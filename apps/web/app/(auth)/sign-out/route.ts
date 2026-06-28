import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

/**
 * Sign-out — accepts both GET (link) and POST (form button). We accept GET
 * intentionally so the user-menu can be a plain `<Link>` and not require
 * JS, but middleware ensures the same-origin invariant.
 */
async function handle(request: NextRequest) {
  const { origin } = new URL(request.url);
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(`${origin}/`);
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
