const DEALER_STORAGE_KEY = "walker.dealer.v1";
const CONSULTANT_STORAGE_KEY = "walker.consultant.v1";

export type DealerInfo = {
  dealershipName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
};

export type ConsultantInfo = {
  name: string;
  salespersonNumber: string;
  phone: string;
  email: string;
};

function isBrowser() {
  return typeof window !== "undefined";
}

function safeTrim(value: unknown) {
  return String(value ?? "").trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function createDefaultDealer(): DealerInfo {
  return { dealershipName: "", street: "", city: "", state: "", zip: "" };
}

export function createDefaultConsultant(): ConsultantInfo {
  return { name: "", salespersonNumber: "", phone: "", email: "" };
}

function normalizeDealer(value: unknown): DealerInfo {
  if (!isRecord(value)) return createDefaultDealer();
  return {
    dealershipName: safeTrim(value.dealershipName),
    street: safeTrim(value.street),
    city: safeTrim(value.city),
    state: safeTrim(value.state),
    zip: safeTrim(value.zip),
  };
}

function normalizeConsultant(value: unknown): ConsultantInfo {
  if (!isRecord(value)) return createDefaultConsultant();
  return {
    name: safeTrim(value.name),
    salespersonNumber: safeTrim(value.salespersonNumber),
    phone: safeTrim(value.phone),
    email: safeTrim(value.email),
  };
}

export function loadDealer(): DealerInfo {
  if (!isBrowser()) return createDefaultDealer();
  try {
    return normalizeDealer(
      JSON.parse(localStorage.getItem(DEALER_STORAGE_KEY) || "{}"),
    );
  } catch {
    return createDefaultDealer();
  }
}

export function saveDealer(data: DealerInfo): DealerInfo {
  const next = normalizeDealer(data);
  if (isBrowser()) {
    localStorage.setItem(DEALER_STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}

export function loadConsultant(): ConsultantInfo {
  if (!isBrowser()) return createDefaultConsultant();
  try {
    return normalizeConsultant(
      JSON.parse(localStorage.getItem(CONSULTANT_STORAGE_KEY) || "{}"),
    );
  } catch {
    return createDefaultConsultant();
  }
}

export function saveConsultant(data: ConsultantInfo): ConsultantInfo {
  const next = normalizeConsultant(data);
  if (isBrowser()) {
    localStorage.setItem(CONSULTANT_STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}

export function getDealerFullAddress(dealer: DealerInfo): string {
  const line1 = dealer.street;
  const line2 = [dealer.city, dealer.state].filter(Boolean).join(", ");
  const line3 = dealer.zip;
  return [line1, line2, line3].filter(Boolean).join(", ");
}
