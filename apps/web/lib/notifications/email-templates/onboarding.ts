/**
 * PLAN.md zad. 243 — Onboarding email sequence (5 emaili).
 *
 * Sekwencja edukacyjna dla nowych użytkowników:
 *   - Day 1  — "Pierwsze kroki" (po rejestracji, ≠ welcome który wysyłamy
 *              od razu) — wprowadzenie do Skanera D1.
 *   - Day 3  — "Sprzeciw EPU 14 dni" — D2 + przypomnienie o terminach.
 *   - Day 7  — "KomornikShield + kwoty wolne" — D3 + link do kalkulatorów.
 *   - Day 14 — "BIK i czyszczenie historii" — D5.
 *   - Day 30 — "Ugoda i upadłość konsumencka" — D7/D8 + zaproszenie do
 *              programu partnerskiego.
 *
 * Każdy email:
 *   - Tarcza ton: Calm Authority, edukacyjnie, nigdy panicznie.
 *   - Konkretny CTA: 1 akcja per email (nie spam linkami).
 *   - Unsubscribe link wbudowany w wrapHtml (footer).
 *
 * Schedulowanie: scheduledFor w dispatchNotification (Tier 4 osobny job).
 *
 * Variables (wspólne dla całej sekwencji):
 *   - full_name (opcjonalne)  — imię/nazwisko z profilu
 *   - app_url   (opcjonalne)  — override domeny (default: appUrl())
 */
import { appUrl, escapeHtml, wrapHtml, wrapText } from "./_layout";
import type { RenderedEmail } from "../types";

function greeting(variables: Record<string, string | number>): string {
  const name = String(variables.full_name ?? "").trim();
  return name ? `Cześć ${escapeHtml(name)},` : "Cześć,";
}

function greetingText(variables: Record<string, string | number>): string {
  const name = String(variables.full_name ?? "").trim();
  return name ? `Cześć ${name},` : "Cześć,";
}

// -----------------------------------------------------------------------------
// Day 1 — Skaner Nakazu (D1)
// -----------------------------------------------------------------------------
export function renderOnboardingDay1(
  variables: Record<string, string | number>,
): RenderedEmail {
  const ctaHref = appUrl("/skaner-nakazu");
  const subject = "Pierwsze kroki — zacznij od darmowego Skanera";
  const preheader = "Wgraj zdjęcie nakazu, dostaniesz analizę za 2 minuty.";
  const hero = "Pierwsze kroki w Długomacie";

  const bodyHtml = `
<p>${greeting(variables)}</p>
<p>jeżeli dostałeś nakaz zapłaty, list od komornika lub wezwanie z banku — zacznij od najprostszego narzędzia.</p>
<p style="margin-top:16px;"><strong>Skaner Nakazu (D1)</strong> jest <em>darmowy</em> i działa tak:</p>
<ol style="margin:8px 0 0;padding-left:20px;color:#1F2937;">
  <li>Robisz zdjęcie pisma telefonem (lub PDF z e-Sądu).</li>
  <li>OCR + AI analizuje treść w 30 sekund.</li>
  <li>Dostajesz: typ pisma, sygnaturę, kwotę, termin, listę zarzutów.</li>
</ol>
<p style="margin-top:16px;color:#1F2937;">Bez logowania, bez płatności. Jeśli warto pisać sprzeciw — kierujemy Cię do odpowiedniego modułu.</p>`.trim();

  const bodyText = [
    greetingText(variables),
    "",
    "Jeżeli dostałeś nakaz zapłaty, list od komornika lub wezwanie z banku —",
    "zacznij od najprostszego narzędzia.",
    "",
    "Skaner Nakazu (D1) jest DARMOWY i działa tak:",
    "1. Robisz zdjęcie pisma telefonem (lub PDF z e-Sądu).",
    "2. OCR + AI analizuje treść w 30 sekund.",
    "3. Dostajesz: typ pisma, sygnaturę, kwotę, termin, listę zarzutów.",
    "",
    "Bez logowania, bez płatności.",
    "",
    `Otwórz Skaner: ${ctaHref}`,
  ].join("\n");

  return {
    subject,
    bodyText: wrapText({
      preheader,
      hero,
      bodyText,
      bodyHtml,
      cta: { label: "Wypróbuj Skaner Nakazu", href: ctaHref },
    }),
    bodyHtml: wrapHtml({
      preheader,
      hero,
      bodyText,
      bodyHtml,
      cta: { label: "Wypróbuj Skaner Nakazu", href: ctaHref },
    }),
  };
}

