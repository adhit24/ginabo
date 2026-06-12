import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

  const now = new Date().toISOString();

  const { data: jobs, error: fetchError } = await supabase
    .from("notifications")
    .select("*")
    .eq("is_read", false)
    .lte("created_at", now)
    .limit(50);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  let processed = 0;
  let sent = 0;

  for (const job of jobs ?? []) {
    processed++;
    try {
      if (job.channel === "email" && resend && job.user_id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", job.user_id)
          .single();

        if (profile?.email) {
          await resend.emails.send({
            from: "Ginabo <noreply@ginabo.id>",
            to: profile.email,
            subject: job.title ?? "Notifikasi Ginabo",
            html: `<p>${job.body ?? ""}</p>`,
          });
          sent++;
        }
      }

      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", job.id);
    } catch {
      // Continue processing other jobs
    }
  }

  return NextResponse.json({ processed, sent });
}
