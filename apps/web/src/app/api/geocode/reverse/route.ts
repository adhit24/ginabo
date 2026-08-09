// GET /api/geocode/reverse?lat=-6.7&lon=108.5 — proxies Nominatim reverse geocoding

import { type NextRequest } from "next/server";
import { reverseGeocode } from "@/lib/geocode";
import { jsonError, jsonOk } from "@/lib/http";

export async function GET(req: NextRequest) {
  const lat = Number(req.nextUrl.searchParams.get("lat"));
  const lon = Number(req.nextUrl.searchParams.get("lon"));
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return jsonError("lat/lon tidak valid", 400);
  }

  return jsonOk(await reverseGeocode(lat, lon));
}
