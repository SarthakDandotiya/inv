import Field from './Field';
import type { FromParty, Party } from '../lib/types';

type FromProps = {
  variant: 'from';
  value: FromParty;
  onChange: (patch: Partial<FromParty>) => void;
};

type ToProps = {
  variant: 'to';
  value: Party;
  onChange: (patch: Partial<Party>) => void;
};

type Props = FromProps | ToProps;

/**
 * Renders the "From" block (no heading, with PAN) or the "To" block
 * (heading, no PAN). Both share Name / Address / GSTIN.
 */
export default function PartyBlock(props: Props) {
  if (props.variant === 'from') {
    const { value, onChange } = props;
    return (
      <section className="party party-from">
        <Field label="Name" value={value.name} onChange={(v) => onChange({ name: v })} className="party-name" hideLabel />
        <Field label="Address" value={value.address} onChange={(v) => onChange({ address: v })} multiline hideLabel />
        <Field label="PAN" value={value.pan} onChange={(v) => onChange({ pan: v })} />
        <Field label="GSTIN" value={value.gstin} onChange={(v) => onChange({ gstin: v })} />
      </section>
    );
  }

  const { value, onChange } = props;
  return (
    <section className="party party-to">
      <h2 className="section-heading">To</h2>
      <Field label="Name" value={value.name} onChange={(v) => onChange({ name: v })} className="party-name" hideLabel />
      <Field label="Address" value={value.address} onChange={(v) => onChange({ address: v })} multiline hideLabel />
      <Field label="GSTIN" value={value.gstin} onChange={(v) => onChange({ gstin: v })} />
    </section>
  );
}
