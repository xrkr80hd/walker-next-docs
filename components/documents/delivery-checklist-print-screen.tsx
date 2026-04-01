"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { DeliveryChecklistSheet } from "@/components/documents/delivery-checklist-sheet";
import { useVinConfirmation } from "@/components/ui/use-vin-confirmation";
import { printElementExact } from "@/lib/exact-print";
import {
  loadDeliveryChecklistNotes,
  loadWorkflow,
  subscribeToWorkflowSessionClear,
  type DeliveryChecklistNotes,
  type WorkflowData,
} from "@/lib/walker-workflow";

export function DeliveryChecklistPrintScreen() {
  const searchParams = useSearchParams();
  const { confirmVinAction, dialog } = useVinConfirmation();
  const [workflow, setWorkflow] = useState<WorkflowData>(() => loadWorkflow());
  const [notes, setNotes] = useState<DeliveryChecklistNotes>(() =>
    loadDeliveryChecklistNotes(),
  );
  const printedRef = useRef(false);

  useEffect(() => {
    return subscribeToWorkflowSessionClear(() => {
      setWorkflow(loadWorkflow());
      setNotes(loadDeliveryChecklistNotes());
    });
  }, []);

  useEffect(() => {
    if (printedRef.current || searchParams.get("autoprint") !== "1") {
      return;
    }

    printedRef.current = true;
    const timeout = window.setTimeout(async () => {
      const vinChecked = searchParams.get("vinchecked") === "1";
      const proceed = vinChecked
        ? true
        : await confirmVinAction(workflow.vin, "printing");
      if (!proceed) {
        return;
      }

      const target = document.querySelector(
        '[data-print-sheet="delivery-checklist"]',
      );
      if (target instanceof HTMLElement) {
        await printElementExact(target);
      }
    }, 260);

    return () => window.clearTimeout(timeout);
  }, [confirmVinAction, searchParams, workflow]);

  async function handlePrint() {
    if (!(await confirmVinAction(workflow.vin, "printing"))) {
      return;
    }

    const target = document.querySelector('[data-print-sheet="delivery-checklist"]');
    if (target instanceof HTMLElement) {
      await printElementExact(target);
    }
  }

  return (
    <>
      <div className="min-h-screen bg-[#f5f5f5] px-4 py-4">
        <div className="mx-auto mb-4 flex w-full max-w-[8.5in] items-center justify-between gap-4 print:hidden">
          <p className="text-sm font-semibold text-[var(--muted)]">
            Exact print clears this browser session when the print dialog closes.
          </p>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex min-h-11 items-center justify-center border border-[var(--accent)] bg-[var(--accent)] px-4 text-sm font-bold uppercase tracking-[0.08em] text-white"
          >
            Print Exact
          </button>
        </div>

        <DeliveryChecklistSheet workflow={workflow} notes={notes} />
      </div>

      {dialog}
    </>
  );
}
