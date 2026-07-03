export const SCHEMA_VERSION = 2;

export interface Theme {
  /** Invoice sheet background colour. */
  background: string;
  /** Base body text colour. */
  text: string;
  /** Heading colour (Invoice title + section headings). */
  heading: string;
  /** Colour for bold/emphasised text (names, totals, table headers). */
  bold: string;
  /** Line separator / border colour. */
  line: string;
}

export const DEFAULT_THEME: Theme = {
  background: '#ffffff',
  text: '#1a1a1a',
  heading: '#21212b',
  bold: '#21212b',
  line: '#d1d5db',
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
    footer: { email: '', instagram: '' },
    logo: null,
    theme: { ...DEFAULT_THEME },
  };
}
