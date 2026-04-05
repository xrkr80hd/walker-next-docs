"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useVinConfirmation } from "@/components/ui/use-vin-confirmation";
import {
  loadConsultant,
  loadDealer,
  type ConsultantInfo,
  type DealerInfo,
} from "@/lib/dealer-consultant";
import {
  CHECKLIST_ITEMS,
  clearWorkflowSession,
  DOCUMENT_LIBRARY,
  getLast8,
  loadWorkflow,
  normalizeVin,
  saveWorkflow,
  subscribeToWorkflowSessionClear,
  type WorkflowData
} from "@/lib/walker-workflow";

const CUSTOMER_FIELDS = [
  { name: "customerName", label: "Customer Name", type: "text", wide: false },
  { name: "coCustomerName", label: "Co-Customer Name", type: "text", wide: false },
  { name: "dealDate", label: "Date", type: "date", wide: false },
  { name: "email", label: "Email", type: "email", wide: false },
  { name: "cellPhone", label: "Cell Phone", type: "tel", wide: false },
] as const;

const DEAL_FIELDS = [
  { name: "dealNumber", label: "Deal #", type: "text", wide: false },
  { name: "stockNumber", label: "Stock #", type: "text", wide: false },
  { name: "customerSource", label: "Customer Source", type: "text", wide: false },
  { name: "fniEmail", label: "F&I Manager Email", type: "email", wide: false },
  { name: "vehicleYear", label: "Year", type: "text", wide: false },
  { name: "vehicleMake", label: "Make", type: "text", wide: false },
  { name: "vehicleModel", label: "Model", type: "text", wide: false },
  { name: "mileage", label: "Mileage", type: "text", wide: false },
  { name: "vin", label: "VIN", type: "text", wide: true },
] as const;

const US_STATES = [
  "", "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC",
];

type StatusTone = "" | "success" | "warn";
const WORKFLOW_VIEW_STATE_KEY = "walker.workflow.view.v1";

type WorkflowViewState = {
  openSections: Record<string, boolean>;
  returnPath?: string;
  scrollY: number;
};

function loadWorkflowViewState() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(WORKFLOW_VIEW_STATE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<WorkflowViewState>;
    const openSections =
      parsed.openSections && typeof parsed.openSections === "object"
        ? parsed.openSections
        : null;
    const scrollY =
      typeof parsed.scrollY === "number" && Number.isFinite(parsed.scrollY)
        ? parsed.scrollY
        : 0;

    if (!openSections) {
      return null;
    }

    return { openSections, scrollY };
  } catch {
    return null;
  }
}

function saveWorkflowViewState(state: WorkflowViewState) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(WORKFLOW_VIEW_STATE_KEY, JSON.stringify(state));
}

function clearWorkflowViewState() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(WORKFLOW_VIEW_STATE_KEY);
}

export function getWorkflowReturnPath(): string {
  if (typeof window === "undefined") return "/workflow";
  try {
    const raw = window.sessionStorage.getItem(WORKFLOW_VIEW_STATE_KEY);
    if (!raw) return "/workflow";
    const parsed = JSON.parse(raw) as Partial<WorkflowViewState>;
    return parsed.returnPath || "/workflow";
  } catch {
    return "/workflow";
  }
}

