import {
  SCHEMA_VERSION,
  createEmptyInvoice,
  createId,
  type InvoiceData,
  type Item,
} from './types';

export const STORAGE_KEY = 'inv.invoice.v1';

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function normalizeItem(raw: unknown): Item {
  const o = isObject(raw) ? raw : {};
  return {
    id: typeof o.id === 'string' && o.id ? o.id : createId(),
    description: str(o.description),
    quantity: str(o.quantity),
    price: str(o.price),
  };
}

/**
 * Coerce arbitrary parsed JSON into a valid InvoiceData, filling defaults for
 * any missing/malformed fields. This is the migration path for older or
 * partially-corrupt saved data.
 */
export function normalizeInvoice(raw: unknown): InvoiceData {
  const base = createEmptyInvoice();
  if (!isObject(raw)) return base;

  const from = isObject(raw.from) ? raw.from : {};
  const to = isObject(raw.to) ? raw.to : {};
  const payment = isObject(raw.payment) ? raw.payment : {};
  const footer = isObject(raw.footer) ? raw.footer : {};

  const items = Array.isArray(raw.items) && raw.items.length > 0
    ? raw.items.map(normalizeItem)
    : base.items;

  return {
    version: SCHEMA_VERSION,
    invoiceNumber: str(raw.invoiceNumber),
    date: str(raw.date),
    from: {
      name: str(from.name),
      address: str(from.address),
      pan: str(from.pan),
      gstin: str(from.gstin),
    },
    to: {
      name: str(to.name),
      address: str(to.address),
      gstin: str(to.gstin),
    },
    items,
    payment: {
      beneficiaryName: str(payment.beneficiaryName),
      bankName: str(payment.bankName),
      accountNumber: str(payment.accountNumber),
      ifsc: str(payment.ifsc),
    },
    footer: {
      email: str(footer.email),
      instagram: str(footer.instagram),
    },
    logo: typeof raw.logo === 'string' ? raw.logo : null,
  };
}

/** Load saved invoice, falling back to a blank invoice on missing/corrupt data. */
export function loadInvoice(): InvoiceData {
  try {
    const rawStr = localStorage.getItem(STORAGE_KEY);
    if (!rawStr) return createEmptyInvoice();
    return normalizeInvoice(JSON.parse(rawStr));
  } catch {
    return createEmptyInvoice();
  }
}

/** Persist invoice; returns false if storage fails (e.g. quota exceeded). */
export function saveInvoice(data: InvoiceData): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function clearInvoice(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
