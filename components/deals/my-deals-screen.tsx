"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  listMyDeals,
  setLocalDealId,
  type DealSummary
} from "@/lib/deals";
import {
  getLast8,
  saveSignatures,
  saveWorkflow
} from "@/lib/walker-workflow";

export function MyDealsScreen() {
  const router = useRouter();
  const [deals, setDeals] = useState<DealSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await listMyDeals();
      if (!cancelled) {
        setDeals(result);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function resumeDeal(deal: DealSummary) {
    saveWorkflow(deal.workflow_data);
    saveSignatures(deal.signatures);
    setLocalDealId(deal.id);
    router.push("/workflow");
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
      <div className="flex items-center justify-between bg-[var(--accent)] bg-[url('/bg-card-3x2.jpg')] bg-cover bg-center px-5 py-5 sm:px-6">
        <h2 className="text-2xl font-bold text-white">My Deals</h2>
        <Link
          href="/dashboard"
          className="inline-flex min-h-10 items-center justify-center border border-white/30 bg-white/10 px-4 text-sm font-bold uppercase tracking-[0.08em] text-white transition hover:bg-white/20"
        >
          Dashboard
        </Link>
      </div>

      {/* Body */}
      <div className="px-4 py-5 sm:px-6 sm:py-6">
        {loading ? (
          <p className="text-center text-sm text-white/50">Loading deals…</p>
        ) : deals.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg font-semibold text-white/60">No open deals</p>
            <p className="mt-2 text-sm text-white/40">
              Start a new deal from the dashboard.
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex min-h-10 items-center justify-center border border-white bg-white px-5 text-sm font-bold uppercase tracking-[0.08em] text-[var(--accent)] transition hover:bg-white/90"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {deals.map((deal) => {
              const wd = deal.workflow_data;
              const customer = wd.customerName || "No customer";
              const vehicle = [wd.vehicleYear, wd.vehicleMake, wd.vehicleModel]
                .filter(Boolean)
                .join(" ");
              const last8 = getLast8(wd.vin);
              const dealNum = wd.dealNumber || "";

              return (
                <button
                  key={deal.id}
                  type="button"
                  onClick={() => resumeDeal(deal)}
                  className="w-full border border-white/10 bg-[#2a2a2e] px-4 py-4 text-left transition hover:border-white/25 hover:bg-[#333]"
                >
                  <div className="flex items-start justify-between gap-3">
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
                    {dealNum && (
                      <span className="shrink-0 text-lg font-extrabold text-white/30">
                        #{dealNum}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-white/30">
                    Updated {formatTime(deal.updated_at)}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
