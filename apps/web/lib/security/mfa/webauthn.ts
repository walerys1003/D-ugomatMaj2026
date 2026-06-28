// WebAuthn (FIDO2) helpers — challenge generation, credential parsing,
// attestation verification scaffolding. Production should pair with @simplewebauthn/server.

import { randomBytes, createHash } from "crypto";

export interface WebAuthnRegistrationOptions {
  challenge: string;
  rp: { name: string; id: string };
  user: { id: string; name: string; displayName: string };
  pubKeyCredParams: Array<{ type: "public-key"; alg: number }>;
  timeout: number;
  attestation: "none" | "indirect" | "direct";
  authenticatorSelection: {
    userVerification: "required" | "preferred" | "discouraged";
    residentKey: "required" | "preferred" | "discouraged";
  };
}

export interface WebAuthnAssertionOptions {
  challenge: string;
  rpId: string;
  timeout: number;
  userVerification: "required" | "preferred" | "discouraged";
  allowCredentials: Array<{ id: string; type: "public-key" }>;
}

export function buildRegistrationOptions(opts: {
  userId: string;
  userName: string;
  displayName: string;
  rpName: string;
  rpId: string;
}): WebAuthnRegistrationOptions {
  return {
    challenge: randomBytes(32).toString("base64url"),
    rp: { name: opts.rpName, id: opts.rpId },
    user: {
      id: Buffer.from(opts.userId).toString("base64url"),
      name: opts.userName,
      displayName: opts.displayName,
    },
    pubKeyCredParams: [
      { type: "public-key", alg: -7 }, // ES256
      { type: "public-key", alg: -257 }, // RS256
    ],
    timeout: 60_000,
    attestation: "none",
    authenticatorSelection: {
      userVerification: "preferred",
      residentKey: "preferred",
    },
  };
}

export function buildAssertionOptions(opts: {
  rpId: string;
  allowCredentials: string[];
}): WebAuthnAssertionOptions {
  return {
    challenge: randomBytes(32).toString("base64url"),
    rpId: opts.rpId,
    timeout: 60_000,
    userVerification: "preferred",
    allowCredentials: opts.allowCredentials.map((id) => ({ id, type: "public-key" })),
  };
}

// Verify the clientDataJSON challenge matches what we issued and the origin
// is in our allowlist. Signature/attestation verification requires a full
// CBOR/COSE decoder — wire in @simplewebauthn/server for production.
export function verifyClientDataChallenge(
  clientDataJSON: string,
  expectedChallenge: string,
  expectedOrigins: string[],
): { ok: boolean; reason?: string } {
  try {
    const decoded = Buffer.from(clientDataJSON, "base64url").toString("utf8");
    const data = JSON.parse(decoded);
    if (data.challenge !== expectedChallenge) return { ok: false, reason: "challenge_mismatch" };
    if (!expectedOrigins.includes(data.origin)) return { ok: false, reason: "origin_mismatch" };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, reason: e?.message ?? "decode_failed" };
  }
}

export function credentialFingerprint(credentialId: string): string {
  return createHash("sha256").update(credentialId).digest("hex").slice(0, 16);
}
