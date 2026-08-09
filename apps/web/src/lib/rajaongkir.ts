/**
 * RajaOngkir API integration
 * Docs: https://rajaongkir.com/dokumentasi
 *
 * Setup:
 * 1. Daftar di rajaongkir.com
 * 2. Dapatkan API key dari dashboard
 * 3. Set env vars:
 *    RAJAONGKIR_API_KEY=your_api_key
 *    RAJAONGKIR_ORIGIN_CITY_ID=15992 # ID destinasi gudang (Kecapi, Cirebon)
 *
 * Free plan (Starter): JNE, POS, TIKI only
 * Pro plan: +J&T, SiCepat, Ninja, GrabExpress, dll.
 */

// ─── Courier list ─────────────────────────────────────────────────────────────

export const COURIERS = [
  { code: "jne",     name: "JNE" },
  { code: "jnt",     name: "J&T Express" },
  { code: "sicepat", name: "SiCepat" },
  { code: "pos",     name: "Pos Indonesia" },
  { code: "tiki",    name: "TIKI" },
  { code: "ninja",   name: "Ninja Xpress" },
  { code: "lion",    name: "Lion Parcel" },
  { code: "anteraja",name: "AnterAja" },
  { code: "grab",    name: "GrabExpress" },
  { code: "paxel",   name: "Paxel" },
] as const;

export type CourierCode = (typeof COURIERS)[number]["code"];

// ─── Response types ───────────────────────────────────────────────────────────

export interface RajaOngkirProvince {
  province_id: string;
  province: string;
}

export interface RajaOngkirCity {
  city_id: string;
  province_id?: string;
  province?: string;
  type?: "Kabupaten" | "Kota";
  city_name: string;
  postal_code?: string;
  label?: string;
  district_name?: string;
  subdistrict_name?: string;
}

export interface RajaOngkirCostDetail {
  value: number;      // IDR
  etd: string;        // estimated delivery time e.g. "1-2"
  note: string;
}

export interface RajaOngkirService {
  service: string;    // e.g. "REG", "YES", "OKE"
  description: string;
  cost: RajaOngkirCostDetail[];
}

export interface RajaOngkirCostResult {
  courier_code: CourierCode;
  courier_name: string;
  services: RajaOngkirService[];
}

export interface WaybillManifest {
  manifest_code: string;
  manifest_description: string;
  manifest_date: string;
  manifest_time: string;
  city_name: string;
}

export interface WaybillResult {
  waybill_number: string;
  courier_code: string;
  courier_name: string;
  service: string;
  status: string;
  receiver_name: string;
  origin: string;
  destination: string;
  shipper_name: string;
  manifests: WaybillManifest[];
}

// ─── Calculated shipping option (normalized) ─────────────────────────────────

export interface ShippingOption {
  courier_code: CourierCode;
  courier_name: string;
  service: string;
  service_description: string;
  cost: number;       // IDR
  etd: string;        // e.g. "1-2 hari"
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function getConfig() {
  const apiKey = process.env.RAJAONGKIR_API_KEY;

  return {
    apiKey,
    baseUrl: "https://rajaongkir.komerce.id/api/v1",
    configured: Boolean(apiKey),
    originCityId: process.env.RAJAONGKIR_ORIGIN_CITY_ID ?? "15992", // Kecapi, Cirebon
  };
}

async function rajaFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const { apiKey, baseUrl, configured } = getConfig();

  if (!configured) {
    throw new Error(
      "RAJAONGKIR_API_KEY is not set. Register at rajaongkir.com and add the env var."
    );
  }

