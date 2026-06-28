"use client";

import { useEffect, useState } from "react";
import { fetchCurrentOrg, fetchUserOrgs, type Organization } from "@/lib/orgs/membership";

export function OrgSwitcher() {
  const [current, setCurrent] = useState<Organization | null>(null);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    void (async () => {
      const [c, all] = await Promise.all([fetchCurrentOrg(), fetchUserOrgs()]);
      setCurrent(c);
      setOrgs(all);
    })();
  }, []);

  async function handleSwitch(orgId: string) {
    setSwitching(true);
    try {
      await fetch("/api/orgs/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ org_id: orgId }),
      });
      window.location.reload();
    } finally {
      setSwitching(false);
      setOpen(false);
    }
  }

  if (!current) {
    return (
      <div className="text-xs text-ink-500 px-3 py-2">
        Ładowanie organizacji...
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 rounded-lg border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 px-3 py-2 text-left hover:border-ink-400 focus:outline-none focus-visible:shadow-shield-focus"
      >
        <div className="w-8 h-8 rounded-md bg-accent-100 dark:bg-accent-700/20 text-accent-700 flex items-center justify-center font-display font-semibold">
          {current.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-ink-900 dark:text-ink-50 truncate">
            {current.name}
          </div>
          <div className="text-xs text-ink-500 capitalize">{current.plan}</div>
        </div>
        <span className="text-ink-400">▾</span>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-lg overflow-hidden">
          {orgs.map((org) => (
            <button
              key={org.id}
              type="button"
              disabled={switching || org.id === current.id}
              onClick={() => handleSwitch(org.id)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-ink-50 dark:hover:bg-ink-800 disabled:opacity-60 ${
                org.id === current.id
                  ? "bg-accent-50 dark:bg-accent-700/10 text-accent-700"
                  : "text-ink-700 dark:text-ink-300"
              }`}
            >
              <div className="font-medium">{org.name}</div>
              <div className="text-xs text-ink-500 capitalize">
                {org.plan} · {org.seats_used}/{org.seats_total} miejsc
              </div>
            </button>
          ))}
          <div className="border-t border-ink-200 dark:border-ink-800">
            <a
              href="/panel/organizacja/nowa"
              className="block px-3 py-2 text-sm text-accent-700 hover:bg-accent-50 dark:hover:bg-accent-700/10"
            >
              + Załóż nową organizację
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
