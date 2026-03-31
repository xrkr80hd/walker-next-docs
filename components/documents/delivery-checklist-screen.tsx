"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { DeliveryChecklistSheet } from "@/components/documents/delivery-checklist-sheet";
import { useVinConfirmation } from "@/components/ui/use-vin-confirmation";
import {
  loadDeliveryChecklistNotes,
  loadWorkflow,
  saveDeliveryChecklistNotes,
  type DeliveryChecklistNoteKey,
  type DeliveryChecklistNotes,
  type WorkflowData,
} from "@/lib/walker-workflow";

export function DeliveryChecklistScreen() {
  const { confirmVinAction, dialog } = useVinConfirmation();
  const [workflow, setWorkflow] = useState<WorkflowData>(() => loadWorkflow());
  const [notes, setNotes] = useState<DeliveryChecklistNotes>(() =>
    loadDeliveryChecklistNotes(),
  );

  useEffect(() => {
    const handleStorage = () => {
      setWorkflow(loadWorkflow());
      setNotes(loadDeliveryChecklistNotes());
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
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

    window.open(
      "/print/delivery-checklist?autoprint=1&vinchecked=1",
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <>
      <div className="grid gap-6">
        <section className="border border-black/10 bg-[var(--panel)] p-5 shadow-[0_24px_60px_rgba(35,23,12,0.12)] sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">
                Document Route
              </p>
              <h2 className="mt-2 text-3xl font-extrabold leading-tight text-[var(--foreground)]">
                Delivery Checklist
              </h2>
              <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted)]">
                This page reuses the shared workflow record and now persists the
                extra on-sheet notes needed before print. Exact output runs in a
                separate chrome-free route.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/workflow"
                className="inline-flex min-h-11 items-center justify-center border border-[var(--foreground)] bg-white px-4 text-sm font-bold uppercase tracking-[0.08em] text-[var(--foreground)]"
              >
                Back to Workflow
              </Link>
              <button
                type="button"
                onClick={openPrintSurface}
                className="inline-flex min-h-11 items-center justify-center border border-[var(--accent)] bg-[var(--accent)] px-4 text-sm font-bold uppercase tracking-[0.08em] text-white"
              >
                Exact Print
              </button>
            </div>
          </div>
        </section>

        <DeliveryChecklistSheet
          workflow={workflow}
          notes={notes}
          onNoteChange={updateNote}
        />
      </div>

      {dialog}
    </>
  );
}
