import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Display,
  Eyebrow,
  Heading,
  Text,
} from "@/components/ui/typography";

const FAQ_ITEMS = [
  { q: "Czy Dlugomat jest kancelaria prawna?", a: "Nie. Dlugomat to narzedzie technologiczne, ktore generuje gotowe wzory pism procesowych z wykorzystaniem AI i bazy aktualnego orzecznictwa. Kazde pismo przed wysylka weryfikujesz osobiscie. Jesli sprawa jest zlozona - kierujemy do wspolpracujacej kancelarii." },
  { q: "Co jesli sad odrzuci moj sprzeciw?", a: "94% naszych pism jest przyjmowanych do akt bez brakow formalnych — walidator Haiku 4.5 sprawdza kompletnosc i zgodnosc z KPC zanim zobaczysz wynik. Jesli mimo to sad odrzuci pismo z powodow formalnych po naszej stronie — zgodnie z §7 regulaminu zwracamy cala kwote w 14 dni, bez pytan. To nie marketingowy slogan, to zapis w umowie." },
  { q: "Co jesli nie zgadzam sie z analiza AI?", a: "Masz 24h na zglosenie watpliwosci — kazde pismo ozaczone jako sporne trafia do naszego radcy prawnego, ktory weryfikuje je recznie. Jesli AI mialo racje — kontynuujemy bez doplaty. Jesli pomylilo sie — korygujemy pismo bezplatnie i zwracamy 50% oplaty za niedogodnosc. Czlowiek zawsze ma ostatnie slowo." },
  { q: "Jak szybko otrzymam gotowe pismo?", a: "Sredni czas pelnego procesu to 12 minut: 2 minuty OCR, 5-7 minut formularza, 2-3 minuty generowania pisma przez AI. Po wygenerowaniu mozesz pobrac PDF natychmiast." },
  { q: "Czy moje dane sa bezpieczne?", a: "Wszystkie dane sa szyfrowane (AES-256 at-rest, TLS 1.3 in-transit) i przechowywane w UE. Stosujemy Row-Level Security - zaden inny uzytkownik (ani my) nie ma dostepu do Twoich dokumentow. Pelna zgodnosc z RODO." },
  { q: "Ile kosztuje wygenerowanie pisma?", a: "Skaner nakazu jest darmowy. Konkretne pisma kosztuja 79-249 PLN, w zaleznosci od modulu (D2 Sprzeciwomat EPU - 159 PLN, D5 BIK-Fix - 129 PLN, D7 UgodoMat - 119 PLN). Pakiety pism (np. komorniczy zestaw 4 pism) - 199 PLN. Faktura VAT na zyczenie." },
  { q: "Co jesli nie rozumiem tresci dokumentu?", a: "Kazdy termin prawniczy w Dlugomacie ma tooltip z prostym wyjasnieniem. Asystent AI w panelu odpowie na pytania konkretne dla Twojej sprawy. Nie uzywamy zargonu bez wyjasnienia." },
  { q: "Czy dziala na telefonie?", a: "Tak, projekt mobile-first. 70% naszych uzytkownikow konczy proces na telefonie. OCR dziala na zdjeciach z aparatu - nie potrzebujesz skanera." },
  { q: "Czy moge edytowac wygenerowane pismo?", a: "Tak. Po wygenerowaniu masz pelny edytor - mozesz zmienic kazde zdanie. PDF jest generowany dopiero po Twojej akceptacji." },
  { q: "Co z VAT i faktura?", a: "Wszystkie ceny zawieraja 23% VAT. Faktura jest wystawiana automatycznie przez Fakturownie w ciagu 24h. Dla firm z waznym numerem VAT-UE stosujemy reverse-charge." },
  { q: "Jakie pisma obsluguje Dlugomat?", a: "32 typy pism w 8 modulach: D1 Skaner, D2 Sprzeciwomat EPU, D3 KomornikShield, D4 PotraceniaStop, D5 BIK-Fix, D6 CesjaCheck, D7 UgodoMat, D8 Upadlosc-Lite. Pelna lista w sekcji Moduly." },
  { q: "Co jesli AI sie pomyli?", a: "Kazde pismo przechodzi walidacje Haiku 4.5 (sprawdzenie kompletnosci i spojnosci). Przy niskim wyniku walidacji nastepuje retry z korektami. Jesli to nie zadziala, system uzyje gotowego szablonu eksperckiego - nigdy nie wygenerujesz pustego pisma." },
] as const;

/**
 * FAQ v4 — primitives-driven, type scale +1, ink-* palette.
 *
 * Zmiany vs v3:
 *  - Heading primitives zamiast raw <h2>/<h3>
 *  - Type scale: Display lvl 2 dla title (był text-3xl/4xl, teraz 5xl/6xl)
 *  - Aside cards: Heading lvl 3 (xl/2xl) zamiast text-base
 *  - Paleta: ink-* zamiast dlugomat-*
 *  - Eyebrow primitive zamiast raw uppercase text
 */
export function FAQ() {
  return (
    <section
      aria-labelledby="faq-title"
      className="bg-ink-50 py-20 sm:py-24 lg:py-28"
    >
      <div className="container max-w-4xl px-6">
        <header className="text-center">
          <div className="flex justify-center">
            <Eyebrow tone="neutral" tracking="wide">
              Najczęstsze pytania
            </Eyebrow>
          </div>
          <Display level={2} id="faq-title" className="mt-4">
            Wiemy, że masz wątpliwości. Mamy odpowiedzi.
          </Display>
        </header>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card elevation="subtle" className="p-2">
            <Accordion type="single" collapsible>
              {FAQ_ITEMS.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-[16px] font-semibold">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent>
                    <Text size="base" tone="default" className="leading-relaxed">
                      {item.a}
                    </Text>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>

          <aside className="space-y-4">
            <Card elevation="subtle" urgency="warning" className="p-5">
              <Badge tone="warning" withDot>
                Pilny termin?
              </Badge>
              <Heading level={3} as="h3" className="mt-3">
                Masz mniej niż 7 dni
              </Heading>
              <Text size="sm" tone="default" className="mt-2">
                Skontaktuj się z naszą obsługą — oddzwonimy w 30 minut w godzinach
                roboczych.
              </Text>
              <a
                href="/kontakt"
                className="mt-3 inline-flex items-center gap-1 text-[14px] font-semibold text-ink-900 transition-colors hover:text-ink-700"
              >
                Przejdź do kontaktu →
              </a>
            </Card>

            <Card elevation="subtle" className="p-5">
              <Heading level={3} as="h3">
                Centrum wiedzy
              </Heading>
              <Text size="sm" tone="default" className="mt-2">
                Ponad 60 artykułów o przedawnieniu, EPU, egzekucji, RODO i
                upadłości.
              </Text>
              <a
                href="/baza-wiedzy"
                className="mt-3 inline-flex items-center gap-1 text-[14px] font-semibold text-ink-900 transition-colors hover:text-ink-700"
              >
                Otwórz bazę wiedzy →
              </a>
            </Card>
          </aside>
        </div>
      </div>
    </section>
  );
}

/**
 * JSON-LD generator for FAQPage schema. Embedded server-side for SEO rich results.
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
