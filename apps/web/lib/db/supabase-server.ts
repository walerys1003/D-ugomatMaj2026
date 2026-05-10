import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/db/types";

/**
 * Server-side Supabase client bound to the current request's cookies.
 * RLS is enforced because we use the user's JWT, NOT the service role.
 *
 * Use this in:
 *  - Route Handlers (`app/api/.../route.ts`)
 *  - Server Components
 *  - Server Actions
 *
 * Do NOT use in middleware (cookies API differs there — see middleware.ts).
 */
export function createSupabaseServerClient() {
  const cookieStore = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error("Brak NEXT_PUBLIC_SUPABASE_URL lub NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createServerClient<Database>(url, anon, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value;
      },
      set(name, value, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // `cookies().set()` only works in Route Handlers / Server Actions;
          // in Server Components Next.js throws — safe to ignore there.
        }
      },
      remove(name, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options, maxAge: 0 });
        } catch {
          /* see comment above */
        }
      },
    },
  });
}

/**
 * Service-role client — bypasses RLS. ONLY use in:
 *  - Trusted server-side jobs (CRON, webhooks after signature verification)
 *  - Admin operations gated by an admin role check upstream
 * NEVER expose this in any code path triggered by an unauthenticated user.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) {
    throw new Error("Brak NEXT_PUBLIC_SUPABASE_URL lub SUPABASE_SERVICE_ROLE_KEY");
  }
  // We still go through @supabase/ssr to keep typed Database; cookies are stubbed.
  return createServerClient<Database>(url, service, {
    cookies: {
      get: () => undefined,
      set: () => undefined,
      remove: () => undefined,
    },
  });
}
