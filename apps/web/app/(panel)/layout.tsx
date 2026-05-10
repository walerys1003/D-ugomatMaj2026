import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

/**
 * Panel layout — server-side guard that fetches the current user and
 * passes a slimmed-down session-shape down to the AppShell. The middleware
 * already redirects unauthenticated requests, but we double-check here
 * because middleware can't see fresh cookie state on the very first
 * request after a magic-link callback.
 */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?next=/panel");
  }

  return (
    <AppShell user={{ email: user.email, name: (user.user_metadata?.full_name as string) ?? null }}>
      {children}
    </AppShell>
  );
}
