import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import { vendors } from '../../data/sampleData';

const columns = [
  { header: 'Vendor Name', accessor: 'name', render: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> },
  { header: 'Type', accessor: 'type', render: (r) => <span className={`badge ${r.type === 'Garage' ? 'badge-blue' : r.type === 'TPA' ? 'badge-purple' : 'badge-orange'}`}>{r.type}</span> },
  { header: 'City', accessor: 'city' },
  { header: 'State', accessor: 'state' },
  { header: 'Status', accessor: 'empanelmentStatus', render: (r) => <span className={`badge ${r.empanelmentStatus === 'Active' ? 'badge-green' : 'badge-red'}`}>{r.empanelmentStatus}</span> },
  { header: 'Rating', accessor: 'rating', render: (r) => <span style={{ fontWeight: 600 }}>{'★'.repeat(Math.floor(r.rating))} {r.rating}</span> },
  { header: 'Claims Handled', accessor: 'claimsHandled' },
  { header: 'Avg TAT (days)', accessor: 'avgTAT', render: (r) => <span style={{ color: r.avgTAT > 4 ? '#ef4444' : '#22c55e', fontWeight: 600 }}>{r.avgTAT}</span> },
  { header: 'SLA %', accessor: 'slaCompliance', render: (r) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div className="progress-bar" style={{ width: 50 }}><div className="progress-fill" style={{ width: `${r.slaCompliance}%`, background: r.slaCompliance >= 90 ? '#22c55e' : r.slaCompliance >= 80 ? '#f59e0b' : '#ef4444' }} /></div>
      <span style={{ fontSize: '0.75rem' }}>{r.slaCompliance}%</span>
    </div>
  )},
];

export default function VendorList() {
  return (
    <div>
      <PageHeader title="All Vendors" subtitle="Empaneled garages, surveyors, and TPAs with performance tracking"
        breadcrumbs={[{ label: 'Vendor Network', path: '/vendor' }, { label: 'All Vendors' }]} />
      <DataTable columns={columns} data={vendors} />
    </div>
  );
}
