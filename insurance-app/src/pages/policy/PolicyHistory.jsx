import PageHeader from '../../components/PageHeader';
import { policies } from '../../data/sampleData';
import { Clock } from 'lucide-react';

const history = [
  { date: '2024-11-15 09:30', policy: 'POL-2024-000006', event: 'Endorsement', description: '50 employees added', user: 'operations@insurancecaffe.com' },
  { date: '2024-11-10 14:20', policy: 'POL-2024-000001', event: 'Claim Filed', description: 'CLM-2024-0006 - Fire damage reported', user: 'neha.gupta@insurancecaffe.com' },
  { date: '2024-10-28 11:15', policy: 'POL-2024-000004', event: 'Status Change', description: 'Status changed to Pending - awaiting KYC', user: 'compliance@insurancecaffe.com' },
  { date: '2024-10-05 16:00', policy: 'POL-2024-000005', event: 'Claim Filed', description: 'CLM-2024-0004 - Surgery claim', user: 'neha.gupta@insurancecaffe.com' },
  { date: '2024-09-15 10:45', policy: 'POL-2024-000004', event: 'Claim Filed', description: 'CLM-2024-0007 - Water damage (later denied)', user: 'vikram.mehta@insurancecaffe.com' },
  { date: '2024-08-15 08:30', policy: 'POL-2024-000001', event: 'Claim Filed', description: 'CLM-2024-0001 - Collision claim', user: 'neha.gupta@insurancecaffe.com' },
  { date: '2024-08-01 12:00', policy: 'POL-2024-000008', event: 'Lapsed', description: 'Policy lapsed due to non-payment', user: 'billing@insurancecaffe.com' },
  { date: '2024-07-15 09:00', policy: 'POL-2024-000001', event: 'Endorsement', description: 'Garaging location updated', user: 'operations@insurancecaffe.com' },
  { date: '2024-06-20 15:20', policy: 'POL-2024-000006', event: 'Endorsement', description: 'Group policy member additions', user: 'operations@insurancecaffe.com' },
  { date: '2024-06-01 09:15', policy: 'POL-2024-000001', event: 'Issuance', description: 'Motor Comprehensive policy issued', user: 'admin@insurancecaffe.com' },
];

const eventColor = { 'Claim Filed': '#f59e0b', Endorsement: '#8b5cf6', Issuance: '#22c55e', Lapsed: '#ef4444', 'Status Change': '#3b82f6' };

export default function PolicyHistory() {
  return (
    <div>
      <PageHeader title="Policy History" subtitle="Chronological audit trail of all policy events"
        breadcrumbs={[{ label: 'Policy Admin', path: '/policy' }, { label: 'History' }]} />
      <div className="card">
        <div className="card-body">
          {history.map((h, i) => (
            <div key={i} style={{ display: 'flex', gap: '1rem', padding: '0.75rem 0', borderBottom: i < history.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '2rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: eventColor[h.event] || '#94a3b8', marginTop: '0.3rem' }} />
                {i < history.length - 1 && <div style={{ width: 2, flex: 1, background: '#e2e8f0', marginTop: 4 }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className={`badge ${h.event === 'Claim Filed' ? 'badge-yellow' : h.event === 'Endorsement' ? 'badge-purple' : h.event === 'Issuance' ? 'badge-green' : h.event === 'Lapsed' ? 'badge-red' : 'badge-blue'}`}>{h.event}</span>
                    <span style={{ fontWeight: 600, marginLeft: '0.5rem', fontSize: '0.82rem', color: '#3b82f6' }}>{h.policy}</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={11} />{h.date}</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.2rem' }}>{h.description}</p>
                <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.15rem' }}>by {h.user}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
