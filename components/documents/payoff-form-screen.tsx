"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { DocToolbar } from "@/components/documents/doc-toolbar";
import { PayoffFormSheet } from "@/components/documents/payoff-form-sheet";
import {
  loadWorkflow,
  saveWorkflow,
  subscribeToWorkflowSessionClear,
  type WorkflowData,
} from "@/lib/walker-workflow";

const PAGE_W = 816;

const LIENHOLDER_FIELDS = [
  { name: "lienholderName", label: "Lienholder Name", type: "text", wide: true },
  { name: "lienholderPhone", label: "Lienholder Phone", type: "tel", wide: false },
  { name: "lienholderAddress", label: "Lienholder Address", type: "text", wide: true },
  { name: "accountNumber", label: "Account Number", type: "text", wide: false },
  { name: "payoff15Day", label: "10 Day Payoff $", type: "text", wide: false },
  { name: "goodUntilDate", label: "Good Until Date", type: "date", wide: false },
  { name: "payoffToday", label: "Payoff as of Today $", type: "text", wide: false },
  { name: "perDiem", label: "Per Diem", type: "text", wide: false },
  { name: "socialSecurityNumber", label: "Social Security Number", type: "password", wide: false },
] as const;

const REP_FIELDS = [
  { name: "representativeName", label: "Representative Name", type: "text", wide: false },
  { name: "repDate", label: "Rep Date", type: "date", wide: false },
  { name: "verifiedBy", label: "Verified By", type: "text", wide: false },
] as const;

const TRADE_FIELDS = [
  { name: "approxBalance", label: "Approx. Balance", type: "text" },
  { name: "currentPayment", label: "Current Payment", type: "text" },
] as const;

