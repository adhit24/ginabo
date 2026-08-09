// GET /api/geocode/search?q=jl.+sudirman — proxies Nominatim search server-side

import { type NextRequest } from "next/server";
import { searchAddress } from "@/lib/geocode";
import { jsonOk } from "@/lib/http";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (query.length < 3) return jsonOk([]);

  return jsonOk(await searchAddress(query));
}
