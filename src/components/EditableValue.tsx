import AutoTextarea from './AutoTextarea';

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Base style class shared by the input and its export mirror. */
  className?: string;
  /** Extra class(es) for both input and mirror (e.g. 'desc-input', 'price-input'). */
  extraClassName?: string;
  multiline?: boolean;
  resizable?: boolean;
  inputMode?: 'text' | 'email' | 'numeric' | 'decimal' | 'tel';
};

/**
 * Renders an editable control for on-screen editing plus a plain-text mirror
 * shown only during export. html2canvas rasterises <input>/<textarea> text
 * unreliably (it clips descenders, especially on mobile), so exports use the
 * span instead — which renders as crisp, unclipped text.
 */
export default function EditableValue({
  value,
  onChange,
  placeholder,
  className = 'field-input',
  extraClassName = '',
  multiline = false,
  resizable = false,
  inputMode = 'text',
}: Props) {
  const base = `${className} ${extraClassName}`.trim();
  return (
    <>
      {multiline ? (
        <AutoTextarea
          className={`${base} editor-only`}
          value={value}
          resizable={resizable}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className={`${base} editor-only`}
          type="text"
          inputMode={inputMode}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      <span className={`${base} print-value ${multiline ? 'multiline' : ''}`.trim()} aria-hidden="true">
        {value}
      </span>
    </>
  );
}
