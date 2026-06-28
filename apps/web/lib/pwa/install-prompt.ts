// PWA install prompt helper — captures the `beforeinstallprompt` event so the
// app can show a custom install CTA at the right moment (not immediately on load).

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

let deferred: BeforeInstallPromptEvent | null = null;

export function attachInstallListener(onAvailable: () => void, onInstalled: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const beforeHandler = (e: Event) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    onAvailable();
  };
  const installedHandler = () => {
    deferred = null;
    onInstalled();
  };
  window.addEventListener("beforeinstallprompt", beforeHandler);
  window.addEventListener("appinstalled", installedHandler);
  return () => {
    window.removeEventListener("beforeinstallprompt", beforeHandler);
    window.removeEventListener("appinstalled", installedHandler);
  };
}

export async function triggerInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  if (!deferred) return "unavailable";
  try {
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    deferred = null;
    return outcome;
  } catch {
    return "dismissed";
  }
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // iOS Safari
    // @ts-expect-error — navigator.standalone is iOS-only, not in TS lib types
    window.navigator?.standalone === true
  );
}
