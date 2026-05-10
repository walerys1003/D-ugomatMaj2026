"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

export const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    value?: number;
    tone?: "primary" | "success" | "warning" | "danger";
  }
>(({ className, value, tone = "primary", ...props }, ref) => {
  const fill =
    tone === "success"
      ? "bg-accent-500"
      : tone === "warning"
        ? "bg-warn-500"
        : tone === "danger"
          ? "bg-danger-500"
          : "bg-dlugomat-500";

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-iron-100 dark:bg-dlugomat-850",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn("h-full w-full flex-1 transition-all duration-smooth ease-shield-out", fill)}
        style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = "Progress";
