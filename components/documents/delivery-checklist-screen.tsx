"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { DeliveryChecklistSheet } from "@/components/documents/delivery-checklist-sheet";
import { DocToolbar } from "@/components/documents/doc-toolbar";
import { useVinConfirmation } from "@/components/ui/use-vin-confirmation";
import { loadConsultant, type ConsultantInfo } from "@/lib/dealer-consultant";
import { getLocalDealId, sendToSm } from "@/lib/deals";
import {
  CHECKLIST_ITEMS,
  createEmailDraft,
  loadDeliveryChecklistNotes,
  loadWorkflow,
  openMailDraft,
  saveDeliveryChecklistNotes,
  saveWorkflow,
  subscribeToWorkflowSessionClear,
  type ChecklistKey,
  type DeliveryChecklistNoteKey,
  type DeliveryChecklistNotes,
  type WorkflowData,
} from "@/lib/walker-workflow";

const PAGE_W = 816;

export function DeliveryChecklistScreen() {
  const { confirmVinAction, dialog } = useVinConfirmation();
  const [workflow, setWorkflow] = useState<WorkflowData>(() => loadWorkflow());
  const [consultant] = useState<ConsultantInfo>(() => loadConsultant());
  const [notes, setNotes] = useState<DeliveryChecklistNotes>(() =>
    loadDeliveryChecklistNotes(),
  );
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState("");
  const [tone, setTone] = useState<"" | "warn" | "success">("");
  const sheetContainerRef = useRef<HTMLDivElement>(null);
  const [pageScale, setPageScale] = useState(1);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [smSent, setSmSent] = useState(false);
  const [smSending, setSmSending] = useState(false);

  useLayoutEffect(() => {
    const el = sheetContainerRef.current;
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
      setNotes(loadDeliveryChecklistNotes());
      setStatus("Session cleared. Ready for a new deal.");
      setTone("success");
    });
  }, []);

  function toggleChecklistItem(key: ChecklistKey) {
    setWorkflow((current) => {
      const next = {
        ...current,
        deliveryChecklist: {
          ...current.deliveryChecklist,
          [key]: !current.deliveryChecklist[key],
        },
      };
      saveWorkflow(next);
      return next;
    });
  }

  function updateNote(fieldKey: DeliveryChecklistNoteKey, value: string) {
    setNotes((current) => {
      const next = saveDeliveryChecklistNotes({
        ...current,
        [fieldKey]: value,
      });
      return next;
    });
  }

  function handleSave() {
    saveWorkflow(workflow);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handlePrint() {
    if (!(await confirmVinAction(workflow.vin, "printing"))) return;
    window.open("/print/delivery-checklist?autoprint=1&vinchecked=1", "_blank");
    setStatus("Print window opened.");
    setTone("success");
  }

  async function handleSendToSm() {
    const dealId = getLocalDealId();
    if (!dealId) {
      setStatus("Save the deal first — no deal ID found.");
      setTone("warn");
      return;
    }
    setSmSending(true);
    const ok = await sendToSm(dealId);
    setSmSending(false);
    if (ok) {
      setSmSent(true);
      setStatus("Deal sent to Sales Manager queue.");
      setTone("success");
    } else {
      setStatus("Could not send to Sales Manager. It may already be sent.");
      setTone("warn");
    }
  }

  function emailFni() {
    openMailDraft(createEmailDraft(workflow, consultant.name));
    setStatus("Email draft opened.");
    setTone("success");
  }

  const emailFniButton = (
    <button
      type="button"
      onClick={emailFni}
      className="flex min-h-12 w-full items-center justify-center gap-2 border border-white/20 bg-white/10 px-4 text-sm font-bold text-white transition hover:bg-white/20"
    >
      Email F&amp;I
    </button>
  );

  return (
    <>
      <div className="mx-auto flex w-full max-w-[8.5in] flex-col rounded-lg bg-[#1c1c1e] p-3 shadow-[0_0_40px_rgba(190,23,23,0.15),0_24px_60px_rgba(0,0,0,0.3)] sm:p-4">
        <DocToolbar vin={workflow.vin} mileage={workflow.mileage} saved={saved} onSave={handleSave} onPrint={handlePrint} />

        {status ? (
          <p
            className={`mb-3 px-2 text-sm font-semibold ${tone === "warn"
              ? "text-yellow-400"
              : tone === "success"
                ? "text-green-400"
                : "text-white/50"
              }`}
          >
            {status}
          </p>
        ) : null}

        {/* Deal Setup Fields */}
        <div className="mb-3 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">Deal Date</span>
            <input
              type="date"
              value={workflow.dealDate}
              onChange={(e) => {
                setWorkflow((cur) => {
                  const next = { ...cur, dealDate: e.target.value };
                  saveWorkflow(next);
                  return next;
                });
              }}
              className="min-h-12 border border-white/10 bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">Tax %</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="e.g. 6.25"
              value={workflow.taxPercent}
              onChange={(e) => {
                setWorkflow((cur) => {
                  const next = { ...cur, taxPercent: e.target.value };
                  saveWorkflow(next);
                  return next;
                });
              }}
              className="min-h-12 border border-white/10 bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
            />
          </label>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setWorkflow((cur) => {
                  const next = { ...cur, deliveryEnabled: !cur.deliveryEnabled };
                  saveWorkflow(next);
                  return next;
                });
              }}
              className={`flex min-h-12 w-full items-center gap-3 border px-4 text-sm font-bold transition ${workflow.deliveryEnabled ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]" : "border-white/20 bg-white/5 text-white/60 hover:border-[var(--accent)]"}`}
            >
              <span className={`flex h-5 w-5 items-center justify-center border text-xs ${workflow.deliveryEnabled ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-white/30 bg-transparent"}`}>{workflow.deliveryEnabled ? "✓" : ""}</span>
              Prepare for Sales Manager
            </button>
          </div>
        </div>

        {/* Checklist Items Accordion */}
        <div className="mb-3 border border-white/10 shadow-[0_0_30px_rgba(190,23,23,0.12),0_14px_40px_rgba(0,0,0,0.2)]">
          <button
            type="button"
            onClick={() => setChecklistOpen((o) => !o)}
            className="flex w-full items-center justify-between bg-[var(--accent)] bg-[url('/bg-card-3x2.jpg')] bg-cover bg-center px-5 py-4 text-left"
          >
            <span className="text-lg font-bold text-white">Checklist Items</span>
            <span
              className="text-xl leading-none text-white/70 transition-transform"
              style={{ transform: checklistOpen ? "rotate(180deg)" : undefined }}
            >
              ▼
            </span>
          </button>
          {checklistOpen && (
            <div className="bg-[#2a2a2e] px-5 pb-6 pt-5">

              <p className="mb-4 text-sm text-white/50">Tap to toggle each item.</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {CHECKLIST_ITEMS.map((item) => (
                  <div key={item.key} className={item.key === "etchNumbers" ? "grid gap-2" : ""}>
                    <button
                      type="button"
                      onClick={() => toggleChecklistItem(item.key)}
                      className={`flex min-h-12 w-full items-center gap-3 border px-4 text-left text-sm font-bold transition ${workflow.deliveryChecklist[item.key]
                        ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]"
                        : "border-white/20 bg-white/5 text-white/60 hover:border-[var(--accent)]"
                        }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center border text-xs ${workflow.deliveryChecklist[item.key]
                          ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                          : "border-white/30 bg-transparent"
                          }`}
                      >
                        {workflow.deliveryChecklist[item.key] ? "✓" : ""}
                      </span>
                      {item.label}
                    </button>
                    {item.key === "etchNumbers" && (
                      <input
                        type="text"
                        placeholder="Enter etch #"
                        value={workflow.etchNumbers}
                        onChange={(e) => {
                          setWorkflow((current) => {
                            const next = { ...current, etchNumbers: e.target.value };
                            saveWorkflow(next);
                            return next;
                          });
                        }}
                        className="min-h-12 border border-white/10 bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                      />
                    )}
                  </div>
                ))}
              </div>

              <hr className="my-6 border-white/10" />

              {/* Document completion toggles */}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setWorkflow((current) => {
                      const next = { ...current, signedBuyerAgreement: !current.signedBuyerAgreement };
                      saveWorkflow(next);
                      return next;
                    });
                  }}
                  className={`flex min-h-12 items-center gap-3 border px-4 text-sm font-bold transition ${workflow.signedBuyerAgreement ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]" : "border-white/20 bg-white/5 text-white/60 hover:border-[var(--accent)]"}`}
                >
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center border text-xs ${workflow.signedBuyerAgreement ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-white/30 bg-transparent"}`}>{workflow.signedBuyerAgreement ? "✓" : ""}</span>
                  Signed Buyer's Agreement
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWorkflow((current) => {
                      const next = { ...current, factoryInvBuyerGuide: !current.factoryInvBuyerGuide };
                      saveWorkflow(next);
                      return next;
                    });
                  }}
                  className={`flex min-h-12 items-center gap-3 border px-4 text-sm font-bold transition ${workflow.factoryInvBuyerGuide ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]" : "border-white/20 bg-white/5 text-white/60 hover:border-[var(--accent)]"}`}
                >
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center border text-xs ${workflow.factoryInvBuyerGuide ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-white/30 bg-transparent"}`}>{workflow.factoryInvBuyerGuide ? "✓" : ""}</span>
                  Factory Inv./Fed. Buyer's Guide
                </button>
              </div>

              {/* First Service Visit + New/Used */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">First Service Visit</span>
                  <input
                    type="date"
                    value={workflow.firstServiceVisitDate}
                    onChange={(e) => {
                      setWorkflow((cur) => {
                        const next = { ...cur, firstServiceVisitDate: e.target.value };
                        saveWorkflow(next);
                        return next;
                      });
                    }}
                    className="min-h-12 border border-white/10 bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                  />
                </label>
                <div className="grid gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">Vehicle Type</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setWorkflow((cur) => {
                          const next = { ...cur, dealType: "new" as const };
                          saveWorkflow(next);
                          return next;
                        });
                      }}
                      className={`flex min-h-12 flex-1 items-center justify-center border px-4 text-sm font-bold transition ${workflow.dealType === "new" ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]" : "border-white/20 bg-white/5 text-white/60 hover:border-[var(--accent)]"}`}
                    >
                      New
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setWorkflow((cur) => {
                          const next = { ...cur, dealType: "used" as const };
                          saveWorkflow(next);
                          return next;
                        });
                      }}
                      className={`flex min-h-12 flex-1 items-center justify-center border px-4 text-sm font-bold transition ${workflow.dealType === "used" ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]" : "border-white/20 bg-white/5 text-white/60 hover:border-[var(--accent)]"}`}
                    >
                      Used
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Specialty Plate Check ── */}
              <div className="mt-4 border-t border-white/10 pt-4">
                <p className="text-sm font-bold uppercase tracking-[0.1em] text-white/60">Does the customer have a specialty plate?</p>
                <p className="mt-1 text-xs leading-5 text-white/40">
                  Louisiana: Only specialty plates (Saints, LSU, Disabled Veteran, Handicap, etc.) can transfer between vehicles for $3. Standard plates are canceled — a new plate is issued ($40–$112).
                </p>
                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setWorkflow(prev => { const next = { ...prev, specialtyPlate: prev.specialtyPlate === "yes" ? "" as const : "yes" as const }; saveWorkflow(next); return next; }); }}
                    className={`inline-flex min-h-10 items-center justify-center border px-5 text-sm font-bold uppercase tracking-[0.08em] transition ${workflow.specialtyPlate === "yes" ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-white/20 bg-white/10 text-white"}`}
                  >
                    Yes — Specialty
                  </button>
                  <button
                    type="button"
                    onClick={() => { setWorkflow(prev => { const next = { ...prev, specialtyPlate: prev.specialtyPlate === "no" ? "" as const : "no" as const }; saveWorkflow(next); return next; }); }}
                    className={`inline-flex min-h-10 items-center justify-center border px-5 text-sm font-bold uppercase tracking-[0.08em] transition ${workflow.specialtyPlate === "no" ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-white/20 bg-white/10 text-white"}`}
                  >
                    No — Standard
                  </button>
                </div>
                {workflow.specialtyPlate === "yes" && (
                  <div className="mt-3 border-l-4 border-[var(--success)] bg-[var(--success)]/10 px-4 py-3">
                    <p className="text-sm font-bold text-[var(--success)]">Plate Transfer — $3 fee</p>
                    <p className="mt-1 text-xs leading-5 text-white/70">Customer has a transferable specialty plate — confirm transfer to save on fees. Flag deal as &quot;plate transfer&quot; when structuring numbers.</p>
                  </div>
                )}
                {workflow.specialtyPlate === "no" && (
                  <div className="mt-3 border-l-4 border-[var(--warn)] bg-[var(--warn)]/10 px-4 py-3">
                    <p className="text-sm font-bold text-[var(--warn)]">New Plate Required — $40–$112</p>
                    <p className="mt-1 text-xs leading-5 text-white/70">Standard plate will be canceled. Include new plate fee in deal structuring before presenting final numbers.</p>
                  </div>
                )}
              </div>

              {/* ── Validation Hints ── */}
              <div className="mt-4 grid gap-2">
                <div className="border-l-4 border-amber-500 bg-amber-500/10 px-4 py-3">
                  <p className="text-xs font-bold text-amber-400">License Check</p>
                  <p className="mt-1 text-xs leading-5 text-white/60">Clear photo, not expired, not cropped — front + back. Name on deal MUST match license EXACTLY (Chris ≠ Christopher = DEAL KILLER).</p>
                </div>
                <div className="border-l-4 border-amber-500 bg-amber-500/10 px-4 py-3">
                  <p className="text-xs font-bold text-amber-400">Insurance Check</p>
                  <p className="mt-1 text-xs leading-5 text-white/60">Full coverage required. Correct vehicle listed. Deductibles ≤ $1,000. Must cover the new vehicle — not just the trade.</p>
                </div>
              </div>

              <hr className="my-6 border-white/10" />

              {/* Email F&I + Send to Sales Manager */}
              <div className="grid gap-2 sm:grid-cols-2">
                {emailFniButton}
                <button
                  type="button"
                  onClick={handleSendToSm}
                  disabled={smSent || smSending}
                  className={`flex min-h-12 w-full items-center justify-center gap-2 border px-4 text-sm font-bold transition ${smSent ? "border-green-500 bg-green-500/20 text-green-400" : "border-white/20 bg-white/10 text-white hover:bg-white/20"} disabled:opacity-50`}
                >
                  {smSending ? "Sending…" : smSent ? "✓ Sent to Sales Manager" : "Send to Sales Manager"}
                </button>
              </div>

              <button type="button" onClick={() => setChecklistOpen(false)} className="mt-4 flex w-full items-center justify-center py-1 text-white/40 transition hover:text-white/70"><span className="text-lg">▲</span></button>
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
            <div className="bg-[#2a2a2e] pb-5 pt-4" ref={sheetContainerRef}>
              <div
                style={
                  pageScale < 1
                    ? { zoom: pageScale }
                    : undefined
                }
              >
                <DeliveryChecklistSheet
                  workflow={workflow}
                  consultant={consultant}
                  notes={notes}
                  onNoteChange={updateNote}
                />
              </div>
              <button type="button" onClick={() => setPreviewOpen(false)} className="mt-4 flex w-full items-center justify-center py-1 text-white/40 transition hover:text-white/70"><span className="text-lg">▲</span></button>
            </div>
          )}
        </div>
      </div>
      {dialog}
    </>
  );
}
