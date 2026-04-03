export const WORKFLOW_STORAGE_KEY = "walker.walkthrough.workflow.v1";
export const SIGNATURE_STORAGE_KEY = "walker.signature.v1";
export const DELIVERY_CHECKLIST_NOTES_STORAGE_KEY =
  "walker.document.deliveryChecklist.v1";
export const WORKFLOW_SESSION_CHANNEL_NAME = "walker.workflow.session.v1";
export const WORKFLOW_SESSION_CLEAR_EVENT = "workflow-session-cleared";

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
      "Customer info, checklist items, and accounting fields.",
    href: "/documents/delivery-checklist",
    printHref: "/print/delivery-checklist",
    stage: "Deal Form",
    ready: true,
  },
  {
    slug: "pain-points",
    title: "Space Sheet",
    description:
      "Priority selling points and customer concerns.",
    href: "/documents/pain-points",
    printHref: "/print/pain-points",
    stage: "Deal Form",
    ready: true,
  },
  {
    slug: "payoff-form",
    title: "Payoff Form",
    description:
      "Trade-in lienholder, payoff details, and signatures.",
    href: "/documents/payoff-form",
    printHref: "/print/payoff-form",
    stage: "Deal Form",
    ready: true,
  },
  {
    slug: "address-information",
    title: "Address Information Sheet",
    description:
      "Physical and mailing address details.",
    href: "/documents/address-information",
    printHref: "/print/address-information",
    stage: "Deal Form",
    ready: true,
  },
  {
    slug: "buyers-guide",
    title: "Buyers Guide",
    description:
      "Federal warranty disclosure and dealer contact (2 pages).",
    href: "/documents/buyers-guide",
    printHref: "/print/buyers-guide",
    stage: "Deal Form",
    ready: true,
  },
  {
    slug: "vin-verification",
    title: "VIN Verification",
    description:
      "VIN confirmation and salesperson signature.",
    href: "/documents/vin-verification",
    printHref: "/print/vin-verification",
    stage: "Deal Form",
    ready: true,
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
  homeCity: string;
  homeState: string;
  homeZip: string;
  mailingAddress: string;
  mailingCity: string;
  mailingState: string;
  mailingZip: string;
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
  etchNumbers: string;
  taxPercent: string;
  vin: string;
  hasCoOwner: boolean;
  payoffVerified: boolean;
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

function getBrowserStorage() {
  if (!isBrowser()) {
    return null;
  }

  return window.sessionStorage;
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

export function getYearMakeModel(
  data: Pick<WorkflowData, "vehicleYear" | "vehicleMake" | "vehicleModel">,
) {
  return [
    safeTrim(data.vehicleYear),
    safeTrim(data.vehicleMake),
    safeTrim(data.vehicleModel),
  ]
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
    homeCity: "",
    homeState: "",
    homeZip: "",
    mailingAddress: "",
    mailingCity: "",
    mailingState: "",
    mailingZip: "",
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
    etchNumbers: "",
    taxPercent: "",
    vin: "",
    hasCoOwner: false,
    payoffVerified: false,
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
    homeAddressCategory:
      safeTrim(value.homeAddressCategory) || base.homeAddressCategory,
    mailingAddressCategory:
      safeTrim(value.mailingAddressCategory) || base.mailingAddressCategory,
    homeAddress,
    homeCity: safeTrim(value.homeCity),
    homeState: safeTrim(value.homeState),
    homeZip: safeTrim(value.homeZip),
    mailingAddress: safeTrim(value.mailingAddress),
    mailingCity: safeTrim(value.mailingCity),
    mailingState: safeTrim(value.mailingState),
    mailingZip: safeTrim(value.mailingZip),
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
    etchNumbers: safeTrim(value.etchNumbers),
    taxPercent: safeTrim(value.taxPercent),
    vin: normalizeVin(value.vin),
    hasCoOwner:
      typeof value.hasCoOwner === "boolean" ? value.hasCoOwner : false,
    payoffVerified:
      typeof value.payoffVerified === "boolean" ? value.payoffVerified : false,
    deliveryEnabled:
      typeof value.deliveryEnabled === "boolean" ? value.deliveryEnabled : true,
    deliveryChecklist: nextChecklist,
  };
}

export function getCustomerDisplayName(
  data: Pick<WorkflowData, "customerName" | "coCustomerName">,
) {
  return [safeTrim(data.customerName), safeTrim(data.coCustomerName)]
    .filter(Boolean)
    .join(" / ");
}

function broadcastWorkflowSessionCleared() {
  if (!isBrowser() || typeof BroadcastChannel === "undefined") {
    return;
  }

  const channel = new BroadcastChannel(WORKFLOW_SESSION_CHANNEL_NAME);
  channel.postMessage({ type: WORKFLOW_SESSION_CLEAR_EVENT });
  channel.close();
}

export function clearWorkflowSession(options: { broadcast?: boolean } = {}) {
  const storage = getBrowserStorage();

  storage?.removeItem(WORKFLOW_STORAGE_KEY);
  storage?.removeItem(SIGNATURE_STORAGE_KEY);
  storage?.removeItem(DELIVERY_CHECKLIST_NOTES_STORAGE_KEY);

  if (options.broadcast !== false) {
    broadcastWorkflowSessionCleared();
  }
}

export function subscribeToWorkflowSessionClear(onClear: () => void) {
  if (!isBrowser() || typeof BroadcastChannel === "undefined") {
    return () => undefined;
  }

  const channel = new BroadcastChannel(WORKFLOW_SESSION_CHANNEL_NAME);
  channel.onmessage = (event: MessageEvent<{ type?: string }>) => {
    if (event.data?.type === WORKFLOW_SESSION_CLEAR_EVENT) {
      onClear();
    }
  };

  return () => channel.close();
}

export function loadWorkflow() {
  const storage = getBrowserStorage();
  if (!storage) {
    return createDefaultWorkflowData();
  }

  try {
    return normalizeWorkflowData(JSON.parse(storage.getItem(WORKFLOW_STORAGE_KEY) || "{}"));
  } catch {
    return createDefaultWorkflowData();
  }
}

export function saveWorkflow(data: WorkflowData) {
  const next = normalizeWorkflowData(data);
  const storage = getBrowserStorage();
  if (storage) {
    storage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}

export function loadSignatures() {
  const storage = getBrowserStorage();
  if (!storage) {
    return {};
  }

  try {
    return JSON.parse(storage.getItem(SIGNATURE_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveSignatures(store: SignatureStore) {
  const storage = getBrowserStorage();
  if (storage) {
    storage.setItem(SIGNATURE_STORAGE_KEY, JSON.stringify(store));
  }
  return store;
}

export function signatureIdFor(
  pathname: string,
  explicitId: string | undefined,
  index: number,
) {
  return explicitId || `${pathname}#signature-${index}`;
}

export function loadDeliveryChecklistNotes() {
  const storage = getBrowserStorage();
  if (!storage) {
    return {};
  }

  try {
    return JSON.parse(
      storage.getItem(DELIVERY_CHECKLIST_NOTES_STORAGE_KEY) || "{}",
    ) as DeliveryChecklistNotes;
  } catch {
    return {};
  }
}

export function saveDeliveryChecklistNotes(notes: DeliveryChecklistNotes) {
  const next = Object.fromEntries(
    Object.entries(notes).filter(([, value]) => cleanSingleLine(value)),
  ) as DeliveryChecklistNotes;

  const storage = getBrowserStorage();
  if (storage) {
    storage.setItem(DELIVERY_CHECKLIST_NOTES_STORAGE_KEY, JSON.stringify(next));
  }

  return next;
}

export function createEmailDraft(data: WorkflowData, salespersonName?: string): EmailDraft {
  const selectedItems = CHECKLIST_ITEMS.filter(
    (item) => data.deliveryChecklist[item.key],
  ).map((item) => `- ${item.label}`);

  const lines = [
    `Customer: ${getCustomerDisplayName(data) || "-"}`,
    `VIN: ${normalizeVin(data.vin) || "-"}`,
    `Last 8: ${getLast8(data.vin) || "-"}`,
    `Deal #: ${safeTrim(data.dealNumber) || "-"}`,
    `Stock #: ${safeTrim(data.stockNumber) || "-"}`,
    `Salesperson: ${salespersonName || safeTrim(data.salespersonName) || "-"}`,
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
    subject: `Delivery Checklist - ${getCustomerDisplayName(data) || normalizeVin(data.vin) || "Walker Customer"
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