// -----------------------------------------------------------------------------
// Day 3 — Sprzeciw EPU (D2) + przypomnienie 14 dni
// -----------------------------------------------------------------------------
export function renderOnboardingDay3(
  variables: Record<string, string | number>,
): RenderedEmail {
  const ctaHref = appUrl("/moduly/sprzeciw-epu");
  const subject = "Masz nakaz z e-Sądu? Sprzeciw to 14 dni od doręczenia";
  const preheader = "Po terminie nakaz staje się prawomocny — bez sprzeciwu egzekucja rusza automatycznie.";
  const hero = "Sprzeciw od nakazu zapłaty (EPU)";

  const bodyHtml = `
<p>${greeting(variables)}</p>
<p>nakaz zapłaty z elektronicznego postępowania upominawczego (EPU) ma jedną kluczową cechę: jeśli <strong>nie złożysz sprzeciwu w 14 dni od doręczenia</strong>, staje się prawomocny — i komornik może rozpocząć egzekucję bez dalszej zgody sądu.</p>
<p style="margin-top:16px;"><strong>Co Ci daje sprzeciw?</strong></p>
<ul style="margin:8px 0 0;padding-left:20px;color:#1F2937;">
  <li>Automatyczne uchylenie nakazu — sprawa wraca do zwykłego trybu.</li>
  <li>Możliwość zarzutu przedawnienia (część roszczeń ma 3-letni termin).</li>
  <li>Czas na negocjacje, ugodę, ratalne spłaty.</li>
</ul>
<p style="margin-top:16px;color:#1F2937;">Generator D2 przygotowuje pełne pismo (PDF) z odwołaniem do art. 505⁵ KPC w 12 minut. Cena: 49 zł.</p>`.trim();

  const bodyText = [
    greetingText(variables),
    "",
    "Nakaz zapłaty z e-Sądu (EPU) ma kluczową regułę:",
    "JEŚLI NIE ZŁOŻYSZ SPRZECIWU W 14 DNI OD DORĘCZENIA,",
    "staje się prawomocny — komornik rusza automatycznie.",
    "",
    "Sprzeciw daje Ci:",
    "- automatyczne uchylenie nakazu (powrót do zwykłego trybu),",
    "- możliwość zarzutu przedawnienia (część roszczeń = 3 lata),",
    "- czas na ugodę / raty.",
    "",
    "Generator D2 — pełne pismo PDF w 12 minut, 49 zł.",
    "",
    `Sprawdź moduł: ${ctaHref}`,
  ].join("\n");

  return {
    subject,
    bodyText: wrapText({
      preheader,
      hero,
      bodyText,
      bodyHtml,
      cta: { label: "Zobacz Sprzeciw EPU", href: ctaHref },
    }),
    bodyHtml: wrapHtml({
      preheader,
      hero,
      bodyText,
      bodyHtml,
      cta: { label: "Zobacz Sprzeciw EPU", href: ctaHref },
    }),
  };
}

