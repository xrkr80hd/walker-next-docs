"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { DocToolbar } from "@/components/documents/doc-toolbar";
import { VinVerificationSheet } from "@/components/documents/vin-verification-sheet";
import { SignaturePad } from "@/components/ui/signature-pad";
import { loadConsultant, type ConsultantInfo } from "@/lib/dealer-consultant";
import {
  loadSignatures,
  loadWorkflow,
  saveSignatures,
  saveWorkflow,
  subscribeToWorkflowSessionClear,
  type SignatureStore,
  type WorkflowData
} from "@/lib/walker-workflow";

const PAGE_W = 816;

type SigKey = "customer" | "salesperson";
const VIN_SIG_IDS: Record<SigKey, string> = {
  customer: "vin.customer",
  salesperson: "vin.salesperson",
};

function loadVinSigs(): Record<SigKey, string> {
  const store = loadSignatures();
  return {
    customer: typeof store[VIN_SIG_IDS.customer] === "string" ? store[VIN_SIG_IDS.customer] : "",
    salesperson: typeof store[VIN_SIG_IDS.salesperson] === "string" ? store[VIN_SIG_IDS.salesperson] : "",
  };
}

export function VinVerificationScreen() {
  const [workflow, setWorkflow] = useState<WorkflowData>(() => loadWorkflow());
  const [consultant] = useState<ConsultantInfo>(() => loadConsultant());
  const [signatures, setSignatures] = useState<Record<SigKey, string>>(() => loadVinSigs());
  const [activeSig, setActiveSig] = useState<SigKey | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageScale, setPageScale] = useState(1);
  const [saved, setSaved] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [sigOpen, setSigOpen] = useState(false);

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
      setSignatures(loadVinSigs());
    });
  }, []);

  function updateField(name: keyof WorkflowData, value: string) {
    setWorkflow((current) => {
      const next = { ...current, [name]: value };
      saveWorkflow(next);
      return next;
    });
    setSaved(false);
  }

  function persistSig(key: SigKey, dataUrl: string) {
    const store: SignatureStore = loadSignatures();
    store[VIN_SIG_IDS[key]] = dataUrl;
    saveSignatures(store);
    setSignatures((prev) => ({ ...prev, [key]: dataUrl }));
  }

  function handleSave() {
    saveWorkflow(workflow);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handlePrint() {
    window.open("/print/vin-verification?autoprint=1", "_blank");
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-[8.5in] flex-col rounded-lg bg-[#1c1c1e] p-3 shadow-[0_0_40px_rgba(190,23,23,0.15),0_24px_60px_rgba(0,0,0,0.3)] sm:p-4">
        <DocToolbar vin={workflow.vin} mileage={workflow.mileage} saved={saved} onSave={handleSave} onPrint={handlePrint} />

        {/* Vehicle Being Sold Accordion */}
        <div className="mb-3 border border-white/10 shadow-[0_0_30px_rgba(190,23,23,0.12),0_14px_40px_rgba(0,0,0,0.2)]">
          <button type="button" onClick={() => setVehicleOpen((o) => !o)} className="flex w-full items-center justify-between bg-[var(--accent)] bg-[url('/bg-card-3x2.jpg')] bg-cover bg-center px-5 py-4 text-left">
            <span className="text-lg font-bold text-white">Vehicle Being Sold</span>
            <span className="text-xl leading-none text-white/70 transition-transform" style={{ transform: vehicleOpen ? "rotate(180deg)" : undefined }}>▼</span>
          </button>
          {vehicleOpen && (
            <div className="border-t border-white/10 bg-[#2a2a2e] px-5 pb-6 pt-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="grid gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">Year</span>
                  <input type="text" inputMode="numeric" value={workflow.vehicleYear} onChange={(e) => updateField("vehicleYear", e.currentTarget.value)} className="min-h-12 border border-white/10 bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                </label>
                <label className="grid gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">Make</span>
                  <input type="text" value={workflow.vehicleMake} onChange={(e) => updateField("vehicleMake", e.currentTarget.value)} className="min-h-12 border border-white/10 bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                </label>
                <label className="grid gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">Model</span>
                  <input type="text" value={workflow.vehicleModel} onChange={(e) => updateField("vehicleModel", e.currentTarget.value)} className="min-h-12 border border-white/10 bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                </label>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 sm:col-span-2">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">VIN</span>
                  <input type="text" maxLength={17} spellCheck={false} autoCapitalize="characters" value={workflow.vin} onChange={(e) => updateField("vin", e.currentTarget.value)} className="min-h-12 border border-white/10 bg-white px-4 font-mono text-base uppercase text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                </label>
                <label className="grid gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">Mileage</span>
                  <input type="text" inputMode="numeric" placeholder="Enter mileage" value={workflow.mileage} onChange={(e) => updateField("mileage", e.currentTarget.value)} className="min-h-12 border border-white/10 bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                </label>
                <div className="grid gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">Stock #</span>
                  <div className="flex gap-2">
                    <input type="text" inputMode="numeric" maxLength={7} value={workflow.stockNumber} onChange={(e) => updateField("stockNumber", e.currentTarget.value)} className="min-h-12 flex-1 border border-white/10 bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                    <select value={workflow.stockNumberLetter} onChange={(e) => updateField("stockNumberLetter", e.currentTarget.value)} className="min-h-12 border border-white/10 bg-white px-3 text-base font-bold text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]">
                      <option value="">—</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                      <option value="E">E</option>
                      <option value="F">F – Dealer Trade</option>
                      <option value="G">G</option>
                    </select>
                  </div>
                </div>
              </div>
              <button type="button" onClick={() => setVehicleOpen(false)} className="mt-4 flex w-full items-center justify-center py-1 text-white/40 transition hover:text-white/70"><span className="text-lg">▲</span></button>
            </div>
          )}
        </div>

        {/* Signatures Accordion */}
        <div className="mb-3 border border-white/10 shadow-[0_0_30px_rgba(190,23,23,0.12),0_14px_40px_rgba(0,0,0,0.2)]">
          <button type="button" onClick={() => setSigOpen((o) => !o)} className="flex w-full items-center justify-between bg-[var(--accent)] bg-[url('/bg-card-3x2.jpg')] bg-cover bg-center px-5 py-4 text-left">
            <span className="text-lg font-bold text-white">Signatures</span>
            <span className="text-xl leading-none text-white/70 transition-transform" style={{ transform: sigOpen ? "rotate(180deg)" : undefined }}>▼</span>
          </button>
          {sigOpen && (
            <div className="border-t border-white/10 bg-[#2a2a2e] px-5 pb-6 pt-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">Customer Signature</span>
                  {signatures.customer ? (
                    <button type="button" onClick={() => setActiveSig("customer")} className="flex min-h-20 items-center justify-center border border-[var(--accent)] bg-white p-2">
                      <img src={signatures.customer} alt="Customer Signature" className="max-h-16 object-contain" />
                    </button>
                  ) : (
                    <button type="button" onClick={() => setActiveSig("customer")} className="flex min-h-20 items-center justify-center border border-white/20 bg-white/5 text-sm font-bold text-white/40 transition hover:border-[var(--accent)]">
                      Tap to sign
                    </button>
                  )}
                </div>
                <div className="grid gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">Salesperson Signature</span>
                  {signatures.salesperson ? (
                    <button type="button" onClick={() => setActiveSig("salesperson")} className="flex min-h-20 items-center justify-center border border-[var(--accent)] bg-white p-2">
                      <img src={signatures.salesperson} alt="Salesperson Signature" className="max-h-16 object-contain" />
                    </button>
                  ) : (
                    <button type="button" onClick={() => setActiveSig("salesperson")} className="flex min-h-20 items-center justify-center border border-white/20 bg-white/5 text-sm font-bold text-white/40 transition hover:border-[var(--accent)]">
                      Tap to sign
                    </button>
                  )}
                </div>
              </div>
              <button type="button" onClick={() => setSigOpen(false)} className="mt-4 flex w-full items-center justify-center py-1 text-white/40 transition hover:text-white/70"><span className="text-lg">▲</span></button>
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
                <VinVerificationSheet workflow={workflow} consultant={consultant} />
              </div>
              <button type="button" onClick={() => setPreviewOpen(false)} className="mt-4 flex w-full items-center justify-center py-1 text-white/40 transition hover:text-white/70"><span className="text-lg">▲</span></button>
            </div>
          )}
        </div>
      </div>

      {activeSig && (
        <SignaturePad
          label={activeSig === "customer" ? "Customer Signature" : "Salesperson Signature"}
          initialValue={signatures[activeSig] || undefined}
          onKeep={(dataUrl) => {
            persistSig(activeSig, dataUrl);
            setActiveSig(null);
          }}
          onCancel={() => setActiveSig(null)}
        />
      )}
    </>
  );
}
