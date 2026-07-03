import AutoTextarea from './AutoTextarea';
import { computeTotal, formatINR } from '../lib/currency';
import { numberToIndianWords } from '../lib/numberToWords';
import type { Item } from '../lib/types';

type Props = {
  items: Item[];
  onItemChange: (id: string, patch: Partial<Omit<Item, 'id'>>) => void;
  onAddRow: () => void;
  onRemoveRow: (id: string) => void;
};

export default function ItemsTable({ items, onItemChange, onAddRow, onRemoveRow }: Props) {
  const total = computeTotal(items);

  return (
    <section className="items">
      <table className="items-table">
        <colgroup>
          <col className="col-desc" />
          <col className="col-qty" />
          <col className="col-price" />
        </colgroup>
        <thead>
          <tr>
            <th>Description</th>
            <th>Quantity</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td className="cell-desc">
                {items.length > 1 && (
                  <button
                    type="button"
                    className="row-remove editor-only"
                    onClick={() => onRemoveRow(item.id)}
                    aria-label="Remove row"
                    title="Remove row"
                  >
                    ×
                  </button>
                )}
                <AutoTextarea
                  className="cell-input desc-input"
                  value={item.description}
                  resizable
                  placeholder="Description"
                  onChange={(e) => onItemChange(item.id, { description: e.target.value })}
                />
              </td>
              <td className="cell-qty">
                <input
                  className="cell-input"
                  type="text"
                  inputMode="decimal"
                  value={item.quantity}
                  placeholder="0"
                  onChange={(e) => onItemChange(item.id, { quantity: e.target.value })}
                />
              </td>
              <td className="cell-price">
                <input
                  className="cell-input price-input"
                  type="text"
                  inputMode="decimal"
                  value={item.price}
                  placeholder="0.00"
                  onChange={(e) => onItemChange(item.id, { price: e.target.value })}
                />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="total-row">
            <td className="total-label" colSpan={2}>
              Total
            </td>
            <td className="total-value">{formatINR(total)}</td>
          </tr>
          <tr className="words-row">
            <td colSpan={3}>
              <span className="words-label">Amount in words:</span> {numberToIndianWords(total)}
            </td>
          </tr>
        </tfoot>
      </table>
      <button type="button" className="add-row editor-only" onClick={onAddRow}>
        + Add row
      </button>
    </section>
  );
}
