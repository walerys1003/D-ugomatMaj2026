/**
 * Tier 12 — Slack + Teams notification adapters via incoming webhooks.
 */
export async function postSlackMessage(webhookUrl: string, opts: { text: string; blocks?: unknown[] }): Promise<boolean> {
  const r = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: opts.text, blocks: opts.blocks }),
  });
  return r.ok;
}

export async function postTeamsMessage(webhookUrl: string, opts: { title: string; text: string; theme?: string }): Promise<boolean> {
  const card = {
    "@type": "MessageCard",
    "@context": "https://schema.org/extensions",
    summary: opts.title,
    themeColor: opts.theme ?? "0078D4",
    title: opts.title,
    text: opts.text,
  };
  const r = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(card),
  });
  return r.ok;
}

export function buildDeadlineSlackBlocks(opts: { title: string; due_at: string; case_url: string; days_left: number }) {
  return [
    { type: "header", text: { type: "plain_text", text: "Zbliża się termin sądowy" } },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Sprawa:*\n${opts.title}` },
        { type: "mrkdwn", text: `*Pozostało:*\n${opts.days_left} dni` },
        { type: "mrkdwn", text: `*Termin:*\n${opts.due_at}` },
      ],
    },
    { type: "actions", elements: [{ type: "button", text: { type: "plain_text", text: "Otwórz sprawę" }, url: opts.case_url }] },
  ];
}
