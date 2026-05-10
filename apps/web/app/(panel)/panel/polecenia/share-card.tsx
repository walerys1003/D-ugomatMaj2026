"use client";

import { Check, Copy, Mail, Share2 } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  code: string;
  link: string;
}

/**
 * Tier 5 zad. 246 — interaktywna karta z kodem i przyciskami "Skopiuj"
 * + Web Share API + mailto. Client component (potrzebuje navigator.clipboard
 * i navigator.share).
 */
export function ReferralCodeShareCard({ code, link }: Props) {
  const [copied, setCopied] = React.useState<"link" | "code" | null>(null);
  const timeoutRef = React.useRef<number | null>(null);

  const flash = (target: "link" | "code") => {
    setCopied(target);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setCopied(null), 1800);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      flash("link");
    } catch {
      // fallback — selekcja & document.execCommand byłby tu dziadowski.
      // Po prostu pokaż w prompt:
      window.prompt("Skopiuj link ręcznie:", link);
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      flash("code");
    } catch {
      window.prompt("Skopiuj kod ręcznie:", code);
    }
  };

  const tryShare = async () => {
    if (typeof navigator === "undefined" || !navigator.share) {
      // Fallback: skopiuj link
      void copyLink();
      return;
    }
    try {
      await navigator.share({
        title: "Długomat — pomoc dla zadłużonych",
        text: "Sprawdź Długomat — generuje pisma procesowe (sprzeciw EPU, skargi komornicze, BIK Fix). Mam dla Ciebie kod polecający:",
        url: link,
      });
    } catch {
      // user cancelled, lub przeglądarka nieobsłużona — silent.
    }
  };

  const mailto = `mailto:?subject=${encodeURIComponent(
    "Długomat — pomoc, gdy długi przerastają",
  )}&body=${encodeURIComponent(
    `Cześć,\n\nMożliwe, że to się przyda — Długomat sam generuje pisma procesowe (sprzeciw EPU, skargi komornicze, BIK Fix, wnioski o upadłość konsumencką). Robi to w ciągu 30 sekund i kosztuje od 49 zł.\n\nMój link polecający (skorzystaj, jeśli chcesz mnie wesprzeć):\n${link}\n\nPowodzenia.`,
  )}`;

  return (
    <Card className="border-dlugomat-100 bg-gradient-to-br from-dlugomat-50 to-white">
      <CardContent className="space-y-5 p-6">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wider text-dlugomat-700">
            Twój kod polecający
          </span>
          <div className="flex items-center gap-3">
            <code className="rounded-md border border-dlugomat-200 bg-white px-3 py-1.5 font-mono text-lg font-semibold tracking-widest text-dlugomat-900">
              {code}
            </code>
            <button
              onClick={copyCode}
              type="button"
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-dlugomat-700 hover:bg-dlugomat-100"
              aria-label="Skopiuj kod"
            >
              {copied === "code" ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Skopiowano
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Kopiuj
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wider text-dlugomat-700">
            Pełny link do udostępnienia
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              readOnly
              value={link}
              onFocus={(e) => e.currentTarget.select()}
              className="min-w-0 flex-1 rounded-md border border-iron-200 bg-white px-3 py-1.5 text-sm text-iron-800"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyLink}
            >
              {copied === "link" ? (
                <>
                  <Check className="mr-1 h-4 w-4" /> Skopiowany
                </>
              ) : (
                <>
                  <Copy className="mr-1 h-4 w-4" /> Skopiuj link
                </>
              )}
            </Button>
            <Button type="button" size="sm" onClick={tryShare}>
              <Share2 className="mr-1 h-4 w-4" /> Udostępnij
            </Button>
            <a
              href={mailto}
              className="inline-flex items-center gap-1 rounded-md border border-iron-200 bg-white px-3 py-1.5 text-sm text-iron-700 hover:bg-iron-50"
            >
              <Mail className="h-4 w-4" /> E-mail
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
