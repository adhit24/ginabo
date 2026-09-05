# Ginabo — Return, Refund & Exchange Management System

Production implementation of the spec in [`return_flow.md`](return_flow.md).
Built on the existing Ginabo stack: **Next.js 14 (App Router) · TypeScript · Supabase
Postgres + Auth + Storage · Cloudflare R2 · Vercel · Resend · Midtrans**.

> Currency is IDR stored as `BIGINT` integers. Timezone WIB (Asia/Jakarta).

---

## 1. System Architecture

```
┌──────────────────┐      ┌──────────────────────────────┐      ┌────────────────────┐
│  Customer (web)  │      │  Next.js App (apps/web)       │      │  Supabase          │
│  /returns/*      │─────▶│  Route Handlers /api/returns  │─────▶│  Postgres (RLS)    │
│  Return Center   │ HTTPS│  /api/admin/returns           │      │  Auth (auth.users) │
└──────────────────┘      │                               │      │  Storage (private) │
                          │  lib/returns.ts (engine)      │      └────────────────────┘
┌──────────────────┐      │  lib/returns-auth.ts          │              │
│  Admin (panel)   │─────▶│                               │              ▼
│  /admin/returns  │      └───────────────┬───────────────┘      ┌────────────────────┐
└──────────────────┘                      │                       │ notifications queue │
                                          ▼                       │ → Resend (email)    │
                                  evidence upload (signed)        │ → WhatsApp (future) │
                                  return-evidence bucket          └────────────────────┘
```

**Layered design**

| Layer | Files | Responsibility |
|-------|-------|----------------|
| Data | `supabase/migrations/004_returns_system.sql` | 11 tables, RLS, triggers, fraud RPC, wallet RPC, storage bucket |
| Types | `apps/web/src/types/returns.ts` | Row types, enums, labels (Bahasa Indonesia) |
| Domain | `apps/web/src/lib/returns.ts` | Policy engine, eligibility, status machine, refund/wallet/voucher, notifications |
| Auth | `apps/web/src/lib/returns-auth.ts` | Dual auth: Supabase Auth + legacy admin JWT |
| Customer API | `apps/web/src/app/api/returns/**` | eligibility, create, list, detail, evidence, cancel |
| Admin API | `apps/web/src/app/api/admin/returns/**` | queue, detail, action, policy, analytics |
| Customer UI | `apps/web/src/app/returns/**` | Return Center, request flow, detail/timeline |
| Admin UI | `apps/web/src/app/admin/returns/**` | queue, detail + action panel, analytics |

---

## 2. Database ERD

```
profiles ──┐
           │ 1:N
orders ────┼──< returns >── return_items ──> order_items
   │       │      │  │  │
   │       │      │  │  └──< return_evidence      (storage: return-evidence/<uid>/<ret#>/)
   │       │      │  └─────< return_notes         (internal | customer)
   │       │      └────────< return_status_logs   (immutable audit timeline)
   │       │      │
payments <─┼──────┤ 1:N
           │      ├──< refunds ──> coupons | customer_wallets
           │      └──< exchanges ──> products / product_variants
           │
return_policies (singleton active row drives the engine)
customer_wallets ──< wallet_transactions (ledger)
return_blacklist (fraud)
```

**Tables (11):** `return_policies`, `returns`, `return_items`, `return_evidence`,
`return_notes`, `return_status_logs`, `refunds`, `exchanges`, `customer_wallets`,
`wallet_transactions`, `return_blacklist`.

Helper DB functions: `generate_return_number()` (RET-YYYY-NNNNNN), `compute_return_risk()`
(0–100 risk + flags), `wallet_credit()` (atomic store-credit), reuses `handle_updated_at()`
and `is_admin()` from migration 001.

---

## 3. Supported Return Types → handling

| Type (`return_type`) | Auto-approve default | Special handling |
|----------------------|----------------------|------------------|
| `defective` | manual review | evidence required |
| `wrong_item` | auto-approve | — |
| `missing_item` | auto-approve | — |
| `expired` | manual review | — |
| `allergic_reaction` | manual review | requires `usage_history` + photos; stored as internal note |
| `exchange` | manual review | creates `exchanges` row, reconciles price difference |
| `other` | manual review | — |

