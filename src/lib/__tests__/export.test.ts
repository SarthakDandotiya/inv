import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const h2cMock = vi.fn();
const saveMock = vi.fn();
const addImageMock = vi.fn();
const addPageMock = vi.fn();

vi.mock('html2canvas', () => ({ default: (node: HTMLElement) => h2cMock(node) }));
vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    internal: { pageSize: { getWidth: () => 595, getHeight: () => 842 } },
    addImage: addImageMock,
    addPage: addPageMock,
    save: saveMock,
  })),
}));

import { EXPORT_MODE_CLASS, exportBasename, exportPDF, exportPNG } from '../export';

function fakeCanvas(width: number, height: number): HTMLCanvasElement {
  return {
    width,
    height,
    toDataURL: () => 'data:image/png;base64,AAAA',
  } as unknown as HTMLCanvasElement;
}

describe('exportBasename', () => {
  it('sanitizes the invoice number', () => {
    expect(exportBasename('INV/001 #2')).toBe('invoice-INV-001-2');
    expect(exportBasename('')).toBe('invoice');
    expect(exportBasename('   ')).toBe('invoice');
  });
});

describe('export capture', () => {
  let node: HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();
    node = document.createElement('div');
    document.body.appendChild(node);
    h2cMock.mockResolvedValue(fakeCanvas(800, 1000));
  });

  afterEach(() => {
    node.remove();
  });

  it('toggles export mode on during capture and removes it after (PNG)', async () => {
    let classDuringCapture = false;
    h2cMock.mockImplementation((n: HTMLElement) => {
      classDuringCapture = n.classList.contains(EXPORT_MODE_CLASS);
      return Promise.resolve(fakeCanvas(800, 1000));
    });

    await exportPNG(node, 'invoice.png');

    expect(classDuringCapture).toBe(true);
    expect(node.classList.contains(EXPORT_MODE_CLASS)).toBe(false);
  });

  it('removes export mode even if capture throws', async () => {
    h2cMock.mockRejectedValue(new Error('boom'));
    await expect(exportPNG(node)).rejects.toThrow('boom');
    expect(node.classList.contains(EXPORT_MODE_CLASS)).toBe(false);
  });

  it('paginates the PDF when content is taller than one page', async () => {
    // 800x2000 image scaled to 595 width => ~1487pt tall => 2 pages (842pt each).
    h2cMock.mockResolvedValue(fakeCanvas(800, 2000));
    await exportPDF(node, 'invoice.pdf');
    expect(addPageMock).toHaveBeenCalledTimes(1);
    expect(addImageMock).toHaveBeenCalledTimes(2);
    expect(saveMock).toHaveBeenCalledWith('invoice.pdf');
  });

  it('produces a single-page PDF for short content', async () => {
    h2cMock.mockResolvedValue(fakeCanvas(800, 1000));
    await exportPDF(node, 'invoice.pdf');
    expect(addPageMock).not.toHaveBeenCalled();
    expect(addImageMock).toHaveBeenCalledTimes(1);
  });
});
