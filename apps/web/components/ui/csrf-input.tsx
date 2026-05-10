import * as React from "react";

import { ensureCsrfToken, CSRF_FIELD } from "@/lib/security/csrf";

/**
 * Tier 5 zad. 203 — `<CsrfInput />` dla `<form>` server-action.
 *
 * Server Component (async). Wstawia hidden input z aktualnym tokenem.
 * Używaj zawsze, gdy form wysyła do server action mutującego dane.
 *
 *   <form action={myAction}>
 *     <CsrfInput />
 *     ...
 *   </form>
 */
export async function CsrfInput(): Promise<React.ReactElement> {
  const token = await ensureCsrfToken();
  return <input type="hidden" name={CSRF_FIELD} value={token} />;
}
