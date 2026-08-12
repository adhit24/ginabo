import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/http";
import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase/server";
import { validateCustomerEvent } from "@/lib/analytics/events";

export async function POST(req: NextRequest) {
  let event;
  try {
    event = validateCustomerEvent(await req.json());
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Event tidak valid", 400);
  }
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = await createAdminClient();
  const { error } = await (admin as any).from("customer_events").insert({
    event_id: event.event_id ?? undefined,
    profile_id: user?.id ?? null,
    anonymous_session_id: event.anonymous_session_id,
    event_name: event.event_name,
    product_id: event.product_id,
    order_id: event.order_id,
    metadata: event.metadata,
    consent: true,
  });
  if (error) return jsonError("Event tidak tersimpan", 503, error.message);
  return jsonOk({ accepted: true });
}
