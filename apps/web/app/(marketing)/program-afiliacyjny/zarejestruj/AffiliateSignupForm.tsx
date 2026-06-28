"use client";

import { useState } from "react";

export default function AffiliateSignupForm() {
  const [displayName, setDisplayName] = useState("");
  const [payoutEmail, setPayoutEmail] = useState("");
  const [preferredSlug, setPreferredSlug] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ slug: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/affiliate/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName,
          payout_email: payoutEmail,
          preferred_slug: preferredSlug || undefined,
        }),
      });
      if (res.status === 401) {
        window.location.href = "/login?next=/program-afiliacyjny/zarejestruj";
        return;
      }
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? "signup_failed");
        return;
      }
      const j = (await res.json()) as { account: { slug: string } };
      setSuccess({ slug: j.account.slug });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    const link = `https://dlugomat.pl/?ref=${success.slug}`;
    return (
      <div className="rounded-lg border bg-green-50 p-6">
        <h2 className="text-xl font-bold text-green-800">Konto utworzone</h2>
        <p className="mt-2 text-gray-700">
          Status: <strong>pending</strong> — zatwierdzimy w ciągu 24h. Po
          aktywacji link działa od razu.
        </p>
        <div className="mt-4 rounded border bg-white p-3 text-sm font-mono break-all">
          {link}
        </div>
        <a
          href="/dashboard/affiliate"
          className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-medium"
        >
          Przejdź do dashboardu →
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          Błąd: {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Nazwa wyświetlana</label>
        <input
          type="text"
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="np. Kancelaria Nowak"
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email do wypłat</label>
        <input
          type="email"
          required
          value={payoutEmail}
          onChange={(e) => setPayoutEmail(e.target.value)}
          placeholder="payouts@kancelaria-nowak.pl"
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Preferowany slug <span className="text-gray-500">(opcjonalnie)</span>
        </label>
        <input
          type="text"
          value={preferredSlug}
          onChange={(e) => setPreferredSlug(e.target.value.toLowerCase())}
          placeholder="kancelaria-nowak"
          pattern="[a-z0-9-]+"
          className="w-full rounded border px-3 py-2"
        />
        <p className="mt-1 text-xs text-gray-500">
          Tylko a-z, 0-9 i myślniki. Link: dlugomat.pl/?ref=TWÓJ-SLUG
        </p>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-blue-600 px-4 py-3 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? "Rejestruję…" : "Zarejestruj"}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Klikając "Zarejestruj" akceptujesz regulamin programu afiliacyjnego.
      </p>
    </form>
  );
}
