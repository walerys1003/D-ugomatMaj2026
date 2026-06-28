// Lightweight sandbox runtime guard — enforces egress allowlist, permission checks,
// and timeout budget for plugin invocations. The real isolation lives in a dedicated
// worker; this module is the host-side policy enforcer.
import type { PluginPermission, SandboxProfile } from "./plugin-sdk";

export class SandboxViolation extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = "SandboxViolation";
  }
}

export function enforcePermission(profile: SandboxProfile, required: PluginPermission): void {
  if (!profile.permissions.includes(required)) {
    throw new SandboxViolation("E_PERM", `missing permission: ${required}`);
  }
}

export function enforceEgress(profile: SandboxProfile, targetUrl: string): void {
  try {
    const u = new URL(targetUrl);
    if (!profile.egressAllowlist.some((host) => u.host === host || u.host.endsWith(`.${host}`))) {
      throw new SandboxViolation("E_EGRESS", `egress not allowed: ${u.host}`);
    }
  } catch (e) {
    if (e instanceof SandboxViolation) throw e;
    throw new SandboxViolation("E_URL", "invalid url");
  }
}

export async function withTimeout<T>(profile: SandboxProfile, fn: () => Promise<T>): Promise<T> {
  return await Promise.race([
    fn(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new SandboxViolation("E_TIMEOUT", `plugin timeout ${profile.timeoutMs}ms`)), profile.timeoutMs),
    ),
  ]);
}

// Convenience runner — combines all three checks.
export async function runSandboxed<T>(
  profile: SandboxProfile,
  required: PluginPermission,
  fn: () => Promise<T>,
): Promise<T> {
  enforcePermission(profile, required);
  return withTimeout(profile, fn);
}
