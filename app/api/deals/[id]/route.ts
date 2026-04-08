import { getSupabaseServiceClient } from "@/lib/supabase-server";

/**
 * GET /api/deals/[id] — load a single deal by ID (owner only)
 */

function getToken(request: Request): string {
  return (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = getToken(request);
  if (!token) return Response.json({ error: "Missing authorization." }, { status: 401 });

  const supabase = getSupabaseServiceClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) return Response.json({ error: "Invalid session." }, { status: 401 });

  const { id } = await params;

  const { data: deal, error } = await supabase
    .from("deals")
    .select("id, workflow_data, signatures, status, created_at, updated_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !deal) return Response.json({ error: "Deal not found." }, { status: 404 });

  return Response.json({ deal });
}
