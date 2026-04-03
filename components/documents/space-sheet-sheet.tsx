"use client";

import {
  getCustomerDisplayName,
  getYearMakeModel,
  type WorkflowData,
} from "@/lib/walker-workflow";
import Image from "next/image";

import styles from "./space-sheet.module.css";

const PRIORITY_ITEMS = [
  "Safety",
  "Performance",
  "Appearance",
  "Comfort",
  "Economy",
  "Dependability",
  "Other",
] as const;

type SpaceSheetProps = {
  workflow: WorkflowData;
};

function blockEnter(e: React.KeyboardEvent) {
  if (e.key === "Enter") { e.preventDefault(); }
}

export function SpaceSheet({ workflow }: SpaceSheetProps) {
  return (
    <main
      className={styles.sheet}
      aria-label="Space Sheet form"
      data-print-sheet="space-sheet"
      style={{ position: "relative" }}
    >
      <div className={styles.logoBlock}>
        <Image
          src="/space-sheet-graphic.png"
          alt="Walker Chrysler Dodge Jeep RAM"
          width={480}
          height={220}
          className={styles.logoImg}
          priority
        />
      </div>

      <div className={styles.fieldGrid}>
        <span className={styles.fieldLabel}>Customer Name:</span>
        <div className={styles.fieldLine} contentEditable suppressContentEditableWarning onKeyDown={blockEnter}>
          {getCustomerDisplayName(workflow)}
        </div>
      </div>

      <div className={styles.fieldGrid}>
        <span className={styles.fieldLabel}>Address:</span>
        <div className={styles.fieldLine} contentEditable suppressContentEditableWarning onKeyDown={blockEnter}>
          {workflow.homeAddress}
        </div>
      </div>

      <div className={styles.fieldGrid}>
        <span className={styles.fieldLabel} />
        <div className={styles.fieldLine} contentEditable suppressContentEditableWarning onKeyDown={blockEnter}>{[workflow.homeCity, workflow.homeState].filter(Boolean).join(", ")}{workflow.homeZip ? ` ${workflow.homeZip}` : ""}</div>
      </div>

      <div className={styles.fieldGrid}>
        <span className={styles.fieldLabel}>Email:</span>
        <div className={styles.fieldLine} contentEditable suppressContentEditableWarning onKeyDown={blockEnter}>
          {workflow.email}
        </div>
      </div>

      <div className={styles.fieldGrid}>
        <span className={styles.fieldLabel}>Cell Phone:</span>
        <div className={styles.fieldLine} contentEditable suppressContentEditableWarning onKeyDown={blockEnter}>
          {workflow.cellPhone}
        </div>
      </div>

      <div className={styles.fieldGrid}>
        <span className={styles.fieldLabel}>Vehicle of Interest:</span>
        <div className={styles.fieldLine} contentEditable suppressContentEditableWarning onKeyDown={blockEnter}>
          {getYearMakeModel(workflow)}
        </div>
      </div>

      <div className={styles.fieldGrid}>
        <span className={styles.fieldLabel}>How did you hear about us?</span>
        <div className={styles.fieldLine} contentEditable suppressContentEditableWarning onKeyDown={blockEnter}>
          {workflow.customerSource}
        </div>
      </div>

      {/* Trade Section */}
      <div className={styles.tradeRow}>
        <div className={styles.tradeSection}>
          <span className={styles.tradeLabel}>Trade:</span>
          <div className={styles.tradeOption}>
            <div className={styles.checkbox} />
            <span>Yes</span>
          </div>
          <div className={styles.tradeOption}>
            <div className={styles.checkbox} />
            <span>No</span>
          </div>
        </div>
        <div className={styles.fieldRow}>
          <span className={styles.fieldLabel}>Approximate Balance:</span>
          <div className={styles.fieldLine} contentEditable suppressContentEditableWarning onKeyDown={blockEnter} />
        </div>
      </div>

      <div className={styles.tradeRow}>
        <div className={styles.fieldRow}>
          <span className={styles.fieldLabel}>Current Payment:</span>
          <div className={styles.fieldLine} contentEditable suppressContentEditableWarning onKeyDown={blockEnter} />
        </div>
        <div className={styles.fieldRow}>
          <span className={styles.fieldLabel}>New Budget:</span>
          <div className={styles.fieldLine} contentEditable suppressContentEditableWarning onKeyDown={blockEnter} />
        </div>
      </div>

      <div className={styles.spacerSm} />

      <p className={styles.questionLine}>
        WHAT 3 ARE MOST IMPORTANT TO YOU IN YOUR SELECTION AND WHY?
      </p>

      {PRIORITY_ITEMS.map((label) => (
        <div key={label} className={styles.priorityRow}>
          <span className={styles.priorityLabel}>{label}</span>
          <div className={styles.priorityLine} contentEditable suppressContentEditableWarning onKeyDown={blockEnter} />
        </div>
      ))}
      <span style={{ position: "absolute", bottom: 4, right: 8, fontSize: 7, color: "#bbb" }}>v1.0 • Space Sheet</span>
    </main>
  );
}
