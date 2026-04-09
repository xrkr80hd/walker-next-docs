"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type UserRow = {
  id: string;
  email: string;
  role: string;
  display_name: string | null;
  created_at: string;
};

type InviteRow = {
  id: string;
  email: string;
  role: string;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
};

async function getAccessToken() {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? "";
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(path, {
    ...init,
    headers: {
      ...init?.headers,
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res.json();
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"user" | "admin" | "fni" | "sales_manager">("user");
  const [inviteStatus, setInviteStatus] = useState("");
  const [inviteSending, setInviteSending] = useState(false);

  // Sections
  const [showUsers, setShowUsers] = useState(true);
  const [showInvites, setShowInvites] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [usersRes, invitesRes] = await Promise.all([
        apiFetch<{ users: UserRow[] }>("/api/admin/users"),
        apiFetch<{ invites: InviteRow[] }>("/api/admin/invites"),
      ]);
      setUsers(usersRes.users);
      setInvites(invitesRes.invites);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite(e: FormEvent) {
    e.preventDefault();
    const email = inviteEmail.trim().toLowerCase();
    if (!email) return;

    setInviteSending(true);
    setInviteStatus("");
    setError("");

    try {
      await apiFetch("/api/admin/invites", {
        method: "POST",
        body: JSON.stringify({ email, role: inviteRole }),
      });
      setInviteStatus(`Invite sent to ${email}`);
      setInviteEmail("");
      setInviteRole("user");
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invite.");
    } finally {
      setInviteSending(false);
    }
  }

  async function handleRemoveUser(id: string, email: string) {
    if (!confirm(`Remove ${email}? This deletes their account.`)) return;

    setError("");
    try {
      await apiFetch(`/api/admin/users/${id}`, { method: "DELETE" });
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove user.");
    }
  }

  async function handleRevokeInvite(id: string, email: string) {
    if (!confirm(`Revoke invite for ${email}?`)) return;

    setError("");
    try {
      await apiFetch(`/api/admin/invites/${id}`, { method: "DELETE" });
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke invite.");
    }
  }

  async function handleRoleChange(id: string, newRole: string) {
    setError("");
    // Optimistic: update local state immediately so the page doesn't jump
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: newRole } : u)));
    try {
      await apiFetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role.");
      // Revert on failure
      loadData();
    }
  }

  return (
    <div className="grid gap-6">
      {/* ── Hero ── */}
      <section className="overflow-hidden border border-black/10 bg-[var(--panel)] bg-[url('/bg-hero-16x9.jpg')] bg-cover bg-center shadow-[0_24px_60px_rgba(35,23,12,0.12)]">
        <div className="grid gap-5 px-5 py-5 sm:px-6">
          <div className="text-center">
            <Image
              src="/walker-red-graphic-v2.png"
              alt="Walker Automotive graphic"
              width={320}
              height={116}
              priority
              className="mx-auto h-auto w-full max-w-[240px]"
            />
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.24em] text-white drop-shadow-sm">
              Walker Docs
            </p>
            <h2 className="mt-2 text-3xl font-extrabold leading-tight tracking-[0.01em] text-white drop-shadow-sm sm:text-4xl">
              Admin Console
            </h2>
            <p className="mx-auto mt-3 max-w-3xl text-base leading-7 text-white/70">
              Manage team access, send invites, and control user roles.
            </p>
            <Link
              href="/overview"
              className="mx-auto mt-4 inline-flex items-center gap-2 border border-white/30 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm transition hover:border-white/60 hover:bg-white/20"
            >
              Back to Overview
            </Link>
          </div>
        </div>
      </section>

      {/* ── Error banner ── */}
      {error && (
        <div className="border border-red-900/20 bg-red-50 px-5 py-3 text-sm font-bold text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <section className="border border-black/10 bg-[var(--panel)] p-6 shadow-[0_18px_44px_rgba(35,23,12,0.08)]">
          <p className="text-sm font-bold text-[var(--muted)]">Loading…</p>
        </section>
      ) : (
        <>
          {/* ── Send Invite ── */}
          <section className="overflow-hidden border border-black/10 shadow-[0_18px_44px_rgba(35,23,12,0.08)]">
            <div className="bg-[var(--accent)] bg-[url('/bg-card-3x2.jpg')] bg-cover bg-center p-5 sm:p-6">
              <h3 className="text-2xl font-bold text-white">Send Invite</h3>
              <p className="mt-1 text-sm text-white/70">
                Invite a team member by email
              </p>
            </div>
            <div className="border-t border-[var(--border)] bg-white px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
              <form onSubmit={handleInvite} className="grid gap-4 sm:grid-cols-[1fr_auto_auto]">
                <input
                  type="email"
                  required
                  placeholder="team@walkerautomotive.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.currentTarget.value)}
                  className="min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.currentTarget.value as "user" | "admin" | "fni" | "sales_manager")}
                  title="Invite role"
                  className="min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="fni">F&amp;I</option>
                  <option value="sales_manager">Sales Manager</option>
                </select>
                <button
                  type="submit"
                  disabled={inviteSending}
                  className="min-h-12 border border-[var(--accent)] bg-[var(--accent)] px-6 text-sm font-bold uppercase tracking-[0.08em] text-white disabled:opacity-40"
                >
                  {inviteSending ? "Sending…" : "Invite"}
                </button>
              </form>
              {inviteStatus && (
                <p className="mt-3 text-sm font-bold text-[var(--success)]">
                  {inviteStatus}
                </p>
              )}
            </div>
          </section>

          {/* ── Users ── */}
          <section className="overflow-hidden border border-black/10 shadow-[0_18px_44px_rgba(35,23,12,0.08)]">
            <button
              type="button"
              onClick={() => setShowUsers((v) => !v)}
              className="flex w-full items-center justify-between bg-[var(--accent)] bg-[url('/bg-card-3x2.jpg')] bg-cover bg-center p-5 text-left sm:p-6"
            >
              <div>
                <h3 className="text-2xl font-bold text-white">
                  Team Members
                </h3>
                <p className="mt-1 text-sm text-white/70">
                  {users.length} user{users.length !== 1 ? "s" : ""}
                </p>
              </div>
              <span className={`text-xl text-white/70 transition-transform ${showUsers ? "rotate-180" : ""}`}>
                ▾
              </span>
            </button>
            {showUsers && (
              <div className="border-t border-[var(--border)] bg-white">
                {users.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-[var(--muted)]">
                    No users yet.
                  </p>
                ) : (
                  <div className="divide-y divide-[var(--border)]">
                    {users.map((u) => (
                      <div
                        key={u.id}
                        className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[var(--foreground)]">
                            {u.display_name || u.email}
                          </p>
                          <p className="truncate text-xs text-[var(--muted)]">
                            {u.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.currentTarget.value)}
                            title={`Change role for ${u.display_name || u.email}`}
                            className={`border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] outline-none transition focus:border-[var(--accent)] ${u.role === "admin"
                              ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                              : u.role === "fni"
                                ? "border-blue-500 bg-blue-500/10 text-blue-500"
                                : u.role === "sales_manager"
                                  ? "border-amber-500 bg-amber-500/10 text-amber-500"
                                  : "border-[var(--border)] bg-[var(--panel-strong)] text-[var(--muted)]"
                              }`}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="fni">F&amp;I</option>
                            <option value="sales_manager">Sales Mgr</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => handleRemoveUser(u.id, u.email)}
                            className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)] transition hover:text-[var(--accent)]"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ── Pending Invites ── */}
          <section className="overflow-hidden border border-black/10 shadow-[0_18px_44px_rgba(35,23,12,0.08)]">
            <button
              type="button"
              onClick={() => setShowInvites((v) => !v)}
              className="flex w-full items-center justify-between bg-[var(--accent)] bg-[url('/bg-card-3x2.jpg')] bg-cover bg-center p-5 text-left sm:p-6"
            >
              <div>
                <h3 className="text-2xl font-bold text-white">
                  Invites
                </h3>
                <p className="mt-1 text-sm text-white/70">
                  {invites.filter((i) => !i.accepted_at).length} pending
                </p>
              </div>
              <span className={`text-xl text-white/70 transition-transform ${showInvites ? "rotate-180" : ""}`}>
                ▾
              </span>
            </button>
            {showInvites && (
              <div className="border-t border-[var(--border)] bg-white">
                {invites.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-[var(--muted)]">
                    No invites sent yet.
                  </p>
                ) : (
                  <div className="divide-y divide-[var(--border)]">
                    {invites.map((inv) => (
                      <div
                        key={inv.id}
                        className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[var(--foreground)]">
                            {inv.email}
                          </p>
                          <p className="text-xs text-[var(--muted)]">
                            Sent{" "}
                            {new Date(inv.created_at).toLocaleDateString()}
                            {" · "}
                            Expires{" "}
                            {new Date(inv.expires_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`rounded border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${inv.accepted_at
                              ? "border-[var(--success)] bg-green-50 text-[var(--success)]"
                              : "border-[var(--warn)] bg-amber-50 text-[var(--warn)]"
                              }`}
                          >
                            {inv.accepted_at ? "Accepted" : "Pending"}
                          </span>
                          <span className="rounded border border-[var(--border)] bg-[var(--panel-strong)] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                            {inv.role}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRevokeInvite(inv.id, inv.email)}
                            className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)] transition hover:text-[var(--accent)]"
                          >
                            {inv.accepted_at ? "Delete" : "Revoke"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
