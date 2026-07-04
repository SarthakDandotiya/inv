import { useRef } from 'react';

type Props = {
  logo: string | null;
  onLogoChange: (dataUrl: string | null) => void;
};

// Guard against images that would blow past the localStorage quota.
const MAX_LOGO_BYTES = 1_500_000;
const MAX_LOGO_DIMENSION = 400;

/** Downscale a logo so it fits within MAX_LOGO_DIMENSION and stays small enough to persist. */
function processLogo(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the image file.'));
    reader.onload = () => {
      const src = String(reader.result);
      const img = new Image();
      img.onerror = () => reject(new Error('That file is not a valid image.'));
      img.onload = () => {
        const scale = Math.min(1, MAX_LOGO_DIMENSION / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        // PNG preserves transparency; fall back to the original if it somehow grows.
        const out = canvas.toDataURL('image/png');
        resolve(out.length < src.length || out.length < MAX_LOGO_BYTES ? out : src);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

export default function InvoiceHeader({ logo, onLogoChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const dataUrl = await processLogo(file);
      onLogoChange(dataUrl);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not load the logo.');
    }
  };

  return (
    <header className={`invoice-header ${logo ? 'has-logo' : ''}`.trim()}>
      <h1 className="invoice-title">Invoice</h1>
      <div className="logo-area">
        {logo ? (
          <div className="logo-wrap">
            <img className="logo-img" src={logo} alt="Logo" />
            <button
              type="button"
              className="logo-remove editor-only"
              onClick={() => onLogoChange(null)}
              aria-label="Remove logo"
            >
              ×
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="logo-placeholder editor-only"
            onClick={() => fileRef.current?.click()}
          >
            + Add logo
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="visually-hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>
    </header>
  );
}
