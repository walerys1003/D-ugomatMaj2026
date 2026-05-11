import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Download,
  Mail,
  Shield,
  Trash2,
  UserCog,
  Users,
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
  title: "Operacje masowe — Użytkownicy",
  robots: { index: false, follow: false },
};

interface BulkOp {
  id: string;
  title: string;
  description: string;
  icon: typeof Users;
  destructive?: boolean;
  requires_2fa?: boolean;
}

const OPS: BulkOp[] = [
  {
    id: "export_csv",
    title: "Eksport do CSV",
    description: "Pobierz wybranych użytkowników jako plik CSV (z pełnymi metadanymi).",
    icon: Download,
  },
  {
    id: "send_email",
    title: "Wyślij e-mail masowy",
    description: "Wybierz szablon i wyślij wiadomość do wszystkich zaznaczonych.",
    icon: Mail,
  },
  {
    id: "change_role",
    title: "Zmień rolę RBAC",
    description: "Przypisz nową rolę zaznaczonym kontom (user / moderator / admin).",
    icon: Shield,
    requires_2fa: true,
  },
  {
    id: "force_mfa",
    title: "Wymuś włączenie MFA",
    description: "Użytkownicy będą musieli skonfigurować MFA przy następnym logowaniu.",
    icon: UserCog,
    requires_2fa: true,
  },
  {
    id: "block_accounts",
    title: "Zablokuj konta",
    description: "Tymczasowo wstrzymaj dostęp wybranym kontom (możliwe odblokowanie).",
    icon: AlertTriangle,
    destructive: true,
    requires_2fa: true,
  },
  {
    id: "delete_accounts",
    title: "Usuń konta (GDPR)",
    description: "Bezpowrotnie usuń wybrane konta zgodnie z art. 17 RODO. Operacja nieodwracalna.",
    icon: Trash2,
    destructive: true,
    requires_2fa: true,
  },
];

interface SelectedUser {
  id: string;
  email: string;
  role: "user" | "moderator" | "admin";
  status: "active" | "blocked";
}

const SELECTED: SelectedUser[] = [
  { id: "usr_a1b2", email: "anna.kowalska@example.pl", role: "user", status: "active" },
  { id: "usr_c3d4", email: "marek.lis@example.pl", role: "user", status: "active" },
  { id: "usr_e5f6", email: "ewa.szczęsna@example.pl", role: "moderator", status: "active" },
  { id: "usr_g7h8", email: "tomasz.bak@example.pl", role: "user", status: "blocked" },
  { id: "usr_i9j0", email: "kasia.nowak@example.pl", role: "user", status: "active" },
];

export default function UzytkownicyOperacjePage() {
  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/uzytkownicy"
          className="inline-flex items-center gap-2 text-sm text-iron-600 hover:text-dlugomat-900 focus-visible:outline-none focus-visible:shadow-shield-focus rounded"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Wróć do listy użytkowników
        </Link>
      </div>

      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-iron-500">
          Admin · użytkownicy · operacje masowe
        </p>
        <h1 className="font-display text-fluid-h1 text-dlugomat-950">
          Operacje masowe
        </h1>
        <p className="max-w-2xl text-iron-600">
          Wszystkie operacje masowe są logowane do audytu i wymagają potwierdzenia.
          Operacje destrukcyjne wymagają dodatkowo MFA.
        </p>
      </header>

      <Card urgency="warning">
        <CardContent className="flex items-start gap-3 p-5">
          <AlertTriangle className="mt-1 h-5 w-5 text-warn flex-shrink-0" aria-hidden />
          <div>
            <p className="font-semibold text-dlugomat-950">
              Operacje destrukcyjne są nieodwracalne
            </p>
            <p className="mt-1 text-sm text-iron-700">
              Przed wykonaniem usunięcia konta upewnij się, że dane zostały
              wyeksportowane (art. 20 RODO — przenośność danych).
            </p>
          </div>
        </CardContent>
      </Card>

      <section aria-label="Wybrani użytkownicy">
        <Card>
          <CardHeader>
            <CardTitle>
              <Users className="mr-2 inline h-4 w-4" aria-hidden />
              Wybrani użytkownicy ({SELECTED.length})
            </CardTitle>
            <CardDescription>Lista kont, na których zostanie wykonana operacja</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-iron-200 text-sm">
                <thead className="bg-iron-50 text-xs uppercase tracking-wide text-iron-600">
                  <tr>
                    <th className="px-4 py-2 text-left">
                      <input type="checkbox" defaultChecked aria-label="Zaznacz wszystkich" />
                    </th>
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">E-mail</th>
                    <th className="px-4 py-2 text-left">Rola</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-iron-100 bg-white">
                  {SELECTED.map((u) => (
                    <tr key={u.id}>
                      <td className="px-4 py-2">
                        <input type="checkbox" defaultChecked aria-label={`Zaznacz ${u.email}`} />
                      </td>
                      <td className="px-4 py-2 font-mono text-xs text-iron-600">{u.id}</td>
                      <td className="px-4 py-2 text-dlugomat-900">{u.email}</td>
                      <td className="px-4 py-2">
                        <Badge tone={u.role === "admin" ? "warning" : u.role === "moderator" ? "info" : "neutral"}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-2">
                        <Badge tone={u.status === "active" ? "success" : "danger"} withDot>
                          {u.status === "active" ? "aktywny" : "zablokowany"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      <section aria-label="Dostępne operacje" className="space-y-3">
        <h2 className="font-display text-fluid-h4 text-dlugomat-950">
          Dostępne operacje
        </h2>
        <ul className="grid gap-4 md:grid-cols-2">
          {OPS.map((op) => {
            const Icon = op.icon;
            return (
              <li key={op.id}>
                <Card urgency={op.destructive ? "warning" : "normal"}>
                  <CardContent className="flex items-start gap-4 p-5">
                    <span
                      className={`rounded-md p-2 flex-shrink-0 ${
                        op.destructive ? "bg-danger/10 text-danger" : "bg-dlugomat-50 text-dlugomat-700"
                      }`}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-dlugomat-950">{op.title}</h3>
                        {op.destructive ? (
                          <Badge tone="danger" withDot>destrukcyjna</Badge>
                        ) : null}
                        {op.requires_2fa ? (
                          <Badge tone="warning">wymaga MFA</Badge>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-iron-600">{op.description}</p>
                      <div className="mt-3">
                        <Button
                          variant={op.destructive ? "danger" : "secondary"}
                          size="sm"
                        >
                          Wykonaj na {SELECTED.length} kontach
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
