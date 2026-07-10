/**
 * Branded booking emails: confirmation (after payment) and 24h reminder.
 * Dark-friendly, table-based HTML that renders in every client.
 */
import { DateTime } from "luxon";
import type { Booking, Service } from "@prisma/client";
import { FORMAT_LABELS, type SessionFormat } from "./services";
import type { SchedulerSettings } from "./settings";
import type { Mail } from "./email";

function fmtWhen(b: Booking): string {
  return DateTime.fromJSDate(b.startUtc)
    .setZone(b.clientTz)
    .toFormat("cccc, LLLL d, yyyy 'at' h:mm a ZZZZ");
}

function formatKey(b: Booking): SessionFormat {
  return b.format.replace("_", "-") as SessionFormat;
}

function deliveryLine(b: Booking, s: SchedulerSettings): string {
  switch (formatKey(b)) {
    case "video":
      return s.videoLink;
    case "phone":
      return b.clientPhone
        ? `Alexandria will call you at ${b.clientPhone}.`
        : s.phoneNumber;
    case "in-person":
      return s.inPersonAddress;
  }
}

function shell(title: string, inner: string): string {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f9f0f4;font-family:Georgia,serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9f0f4;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #ecd8e2;border-radius:16px;overflow:hidden;">
        <tr><td style="padding:28px 36px 20px;text-align:center;border-bottom:1px solid #f4e3ea;">
          <div style="color:#d4638f;font-size:20px;">✦</div>
          <div style="color:#57405f;font-size:22px;letter-spacing:0.04em;padding-top:6px;">House of Alexxann</div>
        </td></tr>
        <tr><td style="padding:28px 36px;color:#6b5375;font-size:15px;line-height:1.65;">
          <h1 style="margin:0 0 16px;font-size:22px;font-weight:500;color:#45304b;">${title}</h1>
          ${inner}
        </td></tr>
        <tr><td style="padding:18px 36px 26px;border-top:1px solid #f4e3ea;color:#a794b0;font-size:12px;text-align:center;">
          Your birth details are held in confidence and used only to prepare your reading.<br/>
          © House of Alexxann · Crafted under night skies
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function detailRows(b: Booking, svc: Service, s: SchedulerSettings): string {
  const rows: [string, string][] = [
    ["Reading", svc.title],
    ["When", fmtWhen(b)],
    ["Length", `${svc.durationMinutes} minutes`],
    ["Format", FORMAT_LABELS[formatKey(b)]],
    ["How we meet", deliveryLine(b, s)],
    ["Paid", `$${(b.priceCents / 100).toFixed(2)}${b.priceTier !== "standard" ? ` (${b.priceTier} rate)` : ""}`],
  ];
  return rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 0;color:#8d7797;font-size:13px;vertical-align:top;width:120px;">${k}</td><td style="padding:6px 0;color:#45304b;font-size:14px;">${v}</td></tr>`
    )
    .join("");
}

export function confirmationEmail(
  b: Booking,
  svc: Service,
  s: SchedulerSettings,
  baseUrl: string
): Mail {
  const when = fmtWhen(b);
  const inner = `
  <p>Dear ${b.clientName},</p>
  <p>Your time is held. Alexandria is looking forward to sitting with your chart.</p>
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:18px 0;padding:0;">${detailRows(b, svc, s)}</table>
  ${b.birthDate ? `<p style="color:#8d7797;font-size:13px;">You shared birth details (${b.birthDate}${b.birthTime ? `, ${b.birthTime}` : ""}${b.birthPlace ? `, ${b.birthPlace}` : ""}) — your chart will be cast and ready before we begin.</p>` : `<p style="color:#8d7797;font-size:13px;">If you'd like your chart prepared in advance, reply with your birth date, exact time and city.</p>`}
  <p style="margin:22px 0;"><a href="${baseUrl}/book/confirmation?token=${b.token}" style="background:#d4638f;color:#ffffff;text-decoration:none;padding:10px 22px;border-radius:999px;font-family:Arial,sans-serif;font-size:14px;font-weight:600;">View your booking</a></p>
  <p>A reminder will reach you the day before. Need to reschedule? Just reply to this email.</p>
  <p style="margin-bottom:0;">Under the same sky,<br/>Alexandria</p>`;
  return {
    to: b.clientEmail,
    subject: `You're booked — ${svc.title}, ${when}`,
    html: shell("Your reading is confirmed", inner),
    text: [
      `Dear ${b.clientName},`,
      ``,
      `Your reading is confirmed.`,
      `Reading: ${svc.title}`,
      `When: ${when}`,
      `Length: ${svc.durationMinutes} minutes`,
      `Format: ${FORMAT_LABELS[formatKey(b)]}`,
      `How we meet: ${deliveryLine(b, s)}`,
      `Manage: ${baseUrl}/book/confirmation?token=${b.token}`,
      ``,
      `Need to reschedule? Reply to this email.`,
    ].join("\n"),
  };
}

