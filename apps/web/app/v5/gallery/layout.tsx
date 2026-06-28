import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "V5 Primitives Gallery · Mandatomat",
  description:
    "Storybook-equivalent for V5-INFRA: every primitive in isolation, all variants & states.",
};

export default function V5GalleryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
