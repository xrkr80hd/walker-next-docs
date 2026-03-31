"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useVinConfirmation } from "@/components/ui/use-vin-confirmation";
import {
  CHECKLIST_ITEMS,
  createEmailDraft,
  DOCUMENT_LIBRARY,
  getLast8,
  loadWorkflow,
  normalizeVin,
  openMailDraft,
  saveWorkflow,
  type WorkflowData,
} from "@/lib/walker-workflow";

const FIELD_DEFS = [
  { name: "customerName", label: "Customer Name", type: "text", wide: false },
  { name: "coCustomerName", label: "Co-Customer Name", type: "text", wide: false },
  { name: "dealDate", label: "Date", type: "date", wide: false },
  { name: "email", label: "Email", type: "email", wide: false },
  { name: "cellPhone", label: "Cell Phone", type: "tel", wide: false },
  {
    name: "homeAddressCategory",
    label: "Home Address Category",
    type: "select",
    options: ["Home Address", "Residence", "Primary Address"],
    wide: false,
  },
  {
    name: "mailingAddressCategory",
    label: "Mailing Address Category",
    type: "select",
    options: ["Mailing Address", "Billing Address", "PO Box"],
    wide: false,
  },
  { name: "homeAddress", label: "Home Address", type: "textarea", wide: true },
  {
    name: "mailingAddress",
    label: "Mailing Address",
    type: "textarea",
    wide: true,
  },
  { name: "salespersonName", label: "Salesperson", type: "text", wide: false },
  {
    name: "salespersonNumber",
    label: "Salesperson #",
    type: "text",
    wide: false,
  },
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

type StatusTone = "" | "success" | "warn";

export function WorkflowScreen() {
  const router = useRouter();
  const { confirmVinAction, dialog } = useVinConfirmation();
  const [data, setData] = useState<WorkflowData>(() => loadWorkflow());
  const [status, setStatus] = useState("");
  const [tone, setTone] = useState<StatusTone>("");

  useEffect(() => {
    saveWorkflow(data);
  }, [data]);

  useEffect(() => {
    const handleStorage = () => {
      setData(loadWorkflow());
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  function setStatusMessage(message: string, nextTone: StatusTone = "") {
    setStatus(message);
    setTone(nextTone);
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

    patchWorkflow({ [name]: String(value) } as Partial<WorkflowData>);
  }

  function updateChecklist(key: keyof WorkflowData["deliveryChecklist"], checked: boolean) {
    setData((current) => ({
      ...current,
      deliveryChecklist: {
        ...current.deliveryChecklist,
        [key]: checked,
      },
    }));
  }

  function saveNow() {
    const saved = saveWorkflow(data);
    setData(saved);
    setStatusMessage("Saved in this browser for this site.", "success");
  }

  function validateForOutput() {
    if (!data.customerName) {
      setStatusMessage("Enter the customer name before output.", "warn");
      return false;
    }

    if (!data.vin || data.vin.length !== 17) {
      setStatusMessage("Enter the full 17-character VIN before output.", "warn");
      return false;
    }

    saveWorkflow(data);
    return true;
  }

  async function openPrintFlow() {
    if (!data.deliveryEnabled) {
      setStatusMessage(
        "Turn on Delivery Checklist for F&I before printing that workflow.",
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

    window.open(
      "/print/delivery-checklist?autoprint=1&vinchecked=1",
      "_blank",
      "noopener,noreferrer",
    );
    setStatusMessage("Opening Delivery Checklist for exact print.", "success");
  }

  async function emailFni() {
    if (!data.deliveryEnabled) {
      setStatusMessage(
        "Turn on Delivery Checklist for F&I before drafting that email.",
        "warn",
      );
      return;
    }

    if (!validateForOutput()) {
      return;
    }

    if (!(await confirmVinAction(data.vin, "emailing"))) {
      return;
    }

    openMailDraft(createEmailDraft(data));
    setStatusMessage(
      "Email draft opened. Attach the printed PDF manually before sending.",
      "success",
    );
  }

  function openChecklist() {
    saveWorkflow(data);
    router.push("/documents/delivery-checklist");
  }

  return (
    <>
      <div className="grid gap-6">
        <section className="overflow-hidden border border-black/10 bg-[var(--panel)] shadow-[0_24px_60px_rgba(35,23,12,0.12)]">
          <div className="grid gap-5 px-5 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">
                Intake First
              </p>
              <h2 className="mt-2 text-3xl font-extrabold leading-tight tracking-[0.01em] text-[var(--foreground)] sm:text-4xl">
                Enter once. Reuse across the docs.
              </h2>
              <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted)]">
                This is the first Next.js pass for Walker Docs. It keeps the
                local browser workflow, preserves the VIN gate, and drives the
                Delivery Checklist into an isolated print surface for tablet and
                phone use.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="border border-[var(--border)] bg-[var(--panel-strong)] px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Local-first
                </span>
                <span className="border border-[var(--border)] bg-[var(--panel-strong)] px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Exact print pilot
                </span>
                <span className="border border-[var(--border)] bg-[var(--panel-strong)] px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Delivery Checklist first
                </span>
              </div>
            </div>

            <div className="flex justify-start lg:justify-end">
              <Image
                src="/walker-red-graphic.png"
                alt="Walker Automotive graphic"
                width={320}
                height={116}
                priority
                className="h-auto w-full max-w-[240px]"
              />
            </div>
          </div>
        </section>

        <section className="border border-black/10 bg-[var(--panel-strong)] p-5 shadow-[0_18px_44px_rgba(35,23,12,0.08)] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
                Customer Information
              </p>
              <h3 className="mt-1 text-2xl font-bold text-[var(--foreground)]">
                Shared deal record
              </h3>
            </div>
            <div className="border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)]">
              Last 8 Preview:{" "}
              <span className="font-mono text-[var(--accent)]">
                {getLast8(data.vin) || "-"}
              </span>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {FIELD_DEFS.map((field) => (
              <label
                key={field.name}
                className={`grid gap-2 ${field.wide ? "md:col-span-2" : ""}`}
              >
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                  {field.label}
                </span>

                {field.type === "textarea" ? (
                  <textarea
                    value={String(data[field.name])}
                    onChange={(event) =>
                      updateField(field.name, event.currentTarget.value)
                    }
                    rows={3}
                    className="min-h-28 border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                  />
                ) : field.type === "select" ? (
                  <select
                    value={String(data[field.name])}
                    onChange={(event) =>
                      updateField(field.name, event.currentTarget.value)
                    }
                    className="min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                  >
                    {field.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={String(data[field.name])}
                    onChange={(event) =>
                      updateField(field.name, event.currentTarget.value)
                    }
                    maxLength={field.name === "vin" ? 17 : undefined}
                    spellCheck={field.name === "vin" ? false : undefined}
                    className="min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                  />
                )}
              </label>
            ))}
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
          </div>

          {data.deliveryEnabled ? (
            <section className="mt-5 border border-[var(--border)] bg-[var(--panel)] p-4">
              <h4 className="text-lg font-bold text-[var(--foreground)]">
                Delivery Checklist Items
              </h4>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                These follow the deal into the Delivery Checklist and the F&amp;I
                email draft.
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {CHECKLIST_ITEMS.map((item) => (
                  <label
                    key={item.key}
                    className="inline-flex items-center gap-3 text-sm font-semibold text-[var(--foreground)]"
                  >
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
                ))}
              </div>
            </section>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={saveNow}
              className="inline-flex min-h-12 items-center justify-center border border-[var(--foreground)] bg-white px-5 text-sm font-bold uppercase tracking-[0.08em] text-[var(--foreground)]"
            >
              Save
            </button>
            <button
              type="button"
              onClick={openChecklist}
              className="inline-flex min-h-12 items-center justify-center border border-[var(--foreground)] bg-white px-5 text-sm font-bold uppercase tracking-[0.08em] text-[var(--foreground)]"
            >
              Open Delivery Checklist
            </button>
            <button
              type="button"
              onClick={openPrintFlow}
              className="inline-flex min-h-12 items-center justify-center border border-[var(--accent)] bg-[var(--accent)] px-5 text-sm font-bold uppercase tracking-[0.08em] text-white"
            >
              Check VIN + Print
            </button>
            <button
              type="button"
              onClick={emailFni}
              className="inline-flex min-h-12 items-center justify-center border border-[var(--accent)] bg-[var(--accent)] px-5 text-sm font-bold uppercase tracking-[0.08em] text-white"
            >
              Check VIN + Email F&amp;I
            </button>
          </div>

          <p
            className={`mt-4 min-h-6 text-sm font-bold ${
              tone === "success"
                ? "text-[var(--success)]"
                : tone === "warn"
                  ? "text-[var(--warn)]"
                  : "text-[var(--muted)]"
            }`}
          >
            {status}
          </p>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Save keeps the deal in this browser for this site. Exact print still
            uses a dedicated rasterized letter-size output.
          </p>
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="border border-black/10 bg-[var(--panel)] p-5 shadow-[0_18px_44px_rgba(35,23,12,0.08)] sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
              Route Map
            </p>
            <h3 className="mt-1 text-2xl font-bold text-[var(--foreground)]">
              Current migration status
            </h3>
            <div className="mt-5 grid gap-3">
              {DOCUMENT_LIBRARY.map((doc) => (
                <div
                  key={doc.slug}
                  className="flex flex-wrap items-center justify-between gap-3 border border-[var(--border)] bg-white px-4 py-3"
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

          <aside className="border border-black/10 bg-[var(--panel-strong)] p-5 shadow-[0_18px_44px_rgba(35,23,12,0.08)] sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
              Pilot Notes
            </p>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-[var(--muted)]">
              <li>Storage keys remain compatible with the static app.</li>
              <li>Print uses a dedicated route and exact raster output.</li>
              <li>Delivery Checklist is the first parity target.</li>
              <li>Other documents stay mapped but intentionally unported.</li>
            </ul>
          </aside>
        </section>
      </div>

      {dialog}
    </>
  );
}
