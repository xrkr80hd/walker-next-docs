"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { DeliveryChecklistSheet } from "@/components/documents/delivery-checklist-sheet";
import { useVinConfirmation } from "@/components/ui/use-vin-confirmation";
import { loadConsultant, type ConsultantInfo } from "@/lib/dealer-consultant";
import { printCurrentWindowAndClear, printElementExact } from "@/lib/exact-print";
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
  const [consultant] = useState<ConsultantInfo>(() => loadConsultant());
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

  const isSaveMode = searchParams.get("mode") === "save";

  useEffect(() => {
    if (printedRef.current || searchParams.get("autoprint") !== "1") {
      return;
    }

    printedRef.current = true;
    const timeout = window.setTimeout(async () => {
      const vinChecked = searchParams.get("vinchecked") === "1";
      const proceed = vinChecked
        ? true
        : await confirmVinAction(workflow.vin, isSaveMode ? "saving to PDF" : "printing");
      if (!proceed) {
        return;
      }

      if (isSaveMode) {
        printCurrentWindowAndClear();
        return;
      }

      const target = document.querySelector('[data-print-sheet="delivery-checklist"]');
      if (target instanceof HTMLElement) {
        await printElementExact(target);
      }
    }, 260);

    return () => window.clearTimeout(timeout);
  }, [confirmVinAction, searchParams, workflow, isSaveMode]);

  async function handleAction() {
    if (!(await confirmVinAction(workflow.vin, isSaveMode ? "saving to PDF" : "printing"))) {
      return;
    }

    if (isSaveMode) {
      printCurrentWindowAndClear();
      return;
    }

    const target = document.querySelector('[data-print-sheet="delivery-checklist"]');
    if (target instanceof HTMLElement) {
      await printElementExact(target);
    }
  }

  return (
    <>
      <div className="mx-auto flex min-h-screen w-full max-w-[8.5in] flex-col px-4 py-4 sm:px-0">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border border-black/10 bg-white/90 px-4 py-3 shadow-[0_14px_40px_rgba(0,0,0,0.08)] print:hidden">
          <Link
            href="/documents/delivery-checklist"
            className="inline-flex min-h-10 items-center justify-center border border-[var(--foreground)] bg-white px-4 text-sm font-bold text-[var(--foreground)]"
          >
            Back to Document
          </Link>

          <button
            type="button"
            onClick={handleAction}
            className="inline-flex min-h-10 items-center justify-center border border-[var(--foreground)] bg-[var(--foreground)] px-4 text-sm font-bold text-white"
          >
            Print Form
          </button>
        </div>

        <DeliveryChecklistSheet workflow={workflow} consultant={consultant} notes={notes} />
      </div>

      {dialog}
    </>
  );
}
