import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import { invoices } from '../../data/sampleData';
import useCurrency from '../../hooks/useCurrency';

const payments = invoices.filter(i => i.paidAmount > 0).map((inv, idx) => ({
  id: idx + 1,
  receiptNo: `RCP-2024-${String(idx + 1).padStart(4, '0')}`,
  invoiceNumber: inv.invoiceNumber,
  partyName: inv.partyName,
  amount: inv.paidAmount,
  mode: inv.paymentMode,
  date: inv.billDate,
  utr: `UTR${Date.now() + idx}`.slice(0, 16),
  reconciled: idx < 5 ? 'Yes' : 'Pending',
}));

const baseColumns = [
  { header: 'Receipt #', accessor: 'receiptNo', render: (r) => <span style={{ fontWeight: 600, color: '#22c55e' }}>{r.receiptNo}</span> },
  { header: 'Invoice #', accessor: 'invoiceNumber' },
  { header: 'Customer', accessor: 'partyName' },
  { header: 'Amount', accessor: 'amount' },
  { header: 'Mode', accessor: 'mode', render: (r) => <span className="badge badge-blue">{r.mode}</span> },
  { header: 'Date', accessor: 'date' },
  { header: 'Reconciled', accessor: 'reconciled', render: (r) => <span className={`badge ${r.reconciled === 'Yes' ? 'badge-green' : 'badge-yellow'}`}>{r.reconciled}</span> },
];

export default function Payments() {
  const { F, FL, symbol, locale } = useCurrency();
  const columns = baseColumns.map(c =>
    c.accessor === 'amount' ? { ...c, render: (r) => `${symbol}${r.amount.toLocaleString(locale)}` } : c
  );
  return (
    <div>
      <PageHeader title="Payment Collection" subtitle="Payment receipts and bank reconciliation status"
        breadcrumbs={[{ label: 'Billing', path: '/billing' }, { label: 'Payments' }]} />
      <DataTable columns={columns} data={payments} />
    </div>
  );
}
