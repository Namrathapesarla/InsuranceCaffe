import PageHeader from '../../components/PageHeader';
import { claims } from '../../data/sampleData';
import useCurrency from '../../hooks/useCurrency';

const investigations = claims.filter(c => ['Under Investigation', 'FNOL', 'Documents Pending'].includes(c.status));

export default function Investigation() {
  const { symbol, locale } = useCurrency();

  return (
    <div>
      <PageHeader title="Claim Investigation" subtitle="Claims under active investigation and document collection"
        breadcrumbs={[{ label: 'Claims', path: '/claims' }, { label: 'Investigation' }]} />
      <div style={{ display: 'grid', gap: '1rem' }}>
        {investigations.map((c) => (
          <div key={c.id} className="card" style={{ borderLeft: `4px solid ${c.status === 'Under Investigation' ? '#3b82f6' : c.status === 'FNOL' ? '#8b5cf6' : '#f59e0b'}` }}>
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, color: '#f59e0b' }}>{c.claimNumber}</span>
                    <span className={`badge ${c.status === 'Under Investigation' ? 'badge-blue' : c.status === 'FNOL' ? 'badge-purple' : 'badge-yellow'}`}>{c.status}</span>
                    <span className="badge badge-blue">{c.lob}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#475569' }}><strong>Customer:</strong> {c.partyName} | <strong>Policy:</strong> {c.policyNumber}</p>
                  <p style={{ fontSize: '0.85rem', color: '#475569' }}><strong>Loss Type:</strong> {c.lossType} | <strong>Loss Date:</strong> {c.lossDate} | <strong>Location:</strong> {c.location}</p>
                  <p style={{ fontSize: '0.85rem', color: '#475569' }}><strong>Adjuster:</strong> {c.adjuster}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Reserve Amount</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{symbol}{c.reserveAmount.toLocaleString(locale)}</div>
                </div>
              </div>
              {/* <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>Update Investigation</button>
                <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>Request Documents</button>
                <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>Assign Surveyor</button>
              </div> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