// -----------------------------------------------------------------------------
// Day 7 — Komornik (D3) + kalkulatory kwot wolnych
// -----------------------------------------------------------------------------
export function renderOnboardingDay7(
  variables: Record<string, string | number>,
): RenderedEmail {
  const ctaHref = appUrl("/kalkulatory");
  const subject = "Komornik zajął konto? Sprawdź ile naprawdę może zająć";
  const preheader = "Kwota wolna od zajęcia: 75% min. wynagrodzenia + świadczenia 500+ całkowicie chronione.";
  const hero = "Twoje prawa wobec komornika";

  const bodyHtml = `
<p>${greeting(variables)}</p>
<p>jeśli komornik zajął Ci konto bankowe lub wynagrodzenie — pamiętaj, że <strong>nie cała kwota podlega egzekucji</strong>. Polskie prawo precyzyjnie określa kwoty wolne:</p>
<ul style="margin:8px 0 0;padding-left:20px;color:#1F2937;">
  <li><strong>Rachunek bankowy</strong> — 75% minimalnego wynagrodzenia miesięcznie wolne (art. 54 Prawa bankowego).</li>
  <li><strong>Wynagrodzenie</strong> — minimum netto pozostaje w dyspozycji pracownika (art. 87¹ KP).</li>
  <li><strong>500+, alimenty, świadczenia rodzinne</strong> — całkowicie wyłączone z egzekucji (art. 833 § 6 KPC).</li>
</ul>
<p style="margin-top:16px;color:#1F2937;">Mamy 3 darmowe kalkulatory — sprawdź konkretną kwotę dla swojej sytuacji. Jeśli komornik / pracodawca ignoruje przepisy, moduł D3 KomornikShield (79 zł) i D4 PotrąceniaStop (49 zł) wygenerują odpowiednie pisma.</p>`.trim();

  const bodyText = [
    greetingText(variables),
    "",
    "Komornik zajął konto / wynagrodzenie? Nie cała kwota podlega egzekucji.",
    "",
    "Polskie prawo precyzyjnie określa kwoty wolne:",
    "- Rachunek bankowy: 75% min. wynagrodzenia miesięcznie (art. 54 PB).",
    "- Wynagrodzenie: min. netto pozostaje pracownikowi (art. 87¹ KP).",
    "- 500+, alimenty, świadczenia rodzinne: całkowicie wyłączone (art. 833 § 6 KPC).",
    "",
    "Mamy 3 DARMOWE kalkulatory — sprawdź swoją sytuację.",
    "",
    `Otwórz kalkulatory: ${ctaHref}`,
  ].join("\n");

  return {
    subject,
    bodyText: wrapText({
      preheader,
      hero,
      bodyText,
      bodyHtml,
      cta: { label: "Otwórz kalkulatory", href: ctaHref },
    }),
    bodyHtml: wrapHtml({
      preheader,
      hero,
      bodyText,
      bodyHtml,
      cta: { label: "Otwórz kalkulatory", href: ctaHref },
    }),
  };
}

// -----------------------------------------------------------------------------
// Day 14 — BIK (D5)
// -----------------------------------------------------------------------------
export function renderOnboardingDay14(
  variables: Record<string, string | number>,
): RenderedEmail {
  const ctaHref = appUrl("/moduly/bik");
  const subject = "Czyszczenie historii w BIK — kiedy i jak";
  const preheader = "5 lat to nie wyrok. Wpisy mogą być usunięte wcześniej, jeśli są błędne.";
  const hero = "BIK — Twoje prawa";

  const bodyHtml = `
<p>${greeting(variables)}</p>
<p>standardowy okres przechowywania danych w BIK to 5 lat od spłaty zadłużenia. Ale to <strong>nie znaczy, że nie da się tego skrócić</strong>:</p>
<ul style="margin:8px 0 0;padding-left:20px;color:#1F2937;">
  <li><strong>Błędne wpisy</strong> — bank ma obowiązek je sprostować (art. 16 RODO).</li>
  <li><strong>Długi przedawnione</strong> — wpis o egzekucji nieaktualny, można żądać zaktualizowania.</li>
  <li><strong>Cofnięcie zgody</strong> — w niektórych przypadkach możesz cofnąć zgodę na przetwarzanie.</li>
  <li><strong>Skarga do UODO</strong> — gdy bank nie reaguje na reklamację (max 30 dni).</li>
</ul>
<p style="margin-top:16px;color:#1F2937;">Moduł BIK-Fix (D5, 49 zł) generuje reklamację do banku/BIK + opcjonalnie skargę do UODO. Pełna ścieżka prawna w 15 minut.</p>`.trim();

  const bodyText = [
    greetingText(variables),
    "",
    "Standardowy okres w BIK to 5 lat od spłaty. Ale to nie znaczy,",
    "że nie da się go skrócić:",
    "- Błędne wpisy: bank musi sprostować (art. 16 RODO).",
    "- Długi przedawnione: można żądać aktualizacji wpisu.",
    "- Skarga do UODO gdy bank nie reaguje (max 30 dni).",
    "",
    "Moduł BIK-Fix (D5, 49 zł) — reklamacja + skarga UODO w 15 min.",
    "",
    `Sprawdź moduł: ${ctaHref}`,
  ].join("\n");

  return {
    subject,
    bodyText: wrapText({
      preheader,
      hero,
      bodyText,
      bodyHtml,
      cta: { label: "Zobacz BIK-Fix", href: ctaHref },
    }),
    bodyHtml: wrapHtml({
      preheader,
      hero,
      bodyText,
      bodyHtml,
      cta: { label: "Zobacz BIK-Fix", href: ctaHref },
    }),
  };
}