  const res = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      key: apiKey!,
      "content-type": "application/x-www-form-urlencoded",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`RajaOngkir API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json() as { meta?: { code: number; message: string; status: string }; data?: T };

  if (!json.meta || json.meta.code !== 200) {
    throw new Error(`RajaOngkir: ${json.meta?.message ?? "Respons API tidak valid"}`);
  }

  return json.data as T;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Ambil daftar semua provinsi */
export async function getProvinces(): Promise<RajaOngkirProvince[]> {
  return rajaFetch<RajaOngkirProvince[]>("/province");
}

/** Ambil daftar kota/kabupaten (bisa filter per provinsi) */
export async function getCities(search: string): Promise<RajaOngkirCity[]> {
  const query = new URLSearchParams({ search, limit: "20", offset: "0" });
  const results = await rajaFetch<Array<{
    id: number;
    label: string;
    province_name: string;
    city_name: string;
    district_name: string;
    subdistrict_name: string;
    zip_code: string;
  }>>(`/destination/domestic-destination?${query.toString()}`);

  return results.map((item) => ({
    city_id: String(item.id),
    city_name: item.city_name,
    province: item.province_name,
    postal_code: item.zip_code,
    label: item.label,
    district_name: item.district_name,
    subdistrict_name: item.subdistrict_name,
  }));
}

/**
 * Hitung ongkos kirim
 * @param destinationCityId - ID kota tujuan dari RajaOngkir
 * @param weightGrams       - Berat paket dalam gram
 * @param couriers          - Daftar kode kurir yang ingin dicek (default: semua)
 */
export async function calculateShippingCost(
  destinationCityId: string,
  weightGrams: number,
  couriers: CourierCode[] = ["jne", "jnt", "sicepat", "pos", "tiki"]
): Promise<ShippingOption[]> {
  const { originCityId } = getConfig();
  const options: ShippingOption[] = [];

  await Promise.allSettled(
    couriers.map(async (courierCode) => {
      const body = new URLSearchParams({
        origin:      originCityId,
        destination: destinationCityId,
        weight:      String(weightGrams),
        courier:     courierCode,
        price:       "lowest",
      });

      type CostResults = Array<{
        code: string;
        name: string;
        service: string;
        description: string;
        cost: number;
        etd: string;
      }>;

      const results = await rajaFetch<CostResults>("/calculate/domestic-cost", {
        method: "POST",
        body: body.toString(),
      });

      const courierInfo = COURIERS.find((c) => c.code === courierCode);
      for (const result of results) {
        options.push({
          courier_code:        courierCode,
          courier_name:        courierInfo?.name ?? result.name,
          service:             result.service,
          service_description: result.description,
          cost:                result.cost,
          etd:                 result.etd ? `${result.etd} hari` : "-",
        });
      }
    })
  );

  return options.sort((a, b) => a.cost - b.cost);
}

/**
 * Lacak status pengiriman via nomor resi
 * @param waybillNumber - Nomor resi / AWB
 * @param courierCode   - Kode kurir
 */
export async function trackWaybill(
  waybillNumber: string,
  courierCode: CourierCode
): Promise<WaybillResult> {
  const body = new URLSearchParams({
    waybill: waybillNumber,
    courier: courierCode,
  });

  type RawWaybill = {
    waybill_number: string;
    courier: { code: string; name: string; service: string };
    waybill_date: string;
    waybill_time: string;
    status: string;
    delivered: boolean;
    summary: {
      waybill_number: string;
      courier_code: string;
      service_code: string;
      waybill_date: string;
      shipper_name: string;
      sender_city: string;
      receiver_name: string;
      receiver_city: string;
      status: string;
    };
    manifest: WaybillManifest[];
  };

  const raw = await rajaFetch<RawWaybill>("/waybill", {
    method: "POST",
    body: body.toString(),
  });

  return {
    waybill_number: raw.summary.waybill_number,
    courier_code:   raw.courier.code,
    courier_name:   raw.courier.name,
    service:        raw.courier.service,
    status:         raw.summary.status,
    receiver_name:  raw.summary.receiver_name,
    origin:         raw.summary.sender_city,
    destination:    raw.summary.receiver_city,
    shipper_name:   raw.summary.shipper_name,
    manifests:      raw.manifest ?? [],
  };
}

/** Cek apakah RajaOngkir sudah dikonfigurasi */
export function isRajaOngkirConfigured(): boolean {
  return getConfig().configured;
}
