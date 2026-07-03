import { test, expect } from '@playwright/test';

// 1x1 transparent PNG.
const PNG_1x1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

// Each test runs in an isolated browser context, so localStorage starts empty.
test.beforeEach(async ({ page }) => {
  await page.goto('/inv/');
});

test('shows a loader in the initial HTML and replaces it once rendered', async ({ request, page }) => {
  // The static HTML ships the loader so it paints before JS runs.
  const html = await (await request.get('/inv/')).text();
  expect(html).toContain('id="app-loader"');

  // After the app mounts (fonts ready or timed out), the loader is gone.
  await expect(page.locator('#app-loader')).toHaveCount(0);
  await expect(page.locator('.invoice-sheet')).toBeVisible();
});

test('renders the invoice with default rows', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Invoice', exact: true })).toBeVisible();
  await expect(page.getByPlaceholder('Description')).toHaveCount(3);
});

test('adds and removes item rows', async ({ page }) => {
  await page.getByRole('button', { name: '+ Add row' }).click();
  await expect(page.getByPlaceholder('Description')).toHaveCount(4);
  await page.getByRole('button', { name: 'Remove row' }).first().click();
  await expect(page.getByPlaceholder('Description')).toHaveCount(3);
});

test('computes Total and amount in words from the Price column', async ({ page }) => {
  const prices = page.getByPlaceholder('0.00');
  await prices.nth(0).fill('100');
  await prices.nth(1).fill('250.50');

  await expect(page.locator('.total-value')).toHaveText('₹350.50');
  await expect(page.locator('.words-row')).toContainText(
    'Indian Rupees Three Hundred Fifty and Fifty Paise Only',
  );
});

test('persists data across reload (localStorage)', async ({ page }) => {
  await page.getByPlaceholder('INV-001').fill('INV-2026-01');
  // allow debounced autosave to flush
  await page.waitForTimeout(500);
  await page.reload();
  await expect(page.getByPlaceholder('INV-001')).toHaveValue('INV-2026-01');
});

test('uploads and removes a logo', async ({ page }) => {
  await page.locator('input[type="file"]').setInputFiles({
    name: 'logo.png',
    mimeType: 'image/png',
    buffer: PNG_1x1,
  });
  await expect(page.locator('.logo-img')).toBeVisible();
  await page.getByRole('button', { name: 'Remove logo' }).click();
  await expect(page.locator('.logo-img')).toHaveCount(0);
});

test('export mode hides all editing chrome and swaps inputs for text', async ({ page }) => {
  await page.getByRole('button', { name: '+ Add row' }).click();
  await page.getByPlaceholder('INV-001').fill('INV-77');
  // Simulate the state used during capture.
  await page.evaluate(() => document.querySelector('.invoice-sheet')?.classList.add('exporting'));

  await expect(page.getByRole('button', { name: '+ Add row' })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Remove row' }).first()).toBeHidden();
  // An untouched empty field should not render in export mode.
  await expect(page.locator('.party-to .field--empty').first()).toBeHidden();
  // Inputs are hidden; their plain-text mirrors are shown (html2canvas-safe).
  await expect(page.getByPlaceholder('INV-001')).toBeHidden();
  await expect(page.locator('.meta-number .print-value')).toHaveText('INV-77');
  await expect(page.locator('.meta-number .print-value')).toBeVisible();

  await page.evaluate(() => document.querySelector('.invoice-sheet')?.classList.remove('exporting'));
  await expect(page.getByRole('button', { name: '+ Add row' })).toBeVisible();
  await expect(page.getByPlaceholder('INV-001')).toBeVisible();
});

test('changes theme colours and persists them', async ({ page }) => {
  const sheet = page.locator('.invoice-sheet');
  await expect(sheet).toHaveCSS('--heading', '#21212b');

  // Use the native value setter so React's controlled-input tracker registers the change.
  const setColor = (label: string, value: string) =>
    page.getByLabel(label).evaluate((el, v) => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      setter.call(el, v);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, value);

  await page.getByText('Colours').click();
  await setColor('Background', '#fff8e1');
  await setColor('Heading', '#7b1fa2');

  await expect(sheet).toHaveCSS('--sheet-bg', '#fff8e1');
  await expect(sheet).toHaveCSS('--heading', '#7b1fa2');

  await page.waitForTimeout(500);
  await page.reload();
  await expect(page.locator('.invoice-sheet')).toHaveCSS('--heading', '#7b1fa2');
});

test('exports a PDF download', async ({ page }) => {
  await page.getByPlaceholder('INV-001').fill('INV-9');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PDF' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('invoice-INV-9.pdf');
});

test('exports a PNG download', async ({ page }) => {
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PNG' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('invoice.png');
});
