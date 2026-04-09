import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { policies } from '../../data/sampleData';
import useCurrency from '../../hooks/useCurrency';

const renewals = policies.filter(p => p.status === 'Active').map((p, i) => ({
  ...p,
  renewalDue: p.expiryDate,
  daysToExpiry: Math.max(0, Math.floor((new Date(p.expiryDate) - new Date()) / 86400000)),
  renewalStatus: i < 3 ? 'Renewed' : i < 5 ? 'Notice Sent' : i < 7 ? 'Pending' : 'At Risk',
  proposedPremium: Math.round(p.grossPremium * (1 + (Math.random() * 0.1 - 0.02))),
}));

export default function Renewals() {
  const { symbol, locale } = useCurrency();

  const columns = [
    { header: 'Policy #', accessor: 'policyNumber', render: (r) => <span style={{ fontWeight: 600, color: '#3b82f6' }}>{r.policyNumber}</span> },
    { header: 'Customer', accessor: 'partyName' },
    { header: 'LOB', accessor: 'lob', render: (r) => <span className="badge badge-blue">{r.lob}</span> },
    { header: 'Expiry Date', accessor: 'expiryDate' },
    { header: 'Days to Expiry', accessor: 'daysToExpiry', render: (r) => <span style={{ color: r.daysToExpiry < 30 ? '#ef4444' : r.daysToExpiry < 90 ? '#f59e0b' : '#22c55e', fontWeight: 600 }}>{r.daysToExpiry}</span> },
    { header: 'Current Premium', accessor: 'grossPremium', render: (r) => `${symbol}${r.grossPremium.toLocaleString(locale)}` },
    { header: 'Proposed Premium', accessor: 'proposedPremium', render: (r) => `${symbol}${r.proposedPremium.toLocaleString(locale)}` },
    { header: 'Renewal Status', accessor: 'renewalStatus', render: (r) => <span className={`badge ${r.renewalStatus === 'Renewed' ? 'badge-green' : r.renewalStatus === 'Notice Sent' ? 'badge-blue' : r.renewalStatus === 'At Risk' ? 'badge-red' : 'badge-yellow'}`}>{r.renewalStatus}</span> },
  ];

  return (
    <div>
      <PageHeader title="Renewals" subtitle="Policy renewal pipeline — 30 to 90 day pre-expiry tracking"
        breadcrumbs={[{ label: 'Policy Admin', path: '/policy' }, { label: 'Renewals' }]} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard icon={RefreshCw} label="Due for Renewal" value={renewals.length} color="#3b82f6" />
        <StatCard icon={CheckCircle} label="Renewed" value={renewals.filter(r => r.renewalStatus === 'Renewed').length} color="#22c55e" />
        <StatCard icon={AlertTriangle} label="Notice Sent" value={renewals.filter(r => r.renewalStatus === 'Notice Sent').length} color="#f59e0b" />
        <StatCard icon={XCircle} label="At Risk" value={renewals.filter(r => r.renewalStatus === 'At Risk').length} color="#ef4444" />
      </div>
      <DataTable columns={columns} data={renewals} />
    </div>
  );
}
