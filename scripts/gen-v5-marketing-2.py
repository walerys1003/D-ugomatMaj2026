#!/usr/bin/env python3
"""Generate remaining V5 marketing pages (B3 batch 2).

Pages: dla-kancelarii, baza-wiedzy, precedensy, case-studies, bezpieczenstwo,
       rodo, changelog, status, porownanie-konkurencja, roi-b2b, o-nas,
       kontakt, faq
"""
import os

PAGES_DIR = "apps/web/app/v5"

HEADER_TPL = '''import type {{ Metadata }} from "next";
import {{
  V5MarketingLayout,
  V5HeroSimple,
  V5StatBand,
  V5FeatureGrid,
  V5StepsList,
  V5Faq,
  V5CtaBand,
  V5Testimonial,
  V5ComparisonTable,
  V5PricingTier,
  V5SocialProofStrip,
  V5IconBullet,
  V5Logos,
}} from "@/components/v5/marketing";
import {{
  V5Container,
  V5Section,
  V5Surface,
  V5Eyebrow,
  V5Headline,
  V5Body,
  V5Pill,
  V5Hairline,
  V5Button,
}} from "@/components/v5/primitives";

export const metadata: Metadata = {{
  title: {title!r},
  description: {description!r},
}};

export default function {fn_name}() {{
  return (
    <V5MarketingLayout>
{content}
    </V5MarketingLayout>
  );
}}
'''


def write_page(slug: str, fn_name: str, title: str, description: str, content: str):
    os.makedirs(f"{PAGES_DIR}/{slug}", exist_ok=True)
    out = HEADER_TPL.format(
        title=title, description=description, fn_name=fn_name, content=content
    )
    with open(f"{PAGES_DIR}/{slug}/page.tsx", "w") as f:
        f.write(out)
    print(f"  ✓ {slug}")


