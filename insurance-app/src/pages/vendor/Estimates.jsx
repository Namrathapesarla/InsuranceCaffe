import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import useCurrency from '../../hooks/useCurrency';

const estimates = [
  { id: 1, claimNumber: 'CLM-2024-0001', vendor: 'AutoFix Garage', type: 'Motor Repair', estimatedCost: 95000, approvedCost: 88000, status: 'Approved', submittedDate: '2024-08-20' },
  { id: 2, claimNumber: 'CLM-2024-0003', vendor: 'AutoFix Garage', type: 'Total Loss Assessment', estimatedCost: 750000, approvedCost: 720000, status: 'Approved', submittedDate: '2024-07-25' },
  { id: 3, claimNumber: 'CLM-2024-0001', vendor: 'RK Surveyors & Associates', type: 'Damage Survey', estimatedCost: 15000, approvedCost: 15000, status: 'Approved', submittedDate: '2024-08-18' },
  { id: 4, claimNumber: 'CLM-2024-0008', vendor: 'RK Surveyors & Associates', type: 'Liability Assessment', estimatedCost: 25000, approvedCost: 0, status: 'Pending', submittedDate: '2024-10-25' },
  { id: 5, claimNumber: 'CLM-2024-0006', vendor: 'Premier Auto Works', type: 'Fire Damage Estimate', estimatedCost: 180000, approvedCost: 0, status: 'Under Review', submittedDate: '2024-11-13' },
];

export default function Estimates() {
  const { F, FL, symbol, locale } = useCurrency();

  const columns = [
    { header: 'Claim #', accessor: 'claimNumber', render: (r) => <span style={{ fontWeight: 600, color: '#f59e0b' }}>{r.claimNumber}</span> },
    { header: 'Vendor', accessor: 'vendor' },
    { header: 'Type', accessor: 'type' },
    { header: 'Estimated', accessor: 'estimatedCost', render: (r) => `${symbol}${r.estimatedCost.toLocaleString(locale)}` },
    { header: 'Approved', accessor: 'approvedCost', render: (r) => r.approvedCost ? `${symbol}${r.approvedCost.toLocaleString(locale)}` : '-' },
    { header: 'Variance', render: (r) => { const v = r.estimatedCost - r.approvedCost; return r.approvedCost ? <span style={{ color: v > 0 ? '#ef4444' : '#22c55e' }}>{symbol}{v.toLocaleString(locale)}</span> : '-'; }},
    { header: 'Submitted', accessor: 'submittedDate' },
    { header: 'Status', accessor: 'status', render: (r) => <span className={`badge ${r.status === 'Approved' ? 'badge-green' : r.status === 'Pending' ? 'badge-yellow' : 'badge-blue'}`}>{r.status}</span> },
  ];

  return (
    <div>
      <PageHeader title="Repair Estimates" subtitle="Vendor repair and survey cost estimates with approval tracking"
        breadcrumbs={[{ label: 'Vendor Network', path: '/vendor' }, { label: 'Estimates' }]} />
      <DataTable columns={columns} data={estimates} />
    </div>
  );
}
