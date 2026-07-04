export const SCHEMA_VERSION = 5;

export interface Theme {
  /** Invoice sheet background colour. */
  background: string;
  /** Base body text colour. */
  text: string;
  /** Heading colour (Invoice title + section headings). */
  heading: string;
  /** Line separator / border colour. */
  line: string;
  /** Field-label colour (PAN, GSTIN, table headers, Total, footer labels, etc.). */
  label: string;
  /** Items-table header + total-row background fill. */
  tableAccent: string;
}

export const DEFAULT_THEME: Theme = {
  background: '#ffffff',
  text: '#1a1a1a',
  heading: '#21212b',
  line: '#d1d5db',
  label: '#6b7280',
  tableAccent: '#f3f4f6',
};

export interface Party {
  name: string;
  address: string;
  gstin: string;
}

export interface FromParty extends Party {
  pan: string;
}

export interface Item {
  /** Stable id for React keys and row operations. */
  id: string;
  description: string;
  /** Kept as raw strings so the inputs stay controlled and empty states are preserved. */
  quantity: string;
  price: string;
}

export interface Payment {
  beneficiaryName: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
}

export interface Footer {
  email: string;
  phone: string;
  instagram: string;
}

export interface InvoiceData {
  version: number;
  invoiceNumber: string;
  date: string;
  from: FromParty;
  to: Party;
  items: Item[];
  payment: Payment;
  footer: Footer;
  /** Data URL of the uploaded logo, or null when none. */
  logo: string | null;
  theme: Theme;
}

/**
 * The reusable parts of an invoice, snapshotted on export and used to
 * prepopulate a new invoice. Excludes the per-invoice fields (invoice number,
 * date, To details, items) which change every time.
 */
export interface InvoiceTemplate {
  from: FromParty;
  payment: Payment;
  footer: Footer;
  logo: string | null;
  theme: Theme;
}

let idCounter = 0;
export function createId(): string {
  idCounter += 1;
  return `item-${Date.now().toString(36)}-${idCounter}`;
}

export function createEmptyItem(): Item {
  return { id: createId(), description: '', quantity: '', price: '' };
}

export function createEmptyInvoice(): InvoiceData {
  return {
    version: SCHEMA_VERSION,
    invoiceNumber: '',
    date: '',
    from: { name: '', address: '', pan: '', gstin: '' },
    to: { name: '', address: '', gstin: '' },
    items: [createEmptyItem(), createEmptyItem(), createEmptyItem()],
    payment: { beneficiaryName: '', bankName: '', accountNumber: '', ifsc: '' },
    footer: { email: '', phone: '', instagram: '' },
    logo: null,
    theme: { ...DEFAULT_THEME },
  };
}

/**
 * A fresh invoice seeded with a saved template's reusable fields. Per-invoice
 * fields (number, date, To, items) stay blank.
 */
export function createInvoiceFromTemplate(template: InvoiceTemplate | null): InvoiceData {
  const invoice = createEmptyInvoice();
  if (!template) return invoice;
  return {
    ...invoice,
    from: { ...template.from },
    payment: { ...template.payment },
    footer: { ...template.footer },
    logo: template.logo,
    theme: { ...template.theme },
  };
}
