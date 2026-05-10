import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_ITEMS = [
  {
    q: "Czy Długomat jest kancelarią prawną?",
    a: "Nie. Długomat to narzędzie technologiczne, które generuje gotowe wzory pism procesowych z wykorzystaniem AI i bazy aktualnego orzecznictwa. Każde pismo przed wysyłką weryfikujesz osobiście. Jeśli sprawa jest złożona — kierujemy do współpracującej kancelarii.",
  },
  {
    q: "Jak szybko otrzymam gotowe pismo?",
    a: "Średni czas pełnego procesu to 12 minut: 2 minuty OCR, 5–7 minut formularza, 2–3 minuty generowania pisma przez AI. Po wygenerowaniu możesz pobrać PDF natychmiast.",
  },
  {
    q: "Co jeśli sąd odrzuci moje pismo?",
    a: "Walidator Haiku 4.5 sprawdza kompletność każdego pisma. Jeśli jakiś element wymaga uzupełnienia — system poinformuje Cię przed wysyłką. Wzory pism są zgodne z aktualnym KPC i orzecznictwem SN.",
  },
  {
    q: "Czy moje dane są bezpieczne?",
    a: "Wszystkie dane są szyfrowane (AES-256 at-rest, TLS 1.3 in-transit) i przechowywane w UE. Stosujemy Row-Level Security — żaden inny użytkownik (ani my) nie ma dostępu do Twoich dokumentów. Pełna zgodność z RODO.",
  },
  {
    q: "Ile kosztuje wygenerowanie pisma?",
    a: "Skaner nakazu jest darmowy. Konkretne pisma kosztują 79–249 zł, w zależności od modułu. Pakiety pism (np. komorniczy zestaw 4 pism) — 199 zł. Faktura VAT na życzenie.",
  },
  {
    q: "Co jeśli nie rozumiem treści dokumentu?",
    a: "Każdy termin prawniczy w Długomacie ma tooltip z prostym wyjaśnieniem. Asystent AI w panelu odpowie na pytania konkretne dla Twojej sprawy. Nie używamy żargonu bez wyjaśnienia.",
  },
  {
    q: "Czy działa na telefonie?",
    a: "Tak, projekt mobile-first. 70% naszych użytkowników kończy proces na telefonie. OCR działa na zdjęciach z aparatu — nie potrzebujesz skanera.",
  },
  {
    q: "Czy mogę edytować wygenerowane pismo?",
    a: "Tak. Po wygenerowaniu masz pełny edytor — możesz zmienić każde zdanie. PDF jest generowany dopiero po Twojej akceptacji.",
  },
  {
    q: "Co z VAT i fakturą?",
    a: "Wszystkie ceny zawierają 23% VAT. Faktura jest wystawiana automatycznie przez Fakturownię w ciągu 24h. Dla firm z ważnym numerem VAT-UE stosujemy reverse-charge.",
  },
  {
    q: "Czy mogę dostać zwrot pieniędzy?",
    a: "Tak, w ciągu 14 dni od zakupu, jeśli pismo nie zostało jeszcze pobrane w wersji finalnej. Zgodnie z UE prawem konsumenckim.",
  },
  {
    q: "Jakie pisma obsługuje Długomat?",
    a: "32 typy pism w 8 modułach: sprzeciw EPU, skargi komornicze, kwota wolna, korekta BIK, zarzuty cesji, propozycja ugody, wniosek upadłościowy, wnioski egzekucyjne, i więcej. Pełna lista w sekcji Moduły.",
  },
  {
    q: "Co jeśli AI się pomyli?",
    a: "Każde pismo przechodzi walidację Haiku 4.5 (sprawdzenie kompletności i spójności). Przy niskim wyniku walidacji następuje retry z korektami. Jeśli to nie zadziała, system użyje gotowego szablonu eksperckiego — nigdy nie wygenerujesz pustego pisma.",
  },
] as const;

export function FAQ() {
  return (
    <section
      aria-labelledby="faq-title"
      className="bg-iron-50/60 py-20 sm:py-24 dark:bg-dlugomat-950/40"
    >
      <div className="container max-w-3xl">
        <div className="text-center">
          <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
            Najczęstsze pytania
          </p>
          <h2
            id="faq-title"
            className="mt-2 text-balance text-fluid-4xl font-bold tracking-tight text-dlugomat-900 dark:text-white"
          >
            Wiemy, że masz wątpliwości. Mamy odpowiedzi.
          </h2>
        </div>

        <Accordion type="single" collapsible className="mt-10">
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent>
                <p className="leading-relaxed">{item.a}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/**
 * JSON-LD generator for FAQPage schema. Embedded in the page server-side
 * for SEO — Google rich result eligibility.
 */
export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
