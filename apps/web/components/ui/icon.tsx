import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Icon — wrapper around lucide-react icons that enforces stroke width
 * and size consistency across the app. Always import lucide icons
 * through this wrapper when used as decorative slot icons.
 */
export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Pixel size; defaults to 16 (matches icon button slot). */
  size?: number;
  children: React.ReactNode;
  /** When true, exposed to assistive tech with the accompanying label. */
  label?: string;
}

export function Icon({ size = 16, className, children, label, ...props }: IconProps) {
  const semantic = label
    ? { role: "img" as const, "aria-label": label }
    : { "aria-hidden": true as const };
  return (
    <span
      style={{ width: size, height: size }}
      className={cn("inline-flex shrink-0 items-center justify-center", className)}
      {...semantic}
      {...props}
    >
      {children}
    </span>
  );
}
