import type { Metadata } from "next";
import { KnowledgeArticle, buildArticleJsonLd, buildBreadcrumbJsonLd } from "@/components/marketing/knowledge-article";

const SLUG = "powodztwo-przeciwegzekucyjne";
const TITLE = "Powództwo przeciwegzekucyjne — pozbawienie tytułu wykonawczego (art. 840 KPC)";
const DESCRIPTION =
  "Kiedy złożyć pozew o pozbawienie tytułu wykonalności: przedawnienie, spłata, zwolnienie z długu, brak wymagalności. Procedura, koszty, szanse.";
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
        category="Egzekucja"
        readingMinutes={14}
        updatedAt={UPDATED}
        lead="Art. 840 KPC pozwala pozbawić tytuł wykonawczy w całości lub części wykonalności. To „ostatnia linia obrony” gdy komornik prowadzi egzekucję z tytułu, który jest formalnie prawidłowy, ale nie powinien być wykonywany. Najczęstsze podstawy: przedawnienie roszczenia, spłata długu, zwolnienie z długu, brak wymagalności."
        sections={[
          {
            id: "podstawy",
            title: "Podstawy powództwa (art. 840 KPC)",
            content: (
              <>
                <p>Pkt 1: dłużnik przeczy zdarzeniom, na których oparto tytuł, w szczególności gdy:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Spełnił świadczenie — całkowicie lub częściowo (zapłacił dług).</li>
                  <li>Roszczenie wygasło (przedawnienie po powstaniu tytułu).</li>
                  <li>Zostało zawarte porozumienie (ugoda, zwolnienie z długu).</li>
                  <li>Nastąpiło rozwiązanie umowy.</li>
                </ul>
                <p>Pkt 2: zdarzenia powstałe po powstaniu tytułu, wskutek których wykonanie tytułu byłoby sprzeczne z prawem.</p>
              </>
            ),
          },
          {
            id: "przedawnienie",
            title: "Przedawnienie roszczenia po wydaniu wyroku",
            content: (
              <>
                <p>Roszczenie stwierdzone prawomocnym wyrokiem (art. 125 §1 KC) przedawnia się po <strong>6 latach</strong> (świadczenia okresowe — 3 lata).</p>
                <p>Termin biegnie od uprawomocnienia. Czynności komornika nie przerywają biegu przedawnienia (uchwała SN III CZP 25/19) — chyba że są skuteczne. Wpisanie do KRD nie przerywa.</p>
              </>
            ),
          },
          {
            id: "splata",
            title: "Spłata po wyroku — jak udowodnić",
            content: (
              <ul className="list-disc pl-6 space-y-1">
                <li>Potwierdzenia przelewów (bankowe lub PayU/Przelewy24).</li>
                <li>Pokwitowania od wierzyciela (z datą + kwotą).</li>
                <li>Zaświadczenie wierzyciela o spłacie (najlepiej).</li>
                <li>Wyciąg z konta komornika (jeśli egzekucja zaspokoiła roszczenie).</li>
                <li>Świadkowie — w przypadku wpłat gotówkowych.</li>
              </ul>
            ),
          },
          {
            id: "oplata",
            title: "Opłata sądowa",
            content: (
              <p>
                Opłata stosunkowa: <strong>5% wartości przedmiotu sporu</strong> (maks. 200 tys. zł). Wartość = kwota egzekwowana, której powództwo dotyczy. Można wystąpić o zwolnienie z kosztów (zob. nasz artykuł o zwolnieniu z kosztów sądowych).
              </p>
            ),
          },
          {
            id: "wstrzymanie-egzekucji",
            title: "Wstrzymanie egzekucji",
            content: (
              <>
                <p>Sam pozew nie wstrzymuje egzekucji! Trzeba osobno wnioskować o:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Zabezpieczenie powództwa przez wstrzymanie postępowania egzekucyjnego (art. 755 KPC).</li>
                  <li>Sąd zwykle wstrzymuje, gdy powództwo jest wiarygodne i istnieje ryzyko nieodwracalnej szkody.</li>
                </ul>
              </>
            ),
          },
        ]}
        relatedModule={{
          code: "D16",
          title: "Anty-egzekucja — pozew art. 840 KPC",
          href: "/app/sprawy/nowa?typ=pozbawienie_tytulu_wykonalnosci",
          description: "Generator pozwu z 3 wariantami: przedawnienie, spłata, brak wymagalności. AI dobiera dowody i orzecznictwo SN.",
          price: "199 zł",
        }}
        legalSources={[
          "art. 840, 755 ustawy z 17 listopada 1964 r. Kodeks postępowania cywilnego",
          "art. 125 §1, 118 ustawy z 23 kwietnia 1964 r. Kodeks cywilny",
          "Uchwała SN z 26 października 2021 r., III CZP 25/19 — czynności komornika a przedawnienie",
          "Postanowienie SN z 8 października 2020 r., II CSK 142/20",
        ]}
      />
    </>
  );
}