/** Options list for person-to-person payment (Venmo/Cash App/Zelle/PayPal). */
export function directPayOptions(s: SchedulerSettings): { label: string; value: string }[] {
  return [
    s.venmoHandle && { label: "Venmo", value: s.venmoHandle },
    s.cashAppTag && { label: "Cash App", value: s.cashAppTag },
    s.zelleContact && { label: "Zelle", value: s.zelleContact },
    s.paypalMeLink && { label: "PayPal", value: s.paypalMeLink },
  ].filter(Boolean) as { label: string; value: string }[];
}

export function directPayEmail(
  b: Booking,
  svc: Service,
  s: SchedulerSettings,
  baseUrl: string
): Mail {
  const when = fmtWhen(b);
  const amount = `$${(b.priceCents / 100).toFixed(2)}`;
  const options = directPayOptions(s);
  const optionsHtml = options.length
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:14px 0;">${options
        .map(
          (o) =>
            `<tr><td style="padding:6px 0;color:#8d7797;font-size:13px;width:120px;">${o.label}</td><td style="padding:6px 0;color:#45304b;font-size:14px;">${o.value}</td></tr>`
        )
        .join("")}</table>`
    : `<p style="color:#8d7797;font-size:13px;">Payment details will follow in a personal note from Alexandria.</p>`;
  const inner = `
  <p>Dear ${b.clientName},</p>
  <p>Your time is being held for <strong style="color:#b14c77;">${svc.title}</strong> on ${when}.</p>
  <p>To confirm it, send <strong style="color:#45304b;">${amount}</strong> using whichever is easiest:</p>
  ${optionsHtml}
  <p style="color:#8d7797;font-size:13px;">Please include your name in the payment note. As soon as it arrives, you'll receive your confirmation email — your slot is safely held in the meantime.</p>
  <p style="margin:22px 0;"><a href="${baseUrl}/book/confirmation?token=${b.token}" style="background:#d4638f;color:#ffffff;text-decoration:none;padding:10px 22px;border-radius:999px;font-family:Arial,sans-serif;font-size:14px;font-weight:600;">View your booking</a></p>
  <p style="margin-bottom:0;">Under the same sky,<br/>Alexandria</p>`;
  return {
    to: b.clientEmail,
    subject: `Almost booked — send ${amount} to confirm your ${svc.title}`,
    html: shell("One step left: payment", inner),
    text: [
      `Dear ${b.clientName},`,
      ``,
      `Your slot for ${svc.title} on ${when} is held.`,
      `Send ${amount} to confirm, via:`,
      ...options.map((o) => `  ${o.label}: ${o.value}`),
      `Include your name in the payment note.`,
      `Booking: ${baseUrl}/book/confirmation?token=${b.token}`,
    ].join("\n"),
  };
}

export function reminderEmail(
  b: Booking,
  svc: Service,
  s: SchedulerSettings,
  baseUrl: string
): Mail {
  const when = fmtWhen(b);
  const inner = `
  <p>Dear ${b.clientName},</p>
  <p>A gentle reminder — your <strong style="color:#b14c77;">${svc.title}</strong> with Alexandria is tomorrow:</p>
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:18px 0;">${detailRows(b, svc, s)}</table>
  <p>Find a quiet corner, bring your questions, and arrive as you are.</p>
  <p style="margin:22px 0;"><a href="${baseUrl}/book/confirmation?token=${b.token}" style="background:#d4638f;color:#ffffff;text-decoration:none;padding:10px 22px;border-radius:999px;font-family:Arial,sans-serif;font-size:14px;font-weight:600;">Booking details</a></p>
  <p style="margin-bottom:0;">See you under the sky,<br/>Alexandria</p>`;
  return {
    to: b.clientEmail,
    subject: `Tomorrow: your ${svc.title} with Alexandria`,
    html: shell("Your reading is tomorrow", inner),
    text: [
      `Dear ${b.clientName},`,
      ``,
      `Reminder: your ${svc.title} is tomorrow.`,
      `When: ${when}`,
      `Format: ${FORMAT_LABELS[formatKey(b)]}`,
      `How we meet: ${deliveryLine(b, s)}`,
      `Details: ${baseUrl}/book/confirmation?token=${b.token}`,
    ].join("\n"),
  };
}
