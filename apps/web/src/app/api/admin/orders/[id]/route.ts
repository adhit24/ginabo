// PATCH /api/admin/orders/[id] — Admin order status transition handler
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { jsonError, jsonOk } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/server";
import { getAdminSessionCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { isValidOrderTransition } from "@/lib/orders/orderLifecycle";
import type { OrderStatus } from "@/types/database";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Verify Admin Session Token
    const cookieStore = cookies();
    const token = cookieStore.get(getAdminSessionCookieName())?.value;
    if (!token) return jsonError("Unauthorized — Admin session required", 401);
    const session = await verifyAdminSessionToken(token);
    if (!session) return jsonError("Unauthorized — Invalid admin session", 401);

    const body = (await req.json()) as { status?: string };
    const nextStatus = typeof body.status === "string" ? (body.status.trim() as OrderStatus) : undefined;

    if (!nextStatus) {
      return jsonError("Status baru wajib diisi", 400);
    }

    const admin = createAdminClient();
    const adminAny = admin as any;

    // 2. Fetch current order
    const { data: rawOrder, error: findError } = await admin
      .from("orders")
      .select("id, status, inventory_decremented_at, inventory_restored_at, processing_at, shipped_at, delivered_at, completed_at, cancelled_at")
      .eq("id", params.id as never)
      .single();

    if (findError || !rawOrder) return jsonError("Pesanan tidak ditemukan", 404);

    const currentStatus = (rawOrder as any).status as OrderStatus;

    // 3. Enforce Server-side State Machine Validation
    if (!isValidOrderTransition(currentStatus, nextStatus)) {
      return jsonError(
        `Transisi status pesanan dari "${currentStatus}" ke "${nextStatus}" tidak valid`,
        400
      );
    }

    // 4. Prepare timestamp updates
    const updates: Record<string, unknown> = {
      status: nextStatus,
      updated_at: new Date().toISOString(),
    };

    const nowIso = new Date().toISOString();
    if (nextStatus === "processing" && !(rawOrder as any).processing_at) {
      updates.processing_at = nowIso;
    }
    if (nextStatus === "shipped" && !(rawOrder as any).shipped_at) {
      updates.shipped_at = nowIso;
    }
    if (nextStatus === "delivered" && !(rawOrder as any).delivered_at) {
      updates.delivered_at = nowIso;
    }
    if (nextStatus === "completed" && !(rawOrder as any).completed_at) {
      updates.completed_at = nowIso;
    }
    if (nextStatus === "cancelled" && !(rawOrder as any).cancelled_at) {
      updates.cancelled_at = nowIso;
    }

    // 5. Restore stock idempotently if a paid/processing order is cancelled
    if (nextStatus === "cancelled" && (currentStatus === "paid" || currentStatus === "processing")) {
      const { error: rpcError } = await adminAny.rpc("restore_cancelled_order_stock", {
        p_order_id: params.id,
      });

      if (rpcError) {
        console.error("[admin-order-patch] Failed to restore inventory stock:", rpcError.message);
      }
    }

    // 6. Mutate order row
    const { data: updatedOrder, error: updateError } = await admin
      .from("orders")
      .update(updates as never)
      .eq("id", params.id as never)
      .select("id, order_number, status, updated_at")
      .single();

    if (updateError || !updatedOrder) {
      return jsonError("Gagal memperbarui status pesanan", 500, updateError?.message);
    }

    return jsonOk({
      id: params.id,
      previousStatus: currentStatus,
      newStatus: nextStatus,
      order: updatedOrder,
    });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}
