import { NotificationChannel } from "@prisma/client";
import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { journey21ApplicationSchema } from "@/lib/validation";

function isDatabaseUnavailableError(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  return msg.includes("Environment variable not found: DATABASE_URL") || msg.includes("Can't reach database server") || msg.includes("P1001");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = journey21ApplicationSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

    const notifyTo = process.env.JOURNEY21_NOTIFY_EMAIL ? String(process.env.JOURNEY21_NOTIFY_EMAIL) : "hello@ginabo.co";
    const subject = `21 Days Journey: ${parsed.data.name}`;

    await prisma.notificationJob.create({
      data: {
        channel: NotificationChannel.EMAIL,
        eventType: "JOURNEY_21_APPLICATION",
        to: notifyTo,
        subject,
        body: [
          "Pendaftaran 21 Days Journey:",
          "",
          `Nama: ${parsed.data.name}`,
          `Phone: ${parsed.data.phone}`,
          parsed.data.email ? `Email: ${parsed.data.email}` : null
        ]
          .filter(Boolean)
          .join("\n"),
        payload: parsed.data
      }
    });

    return jsonOk({ submitted: true });
  } catch (e) {
    if (isDatabaseUnavailableError(e)) {
      return jsonError("Server sedang sibuk. Silakan coba lagi atau hubungi CS Ginabo.", 503);
    }
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}
