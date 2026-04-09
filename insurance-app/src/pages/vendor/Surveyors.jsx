import PageHeader from '../../components/PageHeader';
import { vendors } from '../../data/sampleData';

const surveyors = vendors.filter(v => v.type === 'Surveyor');

export default function Surveyors() {
  return (
    <div>
      <PageHeader title="Surveyors" subtitle="Licensed loss assessors and surveyors"
        breadcrumbs={[{ label: 'Vendor Network', path: '/vendor' }, { label: 'Surveyors' }]} />
      <div className="card">
        <table className="data-table">
          <thead><tr><th>Name</th><th>City</th><th>State</th><th>Status</th><th>Rating</th><th>Claims</th><th>Avg TAT</th><th>SLA %</th></tr></thead>
          <tbody>
            {surveyors.map((s) => (
              <tr key={s.id}>
                <td style={{ fontWeight: 600 }}>{s.name}</td><td>{s.city}</td><td>{s.state}</td>
                <td><span className={`badge ${s.empanelmentStatus === 'Active' ? 'badge-green' : 'badge-red'}`}>{s.empanelmentStatus}</span></td>
                <td>{s.rating}</td><td>{s.claimsHandled}</td><td>{s.avgTAT} days</td><td>{s.slaCompliance}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
