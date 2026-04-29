import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

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
    const now = new Date();
    const jobs = await prisma.notificationJob.findMany({
      where: { status: "PENDING", OR: [{ scheduledAt: null }, { scheduledAt: { lte: now } }] },
      orderBy: { createdAt: "asc" },
      take: 50
    });

    let processed = 0;
    let sent = 0;
    let failed = 0;

    for (const job of jobs) {
      processed++;
      try {
        if (job.channel === "EMAIL") {
          await sendEmail({ to: job.to, subject: job.subject, body: job.body });
        } else {
          await sendWhatsApp({ to: job.to, payload: job.payload });
        }
        await prisma.notificationJob.update({ where: { id: job.id }, data: { status: "SENT", sentAt: new Date() } });
        sent++;
      } catch (e) {
        await prisma.notificationJob.update({
          where: { id: job.id },
          data: { status: "FAILED", error: e instanceof Error ? e.message : String(e) }
        });
        failed++;
      }
    }

    return jsonOk({ processed, sent, failed });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}

