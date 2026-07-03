type Props = {
  onExportPNG: () => void;
  onExportPDF: () => void;
  onNewInvoice: () => void;
  busy: boolean;
};

/** Global actions. Lives outside the invoice sheet so it never appears in exports. */
export default function Toolbar({ onExportPNG, onExportPDF, onNewInvoice, busy }: Props) {
  return (
    <div className="toolbar">
      <div className="toolbar-title">Invoice Generator</div>
      <div className="toolbar-actions">
        <button type="button" onClick={onExportPDF} disabled={busy}>
          {busy ? 'Working…' : 'Export PDF'}
        </button>
        <button type="button" onClick={onExportPNG} disabled={busy}>
          Export PNG
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={onNewInvoice}
          disabled={busy}
        >
          New invoice
        </button>
      </div>
    </div>
  );
}
