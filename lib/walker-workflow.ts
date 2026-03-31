export const WORKFLOW_STORAGE_KEY = "walker.walkthrough.workflow.v1";
export const SIGNATURE_STORAGE_KEY = "walker.signature.v1";
export const DELIVERY_CHECKLIST_NOTES_STORAGE_KEY =
  "walker.document.deliveryChecklist.v1";

export const CHECKLIST_ITEMS = [
  { key: "validDriversLicense", label: "Valid Driver's License" },
  { key: "proofOfInsurance", label: "Proof of Insurance" },
  { key: "weOweUpfit", label: "We Owe/ Up-fit" },
  { key: "gmsSupplierMilitaryId", label: "GMS/Supplier/Military ID" },
  { key: "vinIncentiveLookup", label: "VIN Incentive Lookup" },
  { key: "inServiceDate", label: "In Service Date" },
  { key: "miles", label: "Miles" },
  { key: "etchNumbers", label: "Etch #'s" },
  { key: "carfaxUsed", label: "Carfax (used)" },
] as const;

export const DELIVERY_CHECKLIST_ENTRY_FIELDS = [
  { id: "bmwKeyRead", label: "BMW Key Read" },
  { id: "taxWatch", label: "Tax Watch" },
  { id: "gcwr", label: "# (lbs)GCWR" },
  { id: "signedBuyerAgreement", label: "Signed Buyer's Agreement" },
  {
    id: "signedCreditAppReferences",
    label: "Signed Credit App. W/ References",
  },
  {
    id: "authorizationToSubmitCredit",
    label: "Authorization To Submit Credit",
  },
  {
    id: "factoryInvFederalBuyerGuide",
    label: "Factory Inv./Fed. Buyer's Guide",
  },
  { id: "asIsCertifiedPacket", label: "As Is/Certified/CPO Packet" },
  { id: "firstServiceVisit", label: "First Service Visit" },
  { id: "deliveryChecklistNew", label: "Delivery Check List (new)" },
] as const;

export const ACCOUNTING_LEFT_FIELDS = [
  "downPaymentPostedInAccounting",
  "afterMarketProducts",
  "payoffCheckCut",
  "trackingNumberForPayoffCheck",
  "cancellations",
  "fundingSent",
  "finalizedDealInAccounting",
] as const;

export const ACCOUNTING_RIGHT_FIELDS = [
  "titleWorksheet",
  "receivedTradeTitle",
  "tradeTitlePaperworkSent",
  "receivedPlateRegistration",
  "loggedInSpreadsheet",
] as const;

export const DOCUMENT_LIBRARY = [
  {
    slug: "delivery-checklist",
    title: "Delivery Checklist",
    description:
      "First full Next.js port with shared local workflow data and exact print output.",
    href: "/documents/delivery-checklist",
    printHref: "/print/delivery-checklist",
    stage: "MVP",
    ready: true,
  },
  {
    slug: "pain-points",
    title: "Pain Points",
    description:
      "Queued after the first print-parity pass. Icon workflow and questioning logic come later.",
    href: "/documents/pain-points",
    printHref: "/print/pain-points",
    stage: "Queued",
    ready: false,
  },
  {
    slug: "payoff-form",
    title: "Payoff Form",
    description:
      "Next target after shared document routing and print output are proven stable.",
    href: "/documents/payoff-form",
    printHref: "/print/payoff-form",
    stage: "Queued",
    ready: false,
  },
  {
    slug: "address-information",
    title: "Address Information Sheet",
    description:
      "Will reuse the shared intake data once the first routed form is stable.",
    href: "/documents/address-information",
    printHref: "/print/address-information",
    stage: "Queued",
    ready: false,
  },
  {
    slug: "buyers-guide",
    title: "Buyers Guide",
    description:
      "Held back for legal review and print verification after the pilot document.",
    href: "/documents/buyers-guide",
    printHref: "/print/buyers-guide",
    stage: "Queued",
    ready: false,
  },
  {
    slug: "buyers-guide-reverse",
    title: "Buyers Guide - Reverse",
    description:
      "Companion legal print surface to migrate only after front-side parity is checked.",
    href: "/documents/buyers-guide/reverse",
    printHref: "/print/buyers-guide/reverse",
    stage: "Queued",
    ready: false,
  },
  {
    slug: "vin-verification",
    title: "VIN Verification",
    description:
      "Uses the same VIN contract and comes after the guided checklist path.",
    href: "/documents/vin-verification",
    printHref: "/print/vin-verification",
    stage: "Queued",
    ready: false,
  },
] as const;

