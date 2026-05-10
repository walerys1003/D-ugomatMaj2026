// Web Push (VAPID) client helpers — subscribe, unsubscribe, format subscription
// for sending to the server. Actual push delivery happens server-side via the
// `web-push` library (encrypted payload + VAPID signed JWT).

export interface PushSubscriptionJSON {
  endpoint: string;
  expirationTime: number | null;
  keys: { p256dh: string; auth: string };
}

export async function isPushSupported(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof Notification === "undefined") return "denied";
  if (Notification.permission === "granted" || Notification.permission === "denied") {
    return Notification.permission;
  }
  return await Notification.requestPermission();
}

export async function subscribeWebPush(vapidPublicKey: string): Promise<PushSubscriptionJSON | null> {
  if (!(await isPushSupported())) return null;
  const perm = await requestNotificationPermission();
  if (perm !== "granted") return null;
  const reg = await navigator.serviceWorker.ready;
  const existing = await reg.pushManager.getSubscription();
  if (existing) return existing.toJSON() as PushSubscriptionJSON;

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });
  return sub.toJSON() as PushSubscriptionJSON;
}

export async function unsubscribeWebPush(): Promise<boolean> {
  if (!(await isPushSupported())) return false;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return false;
  return sub.unsubscribe();
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const buf = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
  return buf;
}

// Server-side delivery — lazy-loaded so build doesn't require web-push at compile time.
export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{ action: string; title: string }>;
}

export async function deliverPush(
  subscription: PushSubscriptionJSON,
  payload: PushPayload,
  cfg: { vapidPublicKey: string; vapidPrivateKey: string; vapidSubject: string },
): Promise<{ ok: boolean; statusCode?: number; error?: string }> {
  try {
    // Lazy import — avoids requiring web-push at build time.
    const webpush = await import("web-push").catch(() => null);
    if (!webpush) {
      return { ok: false, error: "web-push module not installed" };
    }
    (webpush as any).default.setVapidDetails(cfg.vapidSubject, cfg.vapidPublicKey, cfg.vapidPrivateKey);
    await (webpush as any).default.sendNotification(subscription, JSON.stringify(payload));
    return { ok: true };
  } catch (e: any) {
    return { ok: false, statusCode: e?.statusCode, error: e?.message ?? "unknown" };
  }
}
