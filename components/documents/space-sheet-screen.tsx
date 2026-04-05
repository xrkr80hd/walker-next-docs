"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { SpaceSheet } from "@/components/documents/space-sheet-sheet";
import {
  loadWorkflow,
  saveWorkflow,
  subscribeToWorkflowSessionClear,
  type WorkflowData,
} from "@/lib/walker-workflow";

const PAGE_W = 816;

const INPUT_FIELDS = [
  { name: "customerName", label: "Customer Name", type: "text" },
  { name: "cellPhone", label: "Cell Phone", type: "tel" },
  { name: "email", label: "Email", type: "email" },
  { name: "homeAddress", label: "Street Address", type: "text" },
  { name: "homeCity", label: "City", type: "text" },
  { name: "homeState", label: "State", type: "text" },
  { name: "homeZip", label: "Zip", type: "text" },
  { name: "customerSource", label: "How did you hear about us?", type: "text" },
] as const;

const PRIORITY_FIELDS = [
  { name: "prioritySafety", label: "Safety" },
  { name: "priorityPerformance", label: "Performance" },
  { name: "priorityAppearance", label: "Appearance" },
  { name: "priorityComfort", label: "Comfort" },
  { name: "priorityEconomy", label: "Economy" },
  { name: "priorityDependability", label: "Dependability" },
  { name: "priorityOther", label: "Other" },
] as const;

