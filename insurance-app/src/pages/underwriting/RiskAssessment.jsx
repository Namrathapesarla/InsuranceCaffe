import PageHeader from '../../components/PageHeader';
import { quotes } from '../../data/sampleData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const riskBands = [
  { band: '0-20 (Low)', count: quotes.filter(q => q.riskScore <= 20).length, color: '#22c55e' },
  { band: '21-40 (Moderate)', count: quotes.filter(q => q.riskScore > 20 && q.riskScore <= 40).length, color: '#f59e0b' },
  { band: '41-60 (High)', count: quotes.filter(q => q.riskScore > 40 && q.riskScore <= 60).length, color: '#ef4444' },
  { band: '61+ (Very High)', count: quotes.filter(q => q.riskScore > 60).length, color: '#7c3aed' },
];

export default function RiskAssessment() {
  return (
    <div>
      <PageHeader title="Risk Assessment" subtitle="Risk scoring distribution and assessment analytics"
        breadcrumbs={[{ label: 'Underwriting', path: '/underwriting' }, { label: 'Risk Assessment' }]} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        {riskBands.map((b) => (
          <div key={b.band} className="stat-card" style={{ borderLeft: `4px solid ${b.color}` }}>
            <div>
              <div className="stat-value">{b.count}</div>
              <div className="stat-label">{b.band}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-header"><h3>Risk Score Distribution</h3></div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskBands}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="band" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" name="Quotes">
                {riskBands.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
