import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getAdminSessionCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { validateTrackingNumber, sanitizeTrackingNumber } from "@/lib/orders/orderLifecycle";
import type { OrderStatus } from "@/types/database";

/**
 * PATCH /api/admin/orders/[id]/tracking
 * Body: { tracking_number, shipping_courier, shipping_service }
 * Admin only — input nomor resi & mark shipped
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1. Verify admin session
  const cookieStore = cookies();
  const token = cookieStore.get(getAdminSessionCookieName())?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized — Admin session required" }, { status: 401 });
  const session = await verifyAdminSessionToken(token);
  if (!session) return NextResponse.json({ error: "Unauthorized — Invalid admin session" }, { status: 401 });

  const body = (await req.json()) as {
    tracking_number?: string;
    shipping_courier?: string;
    shipping_service?: string;
  };

  const rawTracking = body.tracking_number ?? "";
  const rawCourier = body.shipping_courier ?? "";

  const validation = validateTrackingNumber(rawTracking);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.message }, { status: 400 });
  }

  if (!rawCourier.trim()) {
    return NextResponse.json({ error: "Courier pengiriman (shipping_courier) wajib diisi" }, { status: 400 });
  }

  const cleanTracking = sanitizeTrackingNumber(rawTracking);
  const cleanCourier = rawCourier.trim();
  const cleanService = body.shipping_service?.trim() || null;

  const admin = createAdminClient();

  // 2. Fetch current order to enforce state machine rule
  const { data: rawOrder, error: fetchError } = await admin
    .from("orders")
    .select("id, status, shipped_at")
    .eq("id", params.id as never)
    .single();

  if (fetchError || !rawOrder) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  }

  const currentStatus = (rawOrder as any).status as OrderStatus;

  // Tracking can only be submitted if order is paid, processing, or already shipped
  if (currentStatus !== "paid" && currentStatus !== "processing" && currentStatus !== "shipped") {
    return NextResponse.json(
      { error: `Nomor resi tidak dapat diinput pada pesanan berstatus "${currentStatus}"` },
      { status: 400 }
    );
  }

  const nowIso = new Date().toISOString();
  const updates: Record<string, unknown> = {
    tracking_number: cleanTracking,
    shipping_courier: cleanCourier,
    shipping_provider: cleanCourier.toLowerCase(),
    shipping_service: cleanService,
    status: "shipped",
    shipped_at: (rawOrder as any).shipped_at || nowIso,
    updated_at: nowIso,
  };

  const { data, error } = await admin
    .from("orders")
    .update(updates as never)
    .eq("id", params.id as never)
    .select("id, order_number, tracking_number, shipping_courier, shipping_provider, shipping_service, status, shipped_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ order: data });
}
