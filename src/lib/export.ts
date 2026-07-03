import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/** CSS class that hides all editing chrome so only the finished document renders. */
export const EXPORT_MODE_CLASS = 'exporting';

function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

async function captureCanvas(node: HTMLElement): Promise<HTMLCanvasElement> {
  // Ensure web fonts are ready so the capture doesn't fall back to blank glyphs
  // (notably a WebKit/Safari timing issue).
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // fonts.ready can reject in rare cases; capture anyway.
    }
  }
  return html2canvas(node, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
  });
}

function triggerDownload(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Run a capture with export mode enabled, guaranteeing the class is removed
 * afterwards even if capture throws.
 */
async function withExportMode<T>(node: HTMLElement, fn: (node: HTMLElement) => Promise<T>): Promise<T> {
  node.classList.add(EXPORT_MODE_CLASS);
  try {
    await nextFrame();
    return await fn(node);
  } finally {
    node.classList.remove(EXPORT_MODE_CLASS);
  }
}

export async function exportPNG(node: HTMLElement, filename = 'invoice.png'): Promise<void> {
  await withExportMode(node, async (n) => {
    const canvas = await captureCanvas(n);
    triggerDownload(canvas.toDataURL('image/png'), filename);
  });
}

export async function exportPDF(node: HTMLElement, filename = 'invoice.pdf'): Promise<void> {
  await withExportMode(node, async (n) => {
    const canvas = await captureCanvas(n);
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Draw the full image on page one. Only spill onto further pages when the
    // overflow is real content — a small overflow (sub-pixel rounding or the
    // sheet's bottom whitespace) is clipped rather than pushed to a blank page.
    const OVERFLOW_TOLERANCE = 24; // pt (~8mm)
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    let heightLeft = imgHeight - pageHeight;
    let position = 0;
    while (heightLeft > OVERFLOW_TOLERANCE) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    pdf.save(filename);
  });
}

/** Build a safe file basename from the invoice number. */
export function exportBasename(invoiceNumber: string): string {
  const cleaned = (invoiceNumber || '').trim().replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/^-+|-+$/g, '');
  return cleaned ? `invoice-${cleaned}` : 'invoice';
}
