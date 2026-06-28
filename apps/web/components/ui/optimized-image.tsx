import * as React from "react";
import Image, { type ImageProps } from "next/image";

import { cn } from "@/lib/utils";

/**
 * Tier 31 — OptimizedImage wrapper.
 * - Domyślnie loading="lazy" (chyba że priority)
 * - placeholder="blur" jeśli `blurDataURL` podany
 * - automatyczne sizes dla responsive
 * - aspect-ratio container chroni przed CLS
 */

interface Props extends Omit<ImageProps, "alt"> {
  alt: string; // wymagany dla a11y
  aspectRatio?: "video" | "square" | "portrait" | "landscape" | string;
  containerClassName?: string;
}

const ASPECT_CLASSES: Record<string, string> = {
  video: "aspect-video",
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
};

export function OptimizedImage({
  alt,
  aspectRatio,
  containerClassName,
  className,
  sizes,
  priority,
  ...rest
}: Props) {
  const ratioClass = aspectRatio
    ? ASPECT_CLASSES[aspectRatio] ?? `aspect-[${aspectRatio}]`
    : undefined;

  return (
    <div className={cn("relative overflow-hidden", ratioClass, containerClassName)}>
      <Image
        alt={alt}
        sizes={sizes ?? "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        className={cn("object-cover", className)}
        {...rest}
      />
    </div>
  );
}