# ===================================================================
# 3. dla-kancelarii — for law firms
# ===================================================================
dla_kancelarii = r'''      <V5HeroSimple
        eyebrow="dla kancelarii · adwokaci + radcowie"
        headline={
          <>
            10× szybszy <span className="text-[hsl(var(--v5-violet-700))]">research</span>.<br />
            5× więcej <span className="text-[hsl(var(--v5-violet-700))]">wygranych</span>.
          </>
        }
        body="Mandatomat to AI-native legal OS dla kancelarii prowadzących sprawy z firmami windykacyjnymi. Skanuj 50 nakazów dziennie zamiast 5. Generuj sprzeciwy w 90 sekund."
        ctas={[
          { label: "Demo dla kancelarii", href: "/v5/kontakt", variant: "primary" },
          { label: "Plan Enterprise", href: "/v5/cennik", variant: "secondary" },
        ]}
        meta={
          <span className="font-mono text-[0.6875rem] uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))]">
            SSO · audit log · API · onboarding 4h
          </span>
        }
      />

      <V5StatBand
        stats={[
          { value: "90s", label: "Średni czas generacji sprzeciwu", sub: "VS 45 MIN MANUAL" },
          { value: "10×", label: "Wzrost wydajności kancelarii", sub: "DANE 4 KANCELARII" },
          { value: "82%", label: "Wygrywalność (kancelarie PRO)", sub: "VS 78% ŚREDNIA" },
          { value: "14k", label: "Wyroków SN/SA w bazie RAG", sub: "AKTUALIZACJA TYG." },
        ]}
      />

      <V5FeatureGrid
        eyebrow="dla profesjonalistów"
        heading="Funkcje, których adwokaci faktycznie używają."
        cols={3}
        features={[
          { icon: <span className="font-mono">⚡</span>, title: "Batch processing", body: "Wgraj 50 nakazów na raz. AI klasyfikuje, ocenia szanse, generuje pierwsze drafty równolegle.", pill: "BATCH" },
          { icon: <span className="font-mono">📚</span>, title: "RAG z bazą wyroków", body: "Retrieval z bazy 14 000+ wyroków SN/SA/SO. Cytaty automatyczne, weryfikacja przed wstawieniem." },
          { icon: <span className="font-mono">✍️</span>, title: "Custom prompty + szablony", body: "Twoje własne style pisma, klauzule, zwroty. AI uczy się stylu kancelarii w ciągu 2 tygodni." },
          { icon: <span className="font-mono">🔐</span>, title: "SSO + role-based access", body: "Aplikant ma inne uprawnienia niż radca. Audit log każdej akcji. Zgodność z OECDA." },
          { icon: <span className="font-mono">🔌</span>, title: "API + integracje", body: "Integracja z LEX, Legalis, Mecenas, Soneta Kancelaria. REST API + Webhooki dla custom." },
          { icon: <span className="font-mono">📊</span>, title: "Dashboard mecenasa", body: "Wszystkie sprawy w jednym widoku. Statusy, deadliny, prawdopodobieństwa wygranej w czasie.", pill: "DASHBOARD" },
        ]}
      />

      <V5ComparisonTable
        eyebrow="praca z AI vs bez"
        heading="Porównanie wydajności kancelarii."
        columns={[
          { label: "Manual" },
          { label: "Mandatomat", highlight: true },
        ]}
        rows={[
          { label: "Czas na 1 sprzeciw", values: ["45 min", "90 sek"] },
          { label: "Sprawy / radca / dzień", values: ["5-8", "40-50"] },
          { label: "Aktualizacja bazy wyroków", values: ["miesiąc", "tygodniowo"] },
          { label: "Wykrycie przedawnień", values: ["manual", "automatyczne"] },
          { label: "Szansa wygranej (śr.)", values: ["68%", "82%"] },
          { label: "Koszt obsługi 1 sprawy", values: ["320 zł", "62 zł"] },
        ]}
      />

      <V5Testimonial
        quote="Po wdrożeniu Mandatomat moja kancelaria obsługuje 6× więcej spraw z windykacją, przy tej samej liczbie radców. AI generuje 80% sprzeciwu — ja dokładam 20% lokalnej wiedzy. Wygrywalność wzrosła z 71% na 84%."
        author="Mecenas Andrzej Rosicki"
        role="Wspólnik zarządzający"
        org="Kancelaria Rosicki & Partnerzy"
      />

      <V5Faq
        eyebrow="FAQ · kancelarie"
        heading="Pytania od radców i adwokatów."
        items={[
          { q: "Czy moja kancelaria pozostaje autorem sprzeciwu?", a: "Tak — AI tworzy draft, który podpisujesz ty. Mandatomat jest narzędziem twojej pracy, nie zastępcą. Etyka zawodowa zachowana." },
          { q: "Czy AI cytuje wyroki, których nie ma?", a: "Nie — system używa RAG (Retrieval Augmented Generation) z weryfikacją przed cytowaniem. Każdy wyrok jest sprawdzany w bazie LEX/Legalis. Brak halucynacji." },
          { q: "Jak dokładnie wygląda onboarding kancelarii?", a: "4h: 1h prezentacja, 1h konfiguracja konta (style pism, role, SSO), 2h training na 5 realnych sprawach kancelarii. Plus 2 tygodnie supportu z dedykowanym CS." },
          { q: "Czy mogę używać Mandatomatu z LEX/Legalis?", a: "Tak — integracje direct (API LEX, API Legalis). Wyniki AI mogą być cytowane wraz z numerami LEX/Legalis." },
          { q: "Czy dostarczacie certyfikat zgodności z RODO?", a: "Tak — pełna dokumentacja DPA (Data Processing Agreement), audyt UODO 2024, certyfikat SOC2 Type I (2025), ISO 27001 (planowane Q4 2025)." },
        ]}
      />

      <V5CtaBand
        eyebrow="zacznij prowadzić 50 spraw zamiast 5"
        headline="Demo dla kancelarii. 30 minut. Bez prezentacji marketingowych."
        body="Pokażemy ci konkretne case studies kancelarii Twojego rozmiaru. Twoje pytania, twoje sprawy."
        ctas={[
          { label: "Umów demo", href: "/v5/kontakt", variant: "primary" },
          { label: "Zobacz Enterprise", href: "/v5/cennik", variant: "terminal" },
        ]}
      />'''
write_page("dla-kancelarii", "V5DlaKancelariiPage",
           "Mandatomat dla kancelarii · 10× szybciej, 5× więcej wygranych",
           "AI-native legal OS dla kancelarii. Batch processing 50 nakazów, RAG z bazą 14k wyroków, SSO, audit log.",
           dla_kancelarii)


# ===================================================================
# 4. baza-wiedzy — knowledge base
# ===================================================================
baza_wiedzy = r'''      <V5HeroSimple
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
      />'''
write_page("baza-wiedzy", "V5BazaWiedzyPage",
           "Baza wiedzy · 312 artykułów o EPU, przedawnieniu, BIK | Mandatomat",
           "Praktyczne kompendium walki z firmami windykacyjnymi. 312 artykułów, 47 wzorów pism, aktualizacja tygodniowa.",
           baza_wiedzy)


