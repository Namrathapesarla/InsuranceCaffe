import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import useCurrency from '../../hooks/useCurrency';

const endorsements = [
  { id: 1, endorsementNo: 'END-2024-001', policyNumber: 'POL-2024-000006', type: 'Addition', description: '50 employees added to group policy', effectiveDate: '2024-06-20', premiumImpact: 425000, status: 'Processed' },
  { id: 2, endorsementNo: 'END-2024-002', policyNumber: 'POL-2024-000001', type: 'Address Change', description: 'Garaging location updated to Thane', effectiveDate: '2024-07-15', premiumImpact: 1200, status: 'Processed' },
  { id: 3, endorsementNo: 'END-2024-003', policyNumber: 'POL-2024-000003', type: 'Vehicle Addition', description: '5 new fleet vehicles added', effectiveDate: '2024-08-01', premiumImpact: 125000, status: 'Processed' },
  { id: 4, endorsementNo: 'END-2024-004', policyNumber: 'POL-2024-000005', type: 'Sum Insured Increase', description: 'SI increased from 5L to 7.5L', effectiveDate: '2024-09-10', premiumImpact: 3500, status: 'Pending' },
  { id: 5, endorsementNo: 'END-2024-005', policyNumber: 'POL-2024-000010', type: 'Coverage Extension', description: 'Professional indemnity rider added', effectiveDate: '2024-10-01', premiumImpact: 85000, status: 'Pending' },
];

export default function Endorsements() {
  const { symbol, locale } = useCurrency();

  const columns = [
    { header: 'Endorsement #', accessor: 'endorsementNo', render: (r) => <span style={{ fontWeight: 600, color: '#8b5cf6' }}>{r.endorsementNo}</span> },
    { header: 'Policy #', accessor: 'policyNumber', render: (r) => <span style={{ color: '#3b82f6' }}>{r.policyNumber}</span> },
    { header: 'Type', accessor: 'type', render: (r) => <span className="badge badge-blue">{r.type}</span> },
    { header: 'Description', accessor: 'description' },
    { header: 'Effective Date', accessor: 'effectiveDate' },
    { header: 'Premium Impact', accessor: 'premiumImpact', render: (r) => <span style={{ color: r.premiumImpact > 0 ? '#22c55e' : '#ef4444' }}>+{symbol}{r.premiumImpact.toLocaleString(locale)}</span> },
    { header: 'Status', accessor: 'status', render: (r) => <span className={`badge ${r.status === 'Processed' ? 'badge-green' : 'badge-yellow'}`}>{r.status}</span> },
  ];

  return (
    <div>
      <PageHeader title="Policy Endorsements" subtitle="Mid-term policy changes, additions, and modifications"
        breadcrumbs={[{ label: 'Policy Admin', path: '/policy' }, { label: 'Endorsements' }]} />
      <DataTable columns={columns} data={endorsements} />
    </div>
  );
}
