"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { AddressInformationSheet } from "@/components/documents/address-information-sheet";
import { DocToolbar } from "@/components/documents/doc-toolbar";
import {
  loadWorkflow,
  saveWorkflow,
  subscribeToWorkflowSessionClear,
  type WorkflowData,
} from "@/lib/walker-workflow";

const PAGE_W = 816;

const ADDRESS_FIELDS = [
  { name: "customerName", label: "Customer Name", type: "text", wide: true },
  { name: "coCustomerName", label: "Co-Customer Name", type: "text", wide: true },
  { name: "homeAddress", label: "Street Address", type: "text", wide: true },
  { name: "homeCity", label: "City", type: "text", wide: false },
  { name: "homeState", label: "State", type: "text", wide: false },
  { name: "homeZip", label: "Zip", type: "text", wide: false },
] as const;

const MAILING_FIELDS = [
  { name: "mailingAddress", label: "Mailing Address", type: "text", wide: true },
  { name: "mailingCity", label: "City", type: "text", wide: false },
  { name: "mailingState", label: "State", type: "text", wide: false },
  { name: "mailingZip", label: "Zip", type: "text", wide: false },
] as const;

export function AddressInformationScreen() {
  const [workflow, setWorkflow] = useState<WorkflowData>(() => loadWorkflow());
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageScale, setPageScale] = useState(1);
  const [saved, setSaved] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [physicalOpen, setPhysicalOpen] = useState(false);
  const [mailingOpen, setMailingOpen] = useState(false);

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
    window.open("/print/address-information?autoprint=1", "_blank");
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-[8.5in] flex-col rounded-lg bg-[#1c1c1e] p-3 shadow-[0_0_40px_rgba(190,23,23,0.15),0_24px_60px_rgba(0,0,0,0.3)] sm:p-4">
        <DocToolbar vin={workflow.vin} mileage={workflow.mileage} saved={saved} onSave={handleSave} onPrint={handlePrint} />

        {/* Physical Address Accordion */}
        <div className="mb-3 border border-white/10 shadow-[0_0_30px_rgba(190,23,23,0.12),0_14px_40px_rgba(0,0,0,0.2)]">
          <button type="button" onClick={() => setPhysicalOpen((o) => !o)} className="flex w-full items-center justify-between bg-[var(--accent)] bg-[url('/bg-card-3x2.jpg')] bg-cover bg-center px-5 py-4 text-left">
            <span className="text-lg font-bold text-white">Physical Address</span>
            <span className="text-xl leading-none text-white/70 transition-transform" style={{ transform: physicalOpen ? "rotate(180deg)" : undefined }}>▼</span>
          </button>
          {physicalOpen && (
            <div className="border-t border-white/10 bg-[#2a2a2e] px-5 pb-6 pt-5">
              <div className="grid gap-4 sm:grid-cols-2">
                {ADDRESS_FIELDS.map((field) => (
                  <label
                    key={field.name}
                    className={`grid gap-2 ${field.wide ? "sm:col-span-2" : ""}`}
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

              {/* Mailing Address Toggle — inside Physical accordion */}
              <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-5">
                <span className="text-sm font-bold uppercase tracking-[0.14em] text-white/50">Mailing address same as physical?</span>
                <div className="flex overflow-hidden border border-white/20">
                  <button
                    type="button"
                    onClick={() => {
                      setWorkflow((current) => {
                        const next = { ...current, mailingDifferent: false };
                        saveWorkflow(next);
                        return next;
                      });
                      setMailingOpen(false);
                    }}
                    className={`min-h-10 px-4 text-sm font-bold transition ${!workflow.mailingDifferent ? "bg-[var(--accent)] text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setWorkflow((current) => {
                        const next = { ...current, mailingDifferent: true };
                        saveWorkflow(next);
                        return next;
                      });
                      setMailingOpen(true);
                    }}
                    className={`min-h-10 px-4 text-sm font-bold transition ${workflow.mailingDifferent ? "bg-[var(--accent)] text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`}
                  >
                    No
                  </button>
                </div>
              </div>

              <button type="button" onClick={() => setPhysicalOpen(false)} className="mt-4 flex w-full items-center justify-center py-1 text-white/40 transition hover:text-white/70"><span className="text-lg">▲</span></button>
            </div>
          )}
        </div>

        {/* Mailing Address Accordion */}
        <div className={`mb-3 overflow-hidden border shadow-[0_0_30px_rgba(190,23,23,0.12),0_14px_40px_rgba(0,0,0,0.2)] transition-opacity ${workflow.mailingDifferent ? "border-white/10 opacity-100" : "pointer-events-none border-white/5 opacity-40"}`}>
          <button
            type="button"
            onClick={() => { if (workflow.mailingDifferent) setMailingOpen((o) => !o); }}
            className="flex w-full items-center justify-between bg-[var(--accent)] bg-[url('/bg-card-3x2.jpg')] bg-cover bg-center px-5 py-4 text-left"
          >
            <span className="text-lg font-bold text-white">Mailing Address</span>
            <span className="text-xl leading-none text-white/70 transition-transform" style={{ transform: mailingOpen ? "rotate(180deg)" : undefined }}>▼</span>
          </button>
          {mailingOpen && workflow.mailingDifferent && (
            <div className="border-t border-white/10 bg-[#2a2a2e] px-5 pb-6 pt-5">
              <div className="grid gap-4 sm:grid-cols-2">
                {MAILING_FIELDS.map((field) => (
                  <label
                    key={field.name}
                    className={`grid gap-2 ${field.wide ? "sm:col-span-2" : ""}`}
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
              <button type="button" onClick={() => setMailingOpen(false)} className="mt-4 flex w-full items-center justify-center py-1 text-white/40 transition hover:text-white/70"><span className="text-lg">▲</span></button>
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
                <AddressInformationSheet workflow={workflow} />
              </div>
              <button type="button" onClick={() => setPreviewOpen(false)} className="mt-4 flex w-full items-center justify-center py-1 text-white/40 transition hover:text-white/70"><span className="text-lg">▲</span></button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
