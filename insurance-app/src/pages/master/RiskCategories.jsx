import PageHeader from '../../components/PageHeader';
import { riskCategories } from '../../data/sampleData';

export default function RiskCategories() {
  return (
    <div>
      <PageHeader title="Risk Categories" subtitle="Risk classification levels used in underwriting and customer profiling"
        breadcrumbs={[{ label: 'Master Data', path: '/master' }, { label: 'Risk Categories' }]} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {riskCategories.map((rc) => (
          <div key={rc.id} className="card" style={{ borderLeft: `4px solid ${rc.color}` }}>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: rc.color }} />
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>{rc.name}</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#94a3b8', marginLeft: 'auto' }}>{rc.code}</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>{rc.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
