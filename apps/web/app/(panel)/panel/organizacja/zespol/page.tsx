import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fetchCurrentOrg,
  fetchInvitations,
  fetchMembers,
  ROLE_LABELS,
} from "@/lib/orgs/membership";
import { InviteForm } from "./invite-form";

export const metadata: Metadata = {
  title: "Zespół | Organizacja | Długomat",
};

export default async function ZespolPage() {
  const org = await fetchCurrentOrg();
  if (!org) {
    return (
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <p className="text-iron-600">Brak aktywnej organizacji.</p>
      </main>
    );
  }
  const [members, invitations] = await Promise.all([
    fetchMembers(org.id),
    fetchInvitations(org.id),
  ]);
  const pending = invitations.filter((i) => i.status === "pending");

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      <div>
        <Link href="/panel/organizacja" className="text-xs text-iron-500 hover:text-iron-700">
          ← Organizacja
        </Link>
        <h1 className="font-display text-3xl font-semibold text-iron-900 dark:text-iron-50 mt-2">
          Zespół
        </h1>
        <p className="text-sm text-iron-500 mt-1">
          {members.length} {members.length === 1 ? "członek" : "członków"} ·{" "}
          {org.seats_used}/{org.seats_total} miejsc
        </p>
      </div>

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle>Zaproś nowego członka</CardTitle>
        </CardHeader>
        <CardContent>
          <InviteForm orgId={org.id} />
        </CardContent>
      </Card>

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle>Członkowie</CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-sm text-iron-500">Brak członków.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-iron-200 dark:border-iron-800 text-xs uppercase tracking-wider text-iron-500">
                    <th className="py-2 pr-3">Osoba</th>
                    <th className="py-2 pr-3">Rola</th>
                    <th className="py-2 pr-3">Dołączył(a)</th>
                    <th className="py-2 pr-3">Aktywność</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr
                      key={m.id}
                      className="border-b border-iron-100 dark:border-iron-900"
                    >
                      <td className="py-3 pr-3">
                        <div className="font-medium text-iron-900 dark:text-iron-50">
                          {m.user_name}
                        </div>
                        <div className="text-xs text-iron-500">{m.user_email}</div>
                      </td>
                      <td className="py-3 pr-3">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-iron-100 dark:bg-iron-800">
                          {ROLE_LABELS[m.role]}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-iron-600 dark:text-iron-400">
                        {new Date(m.joined_at).toLocaleDateString("pl-PL")}
                      </td>
                      <td className="py-3 pr-3 text-iron-500">
                        {m.last_active_at
                          ? new Date(m.last_active_at).toLocaleDateString("pl-PL")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {pending.length > 0 && (
        <Card elevation="subtle">
          <CardHeader>
            <CardTitle>Oczekujące zaproszenia ({pending.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-iron-100 dark:divide-iron-900">
              {pending.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <div className="font-medium text-iron-900 dark:text-iron-50">{inv.email}</div>
                    <div className="text-xs text-iron-500">
                      Rola: {ROLE_LABELS[inv.role]} · ważne do{" "}
                      {new Date(inv.expires_at).toLocaleDateString("pl-PL")}
                    </div>
                  </div>
                  <span className="text-xs text-warn-700 bg-warn-50 px-2 py-0.5 rounded-full">
                    Oczekuje
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
