import { beforeEach, describe, expect, it } from 'vitest';
import { STORAGE_KEY, clearInvoice, loadInvoice, normalizeInvoice, saveInvoice } from '../storage';
import { SCHEMA_VERSION, createEmptyInvoice } from '../types';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns a blank invoice when nothing is stored', () => {
    const inv = loadInvoice();
    expect(inv.version).toBe(SCHEMA_VERSION);
    expect(inv.items.length).toBeGreaterThan(0);
    expect(inv.invoiceNumber).toBe('');
  });

  it('round-trips a saved invoice', () => {
    const inv = createEmptyInvoice();
    inv.invoiceNumber = 'INV-42';
    inv.from.name = 'Acme';
    inv.items = [{ id: 'x', description: 'Work', quantity: '2', price: '500' }];
    expect(saveInvoice(inv)).toBe(true);

    const loaded = loadInvoice();
    expect(loaded.invoiceNumber).toBe('INV-42');
    expect(loaded.from.name).toBe('Acme');
    expect(loaded.items[0].price).toBe('500');
  });

  it('falls back to blank on corrupt JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json');
    const inv = loadInvoice();
    expect(inv.invoiceNumber).toBe('');
    expect(inv.items.length).toBeGreaterThan(0);
  });

  it('normalizes partial/old data and fills defaults', () => {
    const inv = normalizeInvoice({ invoiceNumber: 'A1', from: { name: 'Only Name' } });
    expect(inv.invoiceNumber).toBe('A1');
    expect(inv.from.name).toBe('Only Name');
    expect(inv.from.pan).toBe('');
    expect(inv.to.name).toBe('');
    expect(inv.version).toBe(SCHEMA_VERSION);
    expect(inv.items.length).toBeGreaterThan(0);
  });

  it('fills default theme colours when missing', () => {
    const inv = normalizeInvoice({ invoiceNumber: 'A1' });
    expect(inv.theme.heading).toBe('#21212b');
    expect(inv.theme.background).toBe('#ffffff');
    expect(inv.theme.label).toBe('#6b7280');
    expect(inv.theme.tableHeadBg).toBe('#f3f4f6');
  });

  it('keeps valid theme colours and rejects invalid ones', () => {
    const inv = normalizeInvoice({ theme: { heading: '#abc', background: 'red; evil', text: '#123456' } });
    expect(inv.theme.heading).toBe('#abc'); // valid short hex kept
    expect(inv.theme.text).toBe('#123456');
    expect(inv.theme.background).toBe('#ffffff'); // invalid -> default
  });

  it('gives items an id when missing', () => {
    const inv = normalizeInvoice({ items: [{ description: 'no id', quantity: '1', price: '10' }] });
    expect(inv.items[0].id).toBeTruthy();
    expect(inv.items[0].description).toBe('no id');
  });

  it('clears stored data', () => {
    saveInvoice(createEmptyInvoice());
    clearInvoice();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
