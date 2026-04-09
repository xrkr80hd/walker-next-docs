import { getSupabaseServiceClient } from "@/lib/supabase-server";

/**
 * GET /api/fna-queue — list deals flagged for F&A, ordered FIFO by fni_sent_at
 * Accessible by users with 'fna' or 'admin' role only.
 */

function getToken(request: Request): string {
  return (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
}

export async function GET(request: Request) {
  const token = getToken(request);
  if (!token) return Response.json({ error: "Missing authorization." }, { status: 401 });

  const supabase = getSupabaseServiceClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) return Response.json({ error: "Invalid session." }, { status: 401 });

  // Check role — fna or admin only
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "fna" && profile.role !== "admin")) {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  const { data: deals, error } = await supabase
    .from("deals")
    .select("id, workflow_data, fni_sent_at, updated_at, user_id")
    .eq("fni_ready", true)
    .eq("status", "open")
    .order("fni_sent_at", { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ deals: deals ?? [] });
}
