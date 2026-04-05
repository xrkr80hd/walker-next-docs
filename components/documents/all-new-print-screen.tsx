"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { AddressInformationSheet } from "@/components/documents/address-information-sheet";
import { DeliveryChecklistSheet } from "@/components/documents/delivery-checklist-sheet";
import { PayoffFormSheet } from "@/components/documents/payoff-form-sheet";
import { SpaceSheet } from "@/components/documents/space-sheet-sheet";
import { VinVerificationSheet } from "@/components/documents/vin-verification-sheet";
import { useVinConfirmation } from "@/components/ui/use-vin-confirmation";
import {
  loadConsultant,
  type ConsultantInfo,
} from "@/lib/dealer-consultant";
import { printAllElementsExact, printCurrentWindowAndClear } from "@/lib/exact-print";
import {
  createDefaultWorkflowData,
  loadDeliveryChecklistNotes,
  loadWorkflow,
  subscribeToWorkflowSessionClear,
  type DeliveryChecklistNotes,
  type WorkflowData,
} from "@/lib/walker-workflow";

export function AllNewPrintScreen() {
  const searchParams = useSearchParams();
  const isBlank = searchParams.get("blank") === "1";
  const { confirmVinAction, dialog } = useVinConfirmation();
  const [workflow, setWorkflow] = useState<WorkflowData>(() => isBlank ? createDefaultWorkflowData() : loadWorkflow());
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

  const collectAndOutput = useCallback(async () => {
    if (isSaveMode) {
      printCurrentWindowAndClear();
      return;
    }

    const sheets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-print-sheet]"),
    );
    if (sheets.length === 0) return;
    await printAllElementsExact(sheets);
  }, [isSaveMode]);

  useEffect(() => {
    if (printedRef.current || searchParams.get("autoprint") !== "1") return;
    printedRef.current = true;
    const timeout = window.setTimeout(async () => {
      const vinChecked = searchParams.get("vinchecked") === "1";
      const proceed = vinChecked
        ? true
        : await confirmVinAction(workflow.vin, isSaveMode ? "saving all forms to PDF" : "printing all forms");
      if (!proceed) return;
      await collectAndOutput();
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [collectAndOutput, confirmVinAction, searchParams, workflow, isSaveMode]);

  async function handleAction() {
    if (!isBlank && !(await confirmVinAction(workflow.vin, isSaveMode ? "saving all forms to PDF" : "printing all forms"))) return;
    await collectAndOutput();
  }

  return (
    <>
      <div className="mx-auto flex min-h-screen w-full max-w-[8.5in] flex-col px-4 py-4 sm:px-0">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border border-black/10 bg-white/90 px-4 py-3 shadow-[0_14px_40px_rgba(0,0,0,0.08)] print:hidden">
          <Link
            href="/workflow/new"
            className="inline-flex min-h-10 items-center justify-center border border-[var(--foreground)] bg-white px-4 text-sm font-bold text-[var(--foreground)]"
          >
            Back to Workflow
          </Link>
          <button
            type="button"
            onClick={handleAction}
            className="inline-flex min-h-10 items-center justify-center border border-[var(--foreground)] bg-[var(--foreground)] px-4 text-sm font-bold text-white"
          >
            {isSaveMode ? "Save All to PDF" : "Print All Forms"}
          </button>
        </div>

        <DeliveryChecklistSheet
          workflow={workflow}
          consultant={consultant}
          notes={notes}
          onNoteChange={() => { }}
        />
        <div className="mt-6" />
        <SpaceSheet workflow={workflow} />
        <div className="mt-6" />
        <PayoffFormSheet workflow={workflow} />
        <div className="mt-6" />
        <AddressInformationSheet workflow={workflow} />
        <div className="mt-6" />
        <VinVerificationSheet workflow={workflow} consultant={consultant} />
      </div>
      {dialog}
    </>
  );
}
