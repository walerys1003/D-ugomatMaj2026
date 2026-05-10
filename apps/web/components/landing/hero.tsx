"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Clock, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Hero — first 100 vh of the landing page. Brand spec §3.5.1:
 *  - "Tarcza" gradient background (Shield Navy 900 → 800 with corner glow)
 *  - Decisive headline (max 8 words), concrete subhead with numbers
 *  - Single primary CTA, supportive secondary CTA
 *  - Trust strip immediately under the buttons
 *  - No alarmist language ("nie strasz, ale prowadź")
 */
export function Hero() {
  return (
    <section
      aria-labelledby="hero-headline"
      className="tarcza-hero-gradient relative overflow-hidden text-white"
    >
      {/* Soft halo for depth without bouncy decoration */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-[-10%] h-[40rem] w-[40rem] rounded-full bg-dlugomat-500/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-20%] left-[-15%] h-[35rem] w-[35rem] rounded-full bg-accent-500/10 blur-3xl"
      />

      <div className="container relative grid gap-10 py-20 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16 lg:py-32">
        <div className="flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <Badge tone="info" withDot className="bg-white/10 text-white border-white/20">
              Sztuczna inteligencja zgodna z polskim prawem
            </Badge>
          </motion.div>

          <motion.h1
            id="hero-headline"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.36, delay: 0.05, ease: [0.22, 0.61, 0.36, 1] }}
            className="max-w-2xl text-balance text-fluid-5xl font-bold tracking-tight text-white"
          >
            Tarcza dla&nbsp;osób&nbsp;zadłużonych. Pismo procesowe gotowe w&nbsp;12&nbsp;minut.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 0.61, 0.36, 1] }}
            className="max-w-xl text-fluid-lg text-iron-200"
          >
            Wczytaj nakaz, list od komornika lub raport BIK. Długomat rozpozna
            dokument, oceni przedawnienie i wygeneruje pismo procesowe
            spersonalizowane dla Twojej sprawy. Bez prawnika, bez kolejek, bez paniki.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay: 0.15, ease: [0.22, 0.61, 0.36, 1] }}
            className="flex flex-wrap items-center gap-3 pt-2"
          >
            <Button asChild size="lg" variant="success">
              <Link href="/skaner-nakazu">
                Zeskanuj nakaz — DARMOWE
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              <Link href="/jak-to-dziala">Zobacz jak to działa</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-fluid-xs text-iron-300"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-accent-400" aria-hidden />
              Dane szyfrowane (AES-256)
            </span>
            <span className="flex items-center gap-2">
              <Clock className="size-4 text-accent-400" aria-hidden />
              Średni czas: 12 minut
            </span>
            <span className="flex items-center gap-2">
              <FileCheck className="size-4 text-accent-400" aria-hidden />
              Pismo gotowe do wysyłki w PDF
            </span>
          </motion.div>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

/**
 * HeroVisual — abstract case-card mock that hints at the dashboard
 * without showing real PII. Pure SVG / CSS so it's < 1 KB extra.
 */
function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.18, ease: [0.22, 0.61, 0.36, 1] }}
      className="relative mx-auto w-full max-w-md"
    >
      <div className="relative rounded-2xl border border-white/15 bg-white/5 p-5 shadow-pop backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-fluid-xs font-semibold uppercase tracking-wider text-iron-300">
            Sprawa #DLG-2026-00187
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-warn-500/15 px-2 py-0.5 text-fluid-xs font-semibold text-warn-100 ring-1 ring-inset ring-warn-500/30">
            <span className="size-1.5 rounded-full bg-warn-500" />5 dni do terminu
          </span>
        </div>
        <h3 className="mt-3 text-fluid-xl font-semibold leading-tight text-white">
          Sprzeciw od nakazu zapłaty (EPU)
        </h3>
        <p className="mt-1 text-fluid-sm text-iron-300">
          Dochodzony dług: 4 218,00 zł · Prawdopodobne przedawnienie
        </p>

        <ul className="mt-4 space-y-2 text-fluid-sm text-iron-200">
          {[
            ["OCR rozpoznał sygnaturę i wierzyciela", "100%"],
            ["Wykryto zarzut przedawnienia (3 lata)", "92%"],
            ["Pismo wygenerowane i zwalidowane", "OK"],
          ].map(([label, pct]) => (
            <li key={label} className="flex items-center justify-between rounded-md bg-white/5 px-3 py-2">
              <span>{label}</span>
              <span className="font-mono text-fluid-xs text-accent-300">{pct}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex items-center justify-between rounded-lg bg-dlugomat-950/60 px-4 py-3 text-fluid-xs text-iron-300 ring-1 ring-inset ring-white/10">
          <span>Pismo PDF</span>
          <span className="font-mono text-accent-300">sprzeciw_epu_v3.pdf</span>
        </div>
      </div>

      {/* Floating "deadline ring" — calm, never bouncy */}
      <div
        aria-hidden
        className="absolute -bottom-6 -left-6 hidden h-24 w-24 rounded-full border border-white/15 bg-dlugomat-900/70 p-2 backdrop-blur-md sm:block"
      >
        <svg viewBox="0 0 36 36" className="h-full w-full">
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--dlugomat-700))" strokeWidth="3" />
          <circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            stroke="hsl(var(--warn-500))"
            strokeWidth="3"
            strokeDasharray="100"
            strokeDashoffset="35"
            strokeLinecap="round"
            transform="rotate(-90 18 18)"
          />
          <text x="18" y="20" textAnchor="middle" className="fill-white text-[8px] font-semibold">
            5 dni
          </text>
        </svg>
      </div>
    </motion.div>
  );
}
