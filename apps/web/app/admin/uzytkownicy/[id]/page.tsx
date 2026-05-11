import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  Shield,
  Clock,
  FileText,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Użytkownik — Admin",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

interface UserDetail {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: "admin" | "moderator" | "user";
  status: "active" | "blocked" | "deleted";
  created_at: string;
  last_sign_in_at: string;
  cases_count: number;
  payments_total_pln: number;
  payments_count: number;
  documents_count: number;
  mfa_enabled: boolean;
  email_verified: boolean;
  preferred_lang: "pl" | "en";
  marketing_consent: boolean;
  newsletter_consent: boolean;
}

const ROLE_TONE: Record<UserDetail["role"], "info" | "warning" | "neutral"> = {
  admin: "warning",
  moderator: "info",
  user: "neutral",
};

const STATUS_TONE: Record<UserDetail["status"], "success" | "danger" | "neutral"> = {
  active: "success",
  blocked: "danger",
  deleted: "neutral",
};

function fmtPLN(n: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

async function loadUser(id: string): Promise<UserDetail> {
  return {
    id,
    email: "anna.kowalska@example.pl",
    full_name: "Anna Kowalska",
    phone: "+48 600 123 456",
    role: "user",
    status: "active",
    created_at: "2024-11-12T09:14:00Z",
    last_sign_in_at: "2026-05-09T18:42:00Z",
    cases_count: 3,
    payments_total_pln: 2480,
    payments_count: 7,
    documents_count: 14,
    mfa_enabled: true,
    email_verified: true,
    preferred_lang: "pl",
    marketing_consent: true,
    newsletter_consent: false,
  };
}

export default async function AdminUserDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await loadUser(id);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/uzytkownicy"
          className="inline-flex items-center gap-2 text-sm text-iron-600 hover:text-dlugomat-900 focus-visible:outline-none focus-visible:shadow-shield-focus rounded"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Wróć do listy
        </Link>
      </div>

      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.18em] text-iron-500">
          Użytkownik · {user.id}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-fluid-h1 text-dlugomat-950">
            {user.full_name}
          </h1>
          <Badge tone={ROLE_TONE[user.role]} withDot>
            {user.role}
          </Badge>
          <Badge tone={STATUS_TONE[user.status]} withDot>
            {user.status === "active" ? "aktywny" : user.status === "blocked" ? "zablokowany" : "usunięty"}
          </Badge>
        </div>
        <p className="max-w-2xl text-iron-600">
          Pełny profil konta, role RBAC, zgody RODO oraz powiązane sprawy, dokumenty i płatności.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-4" aria-label="Statystyki konta">
        <Card>
          <CardHeader>
            <CardDescription>Sprawy</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">
              {user.cases_count}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-iron-500">Aktywne i archiwalne</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Płatności (suma)</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">
              {fmtPLN(user.payments_total_pln)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-iron-500">{user.payments_count} transakcji</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Dokumenty</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">
              {user.documents_count}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-iron-500">W magazynie szyfrowanym</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Ostatnie logowanie</CardDescription>
            <CardTitle className="font-display text-fluid-h4 text-dlugomat-950">
              {fmtDate(user.last_sign_in_at)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-iron-500">Sesja zakończona poprawnie</p>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Dane konta</CardTitle>
            <CardDescription>
              Informacje kontaktowe oraz preferencje komunikacji.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid gap-4 sm:grid-cols-2">
              <Row label="E-mail" value={user.email} icon={Mail} verified={user.email_verified} />
              <Row label="Telefon" value={user.phone} icon={Phone} />
              <Row label="Rola RBAC" value={user.role} icon={Shield} />
              <Row label="Utworzony" value={fmtDate(user.created_at)} icon={Clock} />
              <Row label="Język" value={user.preferred_lang === "pl" ? "polski" : "angielski"} />
              <Row
                label="MFA"
                value={user.mfa_enabled ? "włączone" : "wyłączone"}
                tone={user.mfa_enabled ? "success" : "warning"}
              />
            </dl>

            <div className="rounded-md border border-iron-200 bg-iron-50 p-4">
              <h3 className="text-sm font-semibold text-dlugomat-900">Zgody marketingowe</h3>
              <ul className="mt-2 space-y-1 text-sm text-iron-700">
                <li className="flex items-center gap-2">
                  {user.marketing_consent ? (
                    <CheckCircle2 className="h-4 w-4 text-accent-600" aria-hidden />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-warn" aria-hidden />
                  )}
                  Marketing produktowy: {user.marketing_consent ? "udzielona" : "brak"}
                </li>
                <li className="flex items-center gap-2">
                  {user.newsletter_consent ? (
                    <CheckCircle2 className="h-4 w-4 text-accent-600" aria-hidden />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-warn" aria-hidden />
                  )}
                  Newsletter: {user.newsletter_consent ? "udzielona" : "brak"}
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Akcje administracyjne</CardTitle>
            <CardDescription>Wszystkie działania są audytowane.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="secondary" block>
              Wymuś reset hasła
            </Button>
            <Button variant="secondary" block>
              Zaproś do MFA
            </Button>
            <Button variant="secondary" block asChild>
              <Link href={`/admin/impersonate?user=${user.id}`}>Impersonacja (read-only)</Link>
            </Button>
            <Button variant="ghost" block asChild>
              <Link href={`/admin/audyt?subject=${user.id}`}>Log audytu</Link>
            </Button>
            <Button variant="danger" block>
              Zablokuj konto
            </Button>
          </CardContent>
        </Card>
      </div>

      <section aria-label="Powiązane zasoby" className="grid gap-4 md:grid-cols-3">
        <LinkCard
          href={`/admin/sprawy?user=${user.id}`}
          title="Sprawy użytkownika"
          icon={FileText}
          count={user.cases_count}
          unit="spraw"
        />
        <LinkCard
          href={`/admin/platnosci?user=${user.id}`}
          title="Płatności"
          icon={CreditCard}
          count={user.payments_count}
          unit="transakcji"
        />
        <LinkCard
          href={`/admin/audyt?subject=${user.id}`}
          title="Historia audytu"
          icon={Clock}
          count={142}
          unit="zdarzeń"
        />
      </section>
    </div>
  );
}

function Row({
  label,
  value,
  icon: Icon,
  verified,
  tone,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  verified?: boolean;
  tone?: "success" | "warning";
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-iron-500">{label}</dt>
      <dd className="mt-1 flex items-center gap-2 text-sm text-dlugomat-900">
        {Icon ? <Icon className="h-4 w-4 text-iron-500" aria-hidden /> : null}
        <span>{value}</span>
        {verified ? (
          <Badge tone="success" withDot>
            zweryfikowany
          </Badge>
        ) : null}
        {tone ? (
          <Badge tone={tone} withDot>
            {tone === "success" ? "ok" : "uwaga"}
          </Badge>
        ) : null}
      </dd>
    </div>
  );
}

function LinkCard({
  href,
  title,
  icon: Icon,
  count,
  unit,
}: {
  href: string;
  title: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  count: number;
  unit: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-lg border border-iron-200 bg-white p-5 shadow-card transition hover:shadow-pop focus-visible:outline-none focus-visible:shadow-shield-focus"
    >
      <div className="flex items-start justify-between">
        <Icon className="h-5 w-5 text-dlugomat-700" aria-hidden />
        <span className="font-display text-2xl text-dlugomat-950">
          {count.toLocaleString("pl-PL")}
        </span>
      </div>
      <h3 className="mt-3 text-sm font-semibold text-dlugomat-900">{title}</h3>
      <p className="text-xs text-iron-500">{unit}</p>
    </Link>
  );
}
