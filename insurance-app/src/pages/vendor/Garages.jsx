import PageHeader from '../../components/PageHeader';
import { vendors } from '../../data/sampleData';

const garages = vendors.filter(v => v.type === 'Garage');

export default function Garages() {
  return (
    <div>
      <PageHeader title="Garage Network" subtitle="Authorized motor repair garages"
        breadcrumbs={[{ label: 'Vendor Network', path: '/vendor' }, { label: 'Garages' }]} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        {garages.map((g) => (
          <div key={g.id} className="card">
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{g.name}</span>
                <span className={`badge ${g.empanelmentStatus === 'Active' ? 'badge-green' : 'badge-red'}`}>{g.empanelmentStatus}</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.75rem' }}>{g.city}, {g.state}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                <div><span style={{ color: '#94a3b8' }}>Rating:</span> <span style={{ fontWeight: 600 }}>{'★'.repeat(Math.floor(g.rating))} {g.rating}</span></div>
                <div><span style={{ color: '#94a3b8' }}>Claims:</span> <span style={{ fontWeight: 600 }}>{g.claimsHandled}</span></div>
                <div><span style={{ color: '#94a3b8' }}>Avg TAT:</span> <span style={{ fontWeight: 600 }}>{g.avgTAT} days</span></div>
                <div><span style={{ color: '#94a3b8' }}>SLA:</span> <span style={{ fontWeight: 600 }}>{g.slaCompliance}%</span></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
