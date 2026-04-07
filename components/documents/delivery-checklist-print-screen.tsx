"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { DeliveryChecklistSheet } from "@/components/documents/delivery-checklist-sheet";
import { loadConsultant, type ConsultantInfo } from "@/lib/dealer-consultant";
import {
  loadDeliveryChecklistNotes,
  loadWorkflow,
  subscribeToWorkflowSessionClear,
  type DeliveryChecklistNotes,
  type WorkflowData,
} from "@/lib/walker-workflow";

export function DeliveryChecklistPrintScreen() {
  const searchParams = useSearchParams();
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

  useEffect(() => {
    if (printedRef.current || searchParams.get("autoprint") !== "1") {
      return;
    }

    printedRef.current = true;
    const timeout = window.setTimeout(() => {
      window.print();
    }, 260);

    return () => window.clearTimeout(timeout);
  }, [searchParams]);

  function handleAction() {
    window.print();
  }

  return (
    <>
      <div className="mx-auto flex min-h-screen w-full max-w-[8.5in] flex-col px-4 py-4 print:min-h-0 print:px-0 print:py-0 sm:px-0">
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

    </>
  );
}
