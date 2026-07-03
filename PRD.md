# Invoice Generator — Product Requirements

A simple but powerful, fully client-side invoice generator. Everything runs in the
browser; there is no backend. It is designed to produce a clean, single-A4-page
invoice and export it as PDF or PNG.

## Goals

- Capture **From** (issuer) and **To** (recipient) details.
- Numbered and dated invoices.
- An **Items** table with three columns: **Description (50%)**, **Quantity (20%)**,
  **Price (30%)**.
- Add/remove rows; the description box is resizable (which grows the row height).
- Everything in **INR (₹)**.
- Auto-calculated **Total** at the bottom of the Price column.
- **Amount in words** (Indian numbering system) below the total.
- Optional **logo** in the top-right.
- **Clean export** to PDF and image — only the invoice, with no editing chrome,
  placeholders, or browser-injected headers/footers.
- Fits **one A4 page** with 3–4 default-height rows.

## Section order

1. `Invoice` heading (top-left) with the logo (top-right).
2. Invoice Number (left) and Date (right) on one line.
3. **From** (no heading): Name, Address, PAN, GSTIN.
4. **To**: Name, Address, GSTIN.
5. **Items** table: Description / Quantity / Price, with the numeric **Total**
   inside the table, followed by the **amount in words**.
6. **Payment Details**: Beneficiary Name, Bank Name, Bank Account Number, IFSC Code.
7. **Footer**: email address and Instagram handle.

The **Total** is the sum of the Price column (Quantity is a descriptive field and
does not multiply into the total).

## Tech

- **React + Vite + TypeScript**, static build deployed to **GitHub Pages**.
- Export via **html2canvas** (PNG) and **jsPDF** (A4 PDF), bundled — no CDN.
- Editable fields are controlled `<input>`/`<textarea>` (never `contenteditable`),
  so values stay plain text and no markup can be injected into the export.
- State autosaves to **localStorage**; a **New invoice** button clears it.

## Export & edge cases handled

- Export mode strips all editing chrome (buttons, resize grips, borders, empty
  fields, placeholders) so only the finished document is captured.
- Hex/RGB colours only (avoids html2canvas failures and old-Safari gaps with
  `oklch`/`lab`).
- Fonts awaited (`document.fonts.ready`) before capture.
- Logo is a same-origin data URL (no tainted-canvas), downscaled to stay within the
  localStorage quota, aspect-ratio preserved.
- Date is rendered as clean text in export (no native date-picker control).
- PDF paginates when content exceeds one A4 page; PNG is a single high-DPI image.

## Safari / WebKit

Conservative CSS, canvas kept within WebKit limits, font timing handled, native
date input. Validated in CI with Playwright's WebKit engine.

## Testing

- **Unit** (Vitest): currency formatting, Indian amount-in-words, storage
  load/save/migration, total math.
- **Component** (Vitest + React Testing Library): rows, live totals/words, footer,
  export trigger, controlled inputs.
- **E2E** (Playwright, Chromium + Firefox + WebKit): full flow, logo upload,
  PDF/PNG download, and export-mode cleanliness.

## Out of scope (v1)

Multiple templates/themes, GST/tax line breakup, multi-currency, saved invoice
history, backend storage, authentication.
