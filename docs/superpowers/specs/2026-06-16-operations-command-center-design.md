# Ginabo Operations Command Center Design

## Status

Design approved through the UI and architecture sections. Implementation has not started.

## Objective

Replace the current `/admin` overview with a single-page Operations Command Center for Ginabo's daily operations team.

The page must answer four questions:

1. What is happening?
2. Why is it happening?
3. What needs attention next?
4. What action should the team take?

This is the first operational surface derived from `dashboard_command_center.md`. It is not an attempt to implement every module in that document on one page.

## Audience

Primary audience: Ginabo's daily operations team.

The page prioritizes fulfillment, order flow, inventory risk, returns, payment issues, and immediate actions. Owner and executive reporting can be added as a separate role-specific view later.

## Selected Direction

The selected visual direction is **Balanced and Actionable**.

It provides enough operational detail for daily decisions while keeping the first viewport scannable. It sits between a minimal executive summary and a dense operations cockpit.

## Data Strategy

The first version uses realistic demo data, but the UI must not depend directly on hard-coded values.

All dashboard components consume one typed `CommandCenterData` contract. A dedicated endpoint returns that contract and selects its data provider through configuration.

Initial provider:

- `demo`: deterministic realistic data suitable for design and development.

Planned provider:

- `live`: aggregates Supabase data from orders, products, payments, profiles, and returns.

The provider boundary must allow switching from demo to live without rewriting dashboard components.

## Architecture

### Page

`/admin` becomes the Operations Command Center page inside the existing `AdminShell`.

### API

`GET /api/admin/command-center` returns the complete dashboard payload.

The response includes:

- data source (`demo` or `live`)
- generated and synchronized timestamps
- selected period
- KPIs and comparisons
- seven-day trend series
- health scores
- priority alerts
- recommended actions
- current order queue
- inventory risks

### Provider Layer

The API calls a provider through a common interface:

- demo provider returns deterministic fixtures
- Supabase provider runs server-side aggregate queries

Provider selection is controlled by an environment variable. Provider errors are returned explicitly; the live provider must not silently mask failures with demo data.

### Client Data Flow

The page fetches the endpoint on mount, supports manual refresh, and periodically refreshes while visible. Fetches are cancelled during unmount or replacement to prevent stale updates.

The header always exposes the current source and last synchronization time so demo data cannot be mistaken for production data.

Realtime subscriptions are not required for the demo milestone. The contract and page state must allow a future Supabase Realtime event to trigger a refetch.

## Command Center Contract

The contract contains these logical groups:

### Summary

- revenue today
- orders today
- average order value
- fulfillment rate
- return rate
- inventory items at risk

Every summary metric includes a formatted value, raw value, comparison percentage, comparison direction, and comparison label.

### Trend

Seven daily points containing date, revenue, and order volume.

### Health Scores

- operational
- inventory
- customer
- financial

Each score is from 0 to 100 and includes a status and a short explanation.

### Alerts

Prioritized alerts for:

- delayed orders
- low stock
- risky returns
- failed payments

Each alert includes severity, title, context, suggested action, count, and an internal destination link where one exists.

### Advisor Actions

Three ranked operational recommendations. Each recommendation includes the reason, expected impact, urgency, and action label. These are curated demo recommendations in the first milestone, not claims of live AI inference.

### Operations Lists

- recent or attention-required orders
- products requiring restock

Lists are intentionally short and link to existing admin areas for deeper work.

## User Interface

### Header

- page title: Operations Command Center
- demo/live source indicator
- last synchronization time
- period selector
- manual refresh button

### KPI Strip

Six operational KPIs:

- revenue
- orders
- average order value
- fulfillment rate
- return rate
- inventory risk

### Main Analysis Row

- revenue and order trend chart
- health score panel

### Attention Row

- prioritized operational alerts
- advisor recommendations

### Work Queue Row

- current order queue
- inventory restock risks

## Visual System

The page keeps the existing dark Ginabo admin shell and purple brand accent, but reduces decorative gradients inside dense data surfaces.

Design rules:

- dark neutral surfaces with clear elevation
- purple for primary actions and selected navigation
- emerald for healthy or improving states
- amber for warning states
- rose for critical states
- consistent medium corner radius
- compact but readable spacing
- tabular numerals for operational values
- no decorative animation
- motion limited to loading and state feedback, with reduced-motion support

## Responsive Behavior

Desktop uses the selected balanced two-column layout.

Tablet collapses analysis and attention panels into one column while retaining the KPI grid.

Mobile displays a compact header, two-column KPI grid, and single-column panels. Wide operational tables become concise cards rather than horizontal overflow.

## States

### Loading

Structured skeletons preserve layout and avoid content jumps.

### Error

An inline error state explains that command-center data could not be loaded and offers retry. Existing admin navigation remains usable.

### Empty

Lists explain that no operational issues require attention instead of rendering blank panels.

### Demo

A persistent visible label states that the page is using demonstration data.

## Accessibility

- semantic headings and regions
- keyboard-accessible controls and links
- visible focus states
- status is never conveyed by color alone
- chart data has a textual summary
- contrast targets WCAG AA
- refresh does not steal focus

## Testing Strategy

- type-check the shared contract and provider outputs
- test API provider selection and response shape
- test loading, error, empty, demo, and populated UI states
- verify responsive behavior in the browser
- verify source indicator and synchronization timestamp
- run lint, TypeScript checks, and production build

## Scope Boundaries

Included in this milestone:

- one `/admin` command-center page
- realistic demo provider
- live Supabase provider structure and typed contract
- refresh-ready client data flow
- links into existing admin modules

Not included in this milestone:

- complete implementation of every module in `dashboard_command_center.md`
- production AI model integration
- new database migrations for analytics aggregates
- cross-channel marketing integrations
- full role-based dashboard variants
- true realtime subscriptions

## Implementation Handoff

The next step is to create a detailed implementation plan using the `writing-plans` workflow. No production code should be written before that plan is reviewed.
