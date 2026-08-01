import { NextRequest, NextResponse } from "next/server";
import { getCities, isRajaOngkirConfigured } from "@/lib/rajaongkir";

/**
 * GET /api/shipping/cities?search=Cirebon
 */
export async function GET(req: NextRequest) {
  if (!isRajaOngkirConfigured()) {
    return NextResponse.json(
      { error: "Shipping API belum dikonfigurasi." },
      { status: 503 }
    );
  }

  const search = req.nextUrl.searchParams.get("search")?.trim() ?? "";
  if (search.length < 2) {
    return NextResponse.json({ cities: [] });
  }

  try {
    const cities = await getCities(search);
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
