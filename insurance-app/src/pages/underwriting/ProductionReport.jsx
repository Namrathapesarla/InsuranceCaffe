import { useState, useEffect, useCallback } from 'react';
import {
  IndianRupee, FileText, RefreshCw, TrendingUp, ShieldCheck,
  Percent, Activity, Loader2, Database, Clock,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { useDateFilter } from '../../context/DateFilterContext';
import { useSchema } from '../../context/SchemaContext';
import useCurrency from '../../hooks/useCurrency';
import {
  fetchProductionKPIs, fetchWrittenPremiumByLob, fetchInforceDistribution,
  fetchNbVsRenewalTrend, fetchRetentionByLob, fetchLossRatioByLob,
  fetchPolicyMovement,
} from '../../api';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1'];
export default function ProductionReport() {
  const { from, to, isActive } = useDateFilter();
  const { currentOption } = useSchema();
  const { F, FL, symbol, locale } = useCurrency();

  const [kpis, setKpis] = useState(null);
  const [premiumByLob, setPremiumByLob] = useState([]);
  const [inforceDist, setInforceDist] = useState([]);
  const [nbRenewalTrend, setNbRenewalTrend] = useState([]);
  const [retentionByLob, setRetentionByLob] = useState([]);
  const [lossRatioByLob, setLossRatioByLob] = useState([]);
  const [policyMovement, setPolicyMovement] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [kpiData, wpLob, inforce, nbRen, retention, lossRatio, movement] = await Promise.all([
        fetchProductionKPIs(from, to),
        fetchWrittenPremiumByLob(from, to),
        fetchInforceDistribution(from, to),
        fetchNbVsRenewalTrend(from, to),
        fetchRetentionByLob(from, to),
        fetchLossRatioByLob(from, to),
        fetchPolicyMovement(from, to),
      ]);
      setKpis(kpiData);
      setPremiumByLob(wpLob);
      setInforceDist(inforce);
      setNbRenewalTrend(nbRen);
      setRetentionByLob(retention);
      setLossRatioByLob(lossRatio.slice(0, 10));
      setPolicyMovement(movement);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Production Report"
          subtitle="Underwriting & Quotes — policy production, retention, and profitability metrics"
          breadcrumbs={[{ label: 'Underwriting & Quotes', path: '/underwriting/quotes' }, { label: 'Production Report' }]}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '4rem', color: '#64748b' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
          Loading production data from PostgreSQL...
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader
          title="Production Report"
          subtitle="Underwriting & Quotes — policy production, retention, and profitability metrics"
          breadcrumbs={[{ label: 'Underwriting & Quotes', path: '/underwriting/quotes' }, { label: 'Production Report' }]}
        />
        <div style={{ padding: '2rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', color: '#dc2626' }}>
          <strong>Database connection error:</strong> {error}
          <br /><span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Make sure the backend server is running: <code>cd server && npm run dev</code></span>
        </div>
      </div>
    );
  }

  // Pie data for inforce distribution
  const totalInforce = inforceDist.reduce((s, d) => s + Number(d.policy_count), 0);
  const pieData = inforceDist.map((d, i) => ({
    name: d.lob,
    value: Number(d.policy_count),
    pct: totalInforce > 0 ? ((d.policy_count / totalInforce) * 100).toFixed(1) : 0,
    color: COLORS[i % COLORS.length],
  }));

  return (
    <div>
      <PageHeader
        title="Production Report"
        subtitle="Underwriting & Quotes — policy production, retention, and profitability metrics"
        breadcrumbs={[{ label: 'Underwriting & Quotes', path: '/underwriting/quotes' }, { label: 'Production Report' }]}
      />

      {/* Status bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.35rem 0.75rem', background: '#f0fdf4', border: '1px solid #bbf7d0',
          borderRadius: '0.5rem', fontSize: '0.75rem', color: '#16a34a', fontWeight: 500,
        }}>
          <Database size={13} />
          Live data — {currentOption?.schema || 'reporting'} schema
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.35rem 0.75rem', background: '#eff6ff', border: '1px solid #bfdbfe',
          borderRadius: '0.5rem', fontSize: '0.75rem', color: '#2563eb', fontWeight: 500,
        }}>
          <Clock size={13} />
          {isActive ? `Filtered: ${from || 'start'} to ${to || 'now'}` : 'All Time'}
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard icon={ShieldCheck} label="Inforce Policies" value={Number(kpis.inforce_policies).toLocaleString(locale)} color="#3b82f6" />
        <StatCard icon={IndianRupee} label="Written Premium" value={F(kpis.written_premium)} color="#22c55e" />
        <StatCard icon={FileText} label="New Business Count" value={Number(kpis.new_business_count).toLocaleString(locale)} color="#8b5cf6" />
        <StatCard icon={RefreshCw} label="Renewal Rate" value={kpis.renewal_rate} suffix="%" color="#f59e0b" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard icon={IndianRupee} label="Retention by Premium" value={kpis.retention_by_premium} suffix="%" color="#06b6d4" />
        <StatCard icon={TrendingUp} label="Retention by Count" value={kpis.retention_by_count} suffix="%" color="#14b8a6" />
        <StatCard icon={Percent} label="Loss Ratio" value={kpis.loss_ratio} suffix="%" color="#ef4444" />
        <StatCard icon={Activity} label="Avg Premium / Policy" value={F(kpis.avg_premium_per_policy)} color="#ec4899" />
      </div>

      {/* ── Row 1: Written Premium by LOB + Inforce Distribution ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Chart 1: Written Premium by LOB */}
        <div className="card">
          <div className="card-header"><h3>Written Premium by Line of Business</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={premiumByLob} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tickFormatter={F} tick={{ fontSize: 11 }} />
                <YAxis dataKey="lob" type="category" tick={{ fontSize: 11 }} width={150} />
                <Tooltip formatter={(v) => FL(v)} />
                <Bar dataKey="written_premium" name="Written Premium" radius={[0, 4, 4, 0]}>
                  {premiumByLob.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Inforce Policy Count Distribution */}
        <div className="card">
          <div className="card-header"><h3>Inforce Policy Count Distribution</h3></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={40}
                  label={({ name, pct }) => `${name.length > 14 ? name.substring(0, 14) + '..' : name} ${pct}%`}
                >
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v, name) => [`${v} policies`, name]} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem', justifyContent: 'center' }}>
              {pieData.map((l) => (
                <span key={l.name} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: l.color, display: 'inline-block' }} />
                  {l.name.length > 20 ? l.name.substring(0, 20) + '..' : l.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 2: NB vs Renewal trend + Retention by LOB ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Chart 3: New Business vs Renewal Premium — Stacked Bar (YTD) */}
        <div className="card">
          <div className="card-header"><h3>New Business vs Renewal Premium — Monthly</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={nbRenewalTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={F} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => FL(v)} />
                <Legend />
                <Bar dataKey="new_business" name="New Business" stackId="premium" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="renewal" name="Renewal" stackId="premium" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Retention — Renewal vs New Business Premium by LOB */}
        <div className="card">
          <div className="card-header"><h3>Retention — Renewal vs New Business by LOB</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={retentionByLob} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tickFormatter={F} tick={{ fontSize: 11 }} />
                <YAxis dataKey="lob" type="category" tick={{ fontSize: 10 }} width={140} />
                <Tooltip formatter={(v) => FL(v)} />
                <Legend />
                <Bar dataKey="renewal_premium" name="Renewal Premium" stackId="ret" fill="#22c55e" />
                <Bar dataKey="new_biz_premium" name="New Business Premium" stackId="ret" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Row 3: Loss Ratio by LOB + Policy Movement ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Chart 5: Profitability — Loss Ratio by LOB */}
        <div className="card">
          <div className="card-header"><h3>Profitability — Loss Ratio by LOB</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={lossRatioByLob}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="lob" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={60} />
                <YAxis unit="%" tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v, name) => {
                    if (name === 'Loss Ratio %') return `${v}%`;
                    return FL(v);
                  }}
                />
                <Legend />
                <Bar dataKey="loss_ratio" name="Loss Ratio %" radius={[4, 4, 0, 0]}>
                  {lossRatioByLob.map((d, i) => (
                    <Cell key={i} fill={Number(d.loss_ratio) > 70 ? '#ef4444' : Number(d.loss_ratio) > 50 ? '#f59e0b' : '#22c55e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Policies — NB vs Lapse vs Renewal — Monthly Grouped Bar */}
        <div className="card">
          <div className="card-header"><h3>Policy Movement — NB vs Lapse vs Renewal</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={policyMovement}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="new_business" name="New Business" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="renewal" name="Renewed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lapse" name="Lapsed" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
