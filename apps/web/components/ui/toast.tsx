"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { X, CheckCircle2, AlertTriangle, AlertOctagon, Info } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Toast — non-blocking confirmations + warnings. Used by:
 *   - "Pismo wygenerowane" (success)
 *   - "Termin za 3 dni" (warning)
 *   - "Nie udało się wczytać sprawy" (danger)
 */
export const ToastProvider = ToastPrimitive.Provider;
export const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4",
      "sm:bottom-4 sm:right-4 sm:top-auto sm:flex-col sm:max-w-md",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = "ToastViewport";

const TONE_STYLES = {
  info: {
    border: "border-dlugomat-200 dark:border-dlugomat-700",
    bg: "bg-card",
    icon: <Info className="size-5 shrink-0 text-dlugomat-600" aria-hidden />,
  },
  success: {
    border: "border-accent-200 dark:border-accent-600/40",
    bg: "bg-card",
    icon: <CheckCircle2 className="size-5 shrink-0 text-accent-600" aria-hidden />,
  },
  warning: {
    border: "border-warn-500/40",
    bg: "bg-card",
    icon: <AlertTriangle className="size-5 shrink-0 text-warn-600" aria-hidden />,
  },
  danger: {
    border: "border-danger-500/40",
    bg: "bg-card",
    icon: <AlertOctagon className="size-5 shrink-0 text-danger-600" aria-hidden />,
  },
} as const;

export type ToastTone = keyof typeof TONE_STYLES;

export interface ToastProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> {
  tone?: ToastTone;
}

export const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  ToastProps
>(({ className, tone = "info", children, ...props }, ref) => {
  const t = TONE_STYLES[tone];
  return (
    <ToastPrimitive.Root
      ref={ref}
      className={cn(
        "group pointer-events-auto relative flex items-start gap-3 overflow-hidden",
        "rounded-xl border p-4 pr-10 shadow-pop",
        "data-[state=open]:animate-fade-up data-[state=closed]:animate-out data-[state=closed]:fade-out",
        t.border,
        t.bg,
        className
      )}
      {...props}
    >
      {t.icon}
      <div className="flex-1">{children}</div>
      <ToastPrimitive.Close
        aria-label="Zamknij powiadomienie"
        className="absolute right-2 top-2 rounded-md p-1 text-iron-500 hover:bg-iron-100 dark:hover:bg-dlugomat-850"
      >
        <X className="size-4" />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
});
Toast.displayName = "Toast";

export const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn("text-fluid-sm font-semibold text-dlugomat-900 dark:text-iron-50", className)}
    {...props}
  />
));
ToastTitle.displayName = "ToastTitle";

export const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn("mt-1 text-fluid-xs text-iron-700 dark:text-iron-300", className)}
    {...props}
  />
));
ToastDescription.displayName = "ToastDescription";

// =============================================================================
// useToast() — imperative API used across the app
// =============================================================================
interface ToastItem {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  push: (tone: ToastTone, title: string, options?: { description?: string; duration?: number }) => void;
  info:    (title: string, options?: { description?: string }) => void;
  success: (title: string, options?: { description?: string }) => void;
  warning: (title: string, options?: { description?: string }) => void;
  error:   (title: string, options?: { description?: string }) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastViewportProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);

  const push = React.useCallback<ToastContextValue["push"]>((tone, title, options) => {
    const id = crypto.randomUUID();
    setItems((prev) => [
      ...prev,
      { id, tone, title, description: options?.description, duration: options?.duration ?? 5000 },
    ]);
  }, []);

  const value = React.useMemo<ToastContextValue>(
    () => ({
      push,
      info:    (title, options) => push("info",    title, options),
      success: (title, options) => push("success", title, options),
      warning: (title, options) => push("warning", title, options),
      error:   (title, options) => push("danger",  title, options),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      <ToastProvider swipeDirection="right" duration={5000}>
        {children}
        {items.map((it) => (
          <Toast
            key={it.id}
            tone={it.tone}
            duration={it.duration}
            onOpenChange={(open) => {
              if (!open) setItems((prev) => prev.filter((p) => p.id !== it.id));
            }}
          >
            <ToastTitle>{it.title}</ToastTitle>
            {it.description && <ToastDescription>{it.description}</ToastDescription>}
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    // SSR-safe / no-op fallback so server-imported callers don't crash.
    return {
      push: () => {},
      info: () => {},
      success: () => {},
      warning: () => {},
      error: () => {},
    };
  }
  return ctx;
}
