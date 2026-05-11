"use client";

import { useState, useTransition } from "react";
import { Fingerprint, KeyRound, ShieldOff, Smartphone, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface WebauthnCred {
  id: string;
  device_name: string | null;
  created_at: string;
}

interface Props {
  mfaEnabled: boolean;
  webauthnCredentials: WebauthnCred[];
}

interface MfaSetupState {
  qr_data_url: string;
  secret: string;
  backup_codes: string[];
}

export function SecurityClient({ mfaEnabled: initialEnabled, webauthnCredentials }: Props) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [setup, setSetup] = useState<MfaSetupState | null>(null);
  const [code, setCode] = useState("");
  const [pending, startTransition] = useTransition();
  const [creds, setCreds] = useState(webauthnCredentials);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const startSetup = () => {
    setErr(null);
    setMsg(null);
    startTransition(async () => {
      const res = await fetch("/api/security/mfa/setup", { method: "POST" });
      if (!res.ok) {
        setErr("Nie udało się zainicjować MFA.");
        return;
      }
      const data = await res.json();
      setSetup(data);
    });
  };

  const verify = () => {
    setErr(null);
    startTransition(async () => {
      const res = await fetch("/api/security/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        setErr("Kod nieprawidłowy. Sprawdź czas systemowy w telefonie.");
        return;
      }
      setEnabled(true);
      setSetup(null);
      setCode("");
      setMsg("MFA aktywowane. Zapisz kody zapasowe w bezpiecznym miejscu.");
    });
  };

  const disable = () => {
    if (!confirm("Wyłączyć MFA? To obniży poziom bezpieczeństwa konta.")) return;
    setErr(null);
    startTransition(async () => {
      const res = await fetch("/api/security/mfa/disable", { method: "POST" });
      if (!res.ok) {
        setErr("Nie udało się wyłączyć MFA.");
        return;
      }
      setEnabled(false);
      setMsg("MFA zostało wyłączone.");
    });
  };

  const removeWebauthn = (id: string) => {
    if (!confirm("Usunąć klucz?")) return;
    startTransition(async () => {
      const res = await fetch(`/api/security/webauthn?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setCreds((prev) => prev.filter((c) => c.id !== id));
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {msg && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-fluid-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-100">
          {msg}
        </div>
      )}
      {err && (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-fluid-sm text-rose-800 dark:bg-rose-950 dark:text-rose-100">
          {err}
        </div>
      )}

      {!enabled && !setup && (
        <div className="flex flex-col gap-2">
          <p className="text-fluid-sm text-iron-600 dark:text-iron-300">
            MFA znacząco zmniejsza ryzyko przejęcia konta nawet w razie wycieku hasła.
          </p>
          <Button onClick={startSetup} disabled={pending}>
            <Smartphone className="h-4 w-4" />
            Włącz MFA (TOTP)
          </Button>
        </div>
      )}

      {setup && (
        <div className="flex flex-col gap-3 rounded-lg border border-iron-200 p-4 dark:border-dlugomat-700">
          <h3 className="text-fluid-base font-semibold">1. Zeskanuj kod QR</h3>
          {setup.qr_data_url && (
            <img src={setup.qr_data_url} alt="QR code MFA" className="h-48 w-48 rounded-md border" />
          )}
          <p className="text-fluid-xs text-iron-500">
            Lub wprowadź ręcznie: <code className="font-mono">{setup.secret}</code>
          </p>
          <h3 className="text-fluid-base font-semibold">2. Wpisz 6-cyfrowy kod z aplikacji</h3>
          <div className="flex gap-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              maxLength={6}
              inputMode="numeric"
            />
            <Button onClick={verify} disabled={pending || code.length !== 6}>
              Zweryfikuj
            </Button>
          </div>
          {setup.backup_codes?.length > 0 && (
            <div className="mt-2 flex flex-col gap-1">
              <h3 className="text-fluid-base font-semibold">3. Zachowaj kody zapasowe</h3>
              <p className="text-fluid-xs text-iron-500">
                Każdy kod można użyć raz. Schowaj je w menedżerze haseł.
              </p>
              <div className="mt-1 grid grid-cols-2 gap-1 rounded-md bg-iron-50 p-3 font-mono text-fluid-sm dark:bg-dlugomat-950">
                {setup.backup_codes.map((c) => (
                  <span key={c}>{c}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {enabled && !setup && (
        <Button variant="outline" onClick={disable} disabled={pending}>
          <ShieldOff className="h-4 w-4" />
          Wyłącz MFA
        </Button>
      )}

      <div className="border-t border-iron-200 pt-4 dark:border-dlugomat-700">
        <h3 className="flex items-center gap-2 text-fluid-base font-semibold">
          <Fingerprint className="h-4 w-4" />
          Klucze bezpieczeństwa (Passkey / WebAuthn)
        </h3>
        <p className="mt-1 text-fluid-sm text-iron-600 dark:text-iron-300">
          Logowanie odciskiem palca, Touch ID, klucze YubiKey.
        </p>
        {creds.length === 0 ? (
          <p className="mt-3 text-fluid-sm text-iron-500">Brak zarejestrowanych kluczy.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {creds.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-2 rounded-md border border-iron-200 px-3 py-2 dark:border-dlugomat-700"
              >
                <div className="flex flex-col">
                  <span className="text-fluid-sm font-medium">{c.device_name ?? "Nienazwane urządzenie"}</span>
                  <span className="text-fluid-xs text-iron-500">
                    Dodano {new Date(c.created_at).toLocaleDateString("pl-PL")}
                  </span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeWebauthn(c.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-fluid-xs text-iron-500">
          <KeyRound className="mr-1 inline h-3 w-3" />
          Rejestracja Passkey wymaga obsługi przeglądarki — użyj przycisku „Dodaj passkey" w toku logowania.
        </p>
      </div>
    </div>
  );
}
