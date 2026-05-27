import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Display, Text, Eyebrow } from "@/components/ui/typography";

/**
 * MarketingPageHero — Tarcza v4 unified hero pattern dla wszystkich
 * marketing pages (cennik, jak-to-dziala, kontakt, moduly, o-nas,
 * rodo, baza-wiedzy).
 *
 * Zastępuje legacy `tarcza-hero-gradient` (navy + text-white + raw <h1>)
 * jednolitym jasnym hero zgodnym z landing /. Zmiana: hero MARKETING
 * jest teraz wizualnie spójny od strony głównej do dowolnego subpage.
 *
 * Tło: subtelny gradient ink-50 → background z dot-grid mask. Nigdy
 * navy. Navy zostaje TYLKO na badge'ach i akcentach.
 */

export interface MarketingPageHeroProps {
  eyebrow?: React.ReactNode;
  /** Główny nagłówek — używamy <Display level=1> z type scale v4. */
  title: React.ReactNode;
  /** Opcjonalny podtytuł / lead paragraph. */
  subtitle?: React.ReactNode;
  /** Primary CTA (opcjonalne — większość stron go nie ma). */
  primaryCta?: { href: string; label: string };
  /** Secondary CTA. */
  secondaryCta?: { href: string; label: string };
  /** Wycentrowany hero (default true) vs lewo-aligned (false). */
  centered?: boolean;
  /** Dodatkowa klasa na <section>. */
  className?: string;
  /** Dodatkowa zawartość pod CTA (chips, stats, mini-cards). */
  children?: React.ReactNode;
}

export function MarketingPageHero({
  eyebrow,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  centered = true,
  className,
  children,
}: MarketingPageHeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-gradient-to-b from-ink-50 via-background to-background",
        "border-b border-ink-150/60",
        className,
      )}
    >
      {/* Dot-grid background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, hsl(var(--ink-300)) 1px, transparent 0)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 75%)",
        }}
      />

      <div className="container relative py-20 sm:py-24 lg:py-28">
        <div
          className={cn(
            "max-w-3xl",
            centered ? "mx-auto text-center" : "",
          )}
        >
          {eyebrow ? (
            <div
              className={cn(
                "mb-6",
                centered ? "flex justify-center" : "",
              )}
            >
              {typeof eyebrow === "string" ? (
                <Eyebrow tone="brand" withDot>
                  {eyebrow}
                </Eyebrow>
              ) : (
                eyebrow
              )}
            </div>
          ) : null}

          <Display level={1} className="text-balance">
            {title}
          </Display>

          {subtitle ? (
            <Text
              size="lg"
              tone="default"
              className={cn(
                "mt-6 max-w-2xl",
                centered ? "mx-auto" : "",
              )}
            >
              {subtitle}
            </Text>
          ) : null}

          {(primaryCta || secondaryCta) && (
            <div
              className={cn(
                "mt-8 flex flex-wrap items-center gap-3",
                centered ? "justify-center" : "",
              )}
            >
              {primaryCta ? (
                <Link
                  href={primaryCta.href}
                  className="group inline-flex h-12 items-center gap-2 rounded-md bg-ink-900 px-6 text-[15px] font-semibold text-white shadow-sm transition-all hover:bg-ink-800"
                >
                  {primaryCta.label}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ) : null}
              {secondaryCta ? (
                <Link
                  href={secondaryCta.href}
                  className="inline-flex h-12 items-center gap-2 rounded-md border border-ink-200 bg-background px-6 text-[15px] font-semibold text-ink-900 transition-all hover:border-ink-300 hover:bg-ink-50"
                >
                  {secondaryCta.label}
                </Link>
              ) : null}
            </div>
          )}

          {children ? <div className="mt-10">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}

/**
 * MarketingCtaBanner — unified CTA banner na dole marketing pages.
 * Zastępuje `tarcza-hero-gradient rounded-2xl` (navy) wzorcem ink-900
 * (dark surface, ale neutralna — nie marka navy).
 */
export interface MarketingCtaBannerProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  primaryCta: { href: string; label: string };
  secondaryCta?: { href: string; label: string };
  className?: string;
}

export function MarketingCtaBanner({
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  className,
}: MarketingCtaBannerProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-ink-900 px-6 py-12 text-white sm:px-12 sm:py-16",
        className,
      )}
    >
      {/* Subtle dot-grid on dark */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 70% 70% at 50% 50%, black 40%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 70% at 50% 50%, black 40%, transparent 80%)",
        }}
      />
      <div className="relative mx-auto max-w-2xl text-center">
        <Display level={2} className="text-white">
          {title}
        </Display>
        {subtitle ? (
          <p className="mt-4 text-[18px] leading-relaxed text-ink-300">
            {subtitle}
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={primaryCta.href}
            className="group inline-flex h-12 items-center gap-2 rounded-md bg-white px-6 text-[15px] font-semibold text-ink-900 shadow-sm transition-all hover:bg-ink-50"
          >
            {primaryCta.label}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          {secondaryCta ? (
            <Link
              href={secondaryCta.href}
              className="inline-flex h-12 items-center gap-2 rounded-md border border-white/20 bg-transparent px-6 text-[15px] font-semibold text-white transition-all hover:border-white/40 hover:bg-white/5"
            >
              {secondaryCta.label}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
