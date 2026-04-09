import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import useCurrency from '../../hooks/useCurrency';

const installments = [
  { id: 1, policyNumber: 'POL-2024-000005', partyName: 'Sunita Devi', totalPremium: 12000, installments: 4, paidCount: 2, nextDue: '2024-11-10', nextAmount: 3000, status: 'On Track' },
  { id: 2, policyNumber: 'POL-2024-000009', partyName: 'Deepak Singh', totalPremium: 5500, installments: 2, paidCount: 1, nextDue: '2024-12-15', nextAmount: 2750, status: 'On Track' },
  { id: 3, policyNumber: 'POL-2024-000004', partyName: 'Amit Patel', totalPremium: 35000, installments: 4, paidCount: 0, nextDue: '2024-07-31', nextAmount: 8750, status: 'Overdue' },
  { id: 4, policyNumber: 'POL-2024-000011', partyName: 'Rajesh Kumar Sharma', totalPremium: 14000, installments: 2, paidCount: 1, nextDue: '2024-09-01', nextAmount: 7000, status: 'On Track' },
];

const baseColumns = [
  { header: 'Policy #', accessor: 'policyNumber', render: (r) => <span style={{ fontWeight: 600, color: '#3b82f6' }}>{r.policyNumber}</span> },
  { header: 'Customer', accessor: 'partyName' },
  { header: 'Total Premium', accessor: 'totalPremium' },
  { header: 'Plan', render: (r) => `${r.paidCount} / ${r.installments} paid` },
  { header: 'Progress', render: (r) => (
    <div className="progress-bar" style={{ width: 80 }}>
      <div className="progress-fill" style={{ width: `${(r.paidCount / r.installments) * 100}%`, background: '#3b82f6' }} />
    </div>
  )},
  { header: 'Next Due', accessor: 'nextDue' },
  { header: 'Next Amount', accessor: 'nextAmount' },
  { header: 'Status', accessor: 'status', render: (r) => <span className={`badge ${r.status === 'On Track' ? 'badge-green' : 'badge-red'}`}>{r.status}</span> },
];

export default function Installments() {
  const { F, FL, symbol, locale } = useCurrency();
  const columns = baseColumns.map(c =>
    c.accessor === 'totalPremium' ? { ...c, render: (r) => `${symbol}${r.totalPremium.toLocaleString(locale)}` } :
    c.accessor === 'nextAmount' ? { ...c, render: (r) => `${symbol}${r.nextAmount.toLocaleString(locale)}` } : c
  );
  return (
    <div>
      <PageHeader title="Installment Plans" subtitle="Active installment schedules and payment tracking"
        breadcrumbs={[{ label: 'Billing', path: '/billing' }, { label: 'Installments' }]} />
      <DataTable columns={columns} data={installments} />
    </div>
  );
}
