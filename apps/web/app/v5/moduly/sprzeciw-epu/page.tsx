import type { Metadata } from "next";

import { V5ModulePage } from "@/components/v5/marketing/module-page";
import { MODULE_BY_SLUG } from "@/components/v5/marketing/module-data";

const data = MODULE_BY_SLUG["sprzeciw-epu"];

export const metadata: Metadata = {
  title: `${data.eyebrow} · Mandatomat V5`,
  description: data.body,
};

export default function V5ModuleSprzeciwEpuPage() {
  return <V5ModulePage data={data} />;
}