export type ChecklistKey = (typeof CHECKLIST_ITEMS)[number]["key"];
export type DeliveryChecklistNoteKey =
  | (typeof DELIVERY_CHECKLIST_ENTRY_FIELDS)[number]["id"]
  | (typeof ACCOUNTING_LEFT_FIELDS)[number]
  | (typeof ACCOUNTING_RIGHT_FIELDS)[number]
  | "titleToTrade"
  | "currentRegistration"
  | "acvAppraisalForm"
  | "lienholder"
  | "physicalAddressLine1"
  | "physicalAddressLine2"
  | "accountNumber"
  | "payoffAmount"
  | "goodUntil"
  | "spokeTo"
  | "dateReceivedInOffice";

export type WorkflowData = {
  customerName: string;
  coCustomerName: string;
  dealDate: string;
  email: string;
  cellPhone: string;
  homeAddressCategory: string;
  mailingAddressCategory: string;
  homeAddress: string;
  mailingAddress: string;
  address: string;
  salespersonName: string;
  salespersonNumber: string;
  dealNumber: string;
  stockNumber: string;
  customerSource: string;
  fniEmail: string;
  vehicleYear: string;
  vehicleMake: string;
  vehicleModel: string;
  mileage: string;
  vin: string;
  deliveryEnabled: boolean;
  deliveryChecklist: Record<ChecklistKey, boolean>;
};

export type DeliveryChecklistNotes = Partial<
  Record<DeliveryChecklistNoteKey, string>
>;

export type SignatureStore = Record<string, string>;

export type EmailDraft = {
  to: string;
  subject: string;
  body: string;
};

function isBrowser() {
  return typeof window !== "undefined";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function safeTrim(value: unknown) {
  return String(value ?? "").trim();
}

export function cleanSingleLine(value: unknown) {
  return safeTrim(value).replace(/[\r\n]+/g, " ");
}

export function normalizeVin(value: unknown) {
  return safeTrim(value).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 17);
}

export function formatDate(value: string) {
  if (!value) {
    return "";
  }

  const [year, month, day] = String(value).split("-");
  if (!year || !month || !day) {
    return value;
  }

  return `${month}/${day}/${year}`;
}

export function getLast8(vin: string) {
  const normalized = normalizeVin(vin);
  return normalized.length >= 8 ? normalized.slice(-8) : normalized;
}

export function getYearMakeModel(data: Pick<
  WorkflowData,
  "vehicleYear" | "vehicleMake" | "vehicleModel"
>) {
  return [safeTrim(data.vehicleYear), safeTrim(data.vehicleMake), safeTrim(data.vehicleModel)]
    .filter(Boolean)
    .join(" ");
}

export function getDefaultDate() {
  return new Date().toISOString().slice(0, 10);
}

export function createEmptyChecklist() {
  return CHECKLIST_ITEMS.reduce(
    (result, item) => {
      result[item.key] = false;
      return result;
    },
    {} as Record<ChecklistKey, boolean>,
  );
}

export function createDefaultWorkflowData(): WorkflowData {
  return {
    customerName: "",
    coCustomerName: "",
    dealDate: getDefaultDate(),
    email: "",
    cellPhone: "",
    homeAddressCategory: "Home Address",
    mailingAddressCategory: "Mailing Address",
    homeAddress: "",
    mailingAddress: "",
    address: "",
    salespersonName: "",
    salespersonNumber: "",
    dealNumber: "",
    stockNumber: "",
    customerSource: "",
    fniEmail: "",
    vehicleYear: "",
    vehicleMake: "",
    vehicleModel: "",
    mileage: "",
    vin: "",
    deliveryEnabled: true,
    deliveryChecklist: createEmptyChecklist(),
  };
}