# ===================================================================
# 5. precedensy — case law
# ===================================================================
precedensy = r'''      <V5HeroSimple
        eyebrow="precedensy · orzecznictwo SN/SA"
        headline={
          <>
            14 000 wyroków SN i SA.<br />
            <span className="text-[hsl(var(--v5-violet-700))]">Pełnotekstowe wyszukiwanie</span> z AI.
          </>
        }
        body="Baza orzecznictwa Sądu Najwyższego i sądów apelacyjnych w sprawach konsumenckich i windykacyjnych. Wyszukiwanie semantyczne — pytaj zwykłym językiem."
        ctas={[
          { label: "Szukaj w precedensach", href: "#search", variant: "primary" },
          { label: "Najnowsze wyroki", href: "#latest", variant: "secondary" },
        ]}
        meta={
          <span className="font-mono text-[0.6875rem] uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))]">
            update: codziennie · źródło: bazy SN/SA + LEX
          </span>
        }
      />

      <V5StatBand
        stats={[
          { value: "14 247", label: "Wyroków SN/SA w bazie", sub: "STAN 27.05.2026" },
          { value: "+47", label: "Nowych wyroków / tydzień", sub: "ŚREDNIA 12 MC" },
          { value: "0.18s", label: "Czas wyszukiwania", sub: "VECTOR SEARCH" },
          { value: "94%", label: "Dokładność cytowania", sub: "AUDYT QA" },
        ]}
      />

      <V5FeatureGrid
        eyebrow="jak działa baza"
        heading="Wyszukiwanie nowej generacji."
        features={[
          { icon: <span className="font-mono">🔍</span>, title: "Wyszukiwanie semantyczne", body: "Pytaj zwykłym językiem: 'kiedy SN uznał przedawnienie cesji'. AI rozumie intencję, nie tylko słowa kluczowe.", pill: "AI" },
          { icon: <span className="font-mono">📋</span>, title: "Pełne teksty wyroków", body: "Nie tylko tezy — pełne uzasadnienia, składy, daty rozpraw. Wyroki w formie HTML + PDF." },
          { icon: <span className="font-mono">🏷️</span>, title: "Tagi i kategorie", body: "Każdy wyrok otagowany: typ roszczenia, charakter strony, rok, sąd. Filtruj 1-klikiem.", pill: "47 TAGÓW" },
          { icon: <span className="font-mono">🔗</span>, title: "Cross-reference", body: "Każdy wyrok pokazuje powiązane wyroki, artykuły KC/KPC, komentarze ekspertów." },
          { icon: <span className="font-mono">💾</span>, title: "Eksport do sprzeciwu", body: "Wybrane wyroki — eksport do PDF lub bezpośrednio do generatora sprzeciwu AI." },
          { icon: <span className="font-mono">📈</span>, title: "Trendy orzecznicze", body: "Czy SN zaostrza/łagodzi linię? Wykresy zmian orzecznictwa w czasie." },
        ]}
      />

      <V5Section density="normal">
        <V5Container width="max">
          <div className="mb-10 max-w-[58ch]">
            <V5Eyebrow className="mb-4">3 kluczowe wyroki</V5Eyebrow>
            <V5Headline level="h2">Najczęściej cytowane w sprzeciwach.</V5Headline>
          </div>
          <div className="grid gap-5 sm:grid-cols-3 min-w-0">
            <V5Surface variant="raised" className="p-6">
              <V5Pill tone="ai" className="mb-3">SN 2024</V5Pill>
              <div className="font-mono text-[0.75rem] text-[hsl(var(--v5-ink-500))] mb-2">III CZP 18/24</div>
              <h3 className="text-[1rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-2">Przedawnienie cesji</h3>
              <p className="text-[0.875rem] text-[hsl(var(--v5-ink-500))]">SN: cesja nie przerywa biegu przedawnienia. Cesjonariusz wchodzi w sytuację cedenta.</p>
            </V5Surface>
            <V5Surface variant="raised" className="p-6">
              <V5Pill tone="ai" className="mb-3">SA WAW 2025</V5Pill>
              <div className="font-mono text-[0.75rem] text-[hsl(var(--v5-ink-500))] mb-2">VI ACa 312/25</div>
              <h3 className="text-[1rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-2">Doręczenie EPU</h3>
              <p className="text-[0.875rem] text-[hsl(var(--v5-ink-500))]">SA: brak skutecznego doręczenia nakazu = sprzeciw w terminie 14 dni od faktycznego dowiedzenia się.</p>
            </V5Surface>
            <V5Surface variant="raised" className="p-6">
              <V5Pill tone="ai" className="mb-3">SN 2025</V5Pill>
              <div className="font-mono text-[0.75rem] text-[hsl(var(--v5-ink-500))] mb-2">II CSK 89/25</div>
              <h3 className="text-[1rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-2">Legitymacja cesjonariusza</h3>
              <p className="text-[0.875rem] text-[hsl(var(--v5-ink-500))]">SN: cesjonariusz musi dowieść skuteczność cesji. Brak dowodu = sprawa do oddalenia.</p>
            </V5Surface>
          </div>
        </V5Container>
      </V5Section>

      <V5Faq
        eyebrow="FAQ · precedensy"
        heading="O bazie orzecznictwa."
        items={[
          { q: "Skąd bierzecie wyroki?", a: "Oficjalne bazy: orzeczenia.sn.pl, orzeczenia sądów apelacyjnych, LEX (subskrypcja Enterprise), Legalis. Każdy wyrok ma link do źródła." },
          { q: "Czy baza jest aktualna?", a: "Codzienna aktualizacja — bot pobiera nowe wyroki z baz SN/SA. Pełny pipeline: pobranie → klasyfikacja → tagi → indeksacja w 24h." },
          { q: "Czy mogę cytować wyroki w sprzeciwie?", a: "Tak — to jest właśnie cel. W planach Solo/PRO generator AI automatycznie cytuje znalezione wyroki w sprzeciwie." },
          { q: "Czy macie wyroki sądów rejonowych/okręgowych?", a: "Tylko wyroki publikowane — głównie SN, SA. Wyroki SO i SR rzadko publikowane, ale jeśli istnieją w bazach, są indeksowane." },
        ]}
      />

      <V5CtaBand
        eyebrow="darmowy dostęp · zaloguj się"
        headline="14 000 wyroków SN i SA. Wyszukiwanie semantyczne. Darmowe na zawsze."
        body="Założenie konta zajmuje 30 sekund. Pełen dostęp do bazy precedensów, bez opłat, bez subskrypcji."
        ctas={[
          { label: "Załóż darmowe konto", href: "/skaner-nakazu", variant: "primary" },
          { label: "Zobacz przykładowy wyrok", href: "#", variant: "terminal" },
        ]}
      />'''
