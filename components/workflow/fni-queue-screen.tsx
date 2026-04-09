"use client";

import { useEffect, useState } from "react";

import { listFniQueue, type FniQueueDeal } from "@/lib/deals";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase-browser";

export function FniQueueScreen() {
  const [deals, setDeals] = useState<FniQueueDeal[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Realtime: listen for new notifications → refresh queue + browser ping
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabaseBrowserClient();

    const channel = supabase
      .channel("fni-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: "recipient_role=eq.fni" },
        (payload) => {
          // Refresh the queue
          listFniQueue().then((fresh) => setDeals(fresh));

          // Browser notification
          const msg = (payload.new as { message?: string })?.message ?? "New deal in queue";
          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            new Notification("Sales Docs — F&I Queue", { body: msg, icon: "/android-chrome-192x192.png" });
          }
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

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

              return (
                <div
                  key={deal.id}
                  className="border border-white/10 bg-[#2a2a2e] px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-white/20 bg-white/5 text-sm font-bold text-white/40">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-base font-bold text-white">
                          {customer}
                        </p>
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
                  <div className="mt-3 grid gap-2 text-xs text-white/40 sm:grid-cols-3">
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
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
