import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import InvoiceHeader from './components/InvoiceHeader';
import PartyBlock from './components/PartyBlock';
import ItemsTable from './components/ItemsTable';
import PaymentDetails from './components/PaymentDetails';
import InvoiceFooter from './components/InvoiceFooter';
import Toolbar from './components/Toolbar';
import EditableValue from './components/EditableValue';
import { exportBasename, exportPDF, exportPNG } from './lib/export';
import { clearInvoice, loadInvoice, saveInvoice } from './lib/storage';
import {
  DEFAULT_THEME,
  createEmptyInvoice,
  createEmptyItem,
  type FromParty,
  type Footer,
  type InvoiceData,
  type Item,
  type Party,
  type Payment,
  type Theme,
} from './lib/types';

/** Format an ISO date (yyyy-mm-dd) as e.g. "03 Jul 2026" for the export view. */
function formatDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${String(d).padStart(2, '0')} ${months[m - 1]} ${y}`;
}

export default function App() {
  const [data, setData] = useState<InvoiceData>(() => loadInvoice());
  const [busy, setBusy] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Debounced autosave on every change.
  useEffect(() => {
    const handle = setTimeout(() => saveInvoice(data), 300);
    return () => clearTimeout(handle);
  }, [data]);

  const update = useCallback((patch: Partial<InvoiceData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateFrom = (patch: Partial<FromParty>) =>
    setData((p) => ({ ...p, from: { ...p.from, ...patch } }));
  const updateTo = (patch: Partial<Party>) =>
    setData((p) => ({ ...p, to: { ...p.to, ...patch } }));
  const updatePayment = (patch: Partial<Payment>) =>
    setData((p) => ({ ...p, payment: { ...p.payment, ...patch } }));
  const updateFooter = (patch: Partial<Footer>) =>
    setData((p) => ({ ...p, footer: { ...p.footer, ...patch } }));
  const updateTheme = (patch: Partial<Theme>) =>
    setData((p) => ({ ...p, theme: { ...p.theme, ...patch } }));
  const resetTheme = () => setData((p) => ({ ...p, theme: { ...DEFAULT_THEME } }));

  const handleItemChange = (id: string, patch: Partial<Omit<Item, 'id'>>) =>
    setData((p) => ({
      ...p,
      items: p.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }));
  const handleAddRow = () =>
    setData((p) => ({ ...p, items: [...p.items, createEmptyItem()] }));
  const handleRemoveRow = (id: string) =>
    setData((p) => ({
      ...p,
      items: p.items.length > 1 ? p.items.filter((it) => it.id !== id) : p.items,
    }));

  const handleNewInvoice = () => {
    if (!confirm('Clear this invoice and start a new one? This cannot be undone.')) return;
    clearInvoice();
    setData(createEmptyInvoice());
  };

  const runExport = async (kind: 'png' | 'pdf') => {
    const node = sheetRef.current;
    if (!node || busy) return;
    setBusy(true);
    try {
      const base = exportBasename(data.invoiceNumber);
      if (kind === 'png') await exportPNG(node, `${base}.png`);
      else await exportPDF(node, `${base}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Sorry, the export failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const themeStyle = {
    '--sheet-bg': data.theme.background,
    '--ink': data.theme.text,
    '--heading': data.theme.heading,
    '--bold': data.theme.bold,
    '--line': data.theme.line,
    '--label': data.theme.label,
    '--table-head-bg': data.theme.tableHeadBg,
  } as CSSProperties;

  return (
    <div className="app">
      <Toolbar
        onExportPNG={() => runExport('png')}
        onExportPDF={() => runExport('pdf')}
        onNewInvoice={handleNewInvoice}
        busy={busy}
        theme={data.theme}
        onThemeChange={updateTheme}
        onThemeReset={resetTheme}
      />

      <div className="sheet-scroll">
        <div className="invoice-sheet" ref={sheetRef} style={themeStyle}>
          <InvoiceHeader logo={data.logo} onLogoChange={(logo) => update({ logo })} />

          <div className="meta-row">
            <div className="meta-field meta-number">
              <span className="field-label">Invoice No.</span>
              <EditableValue
                className="field-input"
                value={data.invoiceNumber}
                placeholder="INV-001"
                onChange={(v) => update({ invoiceNumber: v })}
              />
            </div>
            <div className={`meta-field meta-date ${data.date.trim() === '' ? 'field--empty' : ''}`}>
              <span className="field-label">Date</span>
              <input
                className="field-input editor-only"
                type="date"
                value={data.date}
                onChange={(e) => update({ date: e.target.value })}
              />
              <span className="field-value export-only">{formatDate(data.date)}</span>
            </div>
          </div>

          <PartyBlock variant="from" value={data.from} onChange={updateFrom} />
          <PartyBlock variant="to" value={data.to} onChange={updateTo} />

          <ItemsTable
            items={data.items}
            onItemChange={handleItemChange}
            onAddRow={handleAddRow}
            onRemoveRow={handleRemoveRow}
          />

          <PaymentDetails value={data.payment} onChange={updatePayment} />
          <InvoiceFooter value={data.footer} onChange={updateFooter} />
        </div>
      </div>
    </div>
  );
}
