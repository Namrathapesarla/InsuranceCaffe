import PageHeader from '../../components/PageHeader';
import { invoices } from '../../data/sampleData';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import useCurrency from '../../hooks/useCurrency';

const outstanding = invoices.filter(i => i.paidAmount < i.amount).map(i => ({ ...i, outstanding: i.amount - i.paidAmount }));
const agingBuckets = [
  { bucket: '0-30 days', amount: 6000, count: 1, color: '#22c55e' },
  { bucket: '31-60 days', amount: 0, count: 0, color: '#f59e0b' },
  { bucket: '61-90 days', amount: 0, count: 0, color: '#ef4444' },
  { bucket: '90+ days', amount: 35000, count: 1, color: '#7c3aed' },
];

export default function Outstanding() {
  const { F, FL, symbol, locale } = useCurrency();
  return (
    <div>
      <PageHeader title="Outstanding Premiums" subtitle="Accounts receivable aging and collection dashboard"
        breadcrumbs={[{ label: 'Billing', path: '/billing' }, { label: 'Outstanding' }]} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="card-header"><h3>Aging Summary</h3></div>
          <div className="card-body">
            {agingBuckets.map((b) => (
              <div key={b.bucket} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: b.color }} />
                  <span style={{ fontSize: '0.85rem' }}>{b.bucket}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600 }}>{symbol}{b.amount.toLocaleString(locale)}</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{b.count} invoice(s)</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3>Outstanding by Age</h3></div>
          <div className="card-body" style={{ display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={agingBuckets.filter(b => b.amount > 0)} dataKey="amount" nameKey="bucket" cx="50%" cy="50%" outerRadius={80} label>
                  {agingBuckets.filter(b => b.amount > 0).map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v) => FL(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h3>Outstanding Invoices</h3></div>
        <table className="data-table">
          <thead><tr><th>Invoice</th><th>Policy</th><th>Customer</th><th>Billed</th><th>Paid</th><th>Outstanding</th><th>Due Date</th><th>Status</th></tr></thead>
          <tbody>
            {outstanding.map((o) => (
              <tr key={o.id}>
                <td style={{ fontWeight: 600 }}>{o.invoiceNumber}</td>
                <td>{o.policyNumber}</td><td>{o.partyName}</td>
                <td>{symbol}{o.amount.toLocaleString(locale)}</td>
                <td>{symbol}{o.paidAmount.toLocaleString(locale)}</td>
                <td style={{ fontWeight: 600, color: '#ef4444' }}>{symbol}{o.outstanding.toLocaleString(locale)}</td>
                <td>{o.dueDate}</td>
                <td><span className={`badge ${o.status === 'Overdue' ? 'badge-red' : 'badge-yellow'}`}>{o.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
