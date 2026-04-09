import PageHeader from '../../components/PageHeader';
import { claims } from '../../data/sampleData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useCurrency from '../../hooks/useCurrency';

const byLob = ['Motor', 'Health', 'Property', 'Liability'].map(lob => ({
  lob,
  claims: claims.filter(c => c.lob === lob).length,
  totalReserve: claims.filter(c => c.lob === lob).reduce((s, c) => s + c.reserveAmount, 0),
  totalPaid: claims.filter(c => c.lob === lob).reduce((s, c) => s + c.paidAmount, 0),
}));

export default function Assessment() {
  const { F, FL, symbol, locale } = useCurrency();

  return (
    <div>
      <PageHeader title="Claims Assessment" subtitle="Loss assessment analytics by LOB, severity, and reserve adequacy"
        breadcrumbs={[{ label: 'Claims', path: '/claims' }, { label: 'Assessment' }]} />
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header"><h3>Claims by Line of Business</h3></div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={byLob}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="lob" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => FL(v)} />
              <Bar dataKey="totalReserve" name="Reserve" fill="#f59e0b" />
              <Bar dataKey="totalPaid" name="Paid" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h3>LOB Summary</h3></div>
        <table className="data-table">
          <thead><tr><th>LOB</th><th>Claims</th><th>Total Reserve</th><th>Total Paid</th><th>Avg Severity</th></tr></thead>
          <tbody>
            {byLob.map((b) => (
              <tr key={b.lob}>
                <td><span className="badge badge-blue">{b.lob}</span></td>
                <td style={{ fontWeight: 600 }}>{b.claims}</td>
                <td>{symbol}{b.totalReserve.toLocaleString(locale)}</td>
                <td>{symbol}{b.totalPaid.toLocaleString(locale)}</td>
                <td>{symbol}{b.claims ? Math.round(b.totalReserve / b.claims).toLocaleString(locale) : 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
