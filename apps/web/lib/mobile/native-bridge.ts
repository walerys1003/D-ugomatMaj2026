/**
 * Długomat — Tier 9 — Native mobile bridge (Capacitor/React Native interop).
 *
 * Plan: web-app embedded in Capacitor wrapper (iOS + Android) — share most
 * code, expose native features (Push, Biometrics, Files, Camera) przez Bridge.
 *
 * Detection:
 *  - `window.Capacitor` exists → native app
 *  - `Capacitor.getPlatform()` → 'ios' | 'android' | 'web'
 *
 * Native modules (lazy via dynamic import — nie blokuje web bundle):
 *  - @capacitor/push-notifications — APNs/FCM
 *  - @capacitor/local-notifications — termin reminders offline
 *  - @capacitor/filesystem — zapis PDF lokalnie
 *  - @capacitor/share — share sheet
 *  - @capacitor/biometric-auth — Face ID / Touch ID
 *  - @capacitor/camera — OCR letter capture
 *  - @capacitor/network — offline detection
 */

export type NativePlatform = "ios" | "android" | "web";

interface CapacitorGlobal {
  getPlatform?: () => NativePlatform;
  isNativePlatform?: () => boolean;
  Plugins?: Record<string, unknown>;
}

declare global {
  interface Window {
    Capacitor?: CapacitorGlobal;
  }
}

export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  return !!window.Capacitor?.isNativePlatform?.();
}

export function getNativePlatform(): NativePlatform {
  if (typeof window === "undefined") return "web";
  return window.Capacitor?.getPlatform?.() ?? "web";
}

/**
 * Pluggable native feature interface.
 * Każda metoda gracefully fallback'uje do web equivalent (lub no-op).
 */
export interface NativeBridge {
  isNative(): boolean;
  platform(): NativePlatform;

  // PUSH
  registerPush(): Promise<{ token: string | null; granted: boolean }>;
  unregisterPush(): Promise<void>;

  // LOCAL NOTIFICATIONS (offline reminders)
  scheduleLocalNotification(input: {
    id: number;
    title: string;
    body: string;
    fireAt: Date;
  }): Promise<void>;
  cancelLocalNotification(id: number): Promise<void>;

  // FILESYSTEM
  savePdf(filename: string, base64: string): Promise<string | null>;

  // SHARE
  shareDocument(input: { title: string; url: string; text?: string }): Promise<void>;

  // BIOMETRICS
  biometricsAvailable(): Promise<boolean>;
  authenticateBiometric(reason: string): Promise<boolean>;

  // CAMERA (OCR letter)
  captureLetterImage(): Promise<{ base64: string; mimeType: string } | null>;

  // NETWORK
  isOnline(): Promise<boolean>;
}

class WebNativeBridge implements NativeBridge {
  isNative(): boolean {
    return false;
  }
  platform(): NativePlatform {
    return "web";
  }
  async registerPush(): Promise<{ token: string | null; granted: boolean }> {
    // Web Push fallback (handled separately by lib/notifications/push-notifications.ts)
    return { token: null, granted: false };
  }
  async unregisterPush(): Promise<void> {}
  async scheduleLocalNotification(_input: {
    id: number;
    title: string;
    body: string;
    fireAt: Date;
  }): Promise<void> {
    // Browser doesn't allow scheduled local notifications without SW periodic background sync
  }
  async cancelLocalNotification(_id: number): Promise<void> {}
  async savePdf(filename: string, base64: string): Promise<string | null> {
    // Web: trigger download via anchor
    if (typeof document === "undefined") return null;
    const a = document.createElement("a");
    a.href = `data:application/pdf;base64,${base64}`;
    a.download = filename;
    a.click();
    return null;
  }
  async shareDocument(input: { title: string; url: string; text?: string }): Promise<void> {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share(input).catch(() => undefined);
    }
  }
  async biometricsAvailable(): Promise<boolean> {
    return false;
  }
  async authenticateBiometric(_reason: string): Promise<boolean> {
    return false;
  }
  async captureLetterImage(): Promise<{ base64: string; mimeType: string } | null> {
    // Web: input[type=file capture=environment] handled in UI
    return null;
  }
  async isOnline(): Promise<boolean> {
    return typeof navigator !== "undefined" ? navigator.onLine : true;
  }
}

