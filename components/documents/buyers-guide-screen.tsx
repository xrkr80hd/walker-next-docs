"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { BuyersGuideReverseSheet } from "@/components/documents/buyers-guide-reverse-sheet";
import { BuyersGuideSheet } from "@/components/documents/buyers-guide-sheet";
import { DocToolbar } from "@/components/documents/doc-toolbar";
import { useVinConfirmation } from "@/components/ui/use-vin-confirmation";
import {
  loadConsultant,
  loadDealer,
  type ConsultantInfo,
  type DealerInfo,
} from "@/lib/dealer-consultant";
import {
  loadWorkflow,
  subscribeToWorkflowSessionClear,
  type WorkflowData,
} from "@/lib/walker-workflow";

const PAGE_W = 816;

export function BuyersGuideScreen() {
  const { confirmVinAction, dialog } = useVinConfirmation();
  const [workflow, setWorkflow] = useState<WorkflowData>(() => loadWorkflow());
  const [dealer] = useState<DealerInfo>(() => loadDealer());
  const [consultant] = useState<ConsultantInfo>(() => loadConsultant());
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageScale, setPageScale] = useState(1);

  useLayoutEffect(() => {
    const el = containerRef.current;
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
    });
  }, []);

  async function openPrintSurface() {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    const latest = loadWorkflow();
    if (!(await confirmVinAction(latest.vin, "printing"))) return;
    window.open("/print/buyers-guide?autoprint=1&vinchecked=1", "_blank");
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-[8.5in] flex-col">
        <DocToolbar vin={workflow.vin} mileage={workflow.mileage} saved={false} onSave={() => { }} onPrint={openPrintSurface} />

        <div ref={containerRef}>
          <div
            style={
              pageScale < 1
                ? { zoom: pageScale }
                : undefined
            }
          >
            <BuyersGuideSheet workflow={workflow} />
          </div>

          <div className="mt-6" />

          <div
            style={
              pageScale < 1
                ? { zoom: pageScale }
                : undefined
            }
          >
            <BuyersGuideReverseSheet workflow={workflow} dealer={dealer} consultant={consultant} />
          </div>
        </div>
      </div>
      {dialog}
    </>
  );
}
