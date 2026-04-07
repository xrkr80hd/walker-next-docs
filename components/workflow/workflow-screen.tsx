"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  DocumentDrawer,
  DocumentDrawerTrigger,
} from "@/components/workflow/document-drawer";
import {
  clearWorkflowSession,
  getFullStockNumber,
  getLast8,
  loadWorkflow,
  saveWorkflow,
  subscribeToWorkflowSessionClear,
  type WorkflowData
} from "@/lib/walker-workflow";

type StatusTone = "" | "success" | "warn";
const WORKFLOW_VIEW_STATE_KEY = "walker.workflow.view.v1";

type WorkflowViewState = {
  openSections: Record<string, boolean>;
  returnPath?: string;
  scrollY: number;
};

function loadWorkflowViewState() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(WORKFLOW_VIEW_STATE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<WorkflowViewState>;
    const openSections =
      parsed.openSections && typeof parsed.openSections === "object"
        ? parsed.openSections
        : null;
    const scrollY =
      typeof parsed.scrollY === "number" && Number.isFinite(parsed.scrollY)
        ? parsed.scrollY
        : 0;

    if (!openSections) {
      return null;
    }

    return { openSections, scrollY };
  } catch {
    return null;
  }
}

function saveWorkflowViewState(state: WorkflowViewState) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(WORKFLOW_VIEW_STATE_KEY, JSON.stringify(state));
}

function clearWorkflowViewState() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(WORKFLOW_VIEW_STATE_KEY);
}

export function getWorkflowReturnPath(): string {
  if (typeof window === "undefined") return "/workflow";
  try {
    const raw = window.sessionStorage.getItem(WORKFLOW_VIEW_STATE_KEY);
    if (!raw) return "/workflow";
    const parsed = JSON.parse(raw) as Partial<WorkflowViewState>;
    return parsed.returnPath || "/workflow";
  } catch {
    return "/workflow";
  }
}

function OverviewRow({ label, value, href, onNavigate }: { label: string; value: string; href?: string; onNavigate?: () => void }) {
  const display = value || "-";
  return (
    <div className="flex items-baseline gap-2">
      <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.1em] text-white/40">{label}</span>
      {href ? (
        <Link
          href={href}
          onClick={onNavigate}
          className="truncate text-sm font-semibold text-white underline decoration-white/20 underline-offset-2 transition hover:text-[var(--accent)] hover:decoration-[var(--accent)]"
        >
          {display} <span className="text-[10px] text-white/30">&#x270E;</span>
        </Link>
      ) : (
        <span className="truncate text-sm font-semibold text-white">{display}</span>
      )}
    </div>
  );
}

