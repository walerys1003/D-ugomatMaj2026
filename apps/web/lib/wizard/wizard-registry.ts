/**
 * Centralny rejestr wizardów per case_type.
 *
 * Każdy moduł D1–D8 rejestruje tutaj swój `WizardDefinition`.
 * Tier 2 dostarcza tylko D2 (sprzeciw_epu); pozostałe trafią w Tier 3+.
 *
 * Użycie:
 *   const def = getWizardDefinition('sprzeciw_epu');
 *   if (!def) throw new Error('Wizard not registered');
 */
import type { CaseType } from "@/lib/db/types";
import type { WizardDefinition } from "./wizard-types";
import { sprzeciwEpuWizard } from "@/lib/wizard/modules/sprzeciw-epu";
import {
  bikFixWizardBank,
  bikFixWizardBik,
  bikFixWizardUodo,
} from "@/lib/wizard/modules/bik-fix";
import {
  komornikWizardOgraniczenie,
  komornikWizardRaty,
  komornikWizardSkarga,
  komornikWizardUmorzenie,
  komornikWizardZwolnienieKonta,
  komornikWizardZwolnienieSwiadczen,
} from "@/lib/wizard/modules/komornik";
import {
  potraceniaWizardKomornik,
  potraceniaWizardPracodawca,
} from "@/lib/wizard/modules/potracenia";
import { cesjaWizard } from "@/lib/wizard/modules/cesja";
import {
  ugodaWizardPropozycja,
  ugodaWizardRaty,
  ugodaWizardUmorzenie,
} from "@/lib/wizard/modules/ugoda";
import { upadloscWizard } from "@/lib/wizard/modules/upadlosc";
import { upadloscPelnyWizard } from "@/lib/wizard/modules/upadlosc/index-pelny";

const registry: Partial<Record<CaseType, WizardDefinition>> = {
  sprzeciw_epu: sprzeciwEpuWizard,
  bik_reklamacja_bank: bikFixWizardBank,
  bik_reklamacja_bik: bikFixWizardBik,
  bik_skarga_uodo: bikFixWizardUodo,
  komornik_zwolnienie_konta: komornikWizardZwolnienieKonta,
  komornik_zwolnienie_swiadczen: komornikWizardZwolnienieSwiadczen,
  komornik_skarga: komornikWizardSkarga,
  komornik_ograniczenie: komornikWizardOgraniczenie,
  komornik_umorzenie: komornikWizardUmorzenie,
  komornik_raty: komornikWizardRaty,
  potracenia_wniosek_pracodawca: potraceniaWizardPracodawca,
  potracenia_wniosek_komornik: potraceniaWizardKomornik,
  cesja_odpowiedz: cesjaWizard,
  ugoda_raty: ugodaWizardRaty,
  ugoda_umorzenie: ugodaWizardUmorzenie,
  ugoda_propozycja: ugodaWizardPropozycja,
  upadlosc_wniosek: upadloscWizard,
  upadlosc_pelny_wniosek: upadloscPelnyWizard,
};

export function getWizardDefinition(type: CaseType): WizardDefinition | null {
  return registry[type] ?? null;
}

export function listRegisteredWizards(): CaseType[] {
  return Object.keys(registry) as CaseType[];
}
