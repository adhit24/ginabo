import { NextRequest, NextResponse } from "next/server";
import { getCities, isRajaOngkirConfigured } from "@/lib/rajaongkir";

/**
 * GET /api/shipping/cities?province_id=11
 * Cached 24 hours — city list rarely changes
 */
export async function GET(req: NextRequest) {
  if (!isRajaOngkirConfigured()) {
    return NextResponse.json(
      { error: "Shipping API belum dikonfigurasi." },
      { status: 503 }
    );
  }

  const provinceId = req.nextUrl.searchParams.get("province_id") ?? undefined;

  try {
    const cities = await getCities(provinceId);
    return NextResponse.json(
      { cities },
      {
        headers: {
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        },
      }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
