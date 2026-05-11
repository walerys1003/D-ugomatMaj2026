import * as React from "react";
import Link from "next/link";
import { Code2, Key, Shield, Zap, Book, ArrowRight, Terminal, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Dokumentacja API - Dlugomat",
  description: "Pelna dokumentacja publicznego API Dlugomat - autoryzacja, endpointy, webhooks, SDK.",
};

type Endpoint = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  scope: string;
};

const ENDPOINTS: Endpoint[] = [
  { method: "GET", path: "/v1/cases", description: "Lista spraw uzytkownika", scope: "cases:read" },
  { method: "POST", path: "/v1/cases", description: "Utworz nowa sprawe", scope: "cases:write" },
  { method: "GET", path: "/v1/cases/:id", description: "Szczegoly sprawy", scope: "cases:read" },
  { method: "PUT", path: "/v1/cases/:id", description: "Aktualizuj sprawe", scope: "cases:write" },
  { method: "GET", path: "/v1/cases/:id/documents", description: "Dokumenty w sprawie", scope: "documents:read" },
  { method: "POST", path: "/v1/cases/:id/documents", description: "Dodaj dokument do sprawy", scope: "documents:write" },
  { method: "GET", path: "/v1/payment-plans/:id", description: "Plan splaty", scope: "payments:read" },
  { method: "POST", path: "/v1/payment-plans/:id/renegotiate", description: "Renegocjacja planu", scope: "payments:write" },
  { method: "GET", path: "/v1/users/me", description: "Profil zalogowanego uzytkownika", scope: "profile:read" },
  { method: "POST", path: "/v1/webhooks", description: "Rejestracja webhooka", scope: "webhooks:write" },
];

const METHOD_TONE = {
  GET: "info" as const,
  POST: "success" as const,
  PUT: "warning" as const,
  DELETE: "danger" as const,
};

const SDKS = [
  { lang: "TypeScript / JavaScript", install: "npm install @dlugomat/sdk" },
  { lang: "Python", install: "pip install dlugomat" },
  { lang: "Java", install: "implementation 'pl.dlugomat:sdk:1.0.0'" },
  { lang: "Go", install: "go get github.com/dlugomat/go-sdk" },
];

export default function ApiDokumentacjaPage() {
  return (
    <div className="min-h-screen bg-dlugomat-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-12 max-w-3xl">
          <Badge tone="info" className="mb-4">API publiczne</Badge>
          <h1 className="font-display text-4xl sm:text-5xl text-dlugomat-950 mb-4">
            Dokumentacja API Dlugomat
          </h1>
          <p className="text-xl text-dlugomat-700">
            REST API zgodne z OpenAPI 3.1, OAuth 2.1, mTLS opcjonalne. Pelna kontrola nad sprawami, dokumentami,
            planami splaty i webhookami zdarzen.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-12">
          <Card>
            <CardContent className="pt-6">
              <Zap className="h-5 w-5 text-accent-600 mb-2" aria-hidden />
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Latencja p95</div>
              <div className="font-display text-2xl text-dlugomat-950">87 ms</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Shield className="h-5 w-5 text-accent-600 mb-2" aria-hidden />
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">SLA</div>
              <div className="font-display text-2xl text-dlugomat-950">99.95%</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Code2 className="h-5 w-5 text-accent-600 mb-2" aria-hidden />
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Endpointow</div>
              <div className="font-display text-2xl text-dlugomat-950">87</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Lock className="h-5 w-5 text-accent-600 mb-2" aria-hidden />
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Autoryzacja</div>
              <div className="font-display text-2xl text-dlugomat-950">OAuth 2.1</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-accent-600" aria-hidden />
                Autoryzacja
              </CardTitle>
              <CardDescription>OAuth 2.1 z PKCE</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-dlugomat-800 mb-3">
                Uzyj OAuth 2.1 dla aplikacji uzytkownika lub Client Credentials dla integracji server-to-server.
                Tokeny JWT z 1h waznoscia, refresh tokeny rotowane.
              </p>
              <Link
                href="/api-publiczne/autoryzacja"
                className="text-sm text-accent-700 hover:text-accent-900 font-medium inline-flex items-center gap-1 focus-visible:shadow-shield-focus rounded"
              >
                Przewodnik autoryzacji
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-accent-600" aria-hidden />
                Pierwsze wywolanie
              </CardTitle>
              <CardDescription>Szybki start w 2 minuty</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs font-mono bg-dlugomat-950 text-dlugomat-50 p-3 rounded-md overflow-x-auto">
{`curl https://api.dlugomat.pl/v1/cases \\
  -H "Authorization: Bearer TOKEN" \\
  -H "Accept: application/json"`}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-accent-600" aria-hidden />
                Bezpieczenstwo
              </CardTitle>
              <CardDescription>Standardy i zgodnosc</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-dlugomat-800 space-y-1.5">
                <li>TLS 1.3 wymagane</li>
                <li>mTLS opcjonalne (enterprise)</li>
                <li>Rate limit 1000 req/min</li>
                <li>ISO 27001, SOC 2 Type II</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Najwazniejsze endpointy</CardTitle>
            <CardDescription>Pelna lista (87 endpointow) w referencji OpenAPI</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-dlugomat-600 border-b border-iron-200">
                    <th className="py-2 pr-3">Metoda</th>
                    <th className="py-2 pr-3">Sciezka</th>
                    <th className="py-2 pr-3">Opis</th>
                    <th className="py-2">Scope</th>
                  </tr>
                </thead>
                <tbody>
                  {ENDPOINTS.map((e) => (
                    <tr key={`${e.method}-${e.path}`} className="border-b border-iron-100 last:border-0">
                      <td className="py-2.5 pr-3">
                        <Badge tone={METHOD_TONE[e.method]}>{e.method}</Badge>
                      </td>
                      <td className="py-2.5 pr-3 font-mono text-xs text-dlugomat-900">{e.path}</td>
                      <td className="py-2.5 pr-3 text-dlugomat-800">{e.description}</td>
                      <td className="py-2.5">
                        <code className="text-xs bg-iron-100 px-1.5 py-0.5 rounded text-dlugomat-800">{e.scope}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <Button variant="secondary" size="sm" asChild>
                <Link href="/api-publiczne/referencja">
                  Pelna referencja OpenAPI
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" aria-hidden />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5 text-accent-600" aria-hidden />
              Oficjalne SDK
            </CardTitle>
            <CardDescription>Wspierane jezyki i menedzery pakietow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SDKS.map((sdk) => (
                <div key={sdk.lang} className="p-3 rounded-md border border-iron-300 bg-white">
                  <div className="font-medium text-dlugomat-950 text-sm mb-2">{sdk.lang}</div>
                  <pre className="text-xs font-mono bg-dlugomat-950 text-dlugomat-50 p-2 rounded overflow-x-auto">
                    {sdk.install}
                  </pre>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card elevation="pop">
          <CardContent className="pt-6 pb-6 text-center">
            <h2 className="font-display text-2xl text-dlugomat-950 mb-2">Zaczynamy z API?</h2>
            <p className="text-dlugomat-700 mb-6 max-w-2xl mx-auto">
              Generujemy klucze sandbox w 2 minuty. Pelny dostep produkcyjny po podpisaniu umowy SLA.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="primary" asChild>
                <Link href="/api-publiczne/sandbox">
                  Generuj klucz sandbox
                  <ArrowRight className="h-4 w-4 ml-2" aria-hidden />
                </Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/kontakt/demo">Rozmowa z architektem</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
