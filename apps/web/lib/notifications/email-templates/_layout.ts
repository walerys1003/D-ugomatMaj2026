/**
 * Wspólny layout HTML dla wszystkich emaili — minimalistyczny "Tarcza" theme.
 *
 * Brand:
 *   - Granat #0F172A (header + accent)
 *   - Stalowy #1F2937 (text)
 *   - Złoty #C19A4A (CTA)
 *
 * Email-safe rules:
 *   - Tylko tabele do layout
 *   - Inline CSS (gmail strip'uje <style>)
 *   - Max width 600px
 *   - alt na wszystkich obrazkach
 */

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ?? "https://dlugomat.pl";

export interface LayoutBlocks {
  preheader: string;
  /** Title pokazywany w hero (granat). */
  hero: string;
  /** Body w HTML (już z inline-style). */
  bodyHtml: string;
  /** Body w plain text (do bodyText). */
  bodyText: string;
  /** Etykieta + URL CTA. */
  cta?: { label: string; href: string };
  /** Disclaimer prawny pod CTA. */
  legalNote?: string;
}

const FOOTER_HTML = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;border-top:1px solid #E5E7EB;padding-top:16px;">
  <tr>
    <td style="font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#6B7280;line-height:1.6;">
      Długomat — generator pism procesowych dla dłużników.<br/>
      <a href="${APP_URL}" style="color:#0F172A;text-decoration:underline;">${APP_URL.replace(/^https?:\/\//, "")}</a>
      &nbsp;·&nbsp;
      <a href="${APP_URL}/rodo" style="color:#0F172A;text-decoration:underline;">RODO</a>
      &nbsp;·&nbsp;
      <a href="${APP_URL}/regulamin" style="color:#0F172A;text-decoration:underline;">Regulamin</a>
      &nbsp;·&nbsp;
      <a href="${APP_URL}/polityka-prywatnosci" style="color:#0F172A;text-decoration:underline;">Prywatność</a>
      <br/><br/>
      Otrzymujesz tę wiadomość, ponieważ posiadasz konto na dlugomat.pl.<br/>
      Aby zarządzać powiadomieniami, zaloguj się i wejdź w <em>Ustawienia → Powiadomienia</em>.
    </td>
  </tr>
</table>
`.trim();

const FOOTER_TEXT = [
  "—",
  "Długomat — generator pism procesowych dla dłużników.",
  APP_URL,
  "RODO: " + APP_URL + "/rodo",
  "Regulamin: " + APP_URL + "/regulamin",
  "Prywatność: " + APP_URL + "/polityka-prywatnosci",
  "",
  "Otrzymujesz tę wiadomość, ponieważ posiadasz konto na dlugomat.pl.",
  "Aby zarządzać powiadomieniami, zaloguj się i wejdź w Ustawienia → Powiadomienia.",
].join("\n");

export function wrapHtml(blocks: LayoutBlocks): string {
  const ctaHtml = blocks.cta
    ? `
<table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
  <tr>
    <td style="border-radius:6px;background-color:#0F172A;">
      <a href="${blocks.cta.href}" style="display:inline-block;padding:12px 24px;font-family:Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:6px;">
        ${blocks.cta.label}
      </a>
    </td>
  </tr>
</table>`.trim()
    : "";

  const legalHtml = blocks.legalNote
    ? `<p style="margin:16px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#6B7280;line-height:1.6;">${blocks.legalNote}</p>`
    : "";

  return `<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${blocks.hero}</title>
</head>
<body style="margin:0;padding:0;background:#F8FAFC;">
<!-- preheader (ukryty) -->
<div style="display:none;font-size:1px;color:#F8FAFC;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
  ${blocks.preheader}
</div>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8FAFC;padding:24px 12px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#FFFFFF;border-radius:8px;overflow:hidden;">
      <!-- Header -->
      <tr>
        <td style="background:#0F172A;padding:20px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="font-family:Helvetica,Arial,sans-serif;font-size:18px;font-weight:700;color:#FFFFFF;letter-spacing:0.04em;">
                DŁUGOMAT
              </td>
              <td align="right" style="font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#C19A4A;letter-spacing:0.08em;text-transform:uppercase;">
                Tarcza prawna
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:32px 24px;font-family:Helvetica,Arial,sans-serif;color:#1F2937;line-height:1.6;font-size:15px;">
          <h1 style="margin:0 0 16px;font-size:22px;color:#0F172A;font-weight:700;line-height:1.3;">
            ${blocks.hero}
          </h1>
          ${blocks.bodyHtml}
          ${ctaHtml}
          ${legalHtml}
          ${FOOTER_HTML}
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

export function wrapText(blocks: LayoutBlocks): string {
  return [
    blocks.hero.toUpperCase(),
    "",
    blocks.bodyText,
    "",
    blocks.cta ? `${blocks.cta.label}: ${blocks.cta.href}` : "",
    blocks.legalNote ? `\n${blocks.legalNote}` : "",
    "",
    FOOTER_TEXT,
  ]
    .filter(Boolean)
    .join("\n");
}

export function appUrl(path = ""): string {
  if (!path) return APP_URL;
  return `${APP_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Bezpieczna interpolacja — chroni przed HTML-injection w variables. */
export function escapeHtml(value: string | number | undefined | null): string {
  const s = value == null ? "" : String(value);
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function requireVar(
  variables: Record<string, string | number>,
  key: string,
): string {
  const v = variables[key];
  if (v === undefined || v === null || v === "") {
    throw new Error(`Missing required template variable: ${key}`);
  }
  return String(v);
}
