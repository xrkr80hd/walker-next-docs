"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { DeliveryChecklistSheet } from "@/components/documents/delivery-checklist-sheet";
import { DocToolbar } from "@/components/documents/doc-toolbar";
import { loadConsultant, type ConsultantInfo } from "@/lib/dealer-consultant";
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

  useLayoutEffect(() => {
    const el = sheetContainerRef.current;
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

  function handlePrint() {
    window.open("/print/delivery-checklist?autoprint=1", "_blank");
    setStatus("Print window opened.");
    setTone("success");
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
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">Deal #</span>
            <input
              type="text"
              inputMode="numeric"
              value={workflow.dealNumber}
              onChange={(e) => {
                setWorkflow((cur) => {
                  const next = { ...cur, dealNumber: e.target.value };
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
              Prepare for F&amp;I
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

              {/* Co-Owner + Payoff Verified toggles */}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setWorkflow((current) => {
                      const next = { ...current, hasCoOwner: !current.hasCoOwner };
                      saveWorkflow(next);
                      return next;
                    });
                  }}
                  className={`flex min-h-12 items-center gap-2 border px-4 text-sm font-bold transition ${workflow.hasCoOwner ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]" : "border-white/20 bg-white/5 text-white/60 hover:border-[var(--accent)]"}`}
                >
                  <span className={`flex h-5 w-5 items-center justify-center border text-xs ${workflow.hasCoOwner ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-white/30 bg-transparent"}`}>{workflow.hasCoOwner ? "✓" : ""}</span>
                  Co-Owner
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWorkflow((current) => {
                      const next = { ...current, payoffVerified: !current.payoffVerified };
                      saveWorkflow(next);
                      return next;
                    });
                  }}
                  className={`flex min-h-12 items-center gap-3 border px-4 text-sm font-bold transition ${workflow.payoffVerified
                    ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]"
                    : "border-white/20 bg-white/5 text-white/60 hover:border-[var(--accent)]"
                    }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center border text-xs ${workflow.payoffVerified
                      ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                      : "border-white/30 bg-transparent"
                      }`}
                  >
                    {workflow.payoffVerified ? "✓" : ""}
                  </span>
                  Payoff Verified
                </button>
              </div>

              <hr className="my-6 border-white/10" />

              {/* Email F&I */}
              {emailFniButton}

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
            <div className="bg-[#2a2a2e] px-5 pb-5 pt-4" ref={sheetContainerRef}>
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
    </>
  );
}
