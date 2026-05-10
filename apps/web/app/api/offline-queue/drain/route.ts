import { NextRequest, NextResponse } from "next/server";
import { drainServerQueue, ServerQueuedAction } from "@/lib/pwa/offline-queue";

async function getSupabase() {
  const { createServerSupabase } = await import("@/lib/supabase/server");
  return createSupabaseServerClient();
}

// Drain handler — applies each queued action by op type. Real apps would
// dispatch to dedicated services; here we provide a thin router that mirrors
// the legitimate API contracts.
async function applyAction(supabase: any, action: ServerQueuedAction): Promise<Record<string, unknown>> {
  switch (action.op) {
    case "case.create": {
      const { data, error } = await supabase
        .from("cases")
        .insert({ ...action.payload, user_id: action.userId })
        .select("id")
        .single();
      if (error) throw error;
      return { caseId: data.id };
    }
    case "case.update": {
      const { id, ...rest } = action.payload as { id: string };
      const { error } = await supabase.from("cases").update(rest).eq("id", id).eq("user_id", action.userId);
      if (error) throw error;
      return { updated: true };
    }
    case "document.draft": {
      const { data, error } = await supabase
        .from("document_drafts")
        .insert({ ...action.payload, user_id: action.userId })
        .select("id")
        .single();
      if (error) throw error;
      return { draftId: data.id };
    }
    case "message.send": {
      const { error } = await supabase.from("messages").insert({ ...action.payload, sender_id: action.userId });
      if (error) throw error;
      return { sent: true };
    }
    case "deadline.snooze": {
      const { id, snoozeUntil } = action.payload as { id: string; snoozeUntil: string };
      const { error } = await supabase
        .from("deadlines")
        .update({ snooze_until: snoozeUntil })
        .eq("id", id);
      if (error) throw error;
      return { snoozed: true };
    }
    default:
      throw new Error(`unknown_op:${action.op}`);
  }
}

export async function POST(_req: NextRequest) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const result = await drainServerQueue(supabase, user.id, (a) => applyAction(supabase, a));
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "drain_failed" }, { status: 500 });
  }
}
