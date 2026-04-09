import PageHeader from '../../components/PageHeader';
import { agents } from '../../data/sampleData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import useCurrency from '../../hooks/useCurrency';

const chartData = agents.map(a => ({ name: a.name.split(' ')[0], policies: a.policiesSold, persistency: a.persistency, premium: Math.round(a.totalPremium / 100000) }));

export default function Performance() {
  const { F, FL, symbol, locale } = useCurrency();
  return (
    <div>
      <PageHeader title="Agent Performance" subtitle="KPIs: policies sold, premium volume, persistency, and commission efficiency"
        breadcrumbs={[{ label: 'Agent/Broker', path: '/agent' }, { label: 'Performance' }]} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="card-header"><h3>Policies Sold by Agent</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Bar dataKey="policies" name="Policies Sold" fill="#3b82f6" /></BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3>Persistency Rate (%)</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis domain={[60, 100]} tick={{ fontSize: 12 }} /><Tooltip /><Bar dataKey="persistency" name="Persistency %" fill="#22c55e" /></BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h3>Agent Scorecard</h3></div>
        <table className="data-table">
          <thead><tr><th>Agent</th><th>Type</th><th>Policies</th><th>Premium ({symbol}L)</th><th>Commission ({symbol}L)</th><th>Persistency</th><th>Rating</th></tr></thead>
          <tbody>
            {agents.sort((a, b) => b.totalPremium - a.totalPremium).map((a) => (
              <tr key={a.id}>
                <td style={{ fontWeight: 600 }}>{a.name}</td>
                <td><span className="badge badge-blue">{a.type}</span></td>
                <td>{a.policiesSold}</td>
                <td>{F(a.totalPremium)}</td>
                <td>{F(a.commissionEarned)}</td>
                <td><span style={{ color: a.persistency >= 90 ? '#22c55e' : a.persistency >= 80 ? '#f59e0b' : '#ef4444', fontWeight: 600 }}>{a.persistency}%</span></td>
                <td><span className={`badge ${a.persistency >= 90 ? 'badge-green' : a.persistency >= 80 ? 'badge-yellow' : 'badge-red'}`}>{a.persistency >= 90 ? 'A' : a.persistency >= 80 ? 'B' : 'C'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
