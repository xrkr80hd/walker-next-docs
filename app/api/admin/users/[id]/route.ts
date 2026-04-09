import { requireAdmin } from "@/lib/require-admin";
import { getSupabaseServiceClient } from "@/lib/supabase-server";

const VALID_ROLES = ["admin", "user", "fna"] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if (auth instanceof Response) return auth;

  const { id } = await params;

  if (id === auth.userId) {
    return Response.json(
      { error: "You cannot change your own role." },
      { status: 400 },
    );
  }

  const body = await request.json().catch(() => null);
  const role = body?.role;

  if (!role || !VALID_ROLES.includes(role)) {
    return Response.json(
      { error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` },
      { status: 400 },
    );
  }

  const supabase = getSupabaseServiceClient();

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if (auth instanceof Response) return auth;

  const { id } = await params;

  if (id === auth.userId) {
    return Response.json(
      { error: "You cannot remove yourself." },
      { status: 400 },
    );
  }

  const supabase = getSupabaseServiceClient();

  const { error } = await supabase.auth.admin.deleteUser(id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
