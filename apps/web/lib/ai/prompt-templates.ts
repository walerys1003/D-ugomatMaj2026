/**
 * Tier 11 — Versioned prompt template registry for legal AI tasks.
 */
export interface PromptTemplate {
  id: string;
  version: string;
  description: string;
  system: string;
  user_template: string; // mustache-style {{var}}
}

export const PROMPT_TEMPLATES: Record<string, PromptTemplate> = {
  "legal.sprzeciw.draft.v3": {
    id: "legal.sprzeciw.draft.v3",
    version: "3.0.0",
    description: "Draft sprzeciw od nakazu zapłaty z analizą zarzutów",
    system:
      "Jesteś polskim prawnikiem specjalizującym się w postępowaniu cywilnym. " +
      "Sporządź sprzeciw od nakazu zapłaty zgodnie z art. 503 k.p.c. " +
      "Używaj formalnego języka prawniczego, powołuj się na podstawy prawne, " +
      "i strukturuj pismo zgodnie z wymaganiami sądu.",
    user_template:
      "Dane sprawy:\n" +
      "- Sąd: {{court}}\n- Sygnatura: {{caseNumber}}\n- Strony: {{parties}}\n" +
      "- Kwota roszczenia: {{amount}}\n- Termin doręczenia: {{servedAt}}\n\n" +
      "Zarzuty pozwanego:\n{{objections}}\n\n" +
      "Sporządź sprzeciw zachowując wszystkie wymogi formalne.",
  },
  "legal.upadlosc.analysis.v2": {
    id: "legal.upadlosc.analysis.v2",
    version: "2.0.0",
    description: "Analiza możliwości ogłoszenia upadłości konsumenckiej",
    system:
      "Jesteś doradcą restrukturyzacyjnym. Analizujesz sytuację dłużnika " +
      "pod kątem ustawy z 28.02.2003 — Prawo upadłościowe oraz ustawy z 15.05.2015 " +
      "o pomocy państwa w spłacie niektórych kredytów mieszkaniowych. " +
      "Oceniaj przesłanki niewypłacalności i rekomenduj ścieżkę działania.",
    user_template:
      "Sytuacja dłużnika:\n" +
      "- Łączne zadłużenie: {{totalDebt}}\n- Miesięczne dochody: {{income}}\n" +
      "- Aktywa: {{assets}}\n- Liczba wierzycieli: {{creditorCount}}\n\n" +
      "Oceń przesłanki upadłości konsumenckiej i przedstaw rekomendację.",
  },
  "legal.exekucja.objection.v2": {
    id: "legal.exekucja.objection.v2",
    version: "2.0.0",
    description: "Skarga na czynności komornika lub powództwo opozycyjne",
    system:
      "Jesteś prawnikiem egzekucyjnym. Sporządzasz skargę na czynności komornika " +
      "(art. 767 k.p.c.) lub powództwo opozycyjne (art. 840 k.p.c.). " +
      "Wskazuj precyzyjnie naruszenia procedury egzekucyjnej.",
    user_template:
      "Czynność komornicza: {{action}}\nData: {{actionDate}}\n" +
      "Komornik: {{bailiff}}\nSygnatura: {{exFile}}\n" +
      "Podstawa zarzutu: {{groundKind}}\n\nSporządź pismo procesowe.",
  },
  "summary.case.timeline.v1": {
    id: "summary.case.timeline.v1",
    version: "1.0.0",
    description: "Streszczenie chronologii sprawy",
    system: "Streszczasz chronologię polskiej sprawy sądowej w 3-5 zdaniach.",
    user_template: "Wydarzenia:\n{{events}}",
  },
  "classify.intent.v1": {
    id: "classify.intent.v1",
    version: "1.0.0",
    description: "Klasyfikacja intencji użytkownika z wiadomości",
    system:
      "Klasyfikujesz intencje użytkowników kancelarii prawnej. " +
      'Zwracaj JSON: {"intent": "...", "confidence": 0-1}. ' +
      "Możliwe intencje: konsultacja_prawna, sprzeciw, upadłość, egzekucja, " +
      "windykacja, mediacja, inne.",
    user_template: "Wiadomość: {{message}}",
  },
};

export function renderTemplate(templateId: string, vars: Record<string, string | number>): { system: string; user: string; templateId: string; version: string } {
  const t = PROMPT_TEMPLATES[templateId];
  if (!t) throw new Error(`unknown_template:${templateId}`);
  const fill = (s: string) => s.replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars[k] ?? ""));
  return { system: fill(t.system), user: fill(t.user_template), templateId: t.id, version: t.version };
}

export function listTemplates(): { id: string; version: string; description: string }[] {
  return Object.values(PROMPT_TEMPLATES).map((t) => ({ id: t.id, version: t.version, description: t.description }));
}
