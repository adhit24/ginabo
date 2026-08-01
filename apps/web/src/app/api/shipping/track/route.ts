import { NextRequest, NextResponse } from "next/server";
import { trackWaybill, isRajaOngkirConfigured, type CourierCode } from "@/lib/rajaongkir";

/**
 * GET /api/shipping/track?waybill=xxx&courier=jne
 */
export async function GET(req: NextRequest) {
  if (!isRajaOngkirConfigured()) {
    return NextResponse.json(
      { error: "Tracking API belum dikonfigurasi. Hubungi admin." },
      { status: 503 }
    );
  }

  const { searchParams } = req.nextUrl;
  const waybill = searchParams.get("waybill")?.trim();
  const courier = searchParams.get("courier")?.trim() as CourierCode | null;

  if (!waybill) {
    return NextResponse.json({ error: "Parameter 'waybill' wajib diisi" }, { status: 400 });
  }
  if (!courier) {
    return NextResponse.json({ error: "Parameter 'courier' wajib diisi" }, { status: 400 });
  }

  try {
    const result = await trackWaybill(waybill, courier);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Nomor resi tidak ditemukan";
    return NextResponse.json({ error: msg }, { status: 404 });
  }
}
