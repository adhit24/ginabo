import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getAdminSessionCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { cookies } from "next/headers";

/**
 * PATCH /api/admin/orders/[id]/tracking
 * Body: { tracking_number, shipping_courier, shipping_service }
 * Admin only — input nomor resi setelah order dikirim
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verify admin session
  const cookieStore = cookies();
  const token = cookieStore.get(getAdminSessionCookieName())?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const session = await verifyAdminSessionToken(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    tracking_number?: string;
    shipping_courier?: string;
    shipping_service?: string;
  };

  if (!body.tracking_number?.trim()) {
    return NextResponse.json({ error: "tracking_number wajib diisi" }, { status: 400 });
  }
  if (!body.shipping_courier?.trim()) {
    return NextResponse.json({ error: "shipping_courier wajib diisi" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("orders")
    .update({
      tracking_number:  body.tracking_number.trim(),
      shipping_courier: body.shipping_courier.trim().toLowerCase(),
      shipping_service: body.shipping_service?.trim() ?? null,
      shipped_at:       new Date().toISOString(),
      status:           "shipped",
    })
    .eq("id", params.id)
    .select("id, order_number, tracking_number, shipping_courier, status")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ order: data });
}
