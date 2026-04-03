import { getSupabaseServiceClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password?.trim();

  if (!email) {
    return Response.json({ error: "Email is required." }, { status: 400 });
  }

  if (!password || password.length < 6) {
    return Response.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 },
    );
  }

  const supabase = getSupabaseServiceClient();

  // Check for a valid pending invite
  const { data: invite } = await supabase
    .from("invites")
    .select("id, role")
    .eq("email", email)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!invite) {
    return Response.json(
      { error: "No invite found for this email. Contact your admin." },
      { status: 403 },
    );
  }

  // Create the user via admin API (triggers handle_new_user which sets role + marks invite)
  const { error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError) {
    return Response.json({ error: createError.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
