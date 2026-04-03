"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { PayoffFormSheet } from "@/components/documents/payoff-form-sheet";
import { useVinConfirmation } from "@/components/ui/use-vin-confirmation";
import { printElementExact } from "@/lib/exact-print";
import {
  loadWorkflow,
  subscribeToWorkflowSessionClear,
  type WorkflowData,
} from "@/lib/walker-workflow";

export function PayoffFormPrintScreen() {
  const searchParams = useSearchParams();
  const { confirmVinAction, dialog } = useVinConfirmation();
  const [workflow, setWorkflow] = useState<WorkflowData>(() => loadWorkflow());
  const printedRef = useRef(false);

  useEffect(() => {
    return subscribeToWorkflowSessionClear(() => setWorkflow(loadWorkflow()));
  }, []);

  useEffect(() => {
    if (printedRef.current || searchParams.get("autoprint") !== "1") return;
    printedRef.current = true;
    const timeout = window.setTimeout(async () => {
      const vinChecked = searchParams.get("vinchecked") === "1";
      const proceed = vinChecked ? true : await confirmVinAction(workflow.vin, "printing");
      if (!proceed) return;
      const target = document.querySelector('[data-print-sheet="payoff-form"]');
      if (target instanceof HTMLElement) await printElementExact(target);
    }, 260);
    return () => window.clearTimeout(timeout);
  }, [confirmVinAction, searchParams, workflow]);

  async function handlePrint() {
    if (!(await confirmVinAction(workflow.vin, "printing"))) return;
    const target = document.querySelector('[data-print-sheet="payoff-form"]');
    if (target instanceof HTMLElement) await printElementExact(target);
  }

  return (
    <>
      <div className="mx-auto flex min-h-screen w-full max-w-[8.5in] flex-col px-4 py-4 sm:px-0">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border border-black/10 bg-white/90 px-4 py-3 shadow-[0_14px_40px_rgba(0,0,0,0.08)] print:hidden">
          <Link href="/documents/payoff-form" className="inline-flex min-h-10 items-center justify-center border border-[var(--foreground)] bg-white px-4 text-sm font-bold text-[var(--foreground)]">
            Back to Document
          </Link>
          <button type="button" onClick={handlePrint} className="inline-flex min-h-10 items-center justify-center border border-[var(--foreground)] bg-[var(--foreground)] px-4 text-sm font-bold text-white">
            Print Form
          </button>
        </div>
        <PayoffFormSheet workflow={workflow} />
      </div>
      {dialog}
    </>
  );
}
