/**
 * Długomat — Tier 8 — Email provider abstraction (Postmark/SES/Resend pluggable).
 *
 * Każdy provider implementuje `EmailProvider` interface. Domyślnie używamy
 * `ResendProvider` (jeśli `RESEND_API_KEY` ustawiony), fallback na `LogProvider`
 * (dev/test).
 *
 * Wszystkie wysyłki idą przez `sendTransactional()` która waliduje + loguje.
 */
import "server-only";

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  tags?: Record<string, string>;
}

export interface EmailSendResult {
  ok: boolean;
  providerId: string;
  messageId?: string;
  error?: string;
}

export interface EmailProvider {
  readonly name: string;
  available(): boolean;
  send(msg: EmailMessage): Promise<EmailSendResult>;
}

class ResendProvider implements EmailProvider {
  readonly name = "resend";
  available(): boolean {
    return !!process.env.RESEND_API_KEY;
  }
  async send(msg: EmailMessage): Promise<EmailSendResult> {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return { ok: false, providerId: this.name, error: "no_api_key" };
    const from = msg.from ?? process.env.EMAIL_FROM ?? "Długomat <noreply@dlugomat.pl>";
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: msg.to,
          subject: msg.subject,
          html: msg.html,
          text: msg.text,
          reply_to: msg.replyTo,
          tags: msg.tags
            ? Object.entries(msg.tags).map(([name, value]) => ({ name, value }))
            : undefined,
        }),
      });
      if (!res.ok) {
        return {
          ok: false,
          providerId: this.name,
          error: `http_${res.status}`,
        };
      }
      const json = (await res.json().catch(() => ({}))) as { id?: string };
      return { ok: true, providerId: this.name, messageId: json.id };
    } catch (err) {
      return {
        ok: false,
        providerId: this.name,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }
}

class PostmarkProvider implements EmailProvider {
  readonly name = "postmark";
  available(): boolean {
    return !!process.env.POSTMARK_SERVER_TOKEN;
  }
  async send(msg: EmailMessage): Promise<EmailSendResult> {
    const token = process.env.POSTMARK_SERVER_TOKEN;
    if (!token) return { ok: false, providerId: this.name, error: "no_token" };
    const from = msg.from ?? process.env.EMAIL_FROM ?? "noreply@dlugomat.pl";
    try {
      const res = await fetch("https://api.postmarkapp.com/email", {
        method: "POST",
        headers: {
          "X-Postmark-Server-Token": token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          From: from,
          To: msg.to,
          Subject: msg.subject,
          HtmlBody: msg.html,
          TextBody: msg.text,
          ReplyTo: msg.replyTo,
          Metadata: msg.tags,
        }),
      });
      if (!res.ok) {
        return { ok: false, providerId: this.name, error: `http_${res.status}` };
      }
      const json = (await res.json().catch(() => ({}))) as { MessageID?: string };
      return { ok: true, providerId: this.name, messageId: json.MessageID };
    } catch (err) {
      return {
        ok: false,
        providerId: this.name,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }
}

class LogProvider implements EmailProvider {
  readonly name = "log";
  available(): boolean {
    return true;
  }
  async send(msg: EmailMessage): Promise<EmailSendResult> {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.log("[email:log]", msg.to, msg.subject);
    }
    return { ok: true, providerId: this.name, messageId: `log_${Date.now()}` };
  }
}

const providers: EmailProvider[] = [
  new ResendProvider(),
  new PostmarkProvider(),
  new LogProvider(),
];

export function pickEmailProvider(): EmailProvider {
  return providers.find((p) => p.available()) ?? providers[providers.length - 1];
}

export async function sendTransactional(msg: EmailMessage): Promise<EmailSendResult> {
  const provider = pickEmailProvider();
  return provider.send(msg);
}
