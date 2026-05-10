import type { Metadata } from "next";
import { KnowledgeArticle, buildArticleJsonLd, buildBreadcrumbJsonLd } from "@/components/marketing/knowledge-article";

const SLUG = "d9-d16-przeglad-modulow";
const TITLE = "Moduły D9-D16 — co nowego w Długomacie 2026";
const DESCRIPTION =
  "Przewodnik po 8 nowych modułach Długomata: Upadłość-Pro, zwrot opłat, bank/RF, PUODO, raty, zwolnienie z kosztów, zażalenie, anty-egzekucja.";
const UPDATED = "2026-05-12";

export const metadata: Metadata = {
  title: `${TITLE} | Długomat`,
  description: DESCRIPTION,
  alternates: { canonical: `/baza-wiedzy/${SLUG}` },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "article", publishedTime: UPDATED, modifiedTime: UPDATED },
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildArticleJsonLd({ title: TITLE, description: DESCRIPTION, slug: SLUG, updatedAt: UPDATED })).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd({ articleTitle: TITLE, articleSlug: SLUG })).replace(/</g, "\\u003c") }} />
      <KnowledgeArticle
        title={TITLE}
        category="Aktualności"
        readingMinutes={7}
        updatedAt={UPDATED}
        lead="W maju 2026 r. uruchomiliśmy 8 nowych modułów (D9-D16), które odpowiadają na luki w naszej ofercie: od pełnej upadłości konsumenckiej, przez zwrot opłat windykacyjnych, po powództwo przeciwegzekucyjne. Wszystkie są w fazie beta — działają, ale prosimy o feedback przed pełnym wdrożeniem."
        sections={[
          {
            id: "lista",
            title: "Pełna lista modułów D9-D16",
            content: (
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>D9 — Upadłość-Pro</strong>: pełny wniosek o upadłość konsumencką z 25 załącznikami.</li>
                <li><strong>D10 — Zwrot opłat windykacyjnych</strong>: pozew na podstawie art. 36a UKK z wyliczeniem nadpłaty.</li>
                <li><strong>D11 — Reklamacja Bank/RF</strong>: pisma do banku + wniosek do Rzecznika Finansowego.</li>
                <li><strong>D12 — Skarga PUODO</strong>: skarga do Urzędu Ochrony Danych Osobowych.</li>
                <li><strong>D13 — Raty sądowe</strong>: wniosek o rozłożenie zasądzonej kwoty na raty (art. 320 KPC).</li>
                <li><strong>D14 — Zwolnienie z kosztów sądowych</strong>: wniosek z 12-sekcyjnym oświadczeniem.</li>
                <li><strong>D15 — Zażalenie na klauzulę</strong>: pilne — 7-dniowy termin od doręczenia.</li>
                <li><strong>D16 — Anty-egzekucja</strong>: powództwo o pozbawienie tytułu wykonalności (art. 840 KPC).</li>
              </ul>
            ),
          },
          {
            id: "co-nowego",
            title: "Co technicznie się zmieniło?",
            content: (
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Wizard z gałęziowaniem</strong>: pytania zależne (show_if / skip_if) — zamiast pokazywać wszystko, pokazujemy tylko to, co dotyczy Twojej sytuacji.</li>
                <li><strong>AI "radca podpowiada"</strong>: panel boczny z sugestiami w czasie wypełniania kreatora.</li>
                <li><strong>Generacja v2 (PLAN → WRITE → POLISH)</strong>: trzy fazy zamiast jednej — większa jakość, mniejsze ryzyko halucynacji.</li>
                <li><strong>Hallucination Guard 2.0</strong>: drugi model audytuje wygenerowane pismo i blokuje publikację, jeśli wykryje krytyczne błędy.</li>
                <li><strong>Wersjonowanie dokumentów</strong>: pełna historia zmian z możliwością przywrócenia.</li>
              </ul>
            ),
          },
          {
            id: "beta",
            title: "Status beta — co to znaczy?",
            content: (
              <ul className="list-disc pl-6 space-y-1">
                <li>Wszystkie pisma są merytorycznie poprawne i przeszły weryfikację radców prawnych.</li>
                <li>Ceny w wersji beta są niższe o 20%.</li>
                <li>Możesz zgłaszać uwagi przez przycisk „Zgłoś feedback" w każdym module.</li>
                <li>Po 100 ukończonych sprawach moduł wychodzi z beta i trafia do oferty głównej.</li>
              </ul>
            ),
          },
        ]}
        legalSources={[
          "Ustawa z 28 lutego 2003 r. Prawo upadłościowe",
          "Ustawa z 12 maja 2011 r. o kredycie konsumenckim — art. 36a",
          "Ustawa z 5 sierpnia 2015 r. o rozpatrywaniu reklamacji przez podmioty rynku finansowego",
          "Rozporządzenie 2016/679 (RODO)",
          "Ustawa z 17 listopada 1964 r. Kodeks postępowania cywilnego — art. 320, 776, 840",
          "Ustawa z 28 lipca 2005 r. o kosztach sądowych w sprawach cywilnych — art. 102",
        ]}
      />
    </>
  );
}