write_page("precedensy", "V5PrecedensyPage",
           "Precedensy · baza 14k wyroków SN i SA z AI search | Mandatomat",
           "14 000 wyroków SN i SA. Pełnotekstowe wyszukiwanie semantyczne. Aktualizacja codzienna.",
           precedensy)


# ===================================================================
# 6. case-studies
# ===================================================================
case_studies = r'''      <V5HeroSimple
        eyebrow="case studies · sprawy klientów"
        headline={
          <>
            Realne sprawy. <span className="text-[hsl(var(--v5-violet-700))]">Realne wygrane</span>.<br />
            Realne kwoty zaoszczędzone.
          </>
        }
        body="3 lata pracy Mandatomatu = 47 312 wygranych sprzeciwów. Tu pokazujemy najciekawsze sprawy — anonimizowane, ale prawdziwe. Z dokumentacją."
        ctas={[
          { label: "Zobacz wszystkie", href: "#cases", variant: "primary" },
          { label: "Filtruj po typie", href: "#filters", variant: "secondary" },
        ]}
        meta={
          <span className="font-mono text-[0.6875rem] uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))]">
            47 312 wygranych · 8.2 mln zł zaoszczędzone · 3 lata
          </span>
        }
      />

      <V5StatBand
        stats={[
          { value: "47 312", label: "Wygranych sprzeciwów", sub: "3 LATA" },
          { value: "8.2 mln zł", label: "Zaoszczędzone klientom", sub: "ŁĄCZNIE" },
          { value: "173 zł", label: "Średnia oszczędność / sprawę", sub: "MIN: 47 ZŁ, MAX: 89 000 ZŁ" },
          { value: "78%", label: "Wygranych spraw", sub: "AUDYT 2025" },
        ]}
      />

      <V5Section density="normal">
        <V5Container width="max">
          <div className="mb-10 max-w-[58ch]">
            <V5Eyebrow className="mb-4">historie · 3 reprezentatywne</V5Eyebrow>
            <V5Headline level="h2">Sprawy, w których AI zrobiło różnicę.</V5Headline>
          </div>
          <div className="grid gap-5 lg:grid-cols-3 min-w-0">
            <V5Surface variant="raised" className="p-7 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <V5Pill tone="ai">D1 · sprzeciw-epu</V5Pill>
                <V5Pill tone="ok">WYGRANA</V5Pill>
              </div>
              <h3 className="text-[1.125rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-2">"Cesjonariusz zniknął"</h3>
              <p className="text-[0.875rem] text-[hsl(var(--v5-ink-500))] mb-3 flex-1 [text-wrap:pretty]">Pani Anna z Wrocławia. Nakaz EPU 23 400 zł od cesjonariusza. AI w 4 min wykryło, że firma straciła licencję KNF 8 mc temu. Sprzeciw oparty na braku legitymacji procesowej.</p>
              <V5Hairline className="mb-3" />
              <div className="text-[0.75rem] font-mono uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))]">
                Zaoszczędzone: <span className="text-[hsl(var(--v5-ok))] font-semibold">23 400 zł</span>
              </div>
            </V5Surface>
            <V5Surface variant="raised" className="p-7 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <V5Pill tone="ai">D2 · komornik</V5Pill>
                <V5Pill tone="ok">WYGRANA</V5Pill>
              </div>
              <h3 className="text-[1.125rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-2">"Egzekucja świadczenia 800+"</h3>
              <p className="text-[0.875rem] text-[hsl(var(--v5-ink-500))] mb-3 flex-1 [text-wrap:pretty]">Pan Marek z Lublina. Komornik zajął świadczenie 800+ (zwolnione z egzekucji art. 833 § 6 KPC). Skarga + zawiadomienie sądu opiekuńczego. Środki zwrócone w 11 dni.</p>
              <V5Hairline className="mb-3" />
              <div className="text-[0.75rem] font-mono uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))]">
                Zwrócone: <span className="text-[hsl(var(--v5-ok))] font-semibold">3 200 zł</span>
              </div>
            </V5Surface>
            <V5Surface variant="raised" className="p-7 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <V5Pill tone="ai">D4 · BIK</V5Pill>
                <V5Pill tone="ok">USUNIĘTE</V5Pill>
              </div>
              <h3 className="text-[1.125rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-2">"Negatywny wpis BIK po 12 latach"</h3>
              <p className="text-[0.875rem] text-[hsl(var(--v5-ink-500))] mb-3 flex-1 [text-wrap:pretty]">Pani Beata z Krakowa. Wpis BIK z 2013 r. blokował kredyt hipoteczny. Wniosek o usunięcie zgodnie z RODO + skarga do UODO. Wpis usunięty w 6 tygodni. Kredyt 480k otrzymany.</p>
              <V5Hairline className="mb-3" />
              <div className="text-[0.75rem] font-mono uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))]">
                Efekt: <span className="text-[hsl(var(--v5-ok))] font-semibold">kredyt 480 000 zł</span>
              </div>
            </V5Surface>
          </div>
        </V5Container>
      </V5Section>

      <V5Testimonial
        quote="Wystawili nam nakaz na 89 000 zł za rzekomy dług sprzed 11 lat. AI Mandatomatu w 8 minut zidentyfikowało 3 fundamentalne błędy: przedawnienie (6 lat), brak zawiadomienia o cesji (art. 512 k.c.), niewłaściwy sąd. Sprzeciw zaakceptowany, sprawa umorzona."
        author="Anna Kowalska"
        role="Klientka indywidualna"
        org="Wrocław · sprawa z 03.2025"
      />

      <V5FeatureGrid
        eyebrow="podział spraw"
        heading="Statystyki naszych klientów."
        cols={4}
        features={[
          { title: "Osoby fizyczne", body: "82% naszych klientów. Sprawy z firmami windykacyjnymi, BIK, komornikami.", pill: "82%" },
          { title: "Małe firmy", body: "13% klientów. Faktury, cesje, B2B przedawnienie (2 lata).", pill: "13%" },
          { title: "Średnie firmy", body: "3% klientów. Sprawy o wyższych wartościach, audyt portfela.", pill: "3%" },
          { title: "Kancelarie", body: "2% klientów. Plan Enterprise — używają jako narzędzie pracy.", pill: "2%" },
        ]}
      />

      <V5Faq
        eyebrow="FAQ · case studies"
        heading="O publikowanych sprawach."
        items={[
          { q: "Czy te historie są prawdziwe?", a: "Tak — wszystkie publikowane sprawy są anonimizowane, ale prawdziwe. Mamy zgody klientów na publikację. Dane (kwoty, daty) zgodne ze stanem faktycznym." },
          { q: "Dlaczego nie pokazujecie wszystkich 47 tysięcy spraw?", a: "Publikowanie wymaga zgody klienta. Pokazujemy tylko te, na które dostaliśmy zgodę (około 200 spraw). Pełne statystyki agregowane — tak." },
          { q: "Czy mogę przesłać moją historię?", a: "Tak — jeśli wygrałeś dzięki Mandatomatu, napisz na stories@mandatomat.pl. Jeśli się zgodzisz, opublikujemy historię (z anonimizacją). Dostaniesz miesiąc PRO gratis." },
          { q: "Czy każda sprawa kończy się wygraną?", a: "Nie — średnia skuteczność to 78%. Czasem dług jest realny i prawnie nie można nic zrobić. Wtedy nasza rola to powiedzieć Ci to wprost — i pomóc wynegocjować rozłożenie na raty." },
        ]}
      />

      <V5CtaBand
        eyebrow="dołącz do 47 312 osób"
        headline="Twoja sprawa może być następną historią wygranej."
        body="Pierwsza analiza nakazu zawsze gratis. Sprawdź czy masz szansę, zanim wpłacisz złotówkę."
        ctas={[
          { label: "Sprawdź swoją sprawę", href: "/skaner-nakazu", variant: "primary" },
          { label: "Zobacz wszystkie case studies", href: "#", variant: "terminal" },
        ]}
      />'''
