/**
 * GET /api/invoices/[id] — pobiera fakturę (JSON lub PDF).
 * Query: format=pdf | json (default json)
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/db/supabase-server";
import { renderInvoicePdf } from "@/lib/invoices/invoice-generator";
import type { InvoiceRecord } from "@/lib/invoices/invoice-generator";

export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const admin = createSupabaseAdminClient();
  const { data: inv } = await admin
    .from("invoices")
    .select("*")
    .eq("id", ctx.params.id)
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (!inv) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const url = new URL(req.url);
  const format = url.searchParams.get("format") ?? "json";

  if (format === "pdf") {
    const pdf = await renderInvoicePdf(inv as InvoiceRecord);
    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${(inv as InvoiceRecord).invoice_number.replace(/\//g, "_")}.pdf"`,
      },
    });
  }

  return NextResponse.json({ invoice: inv });
}
