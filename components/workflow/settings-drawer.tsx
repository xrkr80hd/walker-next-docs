"use client";

import { useEffect, useState, type FormEvent } from "react";

import {
  createDefaultConsultant,
  createDefaultDealer,
  loadConsultant,
  loadDealer,
  saveConsultant,
  saveDealer,
  type ConsultantInfo,
  type DealerInfo,
} from "@/lib/dealer-consultant";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase-browser";

type TeamUser = { id: string; email: string; role: string; display_name: string | null };
type TeamInvite = { id: string; email: string; role: string; created_at: string; expires_at: string; accepted_at: string | null };

export function SettingsDrawer({ onClose }: { onClose: () => void }) {
  const [dealer, setDealer] = useState<DealerInfo>(() => loadDealer());
  const [consultant, setConsultant] = useState<ConsultantInfo>(() => loadConsultant());
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ dealer: false, consultant: false, fni: false, team: false });
  const [status, setStatus] = useState("");

  // Admin state
  const [isAdmin, setIsAdmin] = useState(false);
  const [teamUsers, setTeamUsers] = useState<TeamUser[]>([]);
  const [teamInvites, setTeamInvites] = useState<TeamInvite[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"user" | "admin">("user");
  const [inviteSending, setInviteSending] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const token = data.session?.access_token;
      if (!token) return;
      fetch("/api/me", { headers: { authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((me) => { if (me.role === "admin") setIsAdmin(true); })
        .catch(() => {});
    });
  }, []);

  async function getToken() {
    const supabase = getSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? "";
  }

  async function loadTeamData() {
    setTeamLoading(true);
    try {
      const token = await getToken();
      const headers = { authorization: `Bearer ${token}`, "content-type": "application/json" };
      const [usersRes, invitesRes] = await Promise.all([
        fetch("/api/admin/users", { headers }).then((r) => r.json()),
        fetch("/api/admin/invites", { headers }).then((r) => r.json()),
      ]);
      setTeamUsers(usersRes.users ?? []);
      setTeamInvites(invitesRes.invites ?? []);
    } catch {
      setStatus("Failed to load team data.");
    } finally {
      setTeamLoading(false);
    }
  }

  async function handleInvite(e: FormEvent) {
    e.preventDefault();
    const email = inviteEmail.trim().toLowerCase();
    if (!email) return;
    setInviteSending(true);
    setStatus("");
    try {
      const token = await getToken();
      const res = await fetch("/api/admin/invites", {
        method: "POST",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: JSON.stringify({ email, role: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) { setStatus(data.error ?? "Invite failed."); return; }
      setStatus(`Invite sent to ${email}`);
      setInviteEmail("");
      setInviteRole("user");
      loadTeamData();
    } catch {
      setStatus("Failed to send invite.");
    } finally {
      setInviteSending(false);
    }
  }

  async function handleRemoveUser(id: string, email: string) {
    if (!confirm(`Remove ${email}? This deletes their account.`)) return;
    try {
      const token = await getToken();
      await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { authorization: `Bearer ${token}` },
      });
      setStatus(`${email} removed.`);
      loadTeamData();
    } catch {
      setStatus("Failed to remove user.");
    }
  }

  function toggleSection(key: string) {
    setOpenSections((current) => ({ ...current, [key]: !current[key] }));
  }

  function updateDealer(field: keyof DealerInfo, value: string) {
    setDealer((current) => ({ ...current, [field]: value }));
  }

  function updateConsultant(field: keyof ConsultantInfo, value: string) {
    setConsultant((current) => ({ ...current, [field]: value }));
  }

  function saveDealerNow() {
    saveDealer(dealer);
    setStatus("Dealership saved.");
  }

  function clearDealerNow() {
    const blank = createDefaultDealer();
    setDealer(blank);
    saveDealer(blank);
    setStatus("Dealership cleared.");
  }

  function deleteDealerNow() {
    const blank = createDefaultDealer();
    setDealer(blank);
    if (typeof window !== "undefined") localStorage.removeItem("walker.dealer.v1");
    setStatus("Dealership deleted.");
  }

  function saveConsultantNow() {
    saveConsultant(consultant);
    setStatus("Salesperson saved.");
  }

  function clearConsultantNow() {
    const blank = createDefaultConsultant();
    setConsultant(blank);
    saveConsultant(blank);
    setStatus("Salesperson cleared.");
  }

  function deleteConsultantNow() {
    const blank = createDefaultConsultant();
    setConsultant(blank);
    if (typeof window !== "undefined") localStorage.removeItem("walker.consultant.v1");
    setStatus("Salesperson deleted.");
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
        role="button"
        tabIndex={-1}
        aria-label="Close settings"
      />
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl sm:max-w-lg">
        <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--accent)] bg-[url('/bg-drawer-9x16.jpg')] bg-cover bg-top px-5 py-4 print:bg-none">
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center text-white/80 transition hover:text-white"
            aria-label="Close settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        {status && (
          <div className="border-b border-[var(--border)] bg-green-50 px-5 py-2 text-sm font-bold text-green-800">
            ✓ {status}
          </div>
        )}

        <div className="grid gap-6 p-5 sm:p-6">
          {/* ── Dealership ── */}
          <section>
            <button
              type="button"
              onClick={() => toggleSection("dealer")}
              className="flex w-full items-center justify-between pb-3 text-left"
            >
              <div>
                <h3 className="text-lg font-bold text-[var(--foreground)]">Dealership</h3>
                <p className="text-sm text-[var(--muted)]">{dealer.dealershipName || "Not set"}</p>
              </div>
              <span className={`text-lg text-[var(--muted)] transition-transform ${openSections.dealer ? "rotate-180" : ""}`}>▾</span>
            </button>
            {openSections.dealer && (
              <div className="border-t border-[var(--border)] pt-4">
                <p className="mb-4 text-sm leading-6 text-[var(--muted)]">
                  Saved to this device. Shared across all deals.
                </p>
                <div className="grid gap-4">
                  <label className="grid gap-2">
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Dealership Name</span>
                    <input type="text" value={dealer.dealershipName} onChange={(e) => updateDealer("dealershipName", e.currentTarget.value)} className="min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Street Address</span>
                    <input type="text" value={dealer.street} onChange={(e) => updateDealer("street", e.currentTarget.value)} className="min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <label className="grid gap-2">
                      <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">City</span>
                      <input type="text" value={dealer.city} onChange={(e) => updateDealer("city", e.currentTarget.value)} className="min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">State</span>
                      <input type="text" value={dealer.state} onChange={(e) => updateDealer("state", e.currentTarget.value)} className="min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">ZIP</span>
                      <input type="text" value={dealer.zip} onChange={(e) => updateDealer("zip", e.currentTarget.value)} className="min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                    </label>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button type="button" onClick={saveDealerNow} className="inline-flex min-h-10 items-center justify-center border border-[var(--accent)] bg-[var(--accent)] px-4 text-xs font-bold uppercase tracking-[0.08em] text-white">Save</button>
                  <button type="button" onClick={clearDealerNow} className="inline-flex min-h-10 items-center justify-center border border-[var(--foreground)] bg-white px-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--foreground)]">Clear</button>
                  <button type="button" onClick={deleteDealerNow} className="inline-flex min-h-10 items-center justify-center border border-[var(--accent)] bg-white px-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--accent)]">Delete</button>
                </div>
              </div>
            )}
          </section>

          {/* ── Salesperson ── */}
          <section>
            <button
              type="button"
              onClick={() => toggleSection("consultant")}
              className="flex w-full items-center justify-between pb-3 text-left"
            >
              <div>
                <h3 className="text-lg font-bold text-[var(--foreground)]">Salesperson</h3>
                <p className="text-sm text-[var(--muted)]">{consultant.name || "Not set"}</p>
              </div>
              <span className={`text-lg text-[var(--muted)] transition-transform ${openSections.consultant ? "rotate-180" : ""}`}>▾</span>
            </button>
            {openSections.consultant && (
              <div className="border-t border-[var(--border)] pt-4">
                <p className="mb-4 text-sm leading-6 text-[var(--muted)]">
                  Saved to this device. Populates salesperson fields on documents.
                </p>
                <div className="grid gap-4">
                  <label className="grid gap-2">
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Name</span>
                    <input type="text" value={consultant.name} onChange={(e) => updateConsultant("name", e.currentTarget.value)} className="min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Salesperson #</span>
                    <input type="text" value={consultant.salespersonNumber} onChange={(e) => updateConsultant("salespersonNumber", e.currentTarget.value)} className="min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Phone Number</span>
                    <input type="tel" value={consultant.phone} onChange={(e) => updateConsultant("phone", e.currentTarget.value)} className="min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Email</span>
                    <input type="email" value={consultant.email} onChange={(e) => updateConsultant("email", e.currentTarget.value)} className="min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                  </label>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button type="button" onClick={saveConsultantNow} className="inline-flex min-h-10 items-center justify-center border border-[var(--accent)] bg-[var(--accent)] px-4 text-xs font-bold uppercase tracking-[0.08em] text-white">Save</button>
                  <button type="button" onClick={clearConsultantNow} className="inline-flex min-h-10 items-center justify-center border border-[var(--foreground)] bg-white px-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--foreground)]">Clear</button>
                  <button type="button" onClick={deleteConsultantNow} className="inline-flex min-h-10 items-center justify-center border border-[var(--accent)] bg-white px-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--accent)]">Delete</button>
                </div>
              </div>
            )}
          </section>

          {/* ── F&I Manager ── */}
          <section>
            <button
              type="button"
              onClick={() => toggleSection("fni")}
              className="flex w-full items-center justify-between pb-3 text-left"
            >
              <div>
                <h3 className="text-lg font-bold text-[var(--foreground)]">F&amp;I Manager</h3>
                <p className="text-sm text-[var(--muted)]">{dealer.fniEmail || "Not set"}</p>
              </div>
              <span className={`text-lg text-[var(--muted)] transition-transform ${openSections.fni ? "rotate-180" : ""}`}>▾</span>
            </button>
            {openSections.fni && (
              <div className="border-t border-[var(--border)] pt-4">
                <p className="mb-4 text-sm leading-6 text-[var(--muted)]">
                  Saved to this device. Used for emailing documents to F&amp;I.
                </p>
                <label className="grid gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Email</span>
                  <input type="email" value={dealer.fniEmail} onChange={(e) => updateDealer("fniEmail", e.currentTarget.value)} className="min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                </label>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button type="button" onClick={saveDealerNow} className="inline-flex min-h-10 items-center justify-center border border-[var(--accent)] bg-[var(--accent)] px-4 text-xs font-bold uppercase tracking-[0.08em] text-white">Save</button>
                </div>
              </div>
            )}
          </section>

          {/* ── Team Management (Admin Only) ── */}
          {isAdmin && (
            <section>
              <button
                type="button"
                onClick={() => { toggleSection("team"); if (!openSections.team) loadTeamData(); }}
                className="flex w-full items-center justify-between pb-3 text-left"
              >
                <div>
                  <h3 className="text-lg font-bold text-[var(--foreground)]">Team Management</h3>
                  <p className="text-sm text-[var(--muted)]">Invite &amp; manage team members</p>
                </div>
                <span className={`text-lg text-[var(--muted)] transition-transform ${openSections.team ? "rotate-180" : ""}`}>▾</span>
              </button>
              {openSections.team && (
                <div className="border-t border-[var(--border)] pt-4">
                  {/* Invite Form */}
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)]">Send Invite</p>
                  <form onSubmit={handleInvite} className="grid gap-3">
                    <label className="grid gap-2">
                      <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Email</span>
                      <input
                        type="email"
                        required
                        placeholder="name@walkerautomotive.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.currentTarget.value)}
                        className="min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Role</span>
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.currentTarget.value as "user" | "admin")}
                        className="min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                      >
                        <option value="user">Salesperson</option>
                        <option value="admin">Admin</option>
                      </select>
                    </label>
                    <button
                      type="submit"
                      disabled={inviteSending}
                      className="inline-flex min-h-10 items-center justify-center border border-[var(--accent)] bg-[var(--accent)] px-4 text-xs font-bold uppercase tracking-[0.08em] text-white disabled:opacity-40"
                    >
                      {inviteSending ? "Sending…" : "Send Invite"}
                    </button>
                  </form>

                  {teamLoading ? (
                    <p className="mt-5 text-sm text-[var(--muted)]">Loading team…</p>
                  ) : (
                    <>
                      {/* Team Members */}
                      {teamUsers.length > 0 && (
                        <div className="mt-6">
                          <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
                            Team Members ({teamUsers.length})
                          </p>
                          <div className="divide-y divide-[var(--border)] border border-[var(--border)]">
                            {teamUsers.map((u) => (
                              <div key={u.id} className="flex items-center justify-between gap-2 px-4 py-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-bold text-[var(--foreground)]">{u.display_name || u.email}</p>
                                  <p className="truncate text-xs text-[var(--muted)]">{u.email}</p>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${u.role === "admin" ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--border)] text-[var(--muted)]"}`}>
                                    {u.role === "admin" ? "Admin" : "Sales"}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveUser(u.id, u.email)}
                                    className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] transition hover:text-[var(--accent)]"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Pending Invites */}
                      {teamInvites.filter((i) => !i.accepted_at).length > 0 && (
                        <div className="mt-5">
                          <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
                            Pending Invites ({teamInvites.filter((i) => !i.accepted_at).length})
                          </p>
                          <div className="divide-y divide-[var(--border)] border border-[var(--border)]">
                            {teamInvites.filter((i) => !i.accepted_at).map((inv) => (
                              <div key={inv.id} className="flex items-center justify-between gap-2 px-4 py-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-bold text-[var(--foreground)]">{inv.email}</p>
                                  <p className="text-xs text-[var(--muted)]">
                                    Expires {new Date(inv.expires_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <span className="shrink-0 rounded-full border border-amber-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600">
                                  Pending
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </section>
          )}
        </div>
      </aside>
    </div>
  );
}
