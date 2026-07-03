import type { Theme } from '../lib/types';

type Props = {
  theme: Theme;
  onChange: (patch: Partial<Theme>) => void;
  onReset: () => void;
};

const FIELDS: { key: keyof Theme; label: string }[] = [
  { key: 'background', label: 'Background' },
  { key: 'text', label: 'Text' },
  { key: 'heading', label: 'Heading' },
  { key: 'bold', label: 'Bold text' },
  { key: 'line', label: 'Lines' },
  { key: 'label', label: 'Labels' },
  { key: 'tableHeadBg', label: 'Table header' },
];

/** Colour pickers for the invoice theme. Lives in the toolbar, never exported. */
export default function ThemeControls({ theme, onChange, onReset }: Props) {
  return (
    <details className="theme-controls">
      <summary>Colours</summary>
      <div className="theme-grid">
        {FIELDS.map((f) => (
          <label key={f.key} className="theme-swatch">
            <input
              type="color"
              value={theme[f.key]}
              aria-label={f.label}
              onChange={(e) => onChange({ [f.key]: e.target.value } as Partial<Theme>)}
            />
            <span>{f.label}</span>
          </label>
        ))}
        <button type="button" className="theme-reset" onClick={onReset}>
          Reset
        </button>
      </div>
    </details>
  );
}
