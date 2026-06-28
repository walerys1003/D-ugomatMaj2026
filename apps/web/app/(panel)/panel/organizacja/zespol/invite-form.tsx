"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS, type OrgRole } from "@/lib/orgs/membership";

const ASSIGNABLE_ROLES: OrgRole[] = ["admin", "member", "viewer", "billing"];

export function InviteForm({ orgId }: { orgId: string }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<OrgRole>("member");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/orgs/${orgId}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage({ kind: "err", text: data.error ?? "Nie udało się wysłać zaproszenia." });
        return;
      }
      setMessage({ kind: "ok", text: `Zaproszenie wysłane na ${email}.` });
      setEmail("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid sm:grid-cols-[1fr_180px_auto] gap-2">
        <input
          type="email"
          required
          placeholder="adres@firma.pl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 px-3 py-2 focus:outline-none focus-visible:shadow-shield-focus"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as OrgRole)}
          className="rounded-lg border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 px-3 py-2 focus:outline-none focus-visible:shadow-shield-focus"
        >
          {ASSIGNABLE_ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? "Wysyłam..." : "Zaproś"}
        </Button>
      </div>
      {message && (
        <p
          className={`text-sm ${
            message.kind === "ok" ? "text-accent-700" : "text-danger-700"
          }`}
        >
          {message.text}
        </p>
      )}
    </form>
  );
}