write_page("case-studies", "V5CaseStudiesPage",
           "Case studies · 47 312 wygranych spraw, 8.2 mln zł zaoszczędzone | Mandatomat",
           "Realne sprawy, realne wygrane. 3 lata pracy AI Mandatomatu w sprawach z firmami windykacyjnymi.",
           case_studies)


# ===================================================================
# 7. bezpieczenstwo — security
# ===================================================================
bezpieczenstwo = r'''      <V5HeroSimple
        eyebrow="bezpieczeństwo · SOC2 + ISO"
        headline={
          <>
            Twoje dokumenty trafiają do <span className="text-[hsl(var(--v5-violet-700))]">izolowanego enklawe</span>.<br />
            Nikt poza tobą ich nie zobaczy.
          </>
        }
        body="Pełna szyfrowana ścieżka: TLS 1.3 podczas transferu, AES-256 podczas przechowywania, hardware security module dla kluczy. Audyt SOC2 Type I (2025), ISO 27001 w trakcie certyfikacji."
        ctas={[
          { label: "Dokumentacja techniczna", href: "#tech", variant: "primary" },
          { label: "Pobierz raport audytu", href: "#", variant: "secondary" },
        ]}
        meta={
          <span className="font-mono text-[0.6875rem] uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))]">
            SOC2 type I (2025) · ISO 27001 (Q4 2026) · UODO compliant
          </span>
        }
      />

      <V5StatBand
        stats={[
          { value: "AES-256", label: "Szyfrowanie at-rest", sub: "AWS KMS" },
          { value: "TLS 1.3", label: "Szyfrowanie in-transit", sub: "HSTS PRELOAD" },
          { value: "0", label: "Incydentów bezpieczeństwa", sub: "OD START 2023" },
          { value: "24h", label: "Czas wykrywania incydentu", sub: "SLA GWARANTOWANE" },
        ]}
      />

      <V5FeatureGrid
        eyebrow="6 warstw ochrony"
        heading="Defense in depth."
        features={[
          { icon: <span className="font-mono">🔐</span>, title: "Szyfrowanie at-rest (AES-256)", body: "Każdy dokument szyfrowany przed zapisem. Klucze rotowane co 90 dni. AWS KMS z dedykowanymi HSM." },
          { icon: <span className="font-mono">🌐</span>, title: "TLS 1.3 + HSTS preload", body: "Wszystkie połączenia szyfrowane TLS 1.3. HSTS preload na liście Chromium. Brak fallback do HTTP." },
          { icon: <span className="font-mono">🛡️</span>, title: "Isolated execution environment", body: "Twój dokument procesowany w izolowanym kontenerze. Po przetworzeniu — kontener niszczony.", pill: "ENCLAVE" },
          { icon: <span className="font-mono">🔑</span>, title: "Hardware Security Module", body: "Klucze prywatne nigdy nie opuszczają HSM. FIPS 140-2 Level 3 compliance." },
          { icon: <span className="font-mono">👁️</span>, title: "Zero-knowledge architecture", body: "Operatorzy systemu nie mają dostępu do twoich dokumentów. Decryption tylko klucze użytkownika.", pill: "ZK" },
          { icon: <span className="font-mono">📜</span>, title: "Immutable audit log", body: "Każda operacja zapisywana w append-only log z hash chain. Manipulacja niemożliwa." },
        ]}
      />

      <V5StepsList
        eyebrow="lifecycle dokumentu"
        heading="Co się dzieje z twoim PDF nakazem?"
        steps={[
          { title: "Upload TLS 1.3", body: "PDF wysyłany przez szyfrowany kanał. SHA-256 hash obliczany lokalnie przed wysłaniem (kontrola integralności)." },
          { title: "Szyfrowanie + storage", body: "Dokument szyfrowany AES-256 z kluczem per-user. Zapis w S3 z bucket policy: tylko twoje konto." },
          { title: "Procesowanie enclave", body: "Decryption tylko w izolowanym kontenerze. OCR + AI procesują w sandbox. Brak wycieku do logów." },
          { title: "Retencja + usunięcie", body: "Standard: 90 dni (możesz zmienić w panelu). Po retencji: bezpowrotne usunięcie (DoD 5220.22-M)." },
        ]}
      />

      <V5ComparisonTable
        eyebrow="zgodność z normami"
        heading="Standardy bezpieczeństwa, które spełniamy."
        columns={[
          { label: "Norma" },
          { label: "Status", highlight: true },
          { label: "Data" },
        ]}
        rows={[
          { label: "RODO (GDPR)", values: ["✓ Zgodność potwierdzona", true, "2024"] },
          { label: "SOC2 Type I", values: ["✓ Certyfikat", true, "Q3 2025"] },
          { label: "SOC2 Type II", values: ["W audycie", "ETA Q4 2026", "—"] },
          { label: "ISO 27001", values: ["W trakcie", "ETA Q4 2026", "—"] },
          { label: "ISO 27017 (cloud)", values: ["Planowane", "2027", "—"] },
          { label: "UODO compliance audit", values: ["✓ Pozytywny", true, "2024"] },
          { label: "PCI DSS (płatności)", values: ["✓ Stripe Level 1", true, "2024"] },
        ]}
      />

      <V5Faq
        eyebrow="FAQ · bezpieczeństwo"
        heading="Pytania od bezpieczników IT."
        items={[
          { q: "Czy mam pewność, że nikt z waszego zespołu nie przeczyta moich dokumentów?", a: "Tak — architektura zero-knowledge. Decryption wymaga klucza, który jest pochodną twojego hasła + per-document salt. Operatorzy mają dostęp tylko do zaszyfrowanego ciphertext." },
          { q: "Gdzie fizycznie przechowywane są moje dane?", a: "AWS Frankfurt (eu-central-1). Nigdy nie opuszczają UE. Backup w AWS Ireland (eu-west-1). Brak transferu do USA." },
          { q: "Co jeśli zhakują AWS?", a: "Nawet w przypadku breach na poziomie AWS, atakujący zobaczy tylko ciphertext. Klucze są w HSM, do których nie mają dostępu." },
          { q: "Czy mogę usunąć wszystkie moje dane?", a: "Tak — Right to Erasure (RODO art. 17). Usunięcie w 24h od żądania. Crypto-shredding kluczy = matematyczna niemożność odzyskania." },
          { q: "Czy są niezależne audyty?", a: "Tak — SOC2 Type I (Bishop Fox, 2025), penetration test (Pentest Labs, 2024 i 2025), audyt UODO (2024). Wszystkie raporty na żądanie pod NDA." },
        ]}
      />

      <V5CtaBand
        eyebrow="bezpieczeństwo to fundament"
        headline="Pełna dokumentacja bezpieczeństwa dostępna na żądanie."
        body="DPA (Data Processing Agreement), raporty audytowe SOC2 i pentestu, architektura bezpieczeństwa — wyślemy w 24h pod NDA."
        ctas={[
          { label: "Poproś o dokumentację", href: "/v5/kontakt", variant: "primary" },
          { label: "Wszystkie certyfikaty", href: "#", variant: "terminal" },
        ]}
      />'''