export function normalizeWorkflowData(value: unknown): WorkflowData {
  const base = createDefaultWorkflowData();
  if (!isRecord(value)) {
    return base;
  }

  const deliveryChecklist = isRecord(value.deliveryChecklist)
    ? value.deliveryChecklist
    : {};

  const nextChecklist = { ...createEmptyChecklist() };
  for (const item of CHECKLIST_ITEMS) {
    nextChecklist[item.key] = Boolean(deliveryChecklist[item.key]);
  }

  const homeAddress = safeTrim(value.homeAddress ?? value.address);

  return {
    customerName: safeTrim(value.customerName),
    coCustomerName: safeTrim(value.coCustomerName),
    dealDate: safeTrim(value.dealDate) || base.dealDate,
    email: safeTrim(value.email),
    cellPhone: safeTrim(value.cellPhone),
    homeAddressCategory: safeTrim(value.homeAddressCategory) || base.homeAddressCategory,
    mailingAddressCategory:
      safeTrim(value.mailingAddressCategory) || base.mailingAddressCategory,
    homeAddress,
    mailingAddress: safeTrim(value.mailingAddress),
    address: homeAddress,
    salespersonName: safeTrim(value.salespersonName),
    salespersonNumber: safeTrim(value.salespersonNumber),
    dealNumber: safeTrim(value.dealNumber),
    stockNumber: safeTrim(value.stockNumber),
    customerSource: safeTrim(value.customerSource),
    fniEmail: safeTrim(value.fniEmail),
    vehicleYear: safeTrim(value.vehicleYear),
    vehicleMake: safeTrim(value.vehicleMake),
    vehicleModel: safeTrim(value.vehicleModel),
    mileage: safeTrim(value.mileage),
    vin: normalizeVin(value.vin),
    deliveryEnabled:
      typeof value.deliveryEnabled === "boolean" ? value.deliveryEnabled : true,
    deliveryChecklist: nextChecklist,
  };
}

export function getCustomerDisplayName(data: Pick<WorkflowData, "customerName" | "coCustomerName">) {
  return [safeTrim(data.customerName), safeTrim(data.coCustomerName)]
    .filter(Boolean)
    .join(" / ");
}

export function loadWorkflow() {
  if (!isBrowser()) {
    return createDefaultWorkflowData();
  }

  try {
    return normalizeWorkflowData(
      JSON.parse(window.localStorage.getItem(WORKFLOW_STORAGE_KEY) || "{}"),
    );
  } catch {
    return createDefaultWorkflowData();
  }
}

export function saveWorkflow(data: WorkflowData) {
  const next = normalizeWorkflowData(data);
  if (isBrowser()) {
    window.localStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}

export function loadSignatures() {
  if (!isBrowser()) {
    return {};
  }

  try {
    return JSON.parse(window.localStorage.getItem(SIGNATURE_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveSignatures(store: SignatureStore) {
  if (isBrowser()) {
    window.localStorage.setItem(SIGNATURE_STORAGE_KEY, JSON.stringify(store));
  }
  return store;
}

export function signatureIdFor(pathname: string, explicitId: string | undefined, index: number) {
  return explicitId || `${pathname}#signature-${index}`;
}

export function loadDeliveryChecklistNotes() {
  if (!isBrowser()) {
    return {};
  }

  try {
    return JSON.parse(
      window.localStorage.getItem(DELIVERY_CHECKLIST_NOTES_STORAGE_KEY) || "{}",
    ) as DeliveryChecklistNotes;
  } catch {
    return {};
  }
}

export function saveDeliveryChecklistNotes(notes: DeliveryChecklistNotes) {
  const next = Object.fromEntries(
    Object.entries(notes).filter(([, value]) => cleanSingleLine(value)),
  ) as DeliveryChecklistNotes;

  if (isBrowser()) {
    window.localStorage.setItem(
      DELIVERY_CHECKLIST_NOTES_STORAGE_KEY,
      JSON.stringify(next),
    );
  }

  return next;
}

export function createEmailDraft(data: WorkflowData): EmailDraft {
  const selectedItems = CHECKLIST_ITEMS.filter(
    (item) => data.deliveryChecklist[item.key],
  ).map((item) => `- ${item.label}`);

  const lines = [
    `Customer: ${getCustomerDisplayName(data) || "-"}`,
    `VIN: ${normalizeVin(data.vin) || "-"}`,
    `Last 8: ${getLast8(data.vin) || "-"}`,
    `Deal #: ${safeTrim(data.dealNumber) || "-"}`,
    `Stock #: ${safeTrim(data.stockNumber) || "-"}`,
    `Salesperson: ${safeTrim(data.salespersonName) || "-"}`,
    `Email: ${safeTrim(data.email) || "-"}`,
    "",
  ];

  if (selectedItems.length) {
    lines.push("Delivery Checklist Items:");
    lines.push(...selectedItems);
    lines.push("");
  }

  lines.push("Attach the printed Delivery Checklist PDF before sending.");

  return {
    to: safeTrim(data.fniEmail),
    subject: `Delivery Checklist - ${
      getCustomerDisplayName(data) || normalizeVin(data.vin) || "Walker Customer"
    }`,
    body: lines.join("\n"),
  };
}

export function openMailDraft(draft: EmailDraft) {
  if (!isBrowser()) {
    return;
  }

  const to = encodeURIComponent(draft.to || "");
  const subject = encodeURIComponent(draft.subject || "");
  const body = encodeURIComponent(draft.body || "");
  window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
}
