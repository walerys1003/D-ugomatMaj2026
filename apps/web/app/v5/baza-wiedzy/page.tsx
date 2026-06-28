import type { Metadata } from "next";
import { V5MarketingLayout, V5HeroSimple, V5StatBand, V5FeatureGrid, V5StepsList, V5Faq, V5CtaBand } from "@/components/v5/marketing";

export const metadata: Metadata = {
  title: 'Baza wiedzy · 312 artykułów o EPU, przedawnieniu, BIK | Mandatomat',
  description: 'Praktyczne kompendium walki z firmami windykacyjnymi. 312 artykułów, 47 wzorów pism, aktualizacja tygodniowa.',
};

export default function V5BazaWiedzyPage() {
  return (
    <V5MarketingLayout>
      <V5HeroSimple
        eyebrow="baza wiedzy · 312 artykułów"
        headline={
          <>
            Co musisz wiedzieć o nakazach EPU,<br />
            <span className="text-[hsl(var(--v5-violet-700))]">zanim wpłacisz złotówkę</span>.
          </>
        }
        body="Praktyczne kompendium walki z firmami windykacyjnymi. Pisane przez radców prawnych, weryfikowane przez kancelarie partnerskie."
        ctas={[
          { label: "Przeglądaj artykuły", href: "#articles", variant: "primary" },
          { label: "Pobierz e-book PDF", href: "#", variant: "secondary" },
        ]}
        meta={
          <span className="font-mono text-[0.6875rem] uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))]">
            aktualizacja: 27.05.2026 · 312 artykułów · 14 kategorii
          </span>
        }
      />

      <V5StatBand
        stats={[
          { value: "312", label: "Artykułów eksperckich", sub: "RADCY + ADWOKACI" },
          { value: "14", label: "Kategorii tematycznych", sub: "OD EPU PO RODO" },
          { value: "47", label: "Wzorów pism (PDF)", sub: "DARMOWE POBRANIE" },
          { value: "tyg.", label: "Częstotliwość update", sub: "ŚLEDŹ NEWSLETTER" },
        ]}
      />

      <V5FeatureGrid
        eyebrow="kategorie wiedzy"
        heading="Co znajdziesz w bazie?"
        features={[
          { icon: <span className="font-mono">⚖️</span>, title: "Procedura EPU", body: "Wszystko o elektronicznym postępowaniu upominawczym — terminy, formularze, błędy sądów.", pill: "47 art." },
          { icon: <span className="font-mono">⏰</span>, title: "Przedawnienie", body: "Praktyka SN: kiedy biegnie, kiedy ulega zawieszeniu, jak przerwać. Tabele dla 24 typów roszczeń.", pill: "31 art." },
          { icon: <span className="font-mono">📨</span>, title: "Doręczenia", body: "Awizo, doręczenie zastępcze, fikcja doręczenia. Najnowsze orzecznictwo (SN 2024-2025)." },
          { icon: <span className="font-mono">🔄</span>, title: "Cesja wierzytelności", body: "Zawiadomienie dłużnika (art. 512 k.c.), legitymacja procesowa, wadliwości cesji.", pill: "28 art." },
          { icon: <span className="font-mono">📊</span>, title: "BIK i BIG", body: "Jak walczyć z negatywnym wpisem. RODO, sprostowanie, usunięcie. Praktyka UODO." },
          { icon: <span className="font-mono">⚒️</span>, title: "Egzekucja komornicza", body: "Zarzuty przeciwko egzekucji, skarga na czynności komornika, kwoty wolne (świadczenia)." },
        ]}
      />

      <V5StepsList
        eyebrow="ścieżka nauki"
        heading="Od zera do skutecznego sprzeciwu."
        steps={[
          { title: "Start: anatomia nakazu", body: "Przeczytaj '5 najczęstszych błędów w nakazach EPU' — zrozumiesz strukturę dokumentu." },
          { title: "Klasyfikacja roszczenia", body: "Sprawdź 'Mapa 24 typów roszczeń' — szybko zorientujesz się czy masz szansę." },
          { title: "Wybierz strategię", body: "Decyzja: przedawnienie, brak legitymacji, błąd w doręczeniu, czy combo? Praktyczny przewodnik." },
          { title: "Wzór sprzeciwu", body: "Skorzystaj z naszych 47 wzorów albo użyj generatora AI. Każdy wzór ma instruktaż." },
        ]}
      />

      <V5Faq
        eyebrow="FAQ · baza wiedzy"
        heading="Najczęściej pytane."
        items={[
          { q: "Czy artykuły są aktualne?", a: "Tak — co tydzień zespół 4 radców prawnych przegląda nowe orzecznictwo SN/SA i aktualizuje artykuły. Każdy artykuł ma datę ostatniej rewizji." },
          { q: "Czy mogę polegać na waszych artykułach w sądzie?", a: "Artykuły zawierają konkretne sygnatury wyroków SN/SA, które możesz cytować. Sam artykuł nie jest źródłem prawa, ale wskazuje źródła, na których możesz się oprzeć." },
          { q: "Czy artykuły są płatne?", a: "Nie — 100% bazy wiedzy jest darmowe, na zawsze. Naszą filozofią jest: dostęp do prawa dla wszystkich. Płatne są jedynie narzędzia AI." },
          { q: "Czy macie kanał YouTube/podcast?", a: "Tak — kanał 'Mandatomat Legal Lab' (47k subskrybentów). Nowy odcinek co tydzień, omawiamy aktualne sprawy i orzeczenia." },
        ]}
      />

      <V5CtaBand
        eyebrow="newsletter · co tydzień"
        headline="Bądź na bieżąco z orzecznictwem SN i SA."
        body="Co poniedziałek — 5 najważniejszych nowości z prawa konsumenckiego i windykacji. 18 000 subskrybentów."
        ctas={[
          { label: "Zapisz się na newsletter", href: "#", variant: "primary" },
          { label: "Subskrybuj YouTube", href: "#", variant: "terminal" },
        ]}
      />
    </V5MarketingLayout>
  );
}
