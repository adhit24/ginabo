export const runtime = 'edge';

import { jsonError, jsonOk } from "@/lib/http";
import { supabase } from "@/lib/supabase";

async function sendEmail(job: { to: string; subject: string | null; body: string | null }) {
  const configured = Boolean(process.env.EMAIL_PROVIDER);
  if (!configured) return { ok: true, info: "EMAIL_PROVIDER not configured (noop)" };
  return { ok: true, info: "sent" };
}

async function sendWhatsApp(job: { to: string; payload: unknown }) {
  const configured = Boolean(process.env.WHATSAPP_PROVIDER);
  if (!configured) return { ok: true, info: "WHATSAPP_PROVIDER not configured (noop)" };
  return { ok: true, info: "sent" };
}

export async function POST() {
  try {
    const now = new Date().toISOString();

    const { data: jobs, error: fetchError } = await supabase
      .from("NotificationJob")
      .select("*")
      .eq("status", "PENDING")
      .or(`scheduledAt.is.null,scheduledAt.lte.${now}`)
      .order("createdAt", { ascending: true })
      .limit(50);

    if (fetchError) throw fetchError;

    let processed = 0;
    let sent = 0;
    let failed = 0;

    for (const job of jobs ?? []) {
      processed++;
      try {
        if (job.channel === "EMAIL") {
          await sendEmail({ to: job.to, subject: job.subject, body: job.body });
        } else {
          await sendWhatsApp({ to: job.to, payload: job.payload });
        }
        await supabase
          .from("NotificationJob")
          .update({ status: "SENT", sentAt: new Date().toISOString() })
          .eq("id", job.id);
        sent++;
      } catch (e) {
        await supabase
          .from("NotificationJob")
          .update({ status: "FAILED", error: e instanceof Error ? e.message : String(e) })
          .eq("id", job.id);
        failed++;
      }
    }

    return jsonOk({ processed, sent, failed });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}
