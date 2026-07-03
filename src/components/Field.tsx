import AutoTextarea from './AutoTextarea';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  inputMode?: 'text' | 'email' | 'numeric';
  className?: string;
  /** Hide the label text (used for prominent fields like Name/Address). */
  hideLabel?: boolean;
};

/**
 * A labelled editable field styled to read like part of a printed document.
 * Empty fields are hidden in export mode so no dangling labels appear.
 */
export default function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  inputMode = 'text',
  className = '',
  hideLabel = false,
}: Props) {
  const empty = value.trim() === '';
  return (
    <div className={`field ${empty ? 'field--empty' : ''} ${className}`.trim()}>
      {!hideLabel && <span className="field-label">{label}</span>}
      {multiline ? (
        <AutoTextarea
          className="field-input"
          value={value}
          placeholder={placeholder ?? label}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="field-input"
          type="text"
          inputMode={inputMode}
          value={value}
          placeholder={placeholder ?? label}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
