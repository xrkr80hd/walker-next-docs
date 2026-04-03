import { requireAdmin } from "@/lib/require-admin";
import { getSupabaseServiceClient } from "@/lib/supabase-server";

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