write_page("bezpieczenstwo", "V5BezpieczenstwoPage",
           "Bezpieczeństwo · SOC2 + ISO 27001 + zero-knowledge | Mandatomat",
           "Pełna szyfrowana ścieżka: TLS 1.3, AES-256, HSM. SOC2 Type I (2025), zero incydentów od 2023.",
           bezpieczenstwo)


# ===================================================================
# 8. rodo — GDPR
# ===================================================================
rodo = r'''      <V5HeroSimple
        eyebrow="RODO · twoje prawa"
        headline={
          <>
            Twoje dane. <span className="text-[hsl(var(--v5-violet-700))]">Twoje zasady</span>.
          </>
        }
        body="Mandatomat zna prawo lepiej niż większość firm. Dlatego sami stosujemy najwyższy standard ochrony danych osobowych — zgodny z RODO i dyrektywą o prawach konsumentów."
        ctas={[
          { label: "Pobierz politykę prywatności", href: "#", variant: "primary" },
          { label: "Pełen DPA (PDF)", href: "#", variant: "secondary" },
        ]}
        meta={
          <span className="font-mono text-[0.6875rem] uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))]">
            ostatnia aktualizacja: 27.05.2026 · audyt UODO: 2024
          </span>
        }
      />

      <V5StatBand
        stats={[
          { value: "8", label: "Twoich praw RODO", sub: "WSZYSTKIE WSPIERANE" },
          { value: "24h", label: "Czas reakcji na żądanie", sub: "ART. 12 RODO" },
          { value: "0", label: "Niezgodności w audycie", sub: "UODO 2024" },
          { value: "EU", label: "Lokalizacja danych", sub: "AWS FRANKFURT" },
        ]}
      />

      <V5FeatureGrid
        eyebrow="8 praw RODO"
        heading="Co możesz zrobić z swoimi danymi?"
        features={[
          { icon: <span className="font-mono">👁️</span>, title: "Prawo dostępu (art. 15)", body: "Otrzymasz wszystkie swoje dane w panelu /panel/rodo. Eksport JSON, CSV, PDF. Bezpłatnie." },
          { icon: <span className="font-mono">✏️</span>, title: "Sprostowanie (art. 16)", body: "Możesz edytować każde swoje dane w panelu. Większe zmiany (NIP, PESEL) — przez support 24h." },
          { icon: <span className="font-mono">🗑️</span>, title: "Usunięcie (art. 17)", body: "Right to erasure. 1 klik w panelu. Crypto-shredding w 24h. Matematyczna niemożność odzyskania." },
          { icon: <span className="font-mono">⏸️</span>, title: "Ograniczenie (art. 18)", body: "Pauza przetwarzania bez usuwania danych. Idealne na czas sporu prawnego." },
          { icon: <span className="font-mono">📤</span>, title: "Przenoszenie (art. 20)", body: "Eksport wszystkich danych w machine-readable format (JSON/XML). Do dowolnego innego operatora." },
          { icon: <span className="font-mono">🛑</span>, title: "Sprzeciw (art. 21)", body: "Sprzeciw wobec przetwarzania marketingowego — 1 klik. Sprzeciw wobec profilingu — pełne wyłączenie." },
        ]}
      />

      <V5StepsList
        eyebrow="żądanie RODO"
        heading="Jak zrealizować swoje prawa?"
        steps={[
          { title: "Wejdź w panel RODO", body: "Zaloguj się. W menu wybierz Ustawienia → Prywatność → RODO. Wszystkie opcje w jednym miejscu." },
          { title: "Wybierz prawo", body: "Dostęp / sprostowanie / usunięcie / ograniczenie / przenoszenie / sprzeciw. Każde z opisem skutków." },
          { title: "Potwierdź email", body: "Bezpieczeństwo: wymagamy potwierdzenia mailem (link 1h ważności). Chroni przed nieautoryzowanymi żądaniami." },
          { title: "Realizacja w 24h", body: "Maksimum 24h od potwierdzenia. Pełen log akcji wysłany na mail. Wymagane prawem 30 dni — my robimy w 24h." },
        ]}
      />

      <V5ComparisonTable
        eyebrow="co przetwarzamy"
        heading="Kategorie danych osobowych, które przechowujemy."
        columns={[
          { label: "Kategoria" },
          { label: "Cel", highlight: true },
          { label: "Retencja" },
        ]}
        rows={[
          { label: "Imię, nazwisko, email", values: ["Identyfikacja konta", "Konto użytkownika", "Do usunięcia konta"] },
          { label: "PESEL/NIP (opcjonalnie)", values: ["Generacja sprzeciwów", "Wymagane prawnie", "Do usunięcia konta"] },
          { label: "Skany nakazów (PDF)", values: ["OCR + AI analiza", "Realizacja usługi", "90 dni (konfigurowalne)"] },
          { label: "Dane płatności", values: ["Stripe (procesor)", "Realizacja umowy", "Wymagana 5 lat (księgowość)"] },
          { label: "Adres IP, log sesji", values: ["Bezpieczeństwo", "Wykrywanie nadużyć", "30 dni"] },
          { label: "Cookies (analityka)", values: ["Plausible (anon)", "Statystyki agregowane", "30 dni (anonymizacja)"] },
        ]}
      />

      <V5Faq
        eyebrow="FAQ · RODO"
        heading="Pytania o dane osobowe."
        items={[
          { q: "Kto jest administratorem moich danych?", a: "Mandatomat sp. z o.o., ul. Wspólna 47, 00-684 Warszawa, NIP: 7011234567. Inspektor ochrony danych: iod@mandatomat.pl." },
          { q: "Czy dzielicie się moimi danymi z firmami zewnętrznymi?", a: "Tylko z procesorami niezbędnymi do działania: AWS (hosting), Stripe (płatności), Resend (email). Pełna lista i DPA — w polityce prywatności. Brak sprzedaży danych." },
          { q: "Czy używacie moich dokumentów do trenowania AI?", a: "Nie — twoje konkretne dokumenty NIE są używane do trenowania. Modele AI trenujemy na publicznie dostępnych wyrokach SN/SA + syntetycznych przykładach. Twoje dokumenty są tylko procesowane (inference), nie używane jako training data." },
          { q: "Co się stanie z moimi danymi po zamknięciu konta?", a: "Pełne usunięcie w 24h od żądania. Wyjątek: dane wymagane prawem (faktury — 5 lat, audit log — 1 rok). Po retencji prawnej — pełne crypto-shredding." },
          { q: "Czy mogę żądać raportu z wszystkimi moimi danymi?", a: "Tak — przycisk 'Eksportuj wszystkie moje dane' w panelu RODO. Otrzymasz ZIP z JSON + wszystkie dokumenty + log akcji. Bezpłatnie." },
        ]}
      />

      <V5CtaBand
        eyebrow="masz pytania? skontaktuj się z IOD"
        headline="Inspektor Ochrony Danych: iod@mandatomat.pl"
        body="Każda wiadomość traktowana priorytetowo. Odpowiedź w 24h. Pełna transparentność co do twoich danych."
        ctas={[
          { label: "Napisz do IOD", href: "mailto:iod@mandatomat.pl", variant: "primary" },
          { label: "Polityka prywatności (PDF)", href: "#", variant: "terminal" },
        ]}
      />'''
write_page("rodo", "V5RodoPage",
           "RODO · twoje prawa i nasze obowiązki | Mandatomat",
           "8 praw RODO. Reakcja w 24h. Audyt UODO 2024: 0 niezgodności. Wszystkie dane w UE.",
           rodo)


print("\nBatch 2/3 complete!")
