import { requireAdmin } from "@/lib/require-admin";
import { getSupabaseServiceClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth instanceof Response) return auth;

  const supabase = getSupabaseServiceClient();

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, role, display_name, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Enrich with email from auth.users
  const {
    data: { users },
    error: usersError,
  } = await supabase.auth.admin.listUsers({ perPage: 1000 });

  if (usersError) {
    return Response.json({ error: usersError.message }, { status: 500 });
  }

  const emailMap = new Map(users.map((u) => [u.id, u.email]));

  const enriched = (profiles ?? []).map((p) => ({
    ...p,
    email: emailMap.get(p.id) ?? "unknown",
  }));

  return Response.json({ users: enriched });
}
