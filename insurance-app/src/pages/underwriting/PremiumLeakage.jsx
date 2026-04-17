import { useState, useEffect, useCallback } from 'react';
import {
  IndianRupee, Percent, AlertTriangle, Search,
  Loader2, Database, Clock, TrendingDown, Users, Layers,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, AreaChart, Area, Line,
} from 'recharts';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { useDateFilter } from '../../context/DateFilterContext';
import { useSchema } from '../../context/SchemaContext';
import useCurrency from '../../hooks/useCurrency';
import {
  fetchLeakageKPIs, fetchLeakageByLob, fetchLeakageByProduct,
  fetchLeakageMonthly, fetchLeakageByUnderwriter,
} from '../../api';

export default function PremiumLeakage() {
  const { from, to, isActive } = useDateFilter();
  const { currentOption } = useSchema();
  const { F, FL, symbol, locale } = useCurrency();
  const [kpis, setKpis] = useState(null);
  const [byLob, setByLob] = useState([]);
  const [byProduct, setByProduct] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [byUW, setByUW] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatIndiaKpiCurrency = (value) => {
    const n = Number(value) || 0;
    const lakhs = n / 100_000;
    return Math.abs(lakhs) >= 100 ? `₹${(n / 10_000_000).toFixed(1)}Cr` : `₹${lakhs.toFixed(1)}L`;
  };

  const formatKpiCurrency = (value) => currentOption?.key === 'us' ? F(value) : formatIndiaKpiCurrency(value);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [k, l, p, m, u] = await Promise.all([
        fetchLeakageKPIs(from, to), fetchLeakageByLob(from, to),
        fetchLeakageByProduct(from, to), fetchLeakageMonthly(from, to),
        fetchLeakageByUnderwriter(from, to),
      ]);
      setKpis(k); setByLob(l); setByProduct(p); setMonthly(m); setByUW(u); setError(null);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }, [from, to]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return (
    <div>
      <PageHeader title="Premium Leakage Detection & Recovery" subtitle="Identify where premium is lost through commissions, cost loads, and earned gaps"
        breadcrumbs={[{ label: 'Underwriting & Quotes', path: '/underwriting/quotes' }, { label: 'Premium Leakage' }]} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '4rem', color: '#64748b' }}>
        <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading...
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div>
      <PageHeader title="Premium Leakage Detection & Recovery" subtitle="Identify where premium is lost through commissions, cost loads, and earned gaps"
        breadcrumbs={[{ label: 'Underwriting & Quotes', path: '/underwriting/quotes' }, { label: 'Premium Leakage' }]} />
      <div style={{ padding: '2rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', color: '#dc2626' }}><strong>Error:</strong> {error}</div>
    </div>
  );

  const signals = [
    { label: 'Gross-to-Net Leakage', desc: 'Written premium lost before reaching net (commissions + cost loads)', value: F(kpis.gross_to_net_gap), pct: `${kpis.leakage_pct}%`, color: '#f59e0b' },
    { label: 'Commission Load', desc: 'Company + producer commission as share of written premium', value: F(kpis.total_commission), pct: `${kpis.commission_ratio}%`, color: '#ef4444' },
    { label: 'Earned Premium Gap', desc: 'Written premium not yet earned — unearned exposure', value: F(kpis.earned_gap), pct: `${kpis.earned_gap_pct}%`, color: '#8b5cf6' },
    { label: 'Surcharges + Taxes + Fees', desc: 'Total cost load applied on policies', value: F(Number(kpis.surcharges) + Number(kpis.taxes) + Number(kpis.fees)), pct: '-', color: '#3b82f6' },
  ];

  return (
    <div>
      <PageHeader title="Premium Leakage Detection & Recovery" subtitle="Identify where premium is lost through commissions, cost loads, and earned gaps — quantify recoverable amount by underwriter, product, and LOB"
        breadcrumbs={[{ label: 'Underwriting & Quotes', path: '/underwriting/quotes' }, { label: 'Premium Leakage' }]} />

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#16a34a', fontWeight: 500 }}>
          <Database size={13} /> Live data — {currentOption?.schema || 'reporting'} schema
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#2563eb', fontWeight: 500 }}>
          <Clock size={13} /> {isActive ? `Filtered: ${from || 'start'} to ${to || 'now'}` : 'All Time'}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard icon={IndianRupee} label="Written Premium" value={formatKpiCurrency(kpis.written_premium)} color="#22c55e" />
        <StatCard icon={Layers} label="Net Written" value={formatKpiCurrency(kpis.net_written)} color="#3b82f6" />
        <StatCard icon={TrendingDown} label="Gross-to-Net Gap" value={formatKpiCurrency(kpis.gross_to_net_gap)} color="#f59e0b" />
        <StatCard icon={Percent} label="Leakage %" value={kpis.leakage_pct} suffix="%" color="#ef4444" />
        <StatCard icon={Users} label="Commission Ratio" value={kpis.commission_ratio} suffix="%" color="#8b5cf6" />
        <StatCard icon={Search} label="Earned Premium" value={formatKpiCurrency(kpis.earned_premium)} color="#06b6d4" />
      </div>

      {/* Leakage Signal Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {signals.map((s) => (
          <div key={s.label} className="card" style={{ borderLeft: `4px solid ${s.color}` }}>
            <div className="card-body" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.3rem' }}>{s.label}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.5rem' }}>{s.desc}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: s.color }}>{s.value}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>{s.pct}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Row 1: Leakage by LOB + Monthly Trend */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="card-header"><h3>Gross-to-Net Leakage by LOB</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byLob} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tickFormatter={F} tick={{ fontSize: 11 }} />
                <YAxis dataKey="lob" type="category" tick={{ fontSize: 9 }} width={150} />
                <Tooltip formatter={(v) => FL(v)} />
                <Legend />
                <Bar dataKey="leakage" name="Leakage (Written - Net)" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Monthly Leakage Trend</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={F} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => FL(v)} />
                <Legend />
                <Area type="monotone" dataKey="leakage" name="Gross-to-Net Gap" stroke="#f59e0b" fill="#f59e0b30" strokeWidth={2} />
                <Area type="monotone" dataKey="commission" name="Commission" stroke="#ef4444" fill="#ef444420" strokeWidth={2} />
                <Line type="monotone" dataKey="cost_load" name="Surcharges+Tax+Fees" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Commission ratio by LOB + Leakage % by Product */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="card-header"><h3>Commission Ratio by LOB</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byLob}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="lob" tick={{ fontSize: 8 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis unit="%" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="commission_ratio" name="Commission Ratio %" radius={[4, 4, 0, 0]}>
                  {byLob.map((d, i) => <Cell key={i} fill={Number(d.commission_ratio) > 20 ? '#ef4444' : Number(d.commission_ratio) > 15 ? '#f59e0b' : '#22c55e'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Leakage % by Product</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byProduct}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="product" tick={{ fontSize: 8 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis unit="%" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v, name) => name.includes('%') ? `${v}%` : FL(v)} />
                <Legend />
                <Bar dataKey="leakage_pct" name="Leakage %" radius={[4, 4, 0, 0]}>
                  {byProduct.map((d, i) => <Cell key={i} fill={Number(d.leakage_pct) > 20 ? '#ef4444' : Number(d.leakage_pct) > 10 ? '#f59e0b' : '#22c55e'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Producer leakage table */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header"><h3><AlertTriangle size={16} style={{ marginRight: '0.4rem', verticalAlign: 'text-bottom' }} />Top 10 Producers — Leakage Analysis</h3></div>
        <table className="data-table">
          <thead><tr><th>Producer</th><th>Policies</th><th>Written</th><th>Net Written</th><th>Leakage</th><th>Leakage %</th><th>Co. Comm.</th><th>Prod. Comm.</th><th>Comm. Ratio</th><th>Flag</th></tr></thead>
          <tbody>
            {byUW.map((r, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{r.underwriter}</td>
                <td>{Number(r.policies).toLocaleString(locale)}</td>
                <td>{F(r.written)}</td>
                <td>{F(r.net_written)}</td>
                <td style={{ color: '#f59e0b', fontWeight: 700 }}>{F(r.leakage)}</td>
                <td style={{ fontWeight: 600 }}>{r.leakage_pct}%</td>
                <td>{F(r.co_commission)}</td>
                <td>{F(r.pr_commission)}</td>
                <td style={{ color: Number(r.commission_ratio) > 20 ? '#ef4444' : '#22c55e', fontWeight: 700 }}>{r.commission_ratio}%</td>
                <td><span className={`badge ${Number(r.leakage_pct) > 20 ? 'badge-red' : Number(r.leakage_pct) > 10 ? 'badge-yellow' : 'badge-green'}`}>{Number(r.leakage_pct) > 20 ? 'High Leakage' : Number(r.leakage_pct) > 10 ? 'Watch' : 'Normal'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* LOB Detail table */}
      <div className="card">
        <div className="card-header"><h3>LOB Leakage Detail</h3></div>
        <table className="data-table">
          <thead><tr><th>LOB</th><th>Written</th><th>Net Written</th><th>Leakage</th><th>Leakage %</th><th>Earned</th><th>Co. Comm.</th><th>Prod. Comm.</th><th>Cost Load</th><th>Comm. Ratio</th></tr></thead>
          <tbody>
            {byLob.map((r, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{r.lob}</td>
                <td>{F(r.written)}</td>
                <td>{F(r.net_written)}</td>
                <td style={{ color: '#f59e0b', fontWeight: 700 }}>{F(r.leakage)}</td>
                <td style={{ fontWeight: 600 }}>{r.leakage_pct}%</td>
                <td>{F(r.earned)}</td>
                <td>{F(r.co_commission)}</td>
                <td>{F(r.pr_commission)}</td>
                <td>{F(r.cost_load)}</td>
                <td style={{ color: Number(r.commission_ratio) > 20 ? '#ef4444' : '#22c55e', fontWeight: 700 }}>{r.commission_ratio}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