All thresholds live in `return_policies` and are editable by admins
(`PATCH /api/admin/returns/policy`).

---

## 4. Status Workflow (state machine)

```
draft → submitted → under_review → approved ──────────────┐
                         │   │  └─ more_evidence_required  │
                         │   └──── rejected                │
                         └──────── escalated               ▼
                                              awaiting_shipment
                                                     │
                                              item_received
                                                     │
                                             quality_inspection
                                                  │       │
                                        refund_approved  exchange_approved
                                                  └───┬───┘
                                                  completed
```

Transitions are enforced in `lib/returns.ts → canTransition()`. Every transition writes a
`return_status_logs` row (the audit trail) and enqueues a customer notification.

**Auto-approval logic** (`decidePostSubmitStatus`): high risk → `escalated`; manual-review
reason or amount > `auto_approve_max_amount` → `under_review`; auto-approve reason →
`approved`; else `under_review`.

---

## 5. API Endpoints

### Customer (Supabase Auth required)
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/returns/eligibility?order=GNB-…` | Eligibility + eligible items |
| GET | `/api/returns` | List own returns |
| POST | `/api/returns` | Create request (validates eligibility, scores risk) |
| GET | `/api/returns/[returnNumber]` | Detail: items, evidence (signed URLs), timeline, notes |
| POST | `/api/returns/[returnNumber]/evidence` | Register uploaded evidence |
| POST | `/api/returns/[returnNumber]/cancel` | Cancel before inspection |

### Admin (Supabase admin or legacy admin JWT)
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/admin/returns` | Queue + filters (status/type/flagged/q) |
| GET | `/api/admin/returns/[id]` | Full detail incl. internal notes & risk |
| POST | `/api/admin/returns/[id]/action` | Workflow engine — see actions below |
| GET/PATCH | `/api/admin/returns/policy` | Read/update the active policy |
| GET | `/api/admin/returns/analytics?days=30` | Aggregate metrics |

**Admin actions** (`action` body field): `approve`, `reject`, `request_evidence`,
`escalate`, `assign`, `mark_received`, `start_inspection`, `inspect_item`, `refund`,
`exchange`, `complete`, `add_note`, `blacklist`.

All responses use the project envelope `{ ok, data }` / `{ ok, error }` from `lib/http.ts`.

---

## 6. Refund System

`lib/returns.ts → processRefund()` handles three methods:

- **`original_payment`** — records a `refunds` row as `pending`; the Midtrans reversal is
  completed out-of-band (dashboard or future webhook), then marked `completed`.
- **`store_credit`** — calls `wallet_credit()` RPC (atomic), credits `customer_wallets`,
  writes a `wallet_transactions` ledger entry; completes immediately. Optional
  `store_credit_bonus_pct` incentive from policy.
- **`voucher`** — mints a single-use `coupons` row (`fixed_idr`, 1-year expiry) and returns
  the code to the customer; completes immediately.

On refund, the order is marked `refunded`.

## 7. Exchange System

`exchanges` row records `same_product` / `different_variant` / `different_product`,
computes `price_difference = new_value − original_value`. Positive → customer pays
(`awaiting_payment`, link `additional_payment_id`); negative → refund difference.

---

## 8. Notification Architecture

Events are written to the existing `notifications` queue table
(`enqueueReturnNotification`) on every customer-facing status change, fanning out to
`in_app` + `email` (+ `whatsapp` when a number exists). A processor (Supabase Edge Function
or the existing `/api/jobs/dispatch-notifications`) sends `email` via **Resend**
(`RESEND_API_KEY`, from `noreply@ginabo.id`). WhatsApp rows are future-ready.

Templated events: submitted, under_review, more_evidence_required, approved, rejected,
item_received, refund_approved, exchange_approved, completed.

---

## 9. Fraud Prevention

- **Risk scoring** (`compute_return_risk` RPC, 0–100): return frequency (30d vs
  `max_returns_per_month`), lifetime return-rate, duplicate-order return, high-value order,
  blacklist. Score ≥ `high_risk_score` → `is_flagged` + routed to `escalated`.
