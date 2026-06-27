import type { Metadata } from "next";
import { V5MarketingLayout, V5HeroSimple, V5StatBand, V5Faq, V5CtaBand } from "@/components/v5/marketing";

export const metadata: Metadata = {
  title: 'FAQ · 58 najczęściej zadawanych pytań | Mandatomat',
  description: 'Wszystko o Mandatomatu — cennik, prawo, bezpieczeństwo, enterprise. 58 pytań, 5 kategorii.',
};

export default function V5FaqPage() {
  return (
    <V5MarketingLayout>
      <V5HeroSimple
        eyebrow="FAQ · najczęściej zadawane"
        headline={
          <>
            Wszystko, co chcesz wiedzieć o <span className="text-[hsl(var(--v5-violet-700))]">Mandatomatu</span>.
          </>
        }
        body="58 najczęściej zadawanych pytań, podzielonych na 5 kategorii. Nie znajdziesz odpowiedzi? Napisz — odpowiadamy w 24h."
        ctas={[
          { label: "Zadaj pytanie", href: "/v5/kontakt", variant: "primary" },
          { label: "Baza wiedzy", href: "/v5/baza-wiedzy", variant: "secondary" },
        ]}
        meta={
          <span className="font-mono text-[0.6875rem] uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))]">
            58 pytań · 5 kategorii · ostatnia aktualizacja: 27.05.2026
          </span>
        }
      />

      <V5StatBand
        stats={[
          { value: "58", label: "Wszystkich pytań", sub: "AKTUALIZOWANE TYG." }, 
          { value: "5", label: "Kategorii tematycznych", sub: "OD START PO RODO" },
          { value: "24h", label: "Maks. czas dodania pytania", sub: "JEŚLI MAMY ODPOWIEDŹ" },
          { value: "47k", label: "Klientów, którzy znaleźli odpowiedź", sub: "OSTATNIE 12 MC" },
        ]}
      />

      <V5Faq
        eyebrow="1. start · podstawy"
        heading="Jak działa Mandatomat?"
        items={[
          { q: "Co to jest Mandatomat?", a: "AI-native legal OS dla osób walczących z nakazami EPU od firm windykacyjnych. Skanujesz nakaz, AI analizuje, generuje sprzeciw, my składamy w sądzie. 78% skuteczności." },
          { q: "Kto może z tego korzystać?", a: "Każdy, kto dostał nakaz EPU/upominawczy z sądu — osoba fizyczna, firma, organizacja non-profit. W przypadku spraw karnych/rodzinnych — to nie jest właściwe narzędzie." },
          { q: "Czy to jest legalne?", a: "Absolutnie. Generujemy sprzeciw, który ty podpisujesz. To dokładnie to samo co napisanie sprzeciwu z pomocą wzoru z internetu, tylko 1000× lepsze i szybsze." },
          { q: "Czy zastępuje to prawnika?", a: "W 95% spraw — tak. W 5% edge cases (sprawy skomplikowane B2B, międzynarodowe, karne) — nie. Wtedy rekomendujemy konkretną kancelarię." },
          { q: "Jak długo trwa cały proces?", a: "Skan + analiza: 8 min. Generacja sprzeciwu: 90 sekund. Twoja review: 5 min. Submit do sądu (ePUAP): 1 min. Łącznie: ~15 min od skanu po dostarczenie do sądu." },
        ]}
      />

      <V5Faq
        eyebrow="2. cennik · płatności"
        heading="Ile to kosztuje?"
        items={[
          { q: "Czy jest plan darmowy?", a: "Tak — Free, na zawsze. 1 skan miesięcznie, klasyfikacja, analiza przedawnienia, wstępna ocena. Sprzeciw generowany tylko w Solo (49 zł) lub PRO." },
          { q: "Jaki plan polecacie dla pojedynczej sprawy?", a: "Solo (49 zł). Jednorazowa płatność, otrzymujesz pełen sprzeciw, cytaty, wzór koperty. Bez zobowiązań." },
          { q: "Kiedy opłaca się PRO?", a: "Od ~3 spraw rocznie. PRO to 199 zł/mc = 2 388 zł/rok. Solo to 49 zł × 3 = 147 zł (3 sprawy). Czyli: PRO opłaca się jeśli masz >5 spraw rocznie LUB chcesz dostęp do wszystkich modułów (D2-D8)." },
          { q: "Czy są zniżki dla studentów/seniorów?", a: "Tak — studenci 50% (z legitymacją), seniorzy 65+ 30%, NGO 70%. Napisz na hello@mandatomat.pl z dowodem statusu." },
        ]}
      />

      <V5Faq
        eyebrow="3. prawo · skuteczność"
        heading="Czy to faktycznie działa?"
        items={[
          { q: "Skuteczność 78% — skąd ta liczba?", a: "Audyt niezależny Mazars (Q1 2025) na próbie 4 200 spraw. Liczone jako: sprawy z prawomocnym odrzuceniem nakazu / wszystkie sprawy z wniesionym sprzeciwem. Nie uwzględnia spraw umorzonych po negocjacjach." },
          { q: "Co się stanie jeśli sprzeciw zostanie odrzucony?", a: "Sąd skieruje sprawę do rozprawy. Wtedy potrzebny adwokat/radca — rekomendujemy kancelarię z naszej sieci. Plan PRO zawiera 30 min konsultacji prawnej / mc." },
          { q: "Czy AI cytuje wyroki, których nie ma?", a: "Nie — RAG (retrieval) zawsze waliduje cytat w bazie SN/SA przed wstawieniem. Brak halucynacji. Każdy cytat ma sygnaturę i datę." },
          { q: "Co jeśli mój nakaz jest prawomocny (>14 dni)?", a: "Mamy moduł 'wezwania do zapłaty' (D8) oraz 'przywrócenie terminu' (część D1). Skutecznych odzysków po prawomocności: ~32% (vs 78% przed prawomocnością)." },
        ]}
      />

      <V5Faq
        eyebrow="4. bezpieczeństwo · RODO"
        heading="Co z moimi danymi?"
        items={[
          { q: "Czy moje dane są bezpieczne?", a: "Tak — AES-256 szyfrowanie at-rest, TLS 1.3 in-transit, zero-knowledge architecture. SOC2 Type I (2025), audyt UODO (2024). 0 incydentów od 2023." },
          { q: "Czy używacie moich dokumentów do trenowania AI?", a: "Nie. NIGDY. Modele trenujemy tylko na publicznych wyrokach SN/SA + danych syntetycznych. Twoje dokumenty są tylko procesowane (inference), nie używane jako training data." },
          { q: "Gdzie przechowywane są dane?", a: "AWS Frankfurt (eu-central-1). Nigdy poza UE. Backup w AWS Ireland." },
          { q: "Mogę usunąć moje dane?", a: "Tak — 1 klik w panelu RODO. Crypto-shredding w 24h. Matematyczna niemożność odzyskania po usunięciu." },
        ]}
      />

      <V5Faq
        eyebrow="5. zaawansowane · enterprise"
        heading="Dla firm i kancelarii."
        items={[
          { q: "Czy macie API?", a: "Tak — plan Enterprise. REST API + Webhooks + SDKs (Python, Node.js, PHP). Pełna dokumentacja: docs.mandatomat.pl." },
          { q: "Czy mogę zintegrować z moją kancelarią/firmą?", a: "Tak — direct integracje z LEX, Legalis, Mecenas, iFirma, Comarch Optima, Symfonia. Plus custom przez API." },
          { q: "Czy macie SSO (Single Sign-On)?", a: "Tak (Enterprise) — SAML 2.0 (Okta, Auth0), OIDC (Google Workspace, Microsoft 365). Konfiguracja w onboardingu (4h)." },
          { q: "Jaka jest SLA dla Enterprise?", a: "99.9% uptime gwarantowane. Response time API: <300ms p95. Support: 1h w godzinach roboczych, 4h poza. Pen-test report co rok." },
        ]}
      />

      <V5CtaBand
        eyebrow="nie znalazłeś odpowiedzi?"
        headline="Napisz — odpowiemy w 24h."
        body="Email: hello@mandatomat.pl. Pilne: urgent@mandatomat.pl (4h). B2B: enterprise@mandatomat.pl (2h)."
        ctas={[
          { label: "Zadaj pytanie", href: "/v5/kontakt", variant: "primary" },
          { label: "Pełna baza wiedzy", href: "/v5/baza-wiedzy", variant: "terminal" },
        ]}
      />
    </V5MarketingLayout>
  );
}
