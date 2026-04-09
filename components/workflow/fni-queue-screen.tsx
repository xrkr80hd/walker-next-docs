"use client";

import { useEffect, useState } from "react";

import { claimFniDeal, finishFniDeal, listFniQueue, type FniQueueDeal } from "@/lib/deals";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase-browser";

function relativeTime(isoDate: string, now: number): string {
  const diff = now - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hrs < 24) return remMins > 0 ? `${hrs} hr ${remMins} min` : `${hrs} hr`;
  const days = Math.floor(hrs / 24);
  return `${days}d ${hrs % 24}h`;
}

export function FniQueueScreen({ role }: { role: string }) {
  const [deals, setDeals] = useState<FniQueueDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [claiming, setClaiming] = useState<string | null>(null);
  const [finishing, setFinishing] = useState<string | null>(null);

  const canAct = role === "fni" || role === "admin";

  // Get current user ID
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  // Fetch initial queue
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await listFniQueue();
      if (!cancelled) {
        setDeals(result);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Update wait timers every 30s
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, []);

  // Realtime: new notifications + deal updates → refresh queue
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabaseBrowserClient();

    const channel = supabase
      .channel("fni-queue-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: "recipient_role=eq.fni" },
        (payload) => {
          listFniQueue().then((fresh) => setDeals(fresh));

          const msg = (payload.new as { message?: string })?.message ?? "New deal in queue";
          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            new Notification("Sales Docs — F&I Queue", { body: msg, icon: "/android-chrome-192x192.png" });
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "deals", filter: "fni_ready=eq.true" },
        () => {
          listFniQueue().then((fresh) => setDeals(fresh));
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function handleClaim(dealId: string) {
    setClaiming(dealId);
    const ok = await claimFniDeal(dealId);
    if (ok) {
      const fresh = await listFniQueue();
      setDeals(fresh);
    }
    setClaiming(null);
  }

  async function handleFinish(dealId: string) {
    setFinishing(dealId);
    const ok = await finishFniDeal(dealId);
    if (ok) {
      const fresh = await listFniQueue();
      setDeals(fresh);
    }
    setFinishing(null);
  }

  function formatTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <section className="overflow-hidden border border-white/10 bg-[#1c1c1e] shadow-[0_0_40px_rgba(190,23,23,0.15),0_24px_60px_rgba(0,0,0,0.3)]">
      {/* Header */}
      <div className="bg-[var(--accent)] bg-[url('/bg-card-3x2.jpg')] bg-cover bg-center px-5 py-5 sm:px-6">
        <h2 className="text-2xl font-bold text-white">F&I Queue</h2>
        <p className="mt-1 text-sm text-white/70">Deals ready for Finance &amp; Insurance — oldest first</p>
      </div>

      {/* Body */}
      <div className="px-4 py-5 sm:px-6 sm:py-6">
        {loading ? (
          <p className="text-center text-sm text-white/50">Loading queue…</p>
        ) : deals.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg font-semibold text-white/60">Queue is empty</p>
            <p className="mt-2 text-sm text-white/40">
              No deals have been sent to F&I yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {deals.map((deal, i) => {
              const wd = deal.workflow_data;
              const customer = wd.customerName || "No customer";
              const vehicle = [wd.vehicleYear, wd.vehicleMake, wd.vehicleModel]
                .filter(Boolean)
                .join(" ");
              const dealNum = wd.dealNumber || "";
              const vin = wd.vin || "";
              const last8 = vin.length >= 8 ? vin.slice(-8) : vin;

              const isClaimed = !!deal.fni_claimed_at;
              const isMyClaim = isClaimed && deal.fni_claimed_by === userId;
              const claimerName = deal.claimer?.display_name || "F&I";

              return (
                <div
                  key={deal.id}
                  className={`border bg-[#2a2a2e] px-4 py-4 ${isClaimed
                      ? "border-l-4 border-l-green-500 border-t-white/10 border-r-white/10 border-b-white/10"
                      : "border-white/10"
                    }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-white/20 bg-white/5 text-sm font-bold text-white/40">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-base font-bold text-white">
                            {customer}
                          </p>
                          {isClaimed && (
                            <span className="shrink-0 border border-green-500/40 bg-green-500/10 px-2 py-0.5 text-xs font-bold uppercase tracking-[0.08em] text-green-400">
                              Working
                            </span>
                          )}
                        </div>
                        <p className="mt-1 truncate text-sm text-white/60">
                          {vehicle || "No vehicle"}{" "}
                          {last8 && (
                            <span className="text-white/40">· {last8}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    {dealNum && (
                      <span className="shrink-0 text-lg font-extrabold text-white/30">
                        #{dealNum}
                      </span>
                    )}
                  </div>

                  {/* Deal details row */}
                  <div className="mt-3 grid gap-2 text-xs text-white/40 sm:grid-cols-4">
                    <div>
                      <span className="font-bold uppercase tracking-[0.12em] text-white/25">Phone</span>
                      <p className="mt-0.5 text-white/50">{wd.cellPhone || "—"}</p>
                    </div>
                    <div>
                      <span className="font-bold uppercase tracking-[0.12em] text-white/25">Trade</span>
                      <p className="mt-0.5 text-white/50">{wd.tradeIn === "yes" ? `Yes · $${wd.approxBalance || "?"}` : "No"}</p>
                    </div>
                    <div>
                      <span className="font-bold uppercase tracking-[0.12em] text-white/25">Sent</span>
                      <p className="mt-0.5 text-white/50">{deal.fni_sent_at ? formatTime(deal.fni_sent_at) : "—"}</p>
                    </div>
                    <div>
                      <span className="font-bold uppercase tracking-[0.12em] text-white/25">Waiting</span>
                      <p className="mt-0.5 font-mono text-white/50">{deal.fni_sent_at ? relativeTime(deal.fni_sent_at, now) : "—"}</p>
                    </div>
                  </div>

                  {/* Claimed-by line */}
                  {isClaimed && (
                    <p className="mt-2 text-xs text-green-400/70">
                      Claimed by {claimerName}
                    </p>
                  )}

                  {/* Action buttons — hidden for sales_manager */}
                  {canAct && (
                    <div className="mt-3 flex gap-2">
                      {!isClaimed && (
                        <button
                          onClick={() => handleClaim(deal.id)}
                          disabled={claiming === deal.id}
                          className="inline-flex min-h-9 items-center justify-center border border-blue-500 bg-blue-500/10 px-4 text-xs font-bold uppercase tracking-[0.08em] text-blue-400 transition hover:bg-blue-500/20 disabled:opacity-50"
                        >
                          {claiming === deal.id ? "Claiming…" : "Claim"}
                        </button>
                      )}
                      {isMyClaim && (
                        <button
                          onClick={() => handleFinish(deal.id)}
                          disabled={finishing === deal.id}
                          className="inline-flex min-h-9 items-center justify-center border border-green-500 bg-green-500/10 px-4 text-xs font-bold uppercase tracking-[0.08em] text-green-400 transition hover:bg-green-500/20 disabled:opacity-50"
                        >
                          {finishing === deal.id ? "Finishing…" : "Finish"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
