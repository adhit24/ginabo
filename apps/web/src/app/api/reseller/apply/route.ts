export const runtime = "edge";

import { Resend } from "resend";
import { jsonError, jsonOk } from "@/lib/http";
import { supabase } from "@/lib/supabase";
import { resellerApplicationSchema } from "@/lib/validation";

const EXPERIENCE_LABEL: Record<string, string> = {
  NEW: "Baru memulai",
  SELLER: "Sudah pernah jualan online",
  STORE: "Punya toko / usaha",
};

const BRAND = "#78257C";

function adminEmailHtml(d: {
  name: string; phone: string; email?: string; city?: string;
  instagram?: string; experience: string; message?: string;
}) {
  const rows = [
    ["Nama", d.name],
    ["WhatsApp", d.phone],
    ["Email", d.email || "—"],
    ["Kota", d.city || "—"],
    ["Instagram", d.instagram || "—"],
    ["Pengalaman", EXPERIENCE_LABEL[d.experience] ?? d.experience],
    ["Catatan", d.message || "—"],
  ]
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px;color:#8a7d92;font-size:13px;white-space:nowrap;vertical-align:top">${k}</td><td style="padding:8px 12px;color:#1a1a1a;font-size:14px;font-weight:600">${v}</td></tr>`,
    )
    .join("");

  return `<!doctype html><html><body style="margin:0;background:#FDFAFF;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:24px">
    <div style="background:linear-gradient(135deg,#2d0a5e,${BRAND});border-radius:16px 16px 0 0;padding:24px">
      <p style="margin:0;color:rgba(255,255,255,.7);font-size:11px;letter-spacing:.18em;text-transform:uppercase;font-weight:700">Pendaftaran Reseller Baru</p>
      <h1 style="margin:6px 0 0;color:#fff;font-size:22px">${d.name}</h1>
    </div>
    <div style="background:#fff;border:1px solid #ede0f8;border-top:0;border-radius:0 0 16px 16px;padding:8px 12px 16px">
      <table style="width:100%;border-collapse:collapse">${rows}</table>
      <a href="https://wa.me/${d.phone.replace(/\D/g, "").replace(/^0/, "62")}" style="display:inline-block;margin:12px;padding:10px 18px;background:${BRAND};color:#fff;text-decoration:none;border-radius:10px;font-size:13px;font-weight:700">Hubungi via WhatsApp</a>
    </div>
  </div></body></html>`;
}

function applicantEmailHtml(name: string) {
  return `<!doctype html><html><body style="margin:0;background:#FDFAFF;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:24px">
    <div style="background:linear-gradient(135deg,#2d0a5e,${BRAND});border-radius:16px 16px 0 0;padding:28px 24px">
      <h1 style="margin:0;color:#fff;font-size:24px">Terima kasih, ${name}!</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,.8);font-size:14px">Pendaftaranmu sebagai partner Ginabo sudah kami terima.</p>
    </div>
    <div style="background:#fff;border:1px solid #ede0f8;border-top:0;border-radius:0 0 16px 16px;padding:24px">
      <p style="margin:0 0 12px;color:#4a4453;font-size:14px;line-height:1.6">Tim Ginabo akan meninjau pendaftaranmu dan menghubungi kamu lewat WhatsApp dalam <strong>1×24 jam</strong> untuk langkah berikutnya.</p>
      <p style="margin:0 0 16px;color:#4a4453;font-size:14px;line-height:1.6">Sambil menunggu, kamu bisa langsung chat tim kami kalau ada pertanyaan.</p>
      <a href="https://wa.me/6285199264835" style="display:inline-block;padding:12px 22px;background:linear-gradient(135deg,#25D366,#128C7E);color:#fff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:700">Chat WhatsApp Ginabo</a>
      <p style="margin:20px 0 0;color:#8a7d92;font-size:12px">Salam hangat,<br/>Tim Ginabo</p>
    </div>
  </div></body></html>`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = resellerApplicationSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());
    const d = parsed.data;

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL || "noreply@ginabo.id";
    const notifyTo = process.env.RESELLER_NOTIFY_EMAIL || "ginabo.official@gmail.com";

    // 1) Kirim email — admin notif + (opsional) konfirmasi ke pendaftar
    let emailSent = false;
    if (apiKey) {
      const resend = new Resend(apiKey);
      try {
        await resend.emails.send({
          from: `Ginabo Partner <${from}>`,
          to: notifyTo,
          replyTo: d.email || undefined,
          subject: `Reseller baru: ${d.name} — ${d.phone}`,
          html: adminEmailHtml(d),
        });
        emailSent = true;

        if (d.email) {
          await resend.emails.send({
            from: `Ginabo <${from}>`,
            to: d.email,
            subject: "Pendaftaran Partner Ginabo diterima",
            html: applicantEmailHtml(d.name),
          });
        }
      } catch {
        // Email gagal tidak boleh menggagalkan submit — tetap simpan ke DB di bawah
      }
    }

    // 2) Simpan jejak ke DB (non-fatal — best effort untuk arsip/CRM)
    try {
      await supabase.from("NotificationJob").insert({
        channel: "EMAIL",
        eventType: "RESELLER_APPLICATION",
        to: notifyTo,
        subject: `Reseller Program: ${d.name}`,
        body: [
          "Pendaftaran reseller baru:",
          "",
          `Nama: ${d.name}`,
          `Phone: ${d.phone}`,
          d.email ? `Email: ${d.email}` : null,
          d.city ? `Kota: ${d.city}` : null,
          d.instagram ? `Instagram: ${d.instagram}` : null,
          `Pengalaman: ${d.experience}`,
          d.message ? `Catatan: ${d.message}` : null,
        ].filter(Boolean).join("\n"),
        payload: d,
        status: emailSent ? "SENT" : "PENDING",
      });
    } catch {
      // DB unavailable tidak menggagalkan submit selama email sudah terkirim
    }

    if (!emailSent && !apiKey) {
      return jsonError("Konfigurasi email belum lengkap. Hubungi CS Ginabo.", 503);
    }

    return jsonOk({ submitted: true, emailSent });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}
