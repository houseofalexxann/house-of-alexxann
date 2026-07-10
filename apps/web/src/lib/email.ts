/**
 * Transactional email. With RESEND_API_KEY set, sends through Resend's REST
 * API; otherwise (dev) writes the rendered message to var/outbox/ so the
 * full flow is testable offline.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export interface Mail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendMail(mail: Mail): Promise<{ delivered: "resend" | "outbox" }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "House of Alexxann <bookings@houseofalexxann.com>";

  if (key) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [mail.to],
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      }),
    });
    if (!res.ok) {
      throw new Error(`Resend failed: ${res.status} ${await res.text()}`);
    }
    return { delivered: "resend" };
  }

  // Dev outbox: one HTML file + one JSON envelope per message.
  const outbox = path.join(process.cwd(), "..", "..", "var", "outbox");
  await mkdir(outbox, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const slug = mail.subject.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 48);
  await writeFile(path.join(outbox, `${stamp}-${slug}.html`), mail.html);
  await writeFile(
    path.join(outbox, `${stamp}-${slug}.json`),
    JSON.stringify({ ...mail, from, sentAt: new Date().toISOString() }, null, 2)
  );
  console.log(`[email→outbox] "${mail.subject}" → ${mail.to}`);
  return { delivered: "outbox" };
}
