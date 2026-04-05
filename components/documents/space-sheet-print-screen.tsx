"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { SpaceSheet } from "@/components/documents/space-sheet-sheet";
import {
  loadWorkflow,
  subscribeToWorkflowSessionClear,
  type WorkflowData,
} from "@/lib/walker-workflow";

export function SpaceSheetPrintScreen() {
  const searchParams = useSearchParams();
  const [workflow, setWorkflow] = useState<WorkflowData>(() => loadWorkflow());
  const printedRef = useRef(false);

  useEffect(() => {
    return subscribeToWorkflowSessionClear(() => setWorkflow(loadWorkflow()));
  }, []);

  useEffect(() => {
    if (printedRef.current || searchParams.get("autoprint") !== "1") return;
    printedRef.current = true;
    const timeout = window.setTimeout(() => {
      window.print();
    }, 260);
    return () => window.clearTimeout(timeout);
  }, [searchParams]);

  function handlePrint() {
    window.print();
  }

  return (
    <>
      <div className="mx-auto flex min-h-screen w-full max-w-[8.5in] flex-col px-4 py-4 print:min-h-0 print:px-0 print:py-0 sm:px-0">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border border-white/10 bg-[#2a2a2e] px-4 py-3 shadow-[0_14px_40px_rgba(0,0,0,0.2)] print:hidden">
          <Link href="/documents/pain-points" className="inline-flex min-h-10 items-center justify-center border border-white/20 bg-white/10 px-4 text-sm font-bold text-white transition hover:bg-white/20">
            Back to SPACED
          </Link>
          <button type="button" onClick={handlePrint} className="inline-flex min-h-10 items-center justify-center border border-white/20 bg-[var(--accent)] px-4 text-sm font-bold text-white transition hover:bg-[var(--accent-strong)]">
            Print Form
          </button>
        </div>
        <SpaceSheet workflow={workflow} />
      </div>
    </>
  );
}
