"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { DeliveryChecklistSheet } from "@/components/documents/delivery-checklist-sheet";
import { useVinConfirmation } from "@/components/ui/use-vin-confirmation";
import { loadConsultant, type ConsultantInfo } from "@/lib/dealer-consultant";
import {
  createEmailDraft,
  getLast8,
  loadDeliveryChecklistNotes,
  loadWorkflow,
  openMailDraft,
  saveDeliveryChecklistNotes,
  subscribeToWorkflowSessionClear,
  type DeliveryChecklistNoteKey,
  type DeliveryChecklistNotes,
  type WorkflowData,
} from "@/lib/walker-workflow";

export function DeliveryChecklistScreen() {
  const { confirmVinAction, dialog } = useVinConfirmation();
  const [workflow, setWorkflow] = useState<WorkflowData>(() => loadWorkflow());
  const [consultant] = useState<ConsultantInfo>(() => loadConsultant());
  const [notes, setNotes] = useState<DeliveryChecklistNotes>(() =>
    loadDeliveryChecklistNotes(),
  );
  const [status, setStatus] = useState("");
  const [tone, setTone] = useState<"" | "warn" | "success">("");
  const sheetContainerRef = useRef<HTMLDivElement>(null);
  const [pageScale, setPageScale] = useState(1);

  useLayoutEffect(() => {
    const el = sheetContainerRef.current;
    if (!el) return;
    const PAGE_W = 816; // 8.5in at 96 CSS-px/in
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

  function updateNote(fieldKey: DeliveryChecklistNoteKey, value: string) {
    setNotes((current) => {
      const next = saveDeliveryChecklistNotes({
        ...current,
        [fieldKey]: value,
      });
      return next;
    });
  }

  async function openPrintSurface() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const latest = loadWorkflow();
    if (!(await confirmVinAction(latest.vin, "printing"))) {
      return;
    }

    window.open("/print/delivery-checklist?autoprint=1&vinchecked=1", "_blank");
    setStatus("Print window opened.");
    setTone("success");
  }

  async function emailFni() {
    const latest = loadWorkflow();
    if (!(await confirmVinAction(latest.vin, "emailing"))) {
      return;
    }

    openMailDraft(createEmailDraft(latest, consultant.name));
    setStatus("Email draft opened.");
    setTone("success");
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-[8.5in] flex-col">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border border-black/10 bg-white/90 px-4 py-3 shadow-[0_14px_40px_rgba(0,0,0,0.08)]">
          <Link
            href="/workflow"
            className="inline-flex min-h-10 items-center justify-center border border-[var(--foreground)] bg-white px-4 text-sm font-bold text-[var(--foreground)]"
          >
            Back to Workflow
          </Link>

          <span className="text-sm font-bold text-[var(--foreground)]">
            Last 8: {getLast8(workflow.vin) || "-"}
          </span>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={emailFni}
              className="inline-flex min-h-10 items-center justify-center border border-[var(--foreground)] bg-white px-4 text-sm font-bold text-[var(--foreground)]"
            >
              Email F&amp;I
            </button>
            <button
              type="button"
              onClick={openPrintSurface}
              className="inline-flex min-h-10 items-center justify-center border border-[var(--foreground)] bg-[var(--foreground)] px-4 text-sm font-bold text-white"
            >
              Print Form
            </button>
          </div>
        </div>

        {status ? (
          <p
            className={`mb-3 text-sm font-semibold ${tone === "warn"
              ? "text-[var(--warn)]"
              : tone === "success"
                ? "text-[var(--success)]"
                : "text-[var(--muted)]"
              }`}
          >
            {status}
          </p>
        ) : null}

        <div ref={sheetContainerRef}>
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
        </div>
      </div>

      {dialog}
    </>
  );
}
