import { useState, useEffect, useCallback } from 'react';
import { IndianRupee, FileText, AlertTriangle, Percent, Clock, Database, Loader2, Calendar, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { useDateFilter } from '../../context/DateFilterContext';
import { useSchema } from '../../context/SchemaContext';
import useCurrency from '../../hooks/useCurrency';
import {
  fetchDashboardKPIs, fetchLobDistribution, fetchClaimsByStatus,
  fetchRecentPolicies, fetchRecentClaims, fetchPremiumTrend, fetchAvailableYears,
} from '../../api';

export default function Dashboard() {
  const { from, to, isActive } = useDateFilter();
  const { currentOption } = useSchema();
  const { F, FL, symbol, locale, isUS } = useCurrency();

  const [kpis, setKpis] = useState(null);
  const [lobData, setLobData] = useState([]);
  const [claimsStatus, setClaimsStatus] = useState([]);
  const [recentPolicies, setRecentPolicies] = useState([]);
  const [recentClaims, setRecentClaims] = useState([]);
  const [premiumTrend, setPremiumTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(2024);

  const formatIndiaDashboardKpi = (value) => {
    const n = Number(value) || 0;
    const lakhs = n / 100_000;
    if (Math.abs(lakhs) >= 1000) {
      return `₹${(n / 10_000_000).toFixed(1)}Cr`;
    }
    return `₹${lakhs.toFixed(1)}L`;
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [kpiData, lob, claims, policies, claimsList, trend, availableYears] = await Promise.all([
        fetchDashboardKPIs(from, to),
        fetchLobDistribution(from, to),
        fetchClaimsByStatus(from, to),
        fetchRecentPolicies(from, to),
        fetchRecentClaims(from, to),
        fetchPremiumTrend(selectedYear),
        fetchAvailableYears(),
      ]);
      setKpis(kpiData);
      setLobData(lob);
      setClaimsStatus(claims);
      setRecentPolicies(policies);
      setRecentClaims(claimsList);
      setPremiumTrend(trend);
      setYears(availableYears);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [from, to, selectedYear]);

  // Re-fetch all data when date filter or year changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div>
        <PageHeader title="Dashboard" subtitle="Insurance operations overview — real-time KPIs and analytics" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '4rem', color: '#64748b' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
          Loading live data from PostgreSQL...
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Dashboard" subtitle="Insurance operations overview — real-time KPIs and analytics" />
        <div style={{ padding: '2rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', color: '#dc2626' }}>
          <strong>Database connection error:</strong> {error}
          <br /><span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Make sure the backend server is running: <code>cd server && npm run dev</code></span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Insurance operations overview — real-time KPIs and analytics" />

      {/* Live DB indicator + active filter */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.35rem 0.75rem', background: '#f0fdf4', border: '1px solid #bbf7d0',
          borderRadius: '0.5rem', fontSize: '0.75rem', color: '#16a34a', fontWeight: 500,
        }}>
          <Database size={13} />
          Live data from PostgreSQL — {currentOption?.schema || 'reporting'} schema
        </div>
        {isActive && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.35rem 0.75rem', background: '#eff6ff', border: '1px solid #bfdbfe',
            borderRadius: '0.5rem', fontSize: '0.75rem', color: '#2563eb', fontWeight: 500,
          }}>
            <Clock size={13} />
            Filtered: {from || 'start'} to {to || 'now'}
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard icon={isUS ? DollarSign : IndianRupee} label={kpis.gwp.label} value={isUS ? F(kpis.gwp.value) : formatIndiaDashboardKpi(kpis.gwp.value)} color="#3b82f6" />
        <StatCard icon={FileText} label={kpis.activePolicies.label} value={kpis.activePolicies.value} color="#22c55e" />
        <StatCard icon={AlertTriangle} label={kpis.openClaims.label} value={kpis.openClaims.value} color="#f59e0b" />
        <StatCard icon={Percent} label={kpis.claimRatio.label} value={kpis.claimRatio.value} suffix="%" color="#ef4444" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard icon={FileText} label={kpis.totalPolicies.label} value={kpis.totalPolicies.value} color="#8b5cf6" />
        <StatCard icon={Clock} label={kpis.avgClaimTAT.label} value={Math.round(kpis.avgClaimTAT.value)} suffix=" days" color="#06b6d4" />
        <StatCard icon={AlertTriangle} label={kpis.totalClaims.label} value={kpis.totalClaims.value} color="#ec4899" />
        <StatCard icon={isUS ? DollarSign : IndianRupee} label={kpis.totalPaid.label} value={isUS ? F(kpis.totalPaid.value) : formatIndiaDashboardKpi(kpis.totalPaid.value)} color="#22c55e" />
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Premium Trend (Monthly)</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={14} style={{ color: '#64748b' }} />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                style={{
                  padding: '0.3rem 0.6rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0',
                  fontSize: '0.8rem', color: '#334155', background: '#f8fafc', cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={premiumTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={F} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => FL(v)} />
                <Legend />
                <Area type="monotone" dataKey="written" name="Written Premium" stroke="#3b82f6" fill="#3b82f680" />
                <Area type="monotone" dataKey="earned" name="Earned Premium" stroke="#22c55e" fill="#22c55e50" />
                <Area type="monotone" dataKey="commission" name="Commission" stroke="#f59e0b" fill="#f59e0b40" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>LOB Distribution</h3></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart margin={{ top: 28, right: 24, bottom: 24, left: 24 }}>
                <Pie data={lobData.filter(d => d.value >= 5)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={72} innerRadius={0} label={({ name, value }) => `${name.length > 12 ? name.substring(0,12) + '..' : name} ${value}%`}>
                  {lobData.filter(d => d.value >= 5).map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v, name, props) => [`${v}% (${F(props.payload.premium)})`, name]} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem', justifyContent: 'center' }}>
              {lobData.slice(0, 8).map((l) => (
                <span key={l.name} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: l.color, display: 'inline-block' }} />
                  {l.name.length > 18 ? l.name.substring(0, 18) + '..' : l.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="card-header"><h3>Claims by Status</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={claimsStatus} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="status" type="category" tick={{ fontSize: 11 }} width={140} />
                <Tooltip />
                <Bar dataKey="count" name="Claims">
                  {claimsStatus.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Commission Ratio Trend ({selectedYear})</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={premiumTrend.filter(m => m.earned > 0).map((m) => ({ month: m.month, ratio: ((m.commission / m.earned) * 100).toFixed(1) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} unit="%" />
                <Tooltip formatter={(v) => `${v}%`} />
                <Line type="monotone" dataKey="ratio" name="Commission Ratio" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="card">
          <div className="card-header"><h3>Recent Policies</h3></div>
          <table className="data-table">
            <thead><tr><th>Policy #</th><th>Insured</th><th>LOB</th><th>Premium</th><th>Status</th></tr></thead>
            <tbody>
              {recentPolicies.map((p, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: '#3b82f6', fontSize: '0.78rem' }}>{p.policyNumber}</td>
                  <td>{p.partyName}</td>
                  <td><span className="badge badge-blue">{p.lob}</span></td>
                  <td>{symbol}{p.grossPremium.toLocaleString(locale)}</td>
                  <td><span className={`badge ${p.status?.toLowerCase().includes('active') || p.status?.toLowerCase().includes('in force') ? 'badge-green' : p.status?.toLowerCase().includes('pend') ? 'badge-yellow' : 'badge-red'}`}>{p.status}</span></td>
                </tr>
              ))}
              {recentPolicies.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '1.5rem' }}>No policies in selected period</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-header"><h3>Recent Claims</h3></div>
          <table className="data-table">
            <thead><tr><th>Claim #</th><th>Insured</th><th>LOB</th><th>Paid</th><th>Status</th></tr></thead>
            <tbody>
              {recentClaims.map((c, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: '#f59e0b', fontSize: '0.78rem' }}>CLM-{c.claimKey}</td>
                  <td>{c.partyName}</td>
                  <td><span className="badge badge-blue">{c.lob}</span></td>
                  <td>{symbol}{c.paidAmount.toLocaleString(locale)}</td>
                  <td><span className={`badge ${c.status?.toLowerCase().includes('close') || c.status?.toLowerCase().includes('settled') ? 'badge-green' : c.status?.toLowerCase().includes('denied') ? 'badge-red' : c.status?.toLowerCase().includes('open') ? 'badge-blue' : 'badge-yellow'}`}>{c.status}</span></td>
                </tr>
              ))}
              {recentClaims.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '1.5rem' }}>No claims in selected period</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