export function SpaceSheetScreen() {
  const [workflow, setWorkflow] = useState<WorkflowData>(() => loadWorkflow());
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageScale, setPageScale] = useState(1);
  const [saved, setSaved] = useState(false);
  const [customerOpen, setCustomerOpen] = useState(true);
  const [tradeOpen, setTradeOpen] = useState(true);
  const [priorityOpen, setPriorityOpen] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setPageScale(w >= PAGE_W ? 1 : w / PAGE_W);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
    window.open("/print/pain-points?autoprint=1&vinchecked=1", "_blank");
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-[8.5in] flex-col rounded-lg bg-[#1c1c1e] p-3 shadow-[0_0_40px_rgba(190,23,23,0.15),0_24px_60px_rgba(0,0,0,0.3)] sm:p-4">
        {/* Toolbar */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border border-white/10 bg-[#2a2a2e] px-4 py-3 shadow-[0_14px_40px_rgba(0,0,0,0.2)]">
          <Link
            href="/dashboard"
            className="inline-flex min-h-10 items-center justify-center border border-white/20 bg-white/10 px-4 text-sm font-bold text-white transition hover:bg-white/20"
          >
            Back to Dashboard
          </Link>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex min-h-10 items-center justify-center border border-white/20 bg-white/10 px-4 text-sm font-bold text-white transition hover:bg-white/20"
            >
              {saved ? "✓ Saved" : "Save"}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex min-h-10 items-center justify-center border border-white/20 bg-[var(--accent)] px-4 text-sm font-bold text-white transition hover:bg-[var(--accent-strong)]"
            >
              Print Form
            </button>
          </div>
        </div>

        {/* Customer Info Accordion */}
        <div className="mb-3 overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(190,23,23,0.12),0_14px_40px_rgba(0,0,0,0.2)]">
          <button
            type="button"
            onClick={() => setCustomerOpen((o) => !o)}
            className="flex w-full items-center justify-between bg-[var(--accent)] bg-[url('/bg-card-3x2.jpg')] bg-cover bg-center px-5 py-4 text-left"
          >
            <span className="text-lg font-bold text-white">Customer Info</span>
            <span
              className="text-xl leading-none text-white/70 transition-transform"
              style={{ transform: customerOpen ? "rotate(180deg)" : undefined }}
            >
              ▼
            </span>
          </button>
          {customerOpen && (
            <div className="bg-[#2a2a2e] px-5 pb-5 pt-4">
              <p className="text-sm text-white/50">
                Fill this out first — data carries over to New/Used workflows.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {INPUT_FIELDS.map((field) => (
                  <label
                    key={field.name}
                    className={`grid gap-2 ${field.name === "customerSource" || field.name === "homeAddress" ? "sm:col-span-2" : ""}`}
                  >
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">
                      {field.label}
                    </span>
                    <input
                      type={field.type}
                      value={String(workflow[field.name] ?? "")}
                      onChange={(e) => updateField(field.name, e.currentTarget.value)}
                      className="min-h-12 border border-white/10 bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Trade & Budget Accordion */}
        <div className="mb-3 overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(190,23,23,0.12),0_14px_40px_rgba(0,0,0,0.2)]">
          <button
            type="button"
            onClick={() => setTradeOpen((o) => !o)}
            className="flex w-full items-center justify-between bg-[var(--accent)] bg-[url('/bg-card-3x2.jpg')] bg-cover bg-center px-5 py-4 text-left"
          >
            <span className="text-lg font-bold text-white">Trade &amp; Budget</span>
            <span
              className="text-xl leading-none text-white/70 transition-transform"
              style={{ transform: tradeOpen ? "rotate(180deg)" : undefined }}
            >
              ▼
            </span>
          </button>
          {tradeOpen && (
            <div className="bg-[#2a2a2e] px-5 pb-5 pt-4">
              {/* Trade-In toggle */}
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">Trade-In?</span>
                <div className="mt-2 flex gap-2 sm:max-w-xs">
                  <button
                    type="button"
                    onClick={() => updateField("tradeIn", workflow.tradeIn === "yes" ? "" : "yes")}
                    className={`flex min-h-12 flex-1 items-center justify-center gap-2 border text-sm font-bold transition ${workflow.tradeIn === "yes" ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]" : "border-white/20 bg-white/5 text-white/60 hover:border-[var(--accent)]"}`}
                  >
                    <span className={`flex h-5 w-5 items-center justify-center border text-xs ${workflow.tradeIn === "yes" ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-white/30 bg-transparent"}`}>{workflow.tradeIn === "yes" ? "✓" : ""}</span>
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField("tradeIn", workflow.tradeIn === "no" ? "" : "no")}
                    className={`flex min-h-12 flex-1 items-center justify-center gap-2 border text-sm font-bold transition ${workflow.tradeIn === "no" ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]" : "border-white/20 bg-white/5 text-white/60 hover:border-[var(--accent)]"}`}
                  >
                    <span className={`flex h-5 w-5 items-center justify-center border text-xs ${workflow.tradeIn === "no" ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-white/30 bg-transparent"}`}>{workflow.tradeIn === "no" ? "✓" : ""}</span>
                    No
                  </button>
                </div>
              </div>

              {/* Balance / Payment / Budget — clean 3-col row */}
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <label className="grid gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">Approx. Balance</span>
                  <input type="text" value={workflow.approxBalance} onChange={(e) => updateField("approxBalance", e.currentTarget.value)} className="min-h-12 border border-white/10 bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                </label>
                <label className="grid gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">Current Payment</span>
                  <input type="text" value={workflow.currentPayment} onChange={(e) => updateField("currentPayment", e.currentTarget.value)} className="min-h-12 border border-white/10 bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                </label>
                <label className="grid gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">New Budget</span>
                  <input type="text" value={workflow.newBudget} onChange={(e) => updateField("newBudget", e.currentTarget.value)} className="min-h-12 border border-white/10 bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Priority Items Accordion */}
        <div className="mb-3 overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(190,23,23,0.12),0_14px_40px_rgba(0,0,0,0.2)]">
          <button
            type="button"
            onClick={() => setPriorityOpen((o) => !o)}
            className="flex w-full items-center justify-between bg-[var(--accent)] bg-[url('/bg-card-3x2.jpg')] bg-cover bg-center px-5 py-4 text-left"
          >
            <span className="text-lg font-bold text-white">What 3 Are Most Important &amp; Why?</span>
            <span
              className="text-xl leading-none text-white/70 transition-transform"
              style={{ transform: priorityOpen ? "rotate(180deg)" : undefined }}
            >
              ▼
            </span>
          </button>
          {priorityOpen && (
            <div className="bg-[#2a2a2e] px-5 pb-5 pt-4">
              <p className="text-sm text-white/50">These print on the SPACED sheet.</p>
              <div className="mt-4 grid gap-4">
                {PRIORITY_FIELDS.map((field) => (
                  <label key={field.name} className="grid gap-2">
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/80">{field.label}</span>
                    <input
                      type="text"
                      placeholder={`Why is ${field.label.toLowerCase()} important?`}
                      value={String(workflow[field.name] ?? "")}
                      onChange={(e) => updateField(field.name, e.currentTarget.value)}
                      className="min-h-12 border border-white/10 bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Print Preview Accordion */}
        <div className="mb-3 overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(190,23,23,0.12),0_14px_40px_rgba(0,0,0,0.2)]">
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
            <div className="bg-[#2a2a2e] px-5 pb-5 pt-4" ref={containerRef}>
              <div
                style={
                  pageScale < 1
                    ? {
                      transform: `scale(${pageScale})`,
                      transformOrigin: "top left",
                      height: `${1056 * pageScale}px`,
                    }
                    : undefined
                }
              >
                <SpaceSheet workflow={workflow} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
