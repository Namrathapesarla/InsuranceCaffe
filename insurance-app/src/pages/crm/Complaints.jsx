import PageHeader from '../../components/PageHeader';
import { interactions } from '../../data/sampleData';
import StatCard from '../../components/StatCard';
import { AlertTriangle, Clock, CheckCircle, ArrowUpCircle } from 'lucide-react';

const complaints = interactions.filter(i => ['Complaint', 'Grievance'].includes(i.type));

export default function Complaints() {
  return (
    <div>
      <PageHeader title="Complaints & Grievances" subtitle="IGMS-integrated complaint tracking with escalation workflow"
        breadcrumbs={[{ label: 'CRM', path: '/crm' }, { label: 'Complaints' }]} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard icon={AlertTriangle} label="Total Complaints" value={complaints.length} color="#ef4444" />
        <StatCard icon={Clock} label="Open" value={complaints.filter(c => c.status === 'Open').length} color="#3b82f6" />
        <StatCard icon={ArrowUpCircle} label="Escalated" value={complaints.filter(c => c.status === 'Escalated').length} color="#f59e0b" />
        <StatCard icon={CheckCircle} label="Resolved" value={complaints.filter(c => c.status === 'Resolved').length} color="#22c55e" />
      </div>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {complaints.map((c) => (
          <div key={c.id} className="card" style={{ borderLeft: `4px solid ${c.priority === 'Critical' ? '#ef4444' : c.priority === 'High' ? '#f59e0b' : '#3b82f6'}` }}>
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontWeight: 700 }}>{c.partyName}</span>
                  <span className={`badge ${c.type === 'Grievance' ? 'badge-orange' : 'badge-red'}`} style={{ marginLeft: '0.5rem' }}>{c.type}</span>
                  <span className={`badge ${c.priority === 'Critical' ? 'badge-red' : 'badge-orange'}`} style={{ marginLeft: '0.25rem' }}>{c.priority}</span>
                </div>
                <span className={`badge ${c.status === 'Escalated' ? 'badge-red' : c.status === 'Open' ? 'badge-blue' : 'badge-green'}`}>{c.status}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.3rem' }}>{c.subject}</p>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>Channel: {c.channel} | Assigned: {c.assignedTo} | {c.createdAt}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
