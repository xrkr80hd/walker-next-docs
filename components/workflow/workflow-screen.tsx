"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { useVinConfirmation } from "@/components/ui/use-vin-confirmation";
import {
  createDefaultConsultant,
  createDefaultDealer,
  loadConsultant,
  loadDealer,
  saveConsultant,
  saveDealer,
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
  type WorkflowData,
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

export function WorkflowScreen() {
  const { confirmVinAction, dialog } = useVinConfirmation();
  const [data, setData] = useState<WorkflowData>(() => loadWorkflow());
  const [dealer, setDealer] = useState<DealerInfo>(() => loadDealer());
  const [consultant, setConsultant] = useState<ConsultantInfo>(() =>
    loadConsultant(),
  );
  const [mailingSameAsPhysical, setMailingSameAsPhysical] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const savedSections = loadWorkflowViewState()?.openSections ?? {};
    return {
      dealer: false,
      consultant: false,
      deal: false,
      ...savedSections,
    };
  });
  const [status, setStatus] = useState("");
  const [tone, setTone] = useState<StatusTone>("");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  useEffect(() => {
    saveWorkflow(data);
  }, [data]);

  useEffect(() => {
    saveDealer(dealer);
  }, [dealer]);

  useEffect(() => {
    saveConsultant(consultant);
  }, [consultant]);

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

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: saved.scrollY, behavior: "auto" });
    });
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

  function updateDealer(field: keyof DealerInfo, value: string) {
    setDealer((current) => ({ ...current, [field]: value }));
  }

  function updateConsultant(field: keyof ConsultantInfo, value: string) {
    setConsultant((current) => ({ ...current, [field]: value }));
  }

  function toggleSection(key: string) {
    setOpenSections((current) => ({ ...current, [key]: !current[key] }));
  }

  function saveDealerNow() {
    saveDealer(dealer);
    setStatusMessage("Dealership saved.", "success");
  }

  function clearDealerNow() {
    const blank = createDefaultDealer();
    setDealer(blank);
    saveDealer(blank);
    setStatusMessage("Dealership cleared.", "success");
  }

  function deleteDealerNow() {
    const blank = createDefaultDealer();
    setDealer(blank);
    if (typeof window !== "undefined") localStorage.removeItem("walker.dealer.v1");
    setStatusMessage("Dealership deleted.", "success");
  }

  function saveConsultantNow() {
    saveConsultant(consultant);
    setStatusMessage("Salesperson saved.", "success");
  }

  function clearConsultantNow() {
    const blank = createDefaultConsultant();
    setConsultant(blank);
    saveConsultant(blank);
    setStatusMessage("Salesperson cleared.", "success");
  }

  function deleteConsultantNow() {
    const blank = createDefaultConsultant();
    setConsultant(blank);
    if (typeof window !== "undefined") localStorage.removeItem("walker.consultant.v1");
    setStatusMessage("Salesperson deleted.", "success");
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
    setOpenSections({ dealer: false, consultant: false, deal: false });
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
    window.open("/print/all?autoprint=1&vinchecked=1", "_blank");
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
    window.open("/print/all?autoprint=1&vinchecked=1&mode=save", "_blank");
    setStatusMessage(
      "PDF downloading…",
      "success",
    );
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
                Deal Workflow
              </h2>
              <p className="mt-2 text-sm font-bold text-white/90 print:text-[var(--foreground)]">
                Last 8: <span className="font-mono">{getLast8(data.vin) || "-"}</span>
              </p>
              <p className="mx-auto mt-3 max-w-3xl text-base leading-7 text-white/70 print:text-[var(--muted)]">
                Enter customer and vehicle information once, then generate all
                required documents from a single source.
              </p>
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="mx-auto mt-4 inline-flex items-center gap-2 border border-white/30 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm transition hover:border-white/60 hover:bg-white/20 print:border-[var(--border)] print:bg-white print:text-[var(--foreground)] print:backdrop-blur-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.992 6.992 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
                </svg>
                Settings
              </button>
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
              <div className="mt-4 grid gap-3 md:col-span-2">
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Mailing address is the same as the physical address
                </p>
                <div className="flex items-center gap-6">
                  <label className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                    <input
                      type="checkbox"
                      checked={mailingSameAsPhysical}
                      onChange={() => setMailingSameAsPhysical(true)}
                      className="h-5 w-5 accent-[var(--accent)]"
                    />
                    Yes
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                    <input
                      type="checkbox"
                      checked={!mailingSameAsPhysical}
                      onChange={() => setMailingSameAsPhysical(false)}
                      className="h-5 w-5 accent-[var(--accent)]"
                    />
                    No
                  </label>
                </div>
                {!mailingSameAsPhysical && (
                  <div className="grid gap-4 border border-[var(--border)] bg-white p-4">
                    <label className="grid gap-2">
                      <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Street Address</span>
                      <input type="text" value={data.mailingAddress} onChange={(e) => updateField("mailingAddress", e.currentTarget.value)} className="min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                    </label>
                    <div className="grid gap-4 md:grid-cols-3">
                      <label className="grid gap-2">
                        <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">City</span>
                        <input type="text" value={data.mailingCity} onChange={(e) => updateField("mailingCity", e.currentTarget.value)} className="min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                      </label>
                      <label className="grid gap-2">
                        <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">State</span>
                        <select value={data.mailingState} onChange={(e) => updateField("mailingState", e.currentTarget.value)} className="min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]">
                          {US_STATES.map((s) => <option key={s} value={s}>{s || "Select"}</option>)}
                        </select>
                      </label>
                      <label className="grid gap-2">
                        <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Zip</span>
                        <input type="text" value={data.mailingZip} onChange={(e) => updateField("mailingZip", e.currentTarget.value)} maxLength={10} className="min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-4 border-t border-[var(--border)] pt-4">
                <label className="inline-flex items-center gap-3 text-sm font-semibold text-[var(--foreground)]">
                  <input
                    type="checkbox"
                    checked={data.deliveryEnabled}
                    onChange={(event) =>
                      updateField("deliveryEnabled", event.currentTarget.checked)
                    }
                    className="h-5 w-5 accent-[var(--accent)]"
                  />
                  Prepare Delivery Checklist for F&amp;I
                </label>
                <label className="inline-flex items-center gap-3 text-sm font-semibold text-[var(--foreground)]">
                  <input
                    type="checkbox"
                    checked={data.hasCoOwner}
                    onChange={(event) =>
                      updateField("hasCoOwner", event.currentTarget.checked)
                    }
                    className="h-5 w-5 accent-[var(--accent)]"
                  />
                  Is there a co-owner?
                </label>
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
                <button
                  type="button"
                  onClick={openPrintFlow}
                  className="inline-flex min-h-12 items-center justify-center border border-[var(--accent)] bg-[var(--accent)] px-5 text-sm font-bold uppercase tracking-[0.08em] text-white"
                >
                  Print
                </button>
                <button
                  type="button"
                  onClick={savePdf}
                  className="inline-flex min-h-12 items-center justify-center border border-[var(--accent)] bg-[var(--accent)] px-5 text-sm font-bold uppercase tracking-[0.08em] text-white"
                >
                  Save to PDF
                </button>
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
              </div>

              <p
                className={`mt-4 min-h-6 text-sm font-bold ${tone === "success"
                  ? "text-[var(--success)]"
                  : tone === "warn"
                    ? "text-[var(--warn)]"
                    : "text-[var(--muted)]"
                  }`}
              >
                {status}
              </p>

              {/* Available Documents */}
              <div className="mt-5 border-t border-[var(--border)] pt-5">
                <h4 className="text-lg font-bold text-[var(--foreground)]">
                  Available Documents
                </h4>
                <div className="mt-3 grid gap-3">
                  {DOCUMENT_LIBRARY.map((doc) => (
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

              <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                Deal data is stored in the current browser session only.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* ── Settings Drawer (Dealership + Salesperson) ── */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeSettings}
            onKeyDown={(e) => { if (e.key === "Escape") closeSettings(); }}
            role="button"
            tabIndex={-1}
            aria-label="Close settings"
          />
          {/* Drawer panel */}
          <aside className="relative z-10 flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl sm:max-w-lg">
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--accent)] bg-[url('/bg-drawer-9x16.jpg')] bg-cover bg-top px-5 py-4 print:bg-none">
              <h2 className="text-xl font-bold text-white">Settings</h2>
              <button
                type="button"
                onClick={closeSettings}
                className="inline-flex h-8 w-8 items-center justify-center text-white/80 transition hover:text-white"
                aria-label="Close settings"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            </div>

            <div className="grid gap-6 p-5 sm:p-6">
              {/* ── Dealership ── */}
              <section>
                <button
                  type="button"
                  onClick={() => toggleSection("dealer")}
                  className="flex w-full items-center justify-between pb-3 text-left"
                >
                  <div>
                    <h3 className="text-lg font-bold text-[var(--foreground)]">Dealership</h3>
                    <p className="text-sm text-[var(--muted)]">{dealer.dealershipName || "Not set"}</p>
                  </div>
                  <span className={`text-lg text-[var(--muted)] transition-transform ${openSections.dealer ? "rotate-180" : ""}`}>▾</span>
                </button>
                {openSections.dealer && (
                  <div className="border-t border-[var(--border)] pt-4">
                    <p className="mb-4 text-sm leading-6 text-[var(--muted)]">
                      Saved to this device. Shared across all deals.
                    </p>
                    <div className="grid gap-4">
                      <label className="grid gap-2">
                        <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Dealership Name</span>
                        <input type="text" value={dealer.dealershipName} onChange={(e) => updateDealer("dealershipName", e.currentTarget.value)} className="min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                      </label>
                      <label className="grid gap-2">
                        <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Street Address</span>
                        <input type="text" value={dealer.street} onChange={(e) => updateDealer("street", e.currentTarget.value)} className="min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        <label className="grid gap-2">
                          <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">City</span>
                          <input type="text" value={dealer.city} onChange={(e) => updateDealer("city", e.currentTarget.value)} className="min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                        </label>
                        <label className="grid gap-2">
                          <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">State</span>
                          <input type="text" value={dealer.state} onChange={(e) => updateDealer("state", e.currentTarget.value)} className="min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                        </label>
                        <label className="grid gap-2">
                          <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">ZIP</span>
                          <input type="text" value={dealer.zip} onChange={(e) => updateDealer("zip", e.currentTarget.value)} className="min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                        </label>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button type="button" onClick={saveDealerNow} className="inline-flex min-h-10 items-center justify-center border border-[var(--accent)] bg-[var(--accent)] px-4 text-xs font-bold uppercase tracking-[0.08em] text-white">Save</button>
                      <button type="button" onClick={clearDealerNow} className="inline-flex min-h-10 items-center justify-center border border-[var(--foreground)] bg-white px-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--foreground)]">Clear</button>
                      <button type="button" onClick={deleteDealerNow} className="inline-flex min-h-10 items-center justify-center border border-[var(--accent)] bg-white px-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--accent)]">Delete</button>
                    </div>
                  </div>
                )}
              </section>

              {/* ── Salesperson ── */}
              <section>
                <button
                  type="button"
                  onClick={() => toggleSection("consultant")}
                  className="flex w-full items-center justify-between pb-3 text-left"
                >
                  <div>
                    <h3 className="text-lg font-bold text-[var(--foreground)]">Salesperson</h3>
                    <p className="text-sm text-[var(--muted)]">{consultant.name || "Not set"}</p>
                  </div>
                  <span className={`text-lg text-[var(--muted)] transition-transform ${openSections.consultant ? "rotate-180" : ""}`}>▾</span>
                </button>
                {openSections.consultant && (
                  <div className="border-t border-[var(--border)] pt-4">
                    <p className="mb-4 text-sm leading-6 text-[var(--muted)]">
                      Saved to this device. Populates salesperson fields on documents.
                    </p>
                    <div className="grid gap-4">
                      <label className="grid gap-2">
                        <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Name</span>
                        <input type="text" value={consultant.name} onChange={(e) => updateConsultant("name", e.currentTarget.value)} className="min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                      </label>
                      <label className="grid gap-2">
                        <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Salesperson #</span>
                        <input type="text" value={consultant.salespersonNumber} onChange={(e) => updateConsultant("salespersonNumber", e.currentTarget.value)} className="min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                      </label>
                      <label className="grid gap-2">
                        <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Phone Number</span>
                        <input type="tel" value={consultant.phone} onChange={(e) => updateConsultant("phone", e.currentTarget.value)} className="min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                      </label>
                      <label className="grid gap-2">
                        <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Email</span>
                        <input type="email" value={consultant.email} onChange={(e) => updateConsultant("email", e.currentTarget.value)} className="min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]" />
                      </label>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button type="button" onClick={saveConsultantNow} className="inline-flex min-h-10 items-center justify-center border border-[var(--accent)] bg-[var(--accent)] px-4 text-xs font-bold uppercase tracking-[0.08em] text-white">Save</button>
                      <button type="button" onClick={clearConsultantNow} className="inline-flex min-h-10 items-center justify-center border border-[var(--foreground)] bg-white px-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--foreground)]">Clear</button>
                      <button type="button" onClick={deleteConsultantNow} className="inline-flex min-h-10 items-center justify-center border border-[var(--accent)] bg-white px-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--accent)]">Delete</button>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </aside>
        </div>
      )}

      {dialog}
    </>
  );
}
