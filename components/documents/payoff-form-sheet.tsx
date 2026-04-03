"use client";

import { SignaturePad } from "@/components/ui/signature-pad";
import {
  formatDate,
  loadSignatures,
  saveSignatures,
  type SignatureStore,
  type WorkflowData,
} from "@/lib/walker-workflow";
import Image from "next/image";
import { useState } from "react";
import css from "./payoff-form.module.css";

interface Props {
  workflow: WorkflowData;
}

function blockEnter(e: React.KeyboardEvent) {
  if (e.key === "Enter") { e.preventDefault(); }
}

type SigKey = "owner" | "coOwner" | "witness";
const PAYOFF_SIGNATURE_IDS: Record<SigKey, string> = {
  owner: "payoff.owner",
  coOwner: "payoff.coOwner",
  witness: "payoff.witness",
};

function loadPayoffSignatures(): Record<SigKey, string> {
  const store = loadSignatures();
  return {
    owner: typeof store[PAYOFF_SIGNATURE_IDS.owner] === "string" ? store[PAYOFF_SIGNATURE_IDS.owner] : "",
    coOwner: typeof store[PAYOFF_SIGNATURE_IDS.coOwner] === "string" ? store[PAYOFF_SIGNATURE_IDS.coOwner] : "",
    witness: typeof store[PAYOFF_SIGNATURE_IDS.witness] === "string" ? store[PAYOFF_SIGNATURE_IDS.witness] : "",
  };
}

