import { getSupabaseServiceClient } from "@/lib/supabase-server";

/**
 * Verify the Authorization header carries a valid Supabase access token
 * belonging to a user with role = 'admin'. Returns the admin's user id
 * on success, or a Response to send back on failure.
 */
export async function requireAdmin(
  request: Request,
): Promise<{ userId: string } | Response> {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return Response.json({ error: "Missing authorization." }, { status: 401 });
  }

  const supabase = getSupabaseServiceClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return Response.json({ error: "Invalid session." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return Response.json({ error: "Admin access required." }, { status: 403 });
  }

  return { userId: user.id };
}
