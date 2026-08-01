import { NextRequest, NextResponse } from "next/server";
import { calculateShippingCost, isRajaOngkirConfigured, type CourierCode } from "@/lib/rajaongkir";

/**
 * POST /api/shipping/cost
 * Body: { destination_city_id: string, weight_grams: number, couriers?: string[] }
 */
export async function POST(req: NextRequest) {
  if (!isRajaOngkirConfigured()) {
    return NextResponse.json(
      { error: "Shipping API belum dikonfigurasi. Hubungi admin." },
      { status: 503 }
    );
  }

  try {
    const body = await req.json() as {
      destination_city_id?: string;
      weight_grams?: number;
      couriers?: CourierCode[];
    };

    if (!body.destination_city_id) {
      return NextResponse.json({ error: "destination_city_id wajib diisi" }, { status: 400 });
    }
    if (!body.weight_grams || body.weight_grams < 1) {
      return NextResponse.json({ error: "weight_grams wajib diisi (minimal 1 gram)" }, { status: 400 });
    }

    const options = await calculateShippingCost(
      body.destination_city_id,
      body.weight_grams,
      body.couriers
    );

    return NextResponse.json({ options });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
