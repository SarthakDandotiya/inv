import Field from './Field';
import type { Payment } from '../lib/types';

type Props = {
  value: Payment;
  onChange: (patch: Partial<Payment>) => void;
};

export default function PaymentDetails({ value, onChange }: Props) {
  return (
    <section className="payment">
      <h2 className="section-heading">Payment Details</h2>
      <Field label="Beneficiary Name" value={value.beneficiaryName} onChange={(v) => onChange({ beneficiaryName: v })} />
      <Field label="Bank Name" value={value.bankName} onChange={(v) => onChange({ bankName: v })} />
      <Field label="Bank Account Number" value={value.accountNumber} onChange={(v) => onChange({ accountNumber: v })} />
      <Field label="IFSC Code" value={value.ifsc} onChange={(v) => onChange({ ifsc: v })} />
    </section>
  );
}
