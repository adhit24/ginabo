/**
 * OpenStreetMap Nominatim geocoding — free, no API key.
 *
 * Nominatim requires an identifying User-Agent and asks clients to keep
 * usage low, so these requests stay server-side instead of running in the
 * browser.
 */

const BASE_URL = "https://nominatim.openstreetmap.org";
const REQUEST_TIMEOUT_MS = 5_000;

function userAgent(): string {
  return `Ginabo/1.0 (${process.env.ADMIN_EMAIL ?? "admin@ginabo.id"})`;
}

export interface GeocodeResult {
  label: string;
  address_line1: string;
  city: string;
  province: string;
  postal_code: string;
  lat: number;
  lon: number;
}

interface NominatimAddress {
  road?: string;
  house_number?: string;
  village?: string;
  town?: string;
  city?: string;
  county?: string;
  state?: string;
  postcode?: string;
}

interface NominatimPlace {
  display_name: string;
  lat: string;
  lon: string;
  address?: NominatimAddress;
}

function normalize(place: NominatimPlace): GeocodeResult {
  const address = place.address ?? {};
  const road = [address.road, address.house_number].filter(Boolean).join(" ");

  return {
    label: place.display_name,
    address_line1: road || place.display_name.split(",")[0]?.trim() || "",
    city: address.city ?? address.town ?? address.village ?? address.county ?? "",
    province: address.state ?? "",
    postal_code: address.postcode ?? "",
    lat: Number.parseFloat(place.lat),
    lon: Number.parseFloat(place.lon),
  };
}

async function fetchNominatim(path: string, params: URLSearchParams): Promise<Response> {
  return fetch(`${BASE_URL}/${path}?${params.toString()}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": userAgent(),
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
}

export async function searchAddress(query: string): Promise<GeocodeResult[]> {
  try {
    const params = new URLSearchParams({
      format: "jsonv2",
      addressdetails: "1",
      countrycodes: "id",
      limit: "8",
      q: query,
    });
    const response = await fetchNominatim("search", params);
    if (!response.ok) return [];

    const places = (await response.json()) as NominatimPlace[];
    return places.map(normalize);
  } catch {
    return [];
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<GeocodeResult | null> {
  try {
    const params = new URLSearchParams({
      format: "jsonv2",
      addressdetails: "1",
      lat: String(lat),
      lon: String(lon),
    });
    const response = await fetchNominatim("reverse", params);
    if (!response.ok) return null;

    const place = (await response.json()) as NominatimPlace;
    if (!place?.display_name || !place.lat || !place.lon) return null;
    return normalize(place);
  } catch {
    return null;
  }
}
