import type { Metadata } from "next";
import { V5MarketingLayout, V5HeroSimple, V5StatBand, V5FeatureGrid, V5StepsList, V5Faq, V5CtaBand, V5ComparisonTable } from "@/components/v5/marketing";

export const metadata: Metadata = {
  title: 'RODO · twoje prawa i nasze obowiązki | Mandatomat',
  description: '8 praw RODO. Reakcja w 24h. Audyt UODO 2024: 0 niezgodności. Wszystkie dane w UE.',
};

export default function V5RodoPage() {
  return (
    <V5MarketingLayout>
      <V5HeroSimple
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
      />
    </V5MarketingLayout>
  );
}