class CapacitorBridge implements NativeBridge {
  isNative(): boolean {
    return true;
  }
  platform(): NativePlatform {
    return getNativePlatform();
  }

  private async plugin<T>(name: string): Promise<T | null> {
    if (typeof window === "undefined") return null;
    const plugins = window.Capacitor?.Plugins;
    return (plugins?.[name] as T) ?? null;
  }

  async registerPush(): Promise<{ token: string | null; granted: boolean }> {
    const PushNotifications = await this.plugin<any>("PushNotifications");
    if (!PushNotifications) return { token: null, granted: false };
    try {
      const perm = await PushNotifications.requestPermissions();
      if (perm.receive !== "granted") return { token: null, granted: false };
      const tokenP = new Promise<string | null>((resolve) => {
        PushNotifications.addListener("registration", (r: { value: string }) =>
          resolve(r.value),
        );
        PushNotifications.addListener("registrationError", () => resolve(null));
      });
      await PushNotifications.register();
      const token = await tokenP;
      return { token, granted: true };
    } catch {
      return { token: null, granted: false };
    }
  }

  async unregisterPush(): Promise<void> {
    const PushNotifications = await this.plugin<any>("PushNotifications");
    if (PushNotifications?.unregister) await PushNotifications.unregister();
  }

  async scheduleLocalNotification(input: {
    id: number;
    title: string;
    body: string;
    fireAt: Date;
  }): Promise<void> {
    const LocalNotifications = await this.plugin<any>("LocalNotifications");
    if (!LocalNotifications) return;
    await LocalNotifications.schedule({
      notifications: [
        {
          id: input.id,
          title: input.title,
          body: input.body,
          schedule: { at: input.fireAt },
        },
      ],
    });
  }

  async cancelLocalNotification(id: number): Promise<void> {
    const LocalNotifications = await this.plugin<any>("LocalNotifications");
    if (!LocalNotifications) return;
    await LocalNotifications.cancel({ notifications: [{ id }] });
  }

  async savePdf(filename: string, base64: string): Promise<string | null> {
    const Filesystem = await this.plugin<any>("Filesystem");
    if (!Filesystem) return null;
    try {
      const res = await Filesystem.writeFile({
        path: filename,
        data: base64,
        directory: "DOCUMENTS",
        recursive: true,
      });
      return res.uri ?? null;
    } catch {
      return null;
    }
  }

  async shareDocument(input: { title: string; url: string; text?: string }): Promise<void> {
    const Share = await this.plugin<any>("Share");
    if (!Share) return;
    await Share.share(input).catch(() => undefined);
  }

  async biometricsAvailable(): Promise<boolean> {
    const Bio = await this.plugin<any>("BiometricAuth");
    if (!Bio) return false;
    try {
      const r = await Bio.checkBiometry();
      return !!r.isAvailable;
    } catch {
      return false;
    }
  }

  async authenticateBiometric(reason: string): Promise<boolean> {
    const Bio = await this.plugin<any>("BiometricAuth");
    if (!Bio) return false;
    try {
      const r = await Bio.authenticate({ reason });
      return !!r.success;
    } catch {
      return false;
    }
  }

  async captureLetterImage(): Promise<{ base64: string; mimeType: string } | null> {
    const Camera = await this.plugin<any>("Camera");
    if (!Camera) return null;
    try {
      const photo = await Camera.getPhoto({
        quality: 85,
        resultType: "base64",
        source: "CAMERA",
      });
      return { base64: photo.base64String, mimeType: `image/${photo.format}` };
    } catch {
      return null;
    }
  }

  async isOnline(): Promise<boolean> {
    const Network = await this.plugin<any>("Network");
    if (!Network) return typeof navigator !== "undefined" ? navigator.onLine : true;
    try {
      const r = await Network.getStatus();
      return !!r.connected;
    } catch {
      return true;
    }
  }
}

let bridgeSingleton: NativeBridge | null = null;

export function getNativeBridge(): NativeBridge {
  if (bridgeSingleton) return bridgeSingleton;
  bridgeSingleton = isNativeApp() ? new CapacitorBridge() : new WebNativeBridge();
  return bridgeSingleton;
}
