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
        <input
          className="footer-input"
          type="text"
          inputMode="email"
          value={value.email}
          placeholder="you@example.com"
          onChange={(e) => onChange({ email: e.target.value })}
        />
      </div>
      <div className={`footer-item ${value.instagram.trim() === '' ? 'field--empty' : ''}`}>
        <span className="footer-label">Instagram</span>
        <input
          className="footer-input"
          type="text"
          value={value.instagram}
          placeholder="@handle"
          onChange={(e) => onChange({ instagram: e.target.value })}
        />
      </div>
    </footer>
  );
}
