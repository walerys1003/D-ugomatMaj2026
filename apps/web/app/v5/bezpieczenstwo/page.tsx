import type { Metadata } from "next";
import { V5MarketingLayout, V5HeroSimple, V5StatBand, V5FeatureGrid, V5StepsList, V5Faq, V5CtaBand, V5ComparisonTable } from "@/components/v5/marketing";

export const metadata: Metadata = {
  title: 'Bezpieczeństwo · SOC2 + ISO 27001 + zero-knowledge | Mandatomat',
  description: 'Pełna szyfrowana ścieżka: TLS 1.3, AES-256, HSM. SOC2 Type I (2025), zero incydentów od 2023.',
};

export default function V5BezpieczenstwoPage() {
  return (
    <V5MarketingLayout>
      <V5HeroSimple
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
      />
    </V5MarketingLayout>
  );
}
