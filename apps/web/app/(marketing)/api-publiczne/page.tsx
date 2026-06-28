import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "API publiczne | Długomat dla deweloperów",
  description:
    "REST API zgodne z OpenAPI 3.1. OAuth 2.0, rate limits, webhooki, SDK dla Node.js i Pythona.",
};

const ENDPOINTS = [
  { method: "GET", path: "/v1/cases", desc: "Lista spraw użytkownika z filtrami" },
  { method: "POST", path: "/v1/cases", desc: "Utworzenie nowej sprawy" },
  { method: "GET", path: "/v1/cases/{id}", desc: "Szczegóły sprawy + timeline" },
  { method: "POST", path: "/v1/letters", desc: "Generowanie pisma procesowego" },
  { method: "GET", path: "/v1/letters/{id}/pdf", desc: "Pobranie pisma jako PDF" },
  { method: "POST", path: "/v1/documents", desc: "Upload dokumentu (multipart)" },
  { method: "GET", path: "/v1/documents/{id}/ocr", desc: "Pobranie wyniku OCR" },
  { method: "POST", path: "/v1/webhooks", desc: "Rejestracja webhooka HMAC" },
  { method: "GET", path: "/v1/precedents/search", desc: "RAG wyszukiwanie orzecznictwa" },
  { method: "POST", path: "/v1/ai/chat", desc: "AI Asystent z cytowaniami (SSE)" },
];

const METHOD_COLOR: Record<string, string> = {
  GET: "bg-accent-50 text-accent-700 border-accent-200",
  POST: "bg-warn-50 text-warn-700 border-warn-200",
  PATCH: "bg-warn-50 text-warn-700 border-warn-200",
  DELETE: "bg-danger-50 text-danger-700 border-danger-200",
};

export default function ApiPublicznePage() {
  return (
    <main className="bg-ink-50 dark:bg-ink-950 pb-20">
      <section className="bg-white dark:bg-ink-900 border-b border-ink-200 dark:border-ink-800">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <p className="text-xs uppercase tracking-wider text-ink-500 mb-2">
            Dla deweloperów
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 dark:text-ink-50">
            REST API
          </h1>
          <p className="text-lg text-ink-600 dark:text-ink-300 mt-3 max-w-2xl">
            Zbuduj własną integrację. OpenAPI 3.1, OAuth 2.0, idempotency keys,
            webhooki podpisane HMAC-SHA256.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/dokumentacja/api">
              <Button variant="primary">Dokumentacja API</Button>
            </Link>
            <a
              href="/openapi.yaml"
              download
              className="inline-flex"
            >
              <Button variant="secondary">Pobierz OpenAPI 3.1</Button>
            </a>
            <Link href="/panel/ustawienia#api-keys">
              <Button variant="ghost">Wygeneruj API key</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 max-w-5xl space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          <Card elevation="subtle">
            <CardHeader>
              <CardTitle className="text-base">Authentication</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-ink-600 dark:text-ink-400 space-y-2">
              <p>OAuth 2.0 (auth code + PKCE) lub API key w nagłówku.</p>
              <code className="block font-mono text-xs px-2 py-1.5 rounded bg-ink-100 dark:bg-ink-800">
                Authorization: Bearer dlg_xxx
              </code>
            </CardContent>
          </Card>
          <Card elevation="subtle">
            <CardHeader>
              <CardTitle className="text-base">Rate limits</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-ink-600 dark:text-ink-400 space-y-2">
              <p>1000 req/dzień (Pro), bez limitu (Enterprise).</p>
              <p>Headers: <code className="font-mono">X-RateLimit-Remaining</code>.</p>
            </CardContent>
          </Card>
          <Card elevation="subtle">
            <CardHeader>
              <CardTitle className="text-base">SDK</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-ink-600 dark:text-ink-400 space-y-2">
              <p>Oficjalne biblioteki:</p>
              <ul className="space-y-0.5">
                <li>• <code className="font-mono text-xs">@dlugomat/node</code></li>
                <li>• <code className="font-mono text-xs">dlugomat-python</code></li>
                <li>• <code className="font-mono text-xs">dlugomat-php</code> (beta)</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card elevation="pop">
          <CardHeader>
            <CardTitle>Endpoints (v1)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-ink-200 dark:border-ink-800 text-xs uppercase tracking-wider text-ink-500">
                    <th className="py-2 pr-3 w-20">Metoda</th>
                    <th className="py-2 pr-3">Ścieżka</th>
                    <th className="py-2 pr-3">Opis</th>
                  </tr>
                </thead>
                <tbody>
                  {ENDPOINTS.map((e, i) => (
                    <tr
                      key={i}
                      className="border-b border-ink-100 dark:border-ink-900"
                    >
                      <td className="py-2.5 pr-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border font-mono font-semibold ${METHOD_COLOR[e.method]}`}
                        >
                          {e.method}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3">
                        <code className="font-mono text-sm text-ink-900 dark:text-ink-50">
                          {e.path}
                        </code>
                      </td>
                      <td className="py-2.5 pr-3 text-ink-600 dark:text-ink-400">
                        {e.desc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-ink-500 mt-4">
              To wybrane endpointy. Pełna referencja: 80+ endpointów w{" "}
              <Link href="/dokumentacja/api" className="text-accent-700 hover:underline">
                dokumentacji
              </Link>
              .
            </p>
          </CardContent>
        </Card>

        <Card elevation="subtle">
          <CardHeader>
            <CardTitle>Przykład: utworzenie sprawy (Node.js SDK)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs font-mono p-4 rounded-lg bg-ink-900 dark:bg-ink-950 text-ink-100 overflow-x-auto">
{`import { Dlugomat } from "@dlugomat/node";

const dlg = new Dlugomat({ apiKey: process.env.DLUGOMAT_API_KEY });

const sprawa = await dlg.cases.create({
  kind: "epu_objection",
  debtor: { full_name: "Jan Kowalski", pesel: "..." },
  creditor: { name: "Bank XYZ", nip: "..." },
  claim: { amount_pln: 12500, due_date: "2023-08-15" }
});

const pismo = await dlg.letters.generate({
  case_id: sprawa.id,
  template: "epu_objection_v3"
});

console.log(pismo.pdf_url);`}
            </pre>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
