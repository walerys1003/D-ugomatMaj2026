import type { Metadata } from "next";
import { KnowledgeArticle, buildArticleJsonLd, buildBreadcrumbJsonLd } from "@/components/marketing/knowledge-article";

const SLUG = "reklamacja-bank-rzecznik-finansowy";
const TITLE = "Reklamacja w banku i wniosek do Rzecznika Finansowego";
const DESCRIPTION =
  "Jak złożyć skuteczną reklamację w banku, kiedy bank musi ją uznać, oraz jak skierować sprawę do Rzecznika Finansowego.";
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
        category="Bankowość"
        readingMinutes={11}
        updatedAt={UPDATED}
        lead="Ustawa o rozpatrywaniu reklamacji przez podmioty rynku finansowego (z 5 sierpnia 2015 r.) daje bankom 30 dni na odpowiedź. Brak odpowiedzi = uznanie reklamacji w całości (art. 8). Jeśli bank odmówi, sprawę można skierować do Rzecznika Finansowego, który prowadzi mediację i może wystąpić z istotnym poglądem przed sądem."
        sections={[
          {
            id: "co-mozesz-reklamowac",
            title: "Co można reklamować w banku?",
            content: (
              <ul className="list-disc pl-6 space-y-1">
                <li>Nieprawidłowe naliczenie opłat (prowizje, ubezpieczenia, opłaty za przewalutowanie).</li>
                <li>Zawyżone oprocentowanie / błędną kalkulację raty.</li>
                <li>Brak ujawnienia ryzyka kursowego (kredyty CHF, EUR).</li>
                <li>Bezpodstawne wypowiedzenie umowy lub wpis do BIK.</li>
                <li>Nieautoryzowane transakcje, oszustwa phishingowe.</li>
                <li>Klauzule abuzywne w umowie (art. 385¹ KC).</li>
              </ul>
            ),
          },
          {
            id: "termin-30-dni",
            title: "Termin 30 dni — uznanie reklamacji „milcząco”",
            content: (
              <p>
                Bank ma 30 dni kalendarzowych na rzeczową odpowiedź. W przypadkach szczególnie skomplikowanych — 60 dni, ale musi pisemnie poinformować o przedłużeniu. Brak odpowiedzi = <strong>reklamacja uznana w całości</strong> (art. 8 ustawy z 5 sierpnia 2015 r.).
              </p>
            ),
          },
          {
            id: "rzecznik-finansowy",
            title: "Rzecznik Finansowy — kiedy i jak?",
            content: (
              <>
                <p>Jeśli bank odmówi uwzględnienia reklamacji, możesz złożyć wniosek do Rzecznika Finansowego (RF):</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Mediacja — bezpłatna, nieformalna procedura ugodowa.</li>
                  <li>„Istotny pogląd” przed sądem — RF może wystąpić z opinią prawną w toczącym się postępowaniu (art. 36 ustawy o Rzeczniku Finansowym).</li>
                  <li>Pozasądowe rozstrzyganie sporów (PRS) — wiążące dla podmiotu rynku finansowego.</li>
                </ul>
              </>
            ),
          },
          {
            id: "co-dalej",
            title: "Co dalej — jeśli RF nie pomoże?",
            content: (
              <p>
                Pozostaje pozew do sądu cywilnego — wartość przedmiotu sporu wyznacza sąd rejonowy (do 75 tys. zł) lub okręgowy (powyżej). Termin przedawnienia: 6 lat dla konsumenta (art. 118 KC).
              </p>
            ),
          },
        ]}
        relatedModule={{
          code: "D11",
          title: "Reklamacja Bank/RF",
          href: "/app/sprawy/nowa?typ=reklamacja_bank_rf",
          description: "AI generuje reklamację z powołaniem na art. 8 ustawy i ewentualny wniosek do Rzecznika Finansowego.",
          price: "79 zł",
        }}
        legalSources={[
          "Ustawa z 5 sierpnia 2015 r. o rozpatrywaniu reklamacji przez podmioty rynku finansowego (Dz.U. 2015 poz. 1348)",
          "Ustawa z 5 sierpnia 2015 r. o Rzeczniku Finansowym (Dz.U. 2015 poz. 1348)",
          "art. 385¹ KC — klauzule abuzywne",
          "Wyrok SN z 11 grudnia 2019 r., V CSK 382/18 — kredyty CHF",
        ]}
      />
    </>
  );
}
