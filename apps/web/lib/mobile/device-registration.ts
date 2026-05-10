/**
 * Długomat — Tier 9 — Mobile device registration (push tokens + sessions).
 *
 * Każde native app instance ma:
 *  - device_id (UUID generated on first launch, persisted in Keychain/Keystore)
 *  - push_token (APNs token iOS, FCM token Android)
 *  - platform (ios/android), app_version, os_version
 *  - last_seen_at (for cleanup of orphan devices)
 *
 * Sync flow:
 *  1. App launches → reads device_id → POST /api/mobile/devices/register
 *  2. Push token rotation → POST /api/mobile/devices/[id]/push-token
 *  3. App goes background → optional ping to update last_seen_at
 *  4. Server-side cron — usuwa devices nieaktywne > 90 dni
 */
import "server-only";
import { createSupabaseAdminClient } from "@/lib/db/supabase-server";

export interface MobileDevice {
  id: string;
  user_id: string | null;
  device_id: string;
  platform: "ios" | "android";
  push_token: string | null;
  app_version: string;
  os_version: string | null;
  locale: string | null;
  last_seen_at: string;
  created_at: string;
}

export interface RegisterDeviceInput {
  deviceId: string;
  platform: "ios" | "android";
  pushToken?: string | null;
  appVersion: string;
  osVersion?: string | null;
  locale?: string | null;
  userId?: string | null;
}

export async function registerOrUpdateDevice(
  input: RegisterDeviceInput,
): Promise<MobileDevice> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("mobile_devices")
    .upsert(
      {
        device_id: input.deviceId,
        user_id: input.userId ?? null,
        platform: input.platform,
        push_token: input.pushToken ?? null,
        app_version: input.appVersion,
        os_version: input.osVersion ?? null,
        locale: input.locale ?? null,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "device_id", ignoreDuplicates: false },
    )
    .select("*")
    .single();
  if (error) throw error;
  return data as MobileDevice;
}

export async function updatePushToken(
  deviceId: string,
  pushToken: string | null,
): Promise<void> {
  const supabase = createSupabaseAdminClient();
  await supabase
    .from("mobile_devices")
    .update({ push_token: pushToken, last_seen_at: new Date().toISOString() })
    .eq("device_id", deviceId);
}

export async function listUserDevices(userId: string): Promise<MobileDevice[]> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("mobile_devices")
    .select("*")
    .eq("user_id", userId)
    .order("last_seen_at", { ascending: false });
  return (data as MobileDevice[]) ?? [];
}

export async function unregisterDevice(deviceId: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  await supabase.from("mobile_devices").delete().eq("device_id", deviceId);
}

/**
 * Cleanup zombie devices (no activity > 90 days).
 */
export async function pruneInactiveDevices(): Promise<number> {
  const supabase = createSupabaseAdminClient();
  const cutoff = new Date(Date.now() - 90 * 86_400_000).toISOString();
  const { count } = await supabase
    .from("mobile_devices")
    .delete({ count: "exact" })
    .lt("last_seen_at", cutoff);
  return count ?? 0;
}

/**
 * Send native push to user via APNs/FCM (lazy provider import).
 * Note: real APNs/FCM SDK is heavy — uses fetch to provider HTTP API in MVP.
 */
export async function sendNativePushToUser(
  userId: string,
  payload: { title: string; body: string; data?: Record<string, string> },
): Promise<{ sent: number; failed: number }> {
  const devices = await listUserDevices(userId);
  let sent = 0;
  let failed = 0;
  for (const d of devices) {
    if (!d.push_token) continue;
    const ok = await sendToDevice(d, payload).catch(() => false);
    if (ok) sent += 1;
    else failed += 1;
  }
  return { sent, failed };
}

async function sendToDevice(
  device: MobileDevice,
  payload: { title: string; body: string; data?: Record<string, string> },
): Promise<boolean> {
  if (device.platform === "android") {
    const fcmKey = process.env.FCM_SERVER_KEY;
    if (!fcmKey || !device.push_token) return false;
    const res = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        Authorization: `key=${fcmKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: device.push_token,
        notification: { title: payload.title, body: payload.body },
        data: payload.data ?? {},
      }),
    });
    return res.ok;
  }
  if (device.platform === "ios") {
    // APNs HTTP/2 — wymaga JWT i certyfikatów. Scaffold:
    if (!process.env.APNS_TEAM_ID || !device.push_token) return false;
    // W produkcji użyć: node-apn / @parse/node-apn / własny JWT generator
    return false;
  }
  return false;
}
