import type { Metadata } from "next";
import { V5MarketingLayout, V5HeroSimple, V5StatBand, V5FeatureGrid, V5Faq, V5CtaBand, V5Testimonial, V5ComparisonTable } from "@/components/v5/marketing";

export const metadata: Metadata = {
  title: 'Mandatomat vs konkurencja · uczciwe porównanie | Mandatomat',
  description: 'Porównanie z kancelariami, kalkulatorami, forami i konkurentami AI. 78% skuteczność, 49 zł, 8 minut.',
};

export default function V5PorownanieKonkurencjaPage() {
  return (
    <V5MarketingLayout>
      <V5HeroSimple
        eyebrow="porównanie · konkurencja"
        headline={
          <>
            Jak Mandatomat wypada na tle <span className="text-[hsl(var(--v5-violet-700))]">innych rozwiązań</span>?
          </>
        }
        body="Uczciwe porównanie z 4 głównymi konkurentami: tradycyjna kancelaria, kalkulatory online, fora prawne, oraz pierwsi konkurenci AI. Bez marketingowego BS."
        ctas={[
          { label: "Zobacz tabelę", href: "#table", variant: "primary" },
          { label: "Cennik Mandatomat", href: "/v5/cennik", variant: "secondary" },
        ]}
      />

      <V5StatBand
        stats={[
          { value: "78%", label: "Skuteczność Mandatomat", sub: "AUDYT 2025" },
          { value: "49 zł", label: "Cena za sprzeciw", sub: "VS 800-2000 ZŁ KANCELARIA" },
          { value: "8 min", label: "Średni czas wygenerowania", sub: "VS 5-14 DNI MANUAL" },
          { value: "1.", label: "Pierwszy AI-native legal w PL", sub: "DOMENA: 2023" },
        ]}
      />

      <V5ComparisonTable
        eyebrow="pełne porównanie"
        heading="5 rozwiązań side-by-side."
        columns={[
          { label: "Kancelaria" },
          { label: "Kalkulator" },
          { label: "Forum" },
          { label: "AI konkurenta" },
          { label: "Mandatomat", highlight: true },
        ]}
        rows={[
          { label: "Cena za sprzeciw", values: ["800-2000 zł", "0 zł (limit)", "0 zł", "129 zł", "49 zł"] },
          { label: "Czas otrzymania", values: ["5-14 dni", "natychmiast", "1-3 dni", "30 min", "8 min"] },
          { label: "Bazuje na orzecznictwie", values: [true, false, false, "częściowo", true] },
          { label: "Aktualne wyroki SN 2025", values: ["zależy", false, false, false, true] },
          { label: "Personalizacja do sprawy", values: ["pełna", false, false, "podstawowa", "pełna"] },
          { label: "Skanowanie nakazu (OCR)", values: [false, false, false, true, true] },
          { label: "Wykrycie przedawnienia", values: ["manual", false, false, true, true] },
          { label: "ePUAP submission", values: [false, false, false, false, true] },
          { label: "Cytaty wyroków w sprzeciwie", values: [true, false, false, false, true] },
          { label: "Reakcja na pisma sądu", values: ["płatna", false, false, false, "włączone w PRO"] },
          { label: "Skuteczność (audyt 2025)", values: ["68%", "n/d", "n/d", "52%", "78%"] },
        ]}
      />

      <V5FeatureGrid
        eyebrow="dla każdego klienta"
        heading="Kiedy Mandatomat jest najlepszy, a kiedy nie?"
        cols={2}
        features={[
          { icon: <span className="font-mono">✓</span>, title: "Mandatomat WYGRYWA gdy...", body: "Masz nakaz EPU, sprawa typowa (cesja, telekom, pożyczka), wartość 1-50k zł, chcesz szybko + tanio + bez prawnika.", pill: "78% przypadków" },
          { icon: <span className="font-mono">⚠️</span>, title: "Wybierz kancelarię gdy...", body: "Sprawa skomplikowana (B2B z zagranicą, spory wielowartościowe >100k, postępowanie arbitrażowe). Lub jeśli sprawa jest emocjonalnie ciężka." },
          { icon: <span className="font-mono">📊</span>, title: "Kalkulator online wystarczy gdy...", body: "Chcesz tylko wstępnie sprawdzić, czy roszczenie jest przedawnione. Nie zamierzasz pisać sprzeciwu sam." },
          { icon: <span className="font-mono">💬</span>, title: "Forum prawne pomoże gdy...", body: "Masz pytanie 'jak to działa' — nie konkretną sprawę. Forum to dobre miejsce na edukację, nie generację dokumentów." },
        ]}
      />

      <V5Testimonial
        quote="Wcześniej płaciłem kancelarii 1 800 zł za każdy sprzeciw. Teraz 49 zł na Mandatomatu. Mam więcej spraw i więcej wygranych. Kancelarię zostawiam na sprawy karne, gospodarcze, rozwodowe."
        author="Tomasz B."
        role="Klient PRO od 11 miesięcy"
        org="Warszawa"
      />

      <V5Faq
        eyebrow="FAQ · porównanie"
        heading="Najczęściej pytane."
        items={[
          { q: "Czy AI nie popełnia więcej błędów niż człowiek?", a: "Statystycznie nie — w typowych sprawach (95% przypadków) AI generuje sprzeciw zgodny z bieżącą linią orzeczniczą, często lepszy niż młody radca prawny. W edge cases (5%) potrzebny jest człowiek — wtedy zawsze rekomendujemy kancelarię." },
          { q: "Czy dane konkurencji są aktualne?", a: "Tak — porównanie z 2025 r. Każdy konkurent ma link do swojej strony w stopce. Jeśli mają nowsze funkcje — zaktualizujemy tabelę w 48h od weryfikacji." },
          { q: "Co jeśli sprawa jest skomplikowana?", a: "W planie PRO masz 30 min konsultacji z radcą prawnym. Jeśli to nie wystarczy — rekomendujemy konkretną kancelarię z naszej sieci partnerskiej (Mandatomat nie pobiera prowizji od kancelarii)." },
        ]}
      />

      <V5CtaBand
        eyebrow="zobacz różnicę"
        headline="78% skuteczności. 49 zł. 8 minut. Sprawdź sam."
        body="Pierwsza analiza nakazu zawsze gratis. Nie kupujesz kota w worku."
        ctas={[
          { label: "Sprawdź swoją sprawę", href: "/skaner-nakazu", variant: "primary" },
          { label: "Zobacz cennik", href: "/v5/cennik", variant: "terminal" },
        ]}
      />
    </V5MarketingLayout>
  );
}
