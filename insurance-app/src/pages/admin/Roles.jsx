import PageHeader from '../../components/PageHeader';

const roles = [
  { name: 'Super Admin', users: 1, permissions: 'Full access to all modules', modules: ['All'] },
  { name: 'Claims Manager', users: 1, permissions: 'Claims module full access, read-only on Policy & Billing', modules: ['Claims', 'Policy (R)', 'Billing (R)'] },
  { name: 'Claims Adjuster', users: 1, permissions: 'Investigate and assess claims, update reserves', modules: ['Claims', 'Documents'] },
  { name: 'Underwriter', users: 1, permissions: 'Underwriting, quotes, risk assessment', modules: ['Underwriting', 'Master Data (R)', 'Policy (R)'] },
  { name: 'Operations Manager', users: 1, permissions: 'Policy administration, endorsements, renewals', modules: ['Policy', 'Master Data', 'Documents'] },
  { name: 'Billing Officer', users: 1, permissions: 'Invoicing, payments, reconciliation', modules: ['Billing', 'Policy (R)'] },
  { name: 'Compliance Officer', users: 0, permissions: 'Audit logs, regulatory reports, risk monitoring', modules: ['Compliance', 'All (R)'] },
  { name: 'Agent Manager', users: 0, permissions: 'Agent onboarding, commissions, performance', modules: ['Agent/Broker', 'Policy (R)'] },
];

export default function Roles() {
  return (
    <div>
      <PageHeader title="Roles & Permissions" subtitle="RBAC configuration per IRDAI cybersecurity framework"
        breadcrumbs={[{ label: 'Administration', path: '/admin' }, { label: 'Roles' }]} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        {roles.map((r, i) => (
          <div key={i} className="card">
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{r.name}</span>
                <span className="badge badge-blue">{r.users} user(s)</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.5rem' }}>{r.permissions}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {r.modules.map((m) => <span key={m} className="badge badge-gray">{m}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