export function WorkflowScreen({ dealType = "used" }: { dealType?: "used" | "new" } = {}) {
  const isNewDeal = dealType === "new";
  const workflowPath = isNewDeal ? "/workflow/new" : "/workflow";
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [data, setData] = useState<WorkflowData>(() => loadWorkflow());
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const savedSections = loadWorkflowViewState()?.openSections ?? {};
    return {
      dealer: false,
      consultant: false,
      deal: false,
      overview: true,
      ...savedSections,
    };
  });
  const [status, setStatus] = useState("");
  const [tone, setTone] = useState<StatusTone>("");
  useEffect(() => {
    saveWorkflow(data);
  }, [data]);

  // Persist dealType so other screens (delivery checklist) can read it
  useEffect(() => {
    setData((prev) => {
      if (prev.dealType === dealType) return prev;
      return { ...prev, dealType };
    });
  }, [dealType]);

  useEffect(() => {
    return subscribeToWorkflowSessionClear(() => {
      setData(loadWorkflow());
      setStatus("Session cleared. Ready for a new deal.");
      setTone("success");
    });
  }, []);

  useEffect(() => {
    const saved = loadWorkflowViewState();
    if (!saved || saved.scrollY <= 0) {
      return;
    }

    // Retry scroll restore — accordion content may not be in the DOM on the first frame
    let attempts = 0;
    const maxAttempts = 10;
    const targetY = saved.scrollY;
    function tryScroll() {
      attempts++;
      window.scrollTo({ top: targetY, behavior: "auto" });
      if (Math.abs(window.scrollY - targetY) > 2 && attempts < maxAttempts) {
        window.requestAnimationFrame(tryScroll);
      }
    }
    window.requestAnimationFrame(tryScroll);
  }, []);

  useEffect(() => {
    saveWorkflowViewState({
      openSections,
      scrollY: typeof window === "undefined" ? 0 : window.scrollY,
    });
  }, [openSections]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let frameId: number | null = null;
    const onScroll = () => {
      if (frameId !== null) {
        return;
      }
      frameId = window.requestAnimationFrame(() => {
        saveWorkflowViewState({
          openSections,
          scrollY: window.scrollY,
        });
        frameId = null;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [openSections]);

  function setStatusMessage(message: string, nextTone: StatusTone = "") {
    setStatus(message);
    setTone(nextTone);
  }

  function persistWorkflowViewState() {
    saveWorkflowViewState({
      openSections,
      returnPath: workflowPath,
      scrollY: typeof window === "undefined" ? 0 : window.scrollY,
    });
  }

  function saveNow() {
    const saved = saveWorkflow(data);
    setData(saved);
    setStatusMessage(
      "Saved.",
      "success",
    );
  }

  function clearSessionNow() {
    clearWorkflowSession();
    clearWorkflowViewState();
    setData(loadWorkflow());
    setOpenSections({ dealer: false, consultant: false, deal: false, overview: true });
    setStatusMessage(
      "Session cleared. Ready for a new deal.",
      "success",
    );
  }

  return (
    <>
      <div className="grid gap-6">
        {/* ── Hero ── */}
        <section className="overflow-hidden border border-white/10 bg-[var(--panel)] bg-[url('/bg-hero-16x9.jpg')] bg-cover bg-center shadow-[0_0_40px_rgba(190,23,23,0.15),0_24px_60px_rgba(0,0,0,0.3)] print:bg-none">
          <div className="grid gap-5 px-5 py-5 sm:px-6">
            <div className="text-center">
              <Image
                src="/walker-red-graphic-v2.png"
                alt="Walker Automotive graphic"
                width={320}
                height={116}
                priority
                className="mx-auto h-auto w-full max-w-[280px]"
              />
              <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-[0.01em] text-white drop-shadow-sm sm:text-4xl print:text-[var(--foreground)] print:drop-shadow-none">
                {isNewDeal ? "New Vehicle Workflow" : "Used Vehicle Workflow"}
              </h2>
              <p className="mt-2 text-sm font-bold text-white/90 print:text-[var(--foreground)]">
                Last 8: <span className="font-mono">{getLast8(data.vin) || "-"}</span>
              </p>
              <p className="mx-auto mt-3 max-w-3xl text-base leading-7 text-white/70 print:text-[var(--muted)]">
                Enter customer and vehicle information once, then generate all
                required documents from a single source.
              </p>

              <div className="mt-5 print:hidden">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.08em] text-white/70 transition hover:text-white"
                >
                  <span aria-hidden="true">&larr;</span>
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Deal Overview (read-only) ── */}
        <section className="overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(190,23,23,0.12),0_18px_44px_rgba(0,0,0,0.25)]">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setOpenSections(prev => ({ ...prev, overview: !prev.overview }))}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpenSections(prev => ({ ...prev, overview: !prev.overview })); } }}
            className="flex w-full cursor-pointer items-center justify-between bg-[var(--accent)] bg-[url('/bg-card-3x2.jpg')] bg-cover bg-center p-5 text-left sm:p-6"
          >
            <div>
              <h3 className="text-2xl font-bold text-white">Deal Overview</h3>
              <p className="mt-1 text-lg font-semibold text-white/90 underline decoration-[var(--accent)] decoration-2 underline-offset-4">
                {data.customerName || "No customer yet"} {data.coCustomerName ? `& ${data.coCustomerName}` : ""}
              </p>
            </div>
            {/* Deal # — editable, centered on accordion header */}
            <div className="flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/50">Deal #</span>
              <input
                type="text"
                value={data.dealNumber}
                onChange={(e) => setData(prev => ({ ...prev, dealNumber: e.target.value }))}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                className="w-28 border-b-2 border-white/40 bg-transparent text-center text-3xl font-extrabold text-white outline-none placeholder:text-white/25 focus:border-white/70"
                placeholder="—"
              />
            </div>
            <span className="ml-3 shrink-0 text-2xl text-white/70" aria-hidden="true">{openSections.overview ? "▲" : "▼"}</span>
          </div>
          {openSections.overview && (
            <div className="border-t border-white/10 bg-[#2a2a2e] px-4 pb-4 pt-3 sm:px-6 sm:pb-6 sm:pt-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:gap-x-6 sm:gap-y-3">
                <OverviewRow label="Vehicle" value={[data.vehicleYear, data.vehicleMake, data.vehicleModel].filter(Boolean).join(" ")} href="/documents/vin-verification" onNavigate={persistWorkflowViewState} />
                {data.tradeIn === "yes" ? <OverviewRow label="Trade-In" value={[data.tradeYear, data.tradeMake, data.tradeModel].filter(Boolean).join(" ")} href="/documents/payoff-form" onNavigate={persistWorkflowViewState} /> : null}
                <OverviewRow label="VIN (Last 8)" value={getLast8(data.vin)} href="/documents/vin-verification" onNavigate={persistWorkflowViewState} />
                <OverviewRow label="Stock #" value={getFullStockNumber(data)} href="/documents/vin-verification" onNavigate={persistWorkflowViewState} />
                <OverviewRow label="Deal #" value={data.dealNumber} href="/documents/delivery-checklist" onNavigate={persistWorkflowViewState} />
                <OverviewRow label="Vehicle Miles" value={data.mileage} href="/documents/vin-verification" onNavigate={persistWorkflowViewState} />
                {data.lienholderName ? <OverviewRow label="Lienholder" value={data.lienholderName} href="/documents/payoff-form" onNavigate={persistWorkflowViewState} /> : null}
                <OverviewRow label="Payoff Verified" value={data.payoffVerified ? "Yes" : "No"} href="/documents/payoff-form" onNavigate={persistWorkflowViewState} />
                <OverviewRow label="Deal is Ready" value={data.deliveryEnabled ? "Yes" : "No"} href="/documents/delivery-checklist" onNavigate={persistWorkflowViewState} />
                <OverviewRow label="Plate" value={data.specialtyPlate === "yes" ? "Specialty — Transfer $3" : data.specialtyPlate === "no" ? "Standard — New Plate" : "Not checked"} />
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={saveNow}
                  className="inline-flex min-h-12 items-center justify-center border border-white/20 bg-white/10 px-5 text-sm font-bold uppercase tracking-[0.08em] text-white"
                >
                  Save Session
                </button>
                <button
                  type="button"
                  onClick={clearSessionNow}
                  className="inline-flex min-h-12 items-center justify-center border border-white/20 bg-white/10 px-5 text-sm font-bold uppercase tracking-[0.08em] text-white"
                >
                  New Deal
                </button>
                {status && (
                  <span className={`text-sm font-bold ${tone === "success" ? "text-[var(--success)]" : tone === "warn" ? "text-[var(--warn)]" : "text-white/50"}`}>
                    {tone === "warn" ? "⚠ " : tone === "success" ? "✓ " : ""}{status}
                  </span>
                )}
              </div>
              <p className="mt-4 text-sm leading-6 text-white/40">
                Enter deal data on individual document screens. This overview refreshes automatically.
              </p>

              {/* ── Specialty Plate Check ── */}
              <div className="mt-5 border-t border-white/10 pt-5">
                <p className="text-sm font-bold uppercase tracking-[0.1em] text-white/60">Does the customer have a specialty plate?</p>
                <p className="mt-1 text-xs leading-5 text-white/40">
                  Louisiana: Only specialty plates (Saints, LSU, Disabled Veteran, Handicap, etc.) can transfer between vehicles for $3. Standard plates are canceled — a new plate is issued ($40–$112).
                </p>
                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setData(prev => { const next = { ...prev, specialtyPlate: prev.specialtyPlate === "yes" ? "" as const : "yes" as const }; saveWorkflow(next); return next; }); }}
                    className={`inline-flex min-h-10 items-center justify-center border px-5 text-sm font-bold uppercase tracking-[0.08em] transition ${data.specialtyPlate === "yes" ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-white/20 bg-white/10 text-white"}`}
                  >
                    Yes — Specialty
                  </button>
                  <button
                    type="button"
                    onClick={() => { setData(prev => { const next = { ...prev, specialtyPlate: prev.specialtyPlate === "no" ? "" as const : "no" as const }; saveWorkflow(next); return next; }); }}
                    className={`inline-flex min-h-10 items-center justify-center border px-5 text-sm font-bold uppercase tracking-[0.08em] transition ${data.specialtyPlate === "no" ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-white/20 bg-white/10 text-white"}`}
                  >
                    No — Standard
                  </button>
                </div>
                {data.specialtyPlate === "yes" && (
                  <div className="mt-3 border-l-4 border-[var(--success)] bg-[var(--success)]/10 px-4 py-3">
                    <p className="text-sm font-bold text-[var(--success)]">Plate Transfer — $3 fee</p>
                    <p className="mt-1 text-xs leading-5 text-white/70">Customer has a transferable specialty plate — confirm transfer to save on fees. Flag deal as &quot;plate transfer&quot; when structuring numbers.</p>
                  </div>
                )}
                {data.specialtyPlate === "no" && (
                  <div className="mt-3 border-l-4 border-[var(--warn)] bg-[var(--warn)]/10 px-4 py-3">
                    <p className="text-sm font-bold text-[var(--warn)]">New Plate Required — $40–$112</p>
                    <p className="mt-1 text-xs leading-5 text-white/70">Standard plate will be canceled. Include new plate fee in deal structuring before presenting final numbers.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ── Available Documents removed — use Document Drawer instead ── */}
      </div>

      <DocumentDrawerTrigger onClick={() => setDrawerOpen(true)} />
      <DocumentDrawer
        dealType={dealType}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}