- **Duplicate detection**: open returns per order block new requests (eligibility + DB).
- **Blacklist**: `return_blacklist` gate on creation; admins add via `blacklist` action.
- **Evidence validation**: `return_evidence.is_validated` flag; allergic-reaction claims
  require usage history.
- **Queue surfacing**: "Hanya berisiko" filter + risk badge in the admin queue.

---

## 10. Security

- **RLS on all 11 tables.** Customers see only their own rows (`profile_id = auth.uid()`);
  customers see only `visibility='customer'` notes; admins via `is_admin()`; service role
  full access.
- **Private evidence bucket** `return-evidence` (50MB, images/video/pdf). Upload path is
  folder-scoped to `auth.uid()`; reads are short-lived **signed URLs** (1h) only — medical/
  skin photos are never public.
- **Dual auth** (`returns-auth.ts`): Supabase Auth first, then legacy admin JWT cookie, so
  the existing `/admin` panel works without re-architecture.
- **Server-side re-validation** of eligibility, ownership, item membership, and amounts on
  create — never trusts client totals. Zod validation on every mutating endpoint.

---

## 11. Mobile-Responsive Design

All UI uses the project's Tailwind setup with mobile-first layouts (single-column customer
flow with a sticky submit bar; admin detail collapses to one column under `lg`). Touch
targets ≥ 40px; file input accepts device camera capture.

---

## 12. Production Deployment Plan

1. **Apply migration** to Supabase project `lvmyjtzfohlorocrjvcx`:
   ```bash
   supabase db push        # or run 004_returns_system.sql via the SQL editor / MCP
   ```
   Migration is wrapped in `BEGIN/COMMIT` and idempotent on the storage bucket + seed.
2. **Storage**: the `return-evidence` bucket is created by the migration. Confirm it is
   **Private** in the Supabase dashboard.
3. **Env vars** (already present): `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
   `RESEND_API_KEY`, `RESEND_FROM_EMAIL`. No new secrets required.
4. **Admin accounts**: ensure each admin has a row in `admin_users` (for the Supabase-Auth
   path) — the legacy JWT panel keeps working regardless.
5. **Deploy** to Vercel (`vercel --prod`); routes are standard App Router handlers.
6. **Notification worker**: schedule the dispatcher (cron/Edge Function) to drain the
   `notifications` queue for `related_type='return'`.
7. **Smoke test**: place a test order → mark `delivered` → submit a return → verify
   auto-approve/manual-review routing, evidence upload (signed URL), admin actions, refund
   to store credit (wallet ledger), and the analytics counters.

---

## 13. File Manifest

```
supabase/migrations/004_returns_system.sql
apps/web/src/types/returns.ts
apps/web/src/lib/returns.ts
apps/web/src/lib/returns-auth.ts
apps/web/src/components/returns/StatusBadge.tsx
apps/web/src/app/api/returns/route.ts
apps/web/src/app/api/returns/eligibility/route.ts
apps/web/src/app/api/returns/[returnNumber]/route.ts
apps/web/src/app/api/returns/[returnNumber]/evidence/route.ts
apps/web/src/app/api/returns/[returnNumber]/cancel/route.ts
apps/web/src/app/api/admin/returns/route.ts
apps/web/src/app/api/admin/returns/[id]/route.ts
apps/web/src/app/api/admin/returns/[id]/action/route.ts
apps/web/src/app/api/admin/returns/policy/route.ts
apps/web/src/app/api/admin/returns/analytics/route.ts
apps/web/src/app/returns/page.tsx                       (Return Center)
apps/web/src/app/returns/new/page.tsx                   (Request flow)
apps/web/src/app/returns/[returnNumber]/page.tsx        (Detail + timeline)
apps/web/src/app/admin/returns/page.tsx                 (Queue)
apps/web/src/app/admin/returns/[id]/page.tsx            (Detail + actions)
apps/web/src/app/admin/returns/analytics/page.tsx       (Analytics)
apps/web/src/app/order/[orderNumber]/page.tsx           (+ "Ajukan Retur" CTA)
apps/web/src/components/admin/AdminShell.tsx            (+ "Retur" nav item)
```
