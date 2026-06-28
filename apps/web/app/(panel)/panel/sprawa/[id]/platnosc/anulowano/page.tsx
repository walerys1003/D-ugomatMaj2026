import type { Metadata } from "next";
import Link from "next/link";
import { XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Płatność anulowana · Długomat",
  robots: { index: false, follow: false },
};

interface Props {
  params: { id: string };
}

export default function PlatnoscAnulowanoPage({ params }: Props) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card elevation="pop">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 size-12 rounded-full bg-ink-100 p-3 text-ink-600 dark:bg-ink-900/40 dark:text-ink-400">
            <XCircle className="size-6" aria-hidden />
          </div>
          <CardTitle>Płatność anulowana</CardTitle>
          <CardDescription>
            Nie pobraliśmy żadnej kwoty — Twoje pismo czeka w panelu i możesz
            wrócić do płatności w dowolnej chwili.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href={`/panel/sprawa/${params.id}`}>Wróć do sprawy</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/panel">Panel</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-shield-100 bg-shield-50/40 p-4 text-fluid-sm text-ink-800">
        <p className="font-medium text-shield-900">
          Spokojnie. Nic nie tracisz.
        </p>
        <p className="mt-1 text-ink-700">
          Sprawa pozostaje w statusie „gotowa do opłaty". Wszystkie wprowadzone
          dane są zapisane. Możesz dokończyć płatność, gdy będziesz gotowy(a) —
          nie ma terminu.
        </p>
      </div>
    </div>
  );
}
