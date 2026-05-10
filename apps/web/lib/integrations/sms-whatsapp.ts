/**
 * Tier 12 — SMS + WhatsApp provider abstraction (Twilio + SMS API PL fallback).
 */
export type MessagingChannel = "sms" | "whatsapp";

export interface SmsProvider {
  name: string;
  available(): boolean;
  send(opts: { to: string; body: string; channel: MessagingChannel }): Promise<{ id: string; status: "sent" | "queued" | "failed" }>;
}

class TwilioProvider implements SmsProvider {
  name = "twilio";
  available() {
    return !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM);
  }
  async send(opts: { to: string; body: string; channel: MessagingChannel }) {
    const sid = process.env.TWILIO_ACCOUNT_SID!;
    const token = process.env.TWILIO_AUTH_TOKEN!;
    const from = opts.channel === "whatsapp" ? `whatsapp:${process.env.TWILIO_FROM_WHATSAPP ?? process.env.TWILIO_FROM}` : process.env.TWILIO_FROM!;
    const to = opts.channel === "whatsapp" ? `whatsapp:${opts.to}` : opts.to;
    const auth = Buffer.from(`${sid}:${token}`).toString("base64");
    const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: { authorization: `Basic ${auth}`, "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ From: from, To: to, Body: opts.body }),
    });
    if (!r.ok) return { id: "", status: "failed" as const };
    const j: any = await r.json();
    return { id: j.sid, status: (j.status as "sent" | "queued") ?? "queued" };
  }
}

class SmsApiPlProvider implements SmsProvider {
  name = "smsapi_pl";
  available() {
    return !!process.env.SMSAPI_PL_TOKEN;
  }
  async send(opts: { to: string; body: string; channel: MessagingChannel }) {
    if (opts.channel !== "sms") return { id: "", status: "failed" as const };
    const token = process.env.SMSAPI_PL_TOKEN!;
    const r = await fetch("https://api.smsapi.pl/sms.do", {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ to: opts.to, message: opts.body, from: process.env.SMSAPI_PL_FROM ?? "Dlugomat", format: "json" }),
    });
    if (!r.ok) return { id: "", status: "failed" as const };
    const j: any = await r.json();
    return { id: j.list?.[0]?.id ?? "", status: "sent" as const };
  }
}

class LogProvider implements SmsProvider {
  name = "log";
  available() {
    return true;
  }
  async send(opts: { to: string; body: string; channel: MessagingChannel }) {
    console.log(`[SMS:${opts.channel}] → ${opts.to}: ${opts.body.slice(0, 80)}`);
    return { id: `log_${Date.now()}`, status: "sent" as const };
  }
}

export function pickProvider(): SmsProvider {
  const candidates: SmsProvider[] = [new TwilioProvider(), new SmsApiPlProvider(), new LogProvider()];
  return candidates.find((p) => p.available()) ?? candidates[candidates.length - 1];
}

export async function sendSms(to: string, body: string, channel: MessagingChannel = "sms") {
  return pickProvider().send({ to, body, channel });
}
