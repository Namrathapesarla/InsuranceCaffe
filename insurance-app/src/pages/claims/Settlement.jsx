import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import { claims } from '../../data/sampleData';
import useCurrency from '../../hooks/useCurrency';

const settled = claims.filter(c => ['Settled', 'Approved'].includes(c.status));

export default function Settlement() {
  const { symbol, locale } = useCurrency();

  const columns = [
    { header: 'Claim #', accessor: 'claimNumber', render: (r) => <span style={{ fontWeight: 600, color: '#f59e0b' }}>{r.claimNumber}</span> },
    { header: 'Policy #', accessor: 'policyNumber' },
    { header: 'Customer', accessor: 'partyName' },
    { header: 'LOB', accessor: 'lob', render: (r) => <span className="badge badge-blue">{r.lob}</span> },
    { header: 'Claim Amount', accessor: 'claimAmount', render: (r) => `${symbol}${r.claimAmount.toLocaleString(locale)}` },
    { header: 'Paid', accessor: 'paidAmount', render: (r) => <span style={{ fontWeight: 600, color: '#22c55e' }}>{symbol}{r.paidAmount.toLocaleString(locale)}</span> },
    { header: 'TAT (days)', render: (r) => { const d = Math.floor((new Date(r.fnolDate) - new Date(r.lossDate)) / 86400000) + Math.floor(Math.random() * 20) + 5; return <span style={{ color: d > 30 ? '#ef4444' : '#22c55e', fontWeight: 600 }}>{d}</span>; }},
    { header: 'Status', accessor: 'status', render: (r) => <span className="badge badge-green">{r.status}</span> },
  ];

  return (
    <div>
      <PageHeader title="Claim Settlement" subtitle="Settled and approved claims with payment details and TAT"
        breadcrumbs={[{ label: 'Claims', path: '/claims' }, { label: 'Settlement' }]} />
      <DataTable columns={columns} data={settled} />
    </div>
  );
}
