import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';

// html2canvas/jspdf are exercised in e2e; keep component tests DOM-only.
vi.mock('../../lib/export', () => ({
  exportPNG: vi.fn().mockResolvedValue(undefined),
  exportPDF: vi.fn().mockResolvedValue(undefined),
  exportBasename: (n: string) => (n ? `invoice-${n}` : 'invoice'),
}));

import { exportPDF } from '../../lib/export';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('starts with three item rows', () => {
    render(<App />);
    expect(screen.getAllByPlaceholderText('Description')).toHaveLength(3);
  });

  it('adds and removes rows', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: '+ Add row' }));
    expect(screen.getAllByPlaceholderText('Description')).toHaveLength(4);

    const removeButtons = screen.getAllByRole('button', { name: 'Remove row' });
    await user.click(removeButtons[0]);
    expect(screen.getAllByPlaceholderText('Description')).toHaveLength(3);
  });

  it('updates the Total and amount-in-words live from the Price column', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    const prices = screen.getAllByPlaceholderText('0.00');
    await user.type(prices[0], '100');
    await user.type(prices[1], '250.50');

    const totalValue = container.querySelector('.total-value');
    expect(totalValue?.textContent).toBe('₹350.50');
    expect(
      screen.getByText(/Three Hundred Fifty Rupees and Fifty Paise Only/),
    ).toBeInTheDocument();
  });

  it('keeps input values as plain text (controlled)', async () => {
    const user = userEvent.setup();
    render(<App />);
    const num = screen.getByPlaceholderText('INV-001') as HTMLInputElement;
    await user.type(num, '<b>INV-9</b>');
    expect(num.value).toBe('<b>INV-9</b>');
  });

  it('edits footer fields', async () => {
    const user = userEvent.setup();
    render(<App />);
    const email = screen.getByPlaceholderText('you@example.com') as HTMLInputElement;
    await user.type(email, 'hi@acme.in');
    expect(email.value).toBe('hi@acme.in');

    const phone = screen.getByPlaceholderText('+91 98765 43210') as HTMLInputElement;
    await user.type(phone, '+91 98765 43210');
    expect(phone.value).toBe('+91 98765 43210');
  });

  it('clears the invoice on "New invoice" when confirmed', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<App />);

    const num = screen.getByPlaceholderText('INV-001') as HTMLInputElement;
    await user.type(num, 'INV-77');
    expect(num.value).toBe('INV-77');

    await user.click(screen.getByRole('button', { name: 'New invoice' }));
    expect((screen.getByPlaceholderText('INV-001') as HTMLInputElement).value).toBe('');
  });

  it('saves a template on export and prepopulates it on New invoice', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<App />);

    const names = screen.getAllByPlaceholderText('Name'); // [0] From, [1] To
    await user.type(names[0], 'Acme Studio');
    await user.type(names[1], 'Client Co');
    await user.type(screen.getByPlaceholderText('INV-001'), 'INV-1');
    await user.type(screen.getByPlaceholderText('you@example.com'), 'me@acme.in');

    await user.click(screen.getByRole('button', { name: 'Export PDF' }));
    await waitFor(() => expect(localStorage.getItem('inv.template.v1')).toBeTruthy());

    await user.click(screen.getByRole('button', { name: 'New invoice' }));

    const after = screen.getAllByPlaceholderText('Name');
    expect((after[0] as HTMLInputElement).value).toBe('Acme Studio'); // From kept
    expect((after[1] as HTMLInputElement).value).toBe(''); // To cleared
    expect((screen.getByPlaceholderText('INV-001') as HTMLInputElement).value).toBe(''); // number cleared
    expect((screen.getByPlaceholderText('you@example.com') as HTMLInputElement).value).toBe('me@acme.in'); // footer kept
  });

  it('triggers PDF export from the toolbar', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Export PDF' }));
    expect(exportPDF).toHaveBeenCalledTimes(1);
  });

  it('hides remove buttons when only one row remains', async () => {
    const user = userEvent.setup();
    render(<App />);
    const removeButtons = screen.getAllByRole('button', { name: 'Remove row' });
    // Remove down to a single row.
    await user.click(removeButtons[0]);
    await user.click(screen.getAllByRole('button', { name: 'Remove row' })[0]);
    expect(screen.queryByRole('button', { name: 'Remove row' })).toBeNull();
    expect(screen.getAllByPlaceholderText('Description')).toHaveLength(1);
  });

  it('applies a chosen heading colour to the invoice sheet', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    // Default heading colour.
    const sheet = container.querySelector('.invoice-sheet') as HTMLElement;
    expect(sheet.style.getPropertyValue('--heading')).toBe('#21212b');

    await user.click(screen.getByText('Colours'));
    const headingPicker = screen.getByLabelText('Heading') as HTMLInputElement;
    fireEvent.change(headingPicker, { target: { value: '#ff0000' } });

    expect(sheet.style.getPropertyValue('--heading')).toBe('#ff0000');
  });

  it('exposes the Labels and Table accent pickers and applies them', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    const sheet = container.querySelector('.invoice-sheet') as HTMLElement;
    expect(sheet.style.getPropertyValue('--label')).toBe('#6b7280');
    expect(sheet.style.getPropertyValue('--table-accent')).toBe('#f3f4f6');

    await user.click(screen.getByText('Colours'));
    fireEvent.change(screen.getByLabelText('Labels'), { target: { value: '#112233' } });
    fireEvent.change(screen.getByLabelText('Table accent'), { target: { value: '#445566' } });

    expect(sheet.style.getPropertyValue('--label')).toBe('#112233');
    expect(sheet.style.getPropertyValue('--table-accent')).toBe('#445566');
  });

  it('no longer exposes a Bold text picker', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText('Colours'));
    expect(screen.queryByLabelText('Bold text')).toBeNull();
  });

  it('renders the Total inside the items table footer', () => {
    const { container } = render(<App />);
    const tfoot = container.querySelector('.items-table tfoot');
    expect(tfoot).toBeTruthy();
    expect(within(tfoot as HTMLElement).getByText('Total')).toBeInTheDocument();
  });
});
