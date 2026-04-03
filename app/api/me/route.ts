import { getSupabaseServiceClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
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
    .select("role, display_name")
    .eq("id", user.id)
    .single();

  return Response.json({
    id: user.id,
    email: user.email,
    role: profile?.role ?? "user",
    displayName: profile?.display_name ?? user.email?.split("@")[0] ?? "",
  });
}