export function PayoffFormSheet({ workflow }: Props) {
  const [signatures, setSignatures] = useState<Record<SigKey, string>>(() =>
    loadPayoffSignatures(),
  );
  const [activeSig, setActiveSig] = useState<SigKey | null>(null);

  function persistSignature(signatureKey: SigKey, dataUrl: string) {
    const store: SignatureStore = loadSignatures();
    store[PAYOFF_SIGNATURE_IDS[signatureKey]] = dataUrl;
    saveSignatures(store);
    setSignatures((prev) => ({ ...prev, [signatureKey]: dataUrl }));
  }

  return (
    <div className={css.sheet} data-print-sheet="payoff-form" style={{ position: "relative" }}>
      {/* Logo */}
      <div className={css.logoBlock}>
        <Image
          src="/walker-red-graphic-v2.png"
          alt="Walker Automotive"
          width={280}
          height={78}
          className={css.logoImg}
          priority
        />
      </div>

      <h2 className={css.docTitle}>Payoff Form</h2>

      <div className={css.spacerMd} />

      <p className={css.bodyText}>
        I / We hereby authorize Walker Automotive or its designee to obtain a
        payoff from my/our lienholder as indicated below for the purpose of
        trading in my/our vehicle for the purchase of a vehicle from Walker
        Automotive.
      </p>

      <div className={css.spacerSm} />

      <p className={css.bodyText}>
        I / We understand that if the payoff changes from the time the payoff
        was verified until the time the check is sent and cashed from Walker
        Automotive, I/We will be responsible for any difference in payoff
        amounts.
      </p>

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
          <div className={css.vehicleLine}>{workflow.vin}</div>
          <span className={css.vehicleLabel}>VIN</span>
        </div>
      </div>

      {/* Signatures — Owner + Co-Owner always side by side */}
      <div className={css.signatureGrid}>
        <div className={css.signatureBlock}>
          {signatures.owner ? (
            <img src={signatures.owner} alt="Owner Signature" className={css.signatureImg} onClick={() => setActiveSig("owner")} />
          ) : (
            <div className={css.signatureLine} onClick={() => setActiveSig("owner")} style={{ cursor: "pointer" }} />
          )}
          <span className={css.signatureLabel}>Owner Signature</span>
        </div>
        <div className={css.signatureBlock}>
          {signatures.coOwner ? (
            <img src={signatures.coOwner} alt="Co-Owner Signature" className={css.signatureImg} onClick={() => setActiveSig("coOwner")} />
          ) : (
            <div className={css.signatureLine} onClick={() => setActiveSig("coOwner")} style={{ cursor: "pointer" }} />
          )}
          <span className={css.signatureLabel}>Co-Owner Signature</span>
        </div>
      </div>

      <div className={css.witnessRow}>
        <div className={css.signatureBlock}>
          {signatures.witness ? (
            <img src={signatures.witness} alt="Witness Signature" className={css.signatureImg} onClick={() => setActiveSig("witness")} />
          ) : (
            <div className={css.signatureLine} onClick={() => setActiveSig("witness")} style={{ cursor: "pointer" }} />
          )}
          <span className={css.signatureLabel}>Witness Signature</span>
        </div>
        <div className={css.signatureBlock}>
          <div className={css.signatureLine} contentEditable suppressContentEditableWarning onKeyDown={blockEnter}>{formatDate(workflow.dealDate)}</div>
          <span className={css.signatureLabel}>Date</span>
        </div>
      </div>

      <div className={css.solidLine} />

      {/* Trade-in Payoff Information */}
      <p className={css.sectionTitle}>Trade-in Payoff Information</p>

      <div className={css.spacerSm} />

      <div className={css.fieldRow}>
        <span className={css.fieldLabel}>Lienholder Name:</span>
        <span className={css.fieldLine} contentEditable suppressContentEditableWarning onKeyDown={blockEnter} />
        <span className={css.fieldLabel}>Ph:</span>
        <span className={css.fieldLine} style={{ maxWidth: "180px" }} contentEditable suppressContentEditableWarning onKeyDown={blockEnter} />
      </div>

      <div className={css.fieldRow}>
        <span className={css.fieldLabel}>Physical Address:</span>
        <span className={css.fieldLine} contentEditable suppressContentEditableWarning onKeyDown={blockEnter} />
      </div>

      <div className={css.twoCol}>
        <div className={css.fieldRow}>
          <span className={css.fieldLabel}>15 Day Payoff $</span>
          <span className={css.fieldLine} contentEditable suppressContentEditableWarning onKeyDown={blockEnter} />
        </div>
        <div className={css.fieldRow}>
          <span className={css.fieldLabel}>Good until Date:</span>
          <span className={css.fieldLine} contentEditable suppressContentEditableWarning onKeyDown={blockEnter} />
        </div>
      </div>

      <div className={css.twoCol}>
        <div className={css.fieldRow}>
          <span className={css.fieldLabel}>Payoff as of Today&rsquo;s $</span>
          <span className={css.fieldLine} contentEditable suppressContentEditableWarning onKeyDown={blockEnter} />
        </div>
        <div className={css.fieldRow}>
          <span className={css.fieldLabel}>Account Number:</span>
          <span className={css.fieldLine} contentEditable suppressContentEditableWarning onKeyDown={blockEnter} />
        </div>
      </div>

      <div className={css.twoCol}>
        <div className={css.fieldRow}>
          <span className={css.fieldLabel}>per Diem</span>
          <span className={css.fieldLine} contentEditable suppressContentEditableWarning onKeyDown={blockEnter} />
        </div>
        <div className={css.fieldRow}>
          <span className={css.fieldLabel}>Social Security Number:</span>
          <span className={css.fieldLine} contentEditable suppressContentEditableWarning onKeyDown={blockEnter} />
        </div>
      </div>

      <div className={css.spacerSm} />

      <div className={css.twoCol}>
        <div className={css.fieldRow}>
          <span className={css.fieldLabel}>Representative Name:</span>
          <span className={css.fieldLine} contentEditable suppressContentEditableWarning onKeyDown={blockEnter} />
        </div>
        <div className={css.fieldRow}>
          <span className={css.fieldLabel}>Date:</span>
          <span className={css.fieldLine} contentEditable suppressContentEditableWarning onKeyDown={blockEnter}>{workflow.payoffVerified ? formatDate(workflow.dealDate) : ""}</span>
        </div>
      </div>

      <div className={css.fieldRow}>
        <span className={css.fieldLabel}>Verified By:</span>
        <span className={css.fieldLine} contentEditable suppressContentEditableWarning onKeyDown={blockEnter}>{workflow.payoffVerified ? workflow.salespersonName : ""}</span>
      </div>

      <div className={css.spacerMd} />

      <div className={css.solidLine} />

      {/* Accounting Office Only */}
      <p className={css.accountingTitle}>Accounting Office Only</p>

      <div className={css.spacerSm} />

      <div className={css.twoCol}>
        <div className={css.fieldRow}>
          <span className={css.fieldLabel}>10 Day Payoff $</span>
          <span className={css.fieldLine} contentEditable suppressContentEditableWarning onKeyDown={blockEnter} />
        </div>
        <div className={css.fieldRow}>
          <span className={css.fieldLabel}>Good until Date:</span>
          <span className={css.fieldLine} contentEditable suppressContentEditableWarning onKeyDown={blockEnter} />
        </div>
      </div>

      <div className={css.twoCol}>
        <div className={css.fieldRow}>
          <span className={css.fieldLabel}>Payoff as of Today&rsquo;s $</span>
          <span className={css.fieldLine} contentEditable suppressContentEditableWarning onKeyDown={blockEnter} />
        </div>
        <div className={css.fieldRow}>
          <span className={css.fieldLabel}>per Diem</span>
          <span className={css.fieldLine} contentEditable suppressContentEditableWarning onKeyDown={blockEnter} />
        </div>
      </div>

      {activeSig && (
        <SignaturePad
          label={activeSig === "owner" ? "Owner Signature" : activeSig === "coOwner" ? "Co-Owner Signature" : "Witness Signature"}
          initialValue={signatures[activeSig] || undefined}
          onKeep={(dataUrl) => {
            persistSignature(activeSig, dataUrl);
            setActiveSig(null);
          }}
          onCancel={() => setActiveSig(null)}
        />
      )}
      <span style={{ position: "absolute", bottom: 4, right: 8, fontSize: 7, color: "#bbb" }}>v1.0 • Payoff Form</span>
    </div>
  );
}