export function WorkflowScreen({ dealType = "used" }: { dealType?: "used" | "new" } = {}) {
  const isNewDeal = dealType === "new";
  const printAllPath = isNewDeal ? "/print/all-new" : "/print/all";
  const workflowPath = isNewDeal ? "/workflow/new" : "/workflow";
  const { confirmVinAction, dialog } = useVinConfirmation();
  const [data, setData] = useState<WorkflowData>(() => loadWorkflow());
  const [dealer] = useState<DealerInfo>(() => loadDealer());
  const [consultant] = useState<ConsultantInfo>(() => loadConsultant());
  const [mailingSameAsPhysical, setMailingSameAsPhysical] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const savedSections = loadWorkflowViewState()?.openSections ?? {};
    return {
      dealer: false,
      consultant: false,
      deal: false,
      documents: false,
      ...savedSections,
    };
  });
  const [status, setStatus] = useState("");
  const [tone, setTone] = useState<StatusTone>("");
  useEffect(() => {
    saveWorkflow(data);
  }, [data]);

  useEffect(() => {
    // Initialise mailing toggle based on saved data
    if (data.mailingAddress && data.mailingAddress !== data.homeAddress) {
      setMailingSameAsPhysical(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mailingSameAsPhysical) {
      patchWorkflow({
        mailingAddress: data.homeAddress,
        mailingCity: data.homeCity,
        mailingState: data.homeState,
        mailingZip: data.homeZip,
      });
    }
  }, [mailingSameAsPhysical, data.homeAddress, data.homeCity, data.homeState, data.homeZip]);

  useEffect(() => {
    return subscribeToWorkflowSessionClear(() => {
      setData(loadWorkflow());
      setStatus("Session cleared. Ready for a new deal.");
      setTone("success");
    });
  }, []);

  useEffect(() => {
    const saved = loadWorkflowViewState();
    if (!saved || saved.scrollY <= 0) {
      return;
    }

    // Retry scroll restore — accordion content may not be in the DOM on the first frame
    let attempts = 0;
    const maxAttempts = 10;
    const targetY = saved.scrollY;
    function tryScroll() {
      attempts++;
      window.scrollTo({ top: targetY, behavior: "auto" });
      if (Math.abs(window.scrollY - targetY) > 2 && attempts < maxAttempts) {
        window.requestAnimationFrame(tryScroll);
      }
    }
    window.requestAnimationFrame(tryScroll);
  }, []);

  useEffect(() => {
    saveWorkflowViewState({
      openSections,
      scrollY: typeof window === "undefined" ? 0 : window.scrollY,
    });
  }, [openSections]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let frameId: number | null = null;
    const onScroll = () => {
      if (frameId !== null) {
        return;
      }
      frameId = window.requestAnimationFrame(() => {
        saveWorkflowViewState({
          openSections,
          scrollY: window.scrollY,
        });
        frameId = null;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [openSections]);

  function setStatusMessage(message: string, nextTone: StatusTone = "") {
    setStatus(message);
    setTone(nextTone);
  }

  function persistWorkflowViewState() {
    saveWorkflowViewState({
      openSections,
      returnPath: workflowPath,
      scrollY: typeof window === "undefined" ? 0 : window.scrollY,
    });
  }

  function patchWorkflow(patch: Partial<WorkflowData>) {
    setData((current) => {
      const next = { ...current, ...patch };
      next.address = next.homeAddress;
      return next;
    });
  }

  function updateField(name: keyof WorkflowData, value: string | boolean) {
    if (name === "vin") {
      patchWorkflow({ vin: normalizeVin(String(value)) });
      return;
    }

    if (name === "deliveryEnabled") {
      patchWorkflow({ deliveryEnabled: Boolean(value) });
      return;
    }

    if (name === "hasCoOwner") {
      patchWorkflow({ hasCoOwner: Boolean(value) });
      return;
    }

    if (name === "payoffVerified") {
      const isVerified = Boolean(value);
      if (!isVerified) {
        patchWorkflow({ payoffVerified: false });
        return;
      }

      patchWorkflow({
        payoffVerified: true,
        salespersonName: consultant.name || data.salespersonName,
        salespersonNumber:
          consultant.salespersonNumber || data.salespersonNumber,
      });
      return;
    }

    patchWorkflow({ [name]: String(value) } as Partial<WorkflowData>);
  }

  function updateChecklist(
    key: keyof WorkflowData["deliveryChecklist"],
    checked: boolean,
  ) {
    setData((current) => ({
      ...current,
      deliveryChecklist: {
        ...current.deliveryChecklist,
        [key]: checked,
      },
    }));
  }

  function toggleSection(key: string) {
    setOpenSections((current) => ({ ...current, [key]: !current[key] }));
  }

  function saveNow() {
    const saved = saveWorkflow(data);
    setData(saved);
    setStatusMessage(
      "Saved.",
      "success",
    );
  }

  function clearSessionNow() {
    clearWorkflowSession();
    clearWorkflowViewState();
    setData(loadWorkflow());
    setOpenSections({ dealer: false, consultant: false, deal: false, documents: false });
    setStatusMessage(
      "Session cleared. Ready for a new deal.",
      "success",
    );
  }

  function validateForOutput() {
    if (!data.customerName) {
      setStatusMessage("Enter the customer name first.", "warn");
      return false;
    }

    if (!data.vin || data.vin.length !== 17) {
      setStatusMessage("Enter the full 17-character VIN first.", "warn");
      return false;
    }

    saveWorkflow(data);
    return true;
  }

  async function openPrintFlow() {
    if (!data.deliveryEnabled) {
      setStatusMessage(
        "Enable the Delivery Checklist first.",
        "warn",
      );
      return;
    }

    if (!validateForOutput()) {
      return;
    }

    if (!(await confirmVinAction(data.vin, "printing"))) {
      return;
    }

    persistWorkflowViewState();
    window.open("/print/delivery-checklist?autoprint=1&vinchecked=1", "_blank");
    setStatusMessage(
      "Print window opened.",
      "success",
    );
  }

  async function savePdf() {
    if (!data.deliveryEnabled) {
      setStatusMessage(
        "Enable the Delivery Checklist first.",
        "warn",
      );
      return;
    }

    if (!validateForOutput()) {
      return;
    }

    if (!(await confirmVinAction(data.vin, "saving to PDF"))) {
      return;
    }

    persistWorkflowViewState();
    window.open("/print/delivery-checklist?autoprint=1&vinchecked=1&mode=save", "_blank");
    setStatusMessage(
      "PDF downloading…",
      "success",
    );
  }

  async function printAll() {
    if (!validateForOutput()) {
      return;
    }

    if (!(await confirmVinAction(data.vin, "printing all forms"))) {
      return;
    }

    persistWorkflowViewState();
    window.open(`${printAllPath}?autoprint=1&vinchecked=1`, "_blank");
    setStatusMessage(
      "Print All window opened.",
      "success",
    );
  }

  async function saveAllPdf() {
    if (!validateForOutput()) {
      return;
    }

    if (!(await confirmVinAction(data.vin, "saving all forms to PDF"))) {
      return;
    }

    persistWorkflowViewState();
    window.open(`${printAllPath}?autoprint=1&vinchecked=1&mode=save`, "_blank");
    setStatusMessage(
      "PDF downloading…",
      "success",
    );
  }

  function printBlank() {
    window.open(`${printAllPath}?autoprint=1&vinchecked=1&blank=1`, "_blank");
    setStatusMessage("Blank forms print window opened.", "success");
  }

  function saveBlankPdf() {
    window.open(`${printAllPath}?autoprint=1&vinchecked=1&blank=1&mode=save`, "_blank");
    setStatusMessage("Blank PDF downloading…", "success");
  }

  return (
    <>
      <div className="grid gap-6">
        {/* ── Hero ── */}
        <section className="overflow-hidden border border-black/10 bg-[var(--panel)] bg-[url('/bg-hero-16x9.jpg')] bg-cover bg-center shadow-[0_24px_60px_rgba(35,23,12,0.12)] print:bg-none">
          <div className="grid gap-5 px-5 py-5 sm:px-6">
            <div className="text-center">
              <Image
                src="/walker-red-graphic-v2.png"
                alt="Walker Automotive graphic"
                width={320}
                height={116}
                priority
                className="mx-auto h-auto w-full max-w-[240px]"
              />
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.24em] text-white drop-shadow-sm print:text-[var(--accent)] print:drop-shadow-none">
                Walker Docs
              </p>
              <h2 className="mt-2 text-3xl font-extrabold leading-tight tracking-[0.01em] text-white drop-shadow-sm sm:text-4xl print:text-[var(--foreground)] print:drop-shadow-none">
                {isNewDeal ? "New Vehicle Workflow" : "Used Vehicle Workflow"}
              </h2>
              <p className="mt-2 text-sm font-bold text-white/90 print:text-[var(--foreground)]">
                Last 8: <span className="font-mono">{getLast8(data.vin) || "-"}</span>
              </p>
              <p className="mx-auto mt-3 max-w-3xl text-base leading-7 text-white/70 print:text-[var(--muted)]">
                Enter customer and vehicle information once, then generate all
                required documents from a single source.
              </p>

              <div className="mt-5 print:hidden">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.08em] text-white/70 transition hover:text-white"
                >
                  <span aria-hidden="true">&larr;</span>
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Current Deal (primary section) ── */}
        <section className="overflow-hidden border border-black/10 shadow-[0_18px_44px_rgba(35,23,12,0.08)]">
          <button
            type="button"
            onClick={() => toggleSection("deal")}
            className="flex w-full items-center justify-between bg-[var(--accent)] bg-[url('/bg-card-3x2.jpg')] bg-cover bg-center p-5 text-left sm:p-6 print:bg-none"
          >
            <div>
              <h3 className="text-2xl font-bold text-white">
                Current Deal
              </h3>
              <p className="mt-1 text-sm text-white/70">
                {data.customerName || "No customer yet"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-xl text-white/70 transition-transform ${openSections.deal ? "rotate-180" : ""}`}>▾</span>
            </div>
          </button>
          {openSections.deal && (
            <div className="border-t border-[var(--border)] bg-white px-5 pb-5 pt-4 sm:px-6 sm:pb-6">

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {CUSTOMER_FIELDS.map((field) => (
                  <label
                    key={field.name}
                    className={`grid gap-2 ${field.wide ? "md:col-span-2" : ""}`}
                  >
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                      {field.label}
                    </span>
                    <input
                      type={field.type}
                      value={String(data[field.name])}
                      onChange={(event) =>
                        updateField(field.name, event.currentTarget.value)
                      }
                      className="min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                    />
                  </label>
                ))}
              </div>

              {/* Home Address */}
              <div className="mt-4 grid gap-4">
                <label className="grid gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Street Address</span>
                  <input type="text" value={data.homeAddress} onChange={(e) => updateField("homeAddress", e.currentTarget.value)} className="min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                </label>
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="grid gap-2">
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">City</span>
                    <input type="text" value={data.homeCity} onChange={(e) => updateField("homeCity", e.currentTarget.value)} className="min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">State</span>
                    <select value={data.homeState} onChange={(e) => updateField("homeState", e.currentTarget.value)} className="min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]">
                      {US_STATES.map((s) => <option key={s} value={s}>{s || "Select"}</option>)}
                    </select>
                  </label>
                  <label className="grid gap-2">
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Zip</span>
                    <input type="text" value={data.homeZip} onChange={(e) => updateField("homeZip", e.currentTarget.value)} maxLength={10} className="min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                  </label>
                </div>
              </div>

              {/* Deal & Vehicle Fields */}
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {DEAL_FIELDS.map((field) => (
                  <label
                    key={field.name}
                    className={`grid gap-2 ${field.wide ? "md:col-span-2" : ""}`}
                  >
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                      {field.label}
                    </span>
                    <input
                      type={field.type}
                      value={String(data[field.name])}
                      onChange={(event) =>
                        updateField(field.name, event.currentTarget.value)
                      }
                      maxLength={field.name === "vin" ? 17 : undefined}
                      spellCheck={field.name === "vin" ? false : undefined}
                      autoCapitalize={field.name === "vin" ? "characters" : undefined}
                      className={`min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]${field.name === "vin" ? " uppercase" : ""}`}
                    />
                  </label>
                ))}
              </div>

              {/* Mailing Address */}
              <div className="mt-5 border-t border-[var(--border)] pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Mailing Address</span>
                  <button
                    type="button"
                    onClick={() => setMailingSameAsPhysical(!mailingSameAsPhysical)}
                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors ${mailingSameAsPhysical ? "bg-[var(--border)]" : "bg-[var(--accent)]"}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${mailingSameAsPhysical ? "translate-x-0.5" : "translate-x-[22px]"}`} />
                  </button>
                </div>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {mailingSameAsPhysical ? "Same as physical address" : "Enter a separate mailing address"}
                </p>
                <div className={`mt-3 grid gap-4 transition-opacity ${mailingSameAsPhysical ? "pointer-events-none opacity-40" : "opacity-100"}`}>
                  <label className="grid gap-2">
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Street Address</span>
                    <input type="text" value={mailingSameAsPhysical ? data.homeAddress : data.mailingAddress} onChange={(e) => updateField("mailingAddress", e.currentTarget.value)} disabled={mailingSameAsPhysical} className="min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] disabled:bg-[var(--panel)] disabled:text-[var(--muted)]" />
                  </label>
                  <div className="grid gap-4 md:grid-cols-3">
                    <label className="grid gap-2">
                      <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">City</span>
                      <input type="text" value={mailingSameAsPhysical ? data.homeCity : data.mailingCity} onChange={(e) => updateField("mailingCity", e.currentTarget.value)} disabled={mailingSameAsPhysical} className="min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] disabled:bg-[var(--panel)] disabled:text-[var(--muted)]" />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">State</span>
                      <select value={mailingSameAsPhysical ? data.homeState : data.mailingState} onChange={(e) => updateField("mailingState", e.currentTarget.value)} disabled={mailingSameAsPhysical} className="min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] disabled:bg-[var(--panel)] disabled:text-[var(--muted)]">
                        {US_STATES.map((s) => <option key={s} value={s}>{s || "Select"}</option>)}
                      </select>
                    </label>
                    <label className="grid gap-2">
                      <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Zip</span>
                      <input type="text" value={mailingSameAsPhysical ? data.homeZip : data.mailingZip} onChange={(e) => updateField("mailingZip", e.currentTarget.value)} disabled={mailingSameAsPhysical} maxLength={10} className="min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] disabled:bg-[var(--panel)] disabled:text-[var(--muted)]" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 border-t border-[var(--border)] pt-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => updateField("deliveryEnabled", !data.deliveryEnabled)}
                  className={`flex min-h-12 items-center gap-3 border px-4 text-sm font-bold transition ${data.deliveryEnabled ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]" : "border-[var(--border)] bg-white text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--foreground)]"}`}
                >
                  <span className={`flex h-5 w-5 items-center justify-center border text-xs ${data.deliveryEnabled ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[var(--border)] bg-white"}`}>
                    {data.deliveryEnabled ? "✓" : ""}
                  </span>
                  Prepare Delivery Checklist for F&amp;I
                </button>
                <button
                  type="button"
                  onClick={() => updateField("hasCoOwner", !data.hasCoOwner)}
                  className={`flex min-h-12 items-center gap-3 border px-4 text-sm font-bold transition ${data.hasCoOwner ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]" : "border-[var(--border)] bg-white text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--foreground)]"}`}
                >
                  <span className={`flex h-5 w-5 items-center justify-center border text-xs ${data.hasCoOwner ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[var(--border)] bg-white"}`}>
                    {data.hasCoOwner ? "✓" : ""}
                  </span>
                  Co-owner on this deal
                </button>
              </div>

              {data.deliveryEnabled ? (
                <section className="mt-5 border border-[var(--border)] bg-[var(--panel)] p-4">
                  <h4 className="text-lg font-bold text-[var(--foreground)]">
                    Delivery Checklist Items
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Check items for this deal. These carry over to the printed
                    checklist.
                  </p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {CHECKLIST_ITEMS.map((item) => (
                      <div
                        key={item.key}
                        className="inline-flex items-center gap-3"
                      >
                        <label className="inline-flex items-center gap-3 text-sm font-semibold text-[var(--foreground)]">
                          <input
                            type="checkbox"
                            checked={data.deliveryChecklist[item.key]}
                            onChange={(event) =>
                              updateChecklist(item.key, event.currentTarget.checked)
                            }
                            className="h-5 w-5 accent-[var(--accent)]"
                          />
                          {item.label}
                        </label>
                        {item.key === "miles" && (
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="Enter mileage"
                            value={data.mileage}
                            onChange={(event) =>
                              updateField("mileage", event.currentTarget.value)
                            }
                            className="ml-1 h-8 w-32 border border-[var(--border)] bg-white px-2 text-sm text-[var(--foreground)]"
                          />
                        )}
                        {item.key === "etchNumbers" && (
                          <input
                            type="text"
                            placeholder="Enter etch #"
                            value={data.etchNumbers}
                            onChange={(event) =>
                              updateField("etchNumbers", event.currentTarget.value)
                            }
                            className="ml-1 h-8 w-32 border border-[var(--border)] bg-white px-2 text-sm text-[var(--foreground)]"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-6">
                    <div className="inline-flex items-center gap-3">
                      <span className="text-sm font-semibold text-[var(--foreground)]">
                        Tax %
                      </span>
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="e.g. 6.25"
                        value={data.taxPercent}
                        onChange={(event) =>
                          updateField("taxPercent", event.currentTarget.value)
                        }
                        className="h-8 w-28 border border-[var(--border)] bg-white px-2 text-sm text-[var(--foreground)]"
                      />
                    </div>
                    <label className="inline-flex items-center gap-3 text-sm font-semibold text-[var(--foreground)]">
                      <input
                        type="checkbox"
                        checked={data.payoffVerified}
                        onChange={(event) =>
                          updateField("payoffVerified", event.currentTarget.checked)
                        }
                        className="h-5 w-5 accent-[var(--accent)]"
                      />
                      Payoff Verified
                    </label>
                  </div>
                </section>
              ) : null}

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={saveNow}
                  className="inline-flex min-h-12 items-center justify-center border border-[var(--foreground)] bg-white px-5 text-sm font-bold uppercase tracking-[0.08em] text-[var(--foreground)]"
                >
                  Save Session
                </button>
                <button
                  type="button"
                  onClick={clearSessionNow}
                  className="inline-flex min-h-12 items-center justify-center border border-[var(--foreground)] bg-white px-5 text-sm font-bold uppercase tracking-[0.08em] text-[var(--foreground)]"
                >
                  New Deal
                </button>
              </div>

              <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                Deal data is stored in the current browser session only.
              </p>
            </div>
          )}
        </section>

        {/* ── Status Message (always visible) ── */}
        {status && (
          <div
            className={`flex items-center gap-3 border px-5 py-3 text-sm font-bold ${tone === "success"
              ? "border-[var(--success)] bg-[var(--success)]/10 text-[var(--success)]"
              : tone === "warn"
                ? "border-[var(--warn)] bg-[var(--warn)]/10 text-[var(--warn)]"
                : "border-[var(--border)] bg-[var(--panel)] text-[var(--muted)]"
              }`}
          >
            <span className="text-lg">{tone === "warn" ? "⚠" : tone === "success" ? "✓" : "ℹ"}</span>
            {status}
          </div>
        )}

        {/* ── Available Documents ── */}
        <section className="overflow-hidden border border-black/10 shadow-[0_18px_44px_rgba(35,23,12,0.08)]">
          <button
            type="button"
            onClick={() => toggleSection("documents")}
            className="flex w-full items-center justify-between bg-[var(--accent)] bg-[url('/bg-card-3x2.jpg')] bg-cover bg-center p-5 text-left sm:p-6 print:bg-none"
          >
            <div>
              <h3 className="text-2xl font-bold text-white">
                Available Documents
              </h3>
              <p className="mt-1 text-sm text-white/70">
                {isNewDeal ? "New vehicle documents" : "Used vehicle documents"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-xl text-white/70 transition-transform ${openSections.documents ? "rotate-180" : ""}`}>▾</span>
            </div>
          </button>
          {openSections.documents && (
            <div className="border-t border-[var(--border)] bg-white px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={printAll}
                  className="inline-flex min-h-12 items-center justify-center border border-[var(--accent)] bg-[var(--accent)] px-5 text-sm font-bold uppercase tracking-[0.08em] text-white"
                >
                  Print All
                </button>
                <button
                  type="button"
                  onClick={saveAllPdf}
                  className="inline-flex min-h-12 items-center justify-center border border-[var(--accent)] bg-[var(--accent)] px-5 text-sm font-bold uppercase tracking-[0.08em] text-white"
                >
                  Save All to PDF
                </button>
                <button
                  type="button"
                  onClick={printBlank}
                  className="inline-flex min-h-12 items-center justify-center border border-[var(--foreground)] bg-white px-5 text-sm font-bold uppercase tracking-[0.08em] text-[var(--foreground)]"
                >
                  Print Blank
                </button>
                <button
                  type="button"
                  onClick={saveBlankPdf}
                  className="inline-flex min-h-12 items-center justify-center border border-[var(--foreground)] bg-white px-5 text-sm font-bold uppercase tracking-[0.08em] text-[var(--foreground)]"
                >
                  Save Blank to PDF
                </button>
              </div>
              <div className="mt-4 grid gap-3">
                {DOCUMENT_LIBRARY.filter((doc) => !isNewDeal || doc.slug !== "buyers-guide").map((doc) => (
                  <div
                    key={doc.slug}
                    className="flex flex-wrap items-center justify-between gap-3 border border-[var(--border)] bg-[var(--panel)] px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-bold text-[var(--foreground)]">
                        {doc.title}
                      </p>
                      <p className="text-sm text-[var(--muted)]">{doc.description}</p>
                    </div>
                    {doc.ready ? (
                      <Link
                        href={doc.href}
                        onClick={persistWorkflowViewState}
                        className="inline-flex min-h-10 items-center justify-center border border-[var(--accent)] bg-[var(--accent)] px-4 text-xs font-bold uppercase tracking-[0.08em] text-white"
                      >
                        Open
                      </Link>
                    ) : (
                      <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                        Queued
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {dialog}
    </>
  );
}