// -----------------------------------------------------------------------------
// Day 30 — Ugoda (D7) i upadłość konsumencka (D8)
// -----------------------------------------------------------------------------
export function renderOnboardingDay30(
  variables: Record<string, string | number>,
): RenderedEmail {
  const ctaHref = appUrl("/moduly/upadlosc");
  const subject = "Gdy długi wymykają się spod kontroli — ugoda lub upadłość";
  const preheader = "Dwie ścieżki na restart — propozycja ratalna lub upadłość konsumencka.";
  const hero = "Restart finansowy — Twoje opcje";

  const bodyHtml = `
<p>${greeting(variables)}</p>
<p>jeżeli długi przerastają możliwości spłaty, masz w polskim prawie dwie konkretne ścieżki:</p>
<p style="margin-top:16px;"><strong>1. Ugoda (UgodoMat — D7, 49 zł)</strong></p>
<p style="margin:4px 0 0;color:#1F2937;">Propozycja dla wierzyciela: rozłożenie na raty, umorzenie odsetek, redukcja kwoty głównej. Pismo z konkretną ofertą i analizą Twojej zdolności miesięcznej.</p>
<p style="margin-top:16px;"><strong>2. Upadłość konsumencka (D8, 79 zł)</strong></p>
<p style="margin:4px 0 0;color:#1F2937;">Wniosek do sądu o ogłoszenie upadłości — możliwość umorzenia długów po planie spłat. Pismo z analizą przesłanek (niewypłacalność, brak winy umyślnej) i kompletem załączników.</p>
<p style="margin-top:16px;color:#0F172A;font-size:14px;"><strong>To nie jest wstyd</strong> — upadłość konsumencka jest narzędziem, które polskie prawo daje każdemu, kto nie radzi sobie z długami. W 2024 r. ogłoszono ich w Polsce ponad 20 000.</p>`.trim();

  const bodyText = [
    greetingText(variables),
    "",
    "Jeżeli długi przerastają możliwości spłaty — masz dwie konkretne ścieżki:",
    "",
    "1. UGODA (UgodoMat — D7, 49 zł)",
    "Propozycja dla wierzyciela: raty, umorzenie odsetek, redukcja kwoty.",
    "Pismo z analizą zdolności miesięcznej.",
    "",
    "2. UPADŁOŚĆ KONSUMENCKA (D8, 79 zł)",
    "Wniosek do sądu — umorzenie długów po planie spłat.",
    "W 2024 r. ogłoszono ich w Polsce ponad 20 000.",
    "",
    "To nie jest wstyd — to narzędzie, które polskie prawo daje każdemu.",
    "",
    `Sprawdź moduły: ${ctaHref}`,
  ].join("\n");

  return {
    subject,
    bodyText: wrapText({
      preheader,
      hero,
      bodyText,
      bodyHtml,
      cta: { label: "Zobacz moduł Upadłość", href: ctaHref },
    }),
    bodyHtml: wrapHtml({
      preheader,
      hero,
      bodyText,
      bodyHtml,
      cta: { label: "Zobacz moduł Upadłość", href: ctaHref },
    }),
  };
}
