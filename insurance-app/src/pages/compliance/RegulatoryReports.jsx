import PageHeader from '../../components/PageHeader';
import { ShieldCheck, Users, FileText, IndianRupee, UserCheck, Lock } from 'lucide-react';

const reports = [
  { id: 1, name: 'Quarterly Solvency Report', type: 'Solvency', frequency: 'Quarterly', lastSubmitted: '2024-09-30', nextDue: '2024-12-31', status: 'Submitted', regulator: 'IRDAI' },
  { id: 2, name: 'Claims TAT Compliance Report', type: 'Claims', frequency: 'Monthly', lastSubmitted: '2024-10-31', nextDue: '2024-11-30', status: 'Due Soon', regulator: 'IRDAI' },
  { id: 3, name: 'AML/KYC Compliance Summary', type: 'AML', frequency: 'Quarterly', lastSubmitted: '2024-09-30', nextDue: '2024-12-31', status: 'Submitted', regulator: 'IRDAI / FIU' },
  { id: 4, name: 'Grievance Redressal Report', type: 'CRM', frequency: 'Monthly', lastSubmitted: '2024-10-31', nextDue: '2024-11-30', status: 'Due Soon', regulator: 'IRDAI / IGMS' },
  { id: 5, name: 'Investment Portfolio Report', type: 'Finance', frequency: 'Quarterly', lastSubmitted: '2024-09-30', nextDue: '2024-12-31', status: 'Submitted', regulator: 'IRDAI' },
  { id: 6, name: 'Agent Licensing Compliance', type: 'Distribution', frequency: 'Annual', lastSubmitted: '2024-03-31', nextDue: '2025-03-31', status: 'On Track', regulator: 'IRDAI' },
  { id: 7, name: 'Cybersecurity Incident Report', type: 'IT', frequency: 'As Needed', lastSubmitted: 'N/A', nextDue: 'N/A', status: 'No Incidents', regulator: 'IRDAI / CERT-In' },
  { id: 8, name: 'Annual Financial Statements', type: 'Finance', frequency: 'Annual', lastSubmitted: '2024-03-31', nextDue: '2025-03-31', status: 'On Track', regulator: 'IRDAI' },
  { id: 9, name: 'FATCA/CRS Declaration Report', type: 'KYC', frequency: 'Annual', lastSubmitted: '2024-03-31', nextDue: '2025-03-31', status: 'On Track', regulator: 'IRDAI / CBDT' },
  { id: 10, name: 'Anti-Mis-selling Compliance', type: 'Distribution', frequency: 'Quarterly', lastSubmitted: '2024-09-30', nextDue: '2024-12-31', status: 'Submitted', regulator: 'IRDAI' },
  { id: 11, name: 'Free-look Cancellation Report', type: 'Policy', frequency: 'Monthly', lastSubmitted: '2024-10-31', nextDue: '2024-11-30', status: 'Due Soon', regulator: 'IRDAI' },
  { id: 12, name: 'BCP & DR Drill Report', type: 'IT', frequency: 'Annual', lastSubmitted: '2024-06-30', nextDue: '2025-06-30', status: 'On Track', regulator: 'IRDAI' },
];

const irdaiComplianceAreas = [
  {
    title: 'Customer & KYC',
    icon: Users,
    color: '#3b82f6',
    items: [
      'Mandatory KYC verification (PAN / Aadhaar / CKYC)',
      'AML/PEP screening under PMLA',
      'FATCA/CRS declaration capture & reporting',
    ],
  },
  {
    title: 'Policy Admin',
    icon: FileText,
    color: '#8b5cf6',
    items: [
      'Free-look period tracking (15/30-day)',
      'Guaranteed renewability for Health policies',
      'Endorsement audit trail with full traceability',
    ],
  },
  {
    title: 'Claims',
    icon: ShieldCheck,
    color: '#ef4444',
    items: [
      '30-day settlement TAT enforcement',
      'Interest auto-calculation on delayed settlements',
      'Mandatory repudiation reason codes & clause references',
    ],
  },
  {
    title: 'Finance & Solvency',
    icon: IndianRupee,
    color: '#22c55e',
    items: [
      'Quarterly solvency ratio monitoring (≥150%)',
      'Actuarial reserve certification tracking',
      'GST compliance on premiums & service charges',
    ],
  },
  {
    title: 'Distribution',
    icon: UserCheck,
    color: '#f59e0b',
    items: [
      'Agent license expiry tracking & renewal alerts',
      'Commission caps validation per IRDAI norms',
      'Anti-mis-selling declarations & needs analysis',
    ],
  },
  {
    title: 'Security & Audit',
    icon: Lock,
    color: '#ec4899',
    items: [
      'RBAC & MFA enforcement across all modules',
      'VAPT readiness tracking & vulnerability logs',
      'BCP & DR drill logs with compliance dates',
    ],
  },
];

export default function RegulatoryReports() {
  return (
    <div>
      <PageHeader title="Regulatory Reports" subtitle="IRDAI compliance submissions calendar and status tracker"
        breadcrumbs={[{ label: 'Compliance', path: '/compliance' }, { label: 'Reports' }]} />

      {/* IRDAI Compliance Areas */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b' }}>IRDAI Compliance — Built Into Every Module</h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>All 13 regulatory areas pre-configured with controls, TAT trackers, audit trails & automated reporting.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {irdaiComplianceAreas.map((area) => {
            const Icon = area.icon;
            return (
              <div key={area.title} className="card" style={{ borderTop: `3px solid ${area.color}` }}>
                <div className="card-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${area.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={16} color={area.color} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{area.title}</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', listStyle: 'none' }}>
                    {area.items.map((item, i) => (
                      <li key={i} style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.4rem', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                        <span style={{ color: '#22c55e', fontWeight: 700, flexShrink: 0 }}>✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Regulatory Reports Table */}
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#1e293b' }}>Regulatory Submission Calendar</h3>
      <div className="card">
        <table className="data-table">
          <thead><tr><th>Report Name</th><th>Type</th><th>Frequency</th><th>Last Submitted</th><th>Next Due</th><th>Regulator</th><th>Status</th></tr></thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id}>
                <td style={{ fontWeight: 600 }}>{r.name}</td>
                <td><span className="badge badge-blue">{r.type}</span></td>
                <td>{r.frequency}</td>
                <td>{r.lastSubmitted}</td>
                <td>{r.nextDue}</td>
                <td style={{ fontSize: '0.78rem' }}>{r.regulator}</td>
                <td><span className={`badge ${r.status === 'Submitted' ? 'badge-green' : r.status === 'Due Soon' ? 'badge-yellow' : r.status === 'On Track' ? 'badge-blue' : 'badge-gray'}`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
