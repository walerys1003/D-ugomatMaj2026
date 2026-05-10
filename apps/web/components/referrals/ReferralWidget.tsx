/**
 * ReferralWidget — invite-a-friend widget z balansem credytów.
 */
"use client";

import { useEffect, useState } from "react";

interface ReferralCodeData {
  code: {
    code: string;
    uses: number;
  };
  balance: {
    totalGrosze: number;
    expiringSoonGrosze: number;
    credits: Array<{
      id: string;
      amount_grosze: number;
      expires_at: string;
      remaining_grosze: number;
    }>;
  };
}

export default function ReferralWidget() {
  const [data, setData] = useState<ReferralCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/referrals/code")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-sm text-gray-500">Ładowanie…</div>;
  if (!data) return null;

  const link = `https://dlugomat.pl/r/${data.code.code}`;
  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border bg-white p-6">
      <h3 className="text-lg font-bold">Zaproś znajomych i zyskaj 30 zł</h3>
      <p className="text-sm text-gray-600 mt-1">
        Twój znajomy dostanie 30 zł rabatu, a Ty 30 zł na kolejne pismo.
      </p>

      <div className="mt-4 flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={link}
          className="flex-1 rounded border px-3 py-2 text-sm bg-gray-50"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-medium"
        >
          {copied ? "✓ Skopiowano" : "Kopiuj"}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-gray-500">Wykorzystane polecenia</div>
          <div className="font-semibold">{data.code.uses} / 10</div>
        </div>
        <div>
          <div className="text-gray-500">Dostępne credyty</div>
          <div className="font-semibold text-green-700">
            {(data.balance.totalGrosze / 100).toFixed(2)} zł
          </div>
        </div>
      </div>

      {data.balance.expiringSoonGrosze > 0 && (
        <p className="mt-3 text-xs text-amber-700">
          Wygasa wkrótce: {(data.balance.expiringSoonGrosze / 100).toFixed(2)} zł
          (w ciągu 30 dni)
        </p>
      )}
    </div>
  );
}