export function PayoffFormScreen() {
  const [workflow, setWorkflow] = useState<WorkflowData>(() => loadWorkflow());
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageScale, setPageScale] = useState(1);
  const [saved, setSaved] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [showSsn, setShowSsn] = useState(false);
  const [tradeOpen, setTradeOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [lienholderOpen, setLienholderOpen] = useState(false);
  const [repOpen, setRepOpen] = useState(false);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setPageScale(w >= PAGE_W ? 1 : w / PAGE_W);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [previewOpen]);

  useEffect(() => {
    return subscribeToWorkflowSessionClear(() => {
      setWorkflow(loadWorkflow());
    });
  }, []);

  function updateField(name: keyof WorkflowData, value: string) {
    setWorkflow((current) => {
      const next = { ...current, [name]: value };
      if (name === "homeAddress") next.address = value;
      saveWorkflow(next);
      return next;
    });
    setSaved(false);
  }

  function handleSave() {
    saveWorkflow(workflow);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handlePrint() {
    window.open("/print/payoff-form?autoprint=1", "_blank");
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-[8.5in] flex-col rounded-lg bg-[#1c1c1e] p-3 shadow-[0_0_40px_rgba(190,23,23,0.15),0_24px_60px_rgba(0,0,0,0.3)] sm:p-4">
        <DocToolbar vin={workflow.vin} mileage={workflow.mileage} saved={saved} onSave={handleSave} onPrint={handlePrint} />

        {/* Trade-In Accordion */}
        <div className="mb-3 border border-white/10 shadow-[0_0_30px_rgba(190,23,23,0.12),0_14px_40px_rgba(0,0,0,0.2)]">
          <button type="button" onClick={() => setTradeOpen((o) => !o)} className="flex w-full items-center justify-between bg-[var(--accent)] bg-[url('/bg-card-3x2.jpg')] bg-cover bg-center px-5 py-4 text-left">
            <span className="text-lg font-bold text-white">Trade-In</span>
            <span className="text-xl leading-none text-white/70 transition-transform" style={{ transform: tradeOpen ? "rotate(180deg)" : undefined }}>▼</span>
          </button>
          {tradeOpen && (
            <div className="border-t border-white/10 bg-[#2a2a2e] px-5 pb-6 pt-5">
              <div className="mb-4">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">Do you have a trade?</span>
                <div className="mt-2 flex gap-2 sm:max-w-xs">
                  <button type="button" onClick={() => updateField("tradeIn", workflow.tradeIn === "yes" ? "" : "yes")} className={`flex min-h-12 flex-1 items-center justify-center gap-2 border text-sm font-bold transition ${workflow.tradeIn === "yes" ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]" : "border-white/20 bg-white/5 text-white/60 hover:border-[var(--accent)]"}`}>
                    <span className={`flex h-5 w-5 items-center justify-center border text-xs ${workflow.tradeIn === "yes" ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-white/30 bg-transparent"}`}>{workflow.tradeIn === "yes" ? "✓" : ""}</span>
                    Yes
                  </button>
                  <button type="button" onClick={() => updateField("tradeIn", workflow.tradeIn === "no" ? "" : "no")} className={`flex min-h-12 flex-1 items-center justify-center gap-2 border text-sm font-bold transition ${workflow.tradeIn === "no" ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]" : "border-white/20 bg-white/5 text-white/60 hover:border-[var(--accent)]"}`}>
                    <span className={`flex h-5 w-5 items-center justify-center border text-xs ${workflow.tradeIn === "no" ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-white/30 bg-transparent"}`}>{workflow.tradeIn === "no" ? "✓" : ""}</span>
                    No
                  </button>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {TRADE_FIELDS.map((field) => (
                  <label key={field.name} className="grid gap-2">
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">{field.label}</span>
                    <input type={field.type} value={String(workflow[field.name] ?? "")} onChange={(e) => updateField(field.name, e.currentTarget.value)} className="min-h-12 border border-white/10 bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                  </label>
                ))}
              </div>
              <button type="button" onClick={() => setTradeOpen(false)} className="mt-4 flex w-full items-center justify-center py-1 text-white/40 transition hover:text-white/70"><span className="text-lg">▲</span></button>
            </div>
          )}
        </div>

        {/* Trade-In Vehicle Details Accordion */}
        <div className="mb-3 border border-white/10 shadow-[0_0_30px_rgba(190,23,23,0.12),0_14px_40px_rgba(0,0,0,0.2)]">
          <button type="button" onClick={() => setDetailsOpen((o) => !o)} className="flex w-full items-center justify-between bg-[var(--accent)] bg-[url('/bg-card-3x2.jpg')] bg-cover bg-center px-5 py-4 text-left">
            <span className="text-lg font-bold text-white">Trade-In Vehicle Details</span>
            <span className="text-xl leading-none text-white/70 transition-transform" style={{ transform: detailsOpen ? "rotate(180deg)" : undefined }}>▼</span>
          </button>
          {detailsOpen && (
            <div className="border-t border-white/10 bg-[#2a2a2e] px-5 pb-6 pt-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="grid gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">Year</span>
                  <input type="text" inputMode="numeric" value={workflow.tradeYear} onChange={(e) => updateField("tradeYear", e.currentTarget.value)} className="min-h-12 border border-white/10 bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                </label>
                <label className="grid gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">Make</span>
                  <input type="text" value={workflow.tradeMake} onChange={(e) => updateField("tradeMake", e.currentTarget.value)} className="min-h-12 border border-white/10 bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                </label>
                <label className="grid gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">Model</span>
                  <input type="text" value={workflow.tradeModel} onChange={(e) => updateField("tradeModel", e.currentTarget.value)} className="min-h-12 border border-white/10 bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                </label>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 sm:col-span-2">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">VIN</span>
                  <input type="text" maxLength={17} spellCheck={false} autoCapitalize="characters" value={workflow.tradeVin} onChange={(e) => updateField("tradeVin", e.currentTarget.value)} className="min-h-12 border border-white/10 bg-white px-4 font-mono text-base uppercase text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                </label>
                <label className="grid gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">Color</span>
                  <input type="text" value={workflow.tradeColor} onChange={(e) => updateField("tradeColor", e.currentTarget.value)} className="min-h-12 border border-white/10 bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                </label>
                <label className="grid gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">Mileage</span>
                  <input type="text" inputMode="numeric" value={workflow.tradeMileage} onChange={(e) => updateField("tradeMileage", e.currentTarget.value)} className="min-h-12 border border-white/10 bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                </label>
              </div>
              <button type="button" onClick={() => setDetailsOpen(false)} className="mt-4 flex w-full items-center justify-center py-1 text-white/40 transition hover:text-white/70"><span className="text-lg">▲</span></button>
            </div>
          )}
        </div>

        {/* Who Do You Make Payments To? Accordion */}
        <div className="mb-3 border border-white/10 shadow-[0_0_30px_rgba(190,23,23,0.12),0_14px_40px_rgba(0,0,0,0.2)]">
          <button type="button" onClick={() => setLienholderOpen((o) => !o)} className="flex w-full items-center justify-between bg-[var(--accent)] bg-[url('/bg-card-3x2.jpg')] bg-cover bg-center px-5 py-4 text-left">
            <span className="text-lg font-bold text-white">Who Do You Make Payments To?</span>
            <span className="text-xl leading-none text-white/70 transition-transform" style={{ transform: lienholderOpen ? "rotate(180deg)" : undefined }}>▼</span>
          </button>
          {lienholderOpen && (
            <div className="border-t border-white/10 bg-[#2a2a2e] px-5 pb-6 pt-5">
              <div className="grid gap-4 sm:grid-cols-2">
                {LIENHOLDER_FIELDS.map((field) => (
                  <label key={field.name} className={`grid gap-2 ${field.wide ? "sm:col-span-2" : ""}`}>
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">{field.label}</span>
                    {field.name === "socialSecurityNumber" ? (
                      <div className="flex">
                        <input type={showSsn ? "text" : "password"} maxLength={9} inputMode="numeric" value={String(workflow[field.name] ?? "")} onChange={(e) => updateField(field.name, e.currentTarget.value)} className="min-h-12 flex-1 border border-white/10 bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                        <button type="button" onClick={() => setShowSsn((s) => !s)} className="min-h-12 border border-l-0 border-white/10 bg-white/5 px-3 text-xs font-bold uppercase tracking-wider text-white/60 transition hover:text-white">{showSsn ? "Hide" : "Show"}</button>
                      </div>
                    ) : (
                      <input type={field.type} value={String(workflow[field.name] ?? "")} onChange={(e) => updateField(field.name, e.currentTarget.value)} className="min-h-12 border border-white/10 bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                    )}
                  </label>
                ))}
              </div>

              <div className="mt-6">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">Payoff Verified?</span>
                <div className="mt-2">
                  <button type="button" onClick={() => { setWorkflow((current) => { const next = { ...current, payoffVerified: !current.payoffVerified }; saveWorkflow(next); return next; }); }} className={`flex min-h-12 items-center gap-2 border px-4 text-sm font-bold transition ${workflow.payoffVerified ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]" : "border-white/20 bg-white/5 text-white/60 hover:border-[var(--accent)]"}`}>
                    <span className={`flex h-5 w-5 items-center justify-center border text-xs ${workflow.payoffVerified ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-white/30 bg-transparent"}`}>{workflow.payoffVerified ? "✓" : ""}</span>
                    Verified
                  </button>
                </div>
              </div>
              <button type="button" onClick={() => setLienholderOpen(false)} className="mt-4 flex w-full items-center justify-center py-1 text-white/40 transition hover:text-white/70"><span className="text-lg">▲</span></button>
            </div>
          )}
        </div>

        {/* Representative Information Accordion */}
        <div className="mb-3 border border-white/10 shadow-[0_0_30px_rgba(190,23,23,0.12),0_14px_40px_rgba(0,0,0,0.2)]">
          <button type="button" onClick={() => setRepOpen((o) => !o)} className="flex w-full items-center justify-between bg-[var(--accent)] bg-[url('/bg-card-3x2.jpg')] bg-cover bg-center px-5 py-4 text-left">
            <span className="text-lg font-bold text-white">Representative Information</span>
            <span className="text-xl leading-none text-white/70 transition-transform" style={{ transform: repOpen ? "rotate(180deg)" : undefined }}>▼</span>
          </button>
          {repOpen && (
            <div className="border-t border-white/10 bg-[#2a2a2e] px-5 pb-6 pt-5">
              <p className="mb-4 text-sm text-white/50">Lienholder / bank representative who verified the payoff.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {REP_FIELDS.map((field) => (
                  <label key={field.name} className={`grid gap-2 ${field.wide ? "sm:col-span-2" : ""}`}>
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">{field.label}</span>
                    <input type={field.type} value={String(workflow[field.name] ?? "")} onChange={(e) => updateField(field.name, e.currentTarget.value)} className="min-h-12 border border-white/10 bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                  </label>
                ))}
              </div>
              <button type="button" onClick={() => setRepOpen(false)} className="mt-4 flex w-full items-center justify-center py-1 text-white/40 transition hover:text-white/70"><span className="text-lg">▲</span></button>
            </div>
          )}
        </div>

        {/* Print Preview Accordion */}
        <div className="mb-3 border border-white/10 shadow-[0_0_30px_rgba(190,23,23,0.12),0_14px_40px_rgba(0,0,0,0.2)]">
          <button
            type="button"
            onClick={() => setPreviewOpen((o) => !o)}
            className="flex w-full items-center justify-between bg-[var(--accent)] bg-[url('/bg-card-3x2.jpg')] bg-cover bg-center px-5 py-4 text-left"
          >
            <span className="text-lg font-bold text-white">Print Preview</span>
            <span
              className="text-xl leading-none text-white/70 transition-transform"
              style={{ transform: previewOpen ? "rotate(180deg)" : undefined }}
            >
              ▼
            </span>
          </button>
          {previewOpen && (
            <div className="bg-[#2a2a2e] pb-5 pt-4" ref={containerRef}>
              <div
                style={
                  pageScale < 1
                    ? { zoom: pageScale }
                    : undefined
                }
              >
                <PayoffFormSheet workflow={workflow} />
              </div>
              <button type="button" onClick={() => setPreviewOpen(false)} className="mt-4 flex w-full items-center justify-center py-1 text-white/40 transition hover:text-white/70"><span className="text-lg">▲</span></button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
