"use client";

import { SignaturePad } from "@/components/ui/signature-pad";
import type { ConsultantInfo } from "@/lib/dealer-consultant";
import {
  getFullStockNumber,
  loadSignatures,
  saveSignatures,
  type SignatureStore,
  type WorkflowData,
} from "@/lib/walker-workflow";
import { useState } from "react";
import css from "./vin-verification.module.css";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function parseDealDate(value: string) {
  if (!value) return { day: "", month: "", year2: "" };
  const [y, m, d] = value.split("-");
  return {
    day: d ? String(Number(d)) : "",
    month: m ? MONTH_NAMES[Number(m) - 1] ?? "" : "",
    year2: y ? y.slice(-2) : "",
  };
}

interface Props {
  workflow: WorkflowData;
  consultant?: ConsultantInfo;
}

function blockEnter(e: React.KeyboardEvent) {
  if (e.key === "Enter") { e.preventDefault(); }
}

type SigKey = "customer" | "salesperson";
const VIN_SIGNATURE_IDS: Record<SigKey, string> = {
  customer: "vin.customer",
  salesperson: "vin.salesperson",
};

function loadVinSignatures(): Record<SigKey, string> {
  const store = loadSignatures();
  return {
    customer: typeof store[VIN_SIGNATURE_IDS.customer] === "string" ? store[VIN_SIGNATURE_IDS.customer] : "",
    salesperson:
      typeof store[VIN_SIGNATURE_IDS.salesperson] === "string" ? store[VIN_SIGNATURE_IDS.salesperson] : "",
  };
}

export function VinVerificationSheet({ workflow, consultant }: Props) {
  const [signatures, setSignatures] = useState<Record<SigKey, string>>(() =>
    loadVinSignatures(),
  );
  const [activeSig, setActiveSig] = useState<SigKey | null>(null);
  const dd = parseDealDate(workflow.dealDate);

  function persistSignature(signatureKey: SigKey, dataUrl: string) {
    const store: SignatureStore = loadSignatures();
    store[VIN_SIGNATURE_IDS[signatureKey]] = dataUrl;
    saveSignatures(store);
    setSignatures((prev) => ({ ...prev, [signatureKey]: dataUrl }));
  }

  return (
    <div className={css.sheet} data-print-sheet="vin-verification" style={{ position: "relative" }}>
      <h1 className={css.docTitle}>VIN Verification</h1>

      <div className={css.spacerLg} />

      <p className={css.paragraph}>
        The vehicle referenced below bearing Stock #{" "}
        <span className={css.inlineField}>{getFullStockNumber(workflow)}</span> has been
        delivered to{" "}
        <span className={css.inlineFieldWide}>{workflow.customerName}</span> on the{" "}
        <span className={css.inlineFieldShort} contentEditable suppressContentEditableWarning onKeyDown={blockEnter}>{dd.day}</span> day of{" "}
        <span className={css.inlineField} contentEditable suppressContentEditableWarning onKeyDown={blockEnter}>{dd.month}</span> 20
        <span className={css.inlineFieldShort} contentEditable suppressContentEditableWarning onKeyDown={blockEnter}>{dd.year2}</span>.
      </p>

      <div className={css.spacerMd} />

      <p className={css.paragraph}>
        A physical inspection of the vehicle has been performed and the VIN
        listed below has been verified by the undersigned as correct.
      </p>

      <div className={css.spacerLg} />

      {/* Vehicle Info */}
      <div className={css.vehicleRow}>
        <div className={css.vehicleCell}>
          <div className={css.vehicleLine}>{workflow.vehicleYear}</div>
          <span className={css.vehicleLabel}>Year</span>
        </div>
        <div className={css.vehicleCell}>
          <div className={css.vehicleLine}>{workflow.vehicleMake}</div>
          <span className={css.vehicleLabel}>Make</span>
        </div>
        <div className={css.vehicleCell}>
          <div className={css.vehicleLine}>{workflow.vehicleModel}</div>
          <span className={css.vehicleLabel}>Model</span>
        </div>
        <div className={css.vehicleCell}>
          <div className={css.vehicleLine}>{workflow.mileage}</div>
          <span className={css.vehicleLabel}>Mileage</span>
        </div>
      </div>

      {/* VIN */}
      <div className={css.vinRow}>
        <span className={css.vinLabel}>VIN Number</span>
        <span className={css.vinLine}>{workflow.vin}</span>
      </div>

      <div className={css.spacerLg} />

      {/* Customer Signature */}
      <div className={css.signatureBlock}>
        {signatures.customer ? (
          <img src={signatures.customer} alt="Customer Signature" className={css.signatureImg} onClick={() => setActiveSig("customer")} />
        ) : (
          <div className={css.signatureLine} onClick={() => setActiveSig("customer")} style={{ cursor: "pointer" }} />
        )}
        <span className={css.signatureLabel}>Customer Signature</span>
      </div>

      <div className={css.printedNameBlock}>
        <div className={css.signatureLine}>{workflow.customerName}</div>
        <span className={css.signatureLabel}>Customer Printed Name</span>
      </div>

      <div className={css.spacerLg} />

      {/* Salesperson Signature */}
      <div className={css.signatureBlock}>
        {signatures.salesperson ? (
          <img src={signatures.salesperson} alt="Salesperson Signature" className={css.signatureImg} onClick={() => setActiveSig("salesperson")} />
        ) : (
          <div className={css.signatureLine} onClick={() => setActiveSig("salesperson")} style={{ cursor: "pointer" }} />
        )}
        <span className={css.signatureLabel}>Salesperson Signature</span>
      </div>

      <div className={css.printedNameBlock}>
        <div className={css.signatureLine}>
          {consultant?.name}
        </div>
        <span className={css.signatureLabel}>Salesperson Printed Name</span>
      </div>

      {activeSig && (
        <SignaturePad
          label={activeSig === "customer" ? "Customer Signature" : "Salesperson Signature"}
          initialValue={signatures[activeSig] || undefined}
          onKeep={(dataUrl) => {
            persistSignature(activeSig, dataUrl);
            setActiveSig(null);
          }}
          onCancel={() => setActiveSig(null)}
        />
      )}
      <span style={{ position: "absolute", bottom: 4, right: 8, fontSize: 7, color: "#bbb" }}>v1.0 • VIN Verification</span>
    </div>
  );
}
