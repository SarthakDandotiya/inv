import EditableValue from './EditableValue';
import type { Footer } from '../lib/types';

type Props = {
  value: Footer;
  onChange: (patch: Partial<Footer>) => void;
};

/**
 * Footer with email and Instagram handle. Each item is hidden in export mode
 * when empty so no orphan icon/label is captured.
 */
export default function InvoiceFooter({ value, onChange }: Props) {
  return (
    <footer className="invoice-footer">
      <div className={`footer-item ${value.email.trim() === '' ? 'field--empty' : ''}`}>
        <span className="footer-label">Email</span>
        <EditableValue
          className="footer-input"
          value={value.email}
          inputMode="email"
          placeholder="you@example.com"
          onChange={(v) => onChange({ email: v })}
        />
      </div>
      <div className={`footer-item ${value.instagram.trim() === '' ? 'field--empty' : ''}`}>
        <span className="footer-label">Instagram</span>
        <EditableValue
          className="footer-input"
          value={value.instagram}
          placeholder="@handle"
          onChange={(v) => onChange({ instagram: v })}
        />
      </div>
    </footer>
  );
}
