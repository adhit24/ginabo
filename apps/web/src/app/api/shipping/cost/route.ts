import { NextRequest, NextResponse } from "next/server";
import { calculateShippingCost, getCities, isRajaOngkirConfigured, type CourierCode } from "@/lib/rajaongkir";

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
      destination_city_name?: string;
      destination_province_name?: string;
      weight_grams?: number;
      couriers?: CourierCode[];
    };

    let destinationCityId = body.destination_city_id;
    if (!destinationCityId && body.destination_city_name) {
      const cities = await getCities(body.destination_city_name);
      const normalizedCity = body.destination_city_name.toLowerCase().replace(/^(kota|kabupaten)\s+/i, "").trim();
      const normalizedProvince = body.destination_province_name?.toLowerCase().trim();
      const match = cities.find((city) => {
        const cityName = city.city_name.toLowerCase().replace(/^(kota|kabupaten)\s+/i, "").trim();
        return cityName === normalizedCity && (!normalizedProvince || city.province?.toLowerCase().includes(normalizedProvince));
      }) ?? cities[0];
      destinationCityId = match?.city_id;
    }
    if (!destinationCityId) {
      return NextResponse.json({ error: "Kota pada alamat belum ditemukan di RajaOngkir." }, { status: 400 });
    }
    if (!body.weight_grams || body.weight_grams < 1) {
      return NextResponse.json({ error: "weight_grams wajib diisi (minimal 1 gram)" }, { status: 400 });
    }

    const options = await calculateShippingCost(
      destinationCityId,
      body.weight_grams,
      body.couriers ?? ["jne"]
    );

    return NextResponse.json({ options });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
