import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import {
  CheckCircle, Target, TrendingUp,
  ArrowLeft, BarChart3, PieChart as PieChartIcon, FileText,
  Loader2, Database, Clock, IndianRupee, Percent,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, Line,
} from 'recharts';
import { useDateFilter } from '../../context/DateFilterContext';
import { useSchema } from '../../context/SchemaContext';
import useCurrency from '../../hooks/useCurrency';
import {
  fetchRiskScoringKPIs, fetchRiskByLob, fetchRiskByRegion,
  fetchRiskMonthlyTrend, fetchUwDecisions,
} from '../../api';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#f97316', '#6366f1'];
const UW_COLORS = { NEWBIZ: '#22c55e', RENEWAL: '#3b82f6', ENDORSE: '#f59e0b', CANCEL: '#ef4444', REINSTATE: '#8b5cf6', AUDIT: '#06b6d4', UNKNOWN: '#94a3b8' };
export default function RiskScoringDashboard() {
  const navigate = useNavigate();
  const { from, to, isActive } = useDateFilter();
  const { currentOption } = useSchema();
  const { F, FL, symbol, locale } = useCurrency();

  const [kpis, setKpis] = useState(null);
  const [riskByLob, setRiskByLob] = useState([]);
  const [riskByRegion, setRiskByRegion] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [uwDecisions, setUwDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [kpiData, lobData, regionData, trendData, uwData] = await Promise.all([
        fetchRiskScoringKPIs(from, to),
        fetchRiskByLob(from, to),
        fetchRiskByRegion(from, to),
        fetchRiskMonthlyTrend(from, to),
        fetchUwDecisions(from, to),
      ]);
      setKpis(kpiData);
      setRiskByLob(lobData);
      setRiskByRegion(regionData);
      setMonthlyTrend(trendData);
      setUwDecisions(uwData);
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
        <PageHeader title="Risk Scoring & Selection" subtitle="Automated underwriting with risk score capture, referral & override tracking — powered by reporting layer"
          breadcrumbs={[{ label: 'Underwriting', path: '/underwriting/quotes' }, { label: 'Risk Scoring & Selection' }]} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '4rem', color: '#64748b' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
          Loading risk scoring data from PostgreSQL...
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Risk Scoring & Selection" subtitle="Automated underwriting with risk score capture, referral & override tracking — powered by reporting layer"
          breadcrumbs={[{ label: 'Underwriting', path: '/underwriting/quotes' }, { label: 'Risk Scoring & Selection' }]} />
        <div style={{ padding: '2rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', color: '#dc2626' }}>
          <strong>Database connection error:</strong> {error}
          <br /><span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Make sure the backend server is running: <code>cd server && npm run dev</code></span>
        </div>
      </div>
    );
  }

  // Pie data for UW decisions
  const uwPieData = uwDecisions.map((d, i) => ({
    decision: d.decision,
    count: Number(d.count),
    percentage: Number(d.percentage),
    premium: Number(d.premium),
    color: UW_COLORS[d.decision] || COLORS[i % COLORS.length],
  }));

  // Radar data from LOB
  const radarData = riskByLob.map(r => ({
    lob: r.lob.length > 16 ? r.lob.substring(0, 16) + '..' : r.lob,
    lossRatio: Number(r.loss_ratio),
    policies: Number(r.policies),
  }));

  return (
    <div>
      <PageHeader
        title="Risk Scoring & Selection"
        subtitle="Automated underwriting with risk score capture, referral & override tracking — powered by reporting layer"
        breadcrumbs={[{ label: 'Underwriting', path: '/underwriting/quotes' }, { label: 'Risk Scoring & Selection' }]}
        actions={
          <button className="btn btn-secondary" onClick={() => navigate('/underwriting/quotes')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ArrowLeft size={15} /> Back to Quotes
          </button>
        }
      />

      {/* Status bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#16a34a', fontWeight: 500 }}>
          <Database size={13} /> Live data — {currentOption?.schema || 'reporting'} schema
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#2563eb', fontWeight: 500 }}>
          <Clock size={13} /> {isActive ? `Filtered: ${from || 'start'} to ${to || 'now'}` : 'All Time'}
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <StatCard icon={FileText} label="Total Policies" value={Number(kpis.total_policies).toLocaleString(locale)} color="#3b82f6" />
        <StatCard icon={IndianRupee} label="Total DWP" value={F(kpis.total_dwp)} color="#22c55e" />
        <StatCard icon={TrendingUp} label="New Business" value={Number(kpis.new_biz).toLocaleString(locale)} color="#8b5cf6" />
        <StatCard icon={CheckCircle} label="Renewals" value={Number(kpis.renewals).toLocaleString(locale)} color="#06b6d4" />
        <StatCard icon={Percent} label="Loss Ratio" value={kpis.loss_ratio} suffix="%" color="#ef4444" />
        <StatCard icon={Target} label="Avg Premium" value={F(kpis.avg_premium)} color="#f59e0b" />
      </div>

      {/* ── ROW 1: Risk by LOB + UW Decisions Pie ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div className="card">
          <div className="card-header"><h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><BarChart3 size={16} /> DWP & Loss Ratio by LOB</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskByLob} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tickFormatter={F} tick={{ fontSize: 11 }} />
                <YAxis dataKey="lob" type="category" tick={{ fontSize: 10 }} width={150} />
                <Tooltip formatter={(v, name) => name === 'DWP' ? FL(v) : `${v}%`} />
                <Legend />
                <Bar dataKey="dwp" name="DWP" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><PieChartIcon size={16} /> Transaction Type Breakdown</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={uwPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="count" nameKey="decision"
                  label={({ decision, percentage }) => `${decision} (${percentage}%)`} labelLine={{ stroke: '#94a3b8' }}>
                  {uwPieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={(v, name, props) => [`${v} policies (${FL(props.payload.premium)})`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── ROW 2: Loss Ratio by LOB bar + Risk by Region table ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div className="card">
          <div className="card-header"><h3>Loss Ratio by LOB</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={riskByLob}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="lob" tick={{ fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis unit="%" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="loss_ratio" name="Loss Ratio %" radius={[4, 4, 0, 0]}>
                  {riskByLob.map((d, i) => (
                    <Cell key={i} fill={Number(d.loss_ratio) > 80 ? '#ef4444' : Number(d.loss_ratio) > 60 ? '#f59e0b' : '#22c55e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Risk & DWP by Region</h3></div>
          <div className="card-body">
            <table className="data-table">
              <thead>
                <tr><th>Region</th><th>Policies</th><th>DWP</th><th>Loss Ratio</th><th>Risk Level</th></tr>
              </thead>
              <tbody>
                {riskByRegion.map((r) => (
                  <tr key={r.region}>
                    <td style={{ fontWeight: 600 }}>{r.region}</td>
                    <td>{Number(r.policies).toLocaleString(locale)}</td>
                    <td style={{ fontWeight: 600 }}>{F(r.dwp)}</td>
                    <td style={{ color: Number(r.loss_ratio) > 80 ? '#ef4444' : Number(r.loss_ratio) > 60 ? '#f59e0b' : '#22c55e', fontWeight: 600 }}>{r.loss_ratio}%</td>
                    <td><span className={`badge ${Number(r.loss_ratio) <= 60 ? 'badge-green' : Number(r.loss_ratio) <= 80 ? 'badge-yellow' : 'badge-red'}`}>{Number(r.loss_ratio) <= 60 ? 'Low' : Number(r.loss_ratio) <= 80 ? 'Medium' : 'High'}</span></td>
                  </tr>
                ))}
                {riskByRegion.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '1.5rem' }}>No data in selected period</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── ROW 3: Monthly Trend + Risk Radar ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div className="card">
          <div className="card-header"><h3>Monthly Policy & Premium Trend</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} unit="%" />
                <Tooltip formatter={(v, name) => name === 'DWP' ? FL(v) : name === 'Loss Ratio %' ? `${v}%` : v} />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="policies" name="Policies" stroke="#3b82f6" fill="#3b82f620" strokeWidth={2} />
                <Area yAxisId="left" type="monotone" dataKey="new_biz" name="New Business" stroke="#22c55e" fill="#22c55e20" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="loss_ratio" name="Loss Ratio %" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>LOB Risk Radar</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="lob" tick={{ fontSize: 9 }} />
                <PolarRadiusAxis tick={{ fontSize: 9 }} />
                <Radar name="Loss Ratio" dataKey="lossRatio" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                <Radar name="Policies" dataKey="policies" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── ROW 4: LOB Detail Table ── */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-header"><h3>LOB Performance Summary</h3></div>
        <table className="data-table">
          <thead>
            <tr><th>Line of Business</th><th>Policies</th><th>Written Premium</th><th>Loss Ratio</th><th>Risk Level</th></tr>
          </thead>
          <tbody>
            {riskByLob.slice(0, 20).map((r, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{r.lob}</td>
                <td>{Number(r.policies).toLocaleString(locale)}</td>
                <td style={{ fontWeight: 600 }}>{FL(r.dwp)}</td>
                <td style={{ color: Number(r.loss_ratio) > 80 ? '#ef4444' : Number(r.loss_ratio) > 60 ? '#f59e0b' : '#22c55e', fontWeight: 700 }}>{r.loss_ratio}%</td>
                <td>
                  <span className={`badge ${Number(r.loss_ratio) <= 60 ? 'badge-green' : Number(r.loss_ratio) <= 80 ? 'badge-yellow' : 'badge-red'}`}>
                    {Number(r.loss_ratio) <= 60 ? 'Low' : Number(r.loss_ratio) <= 80 ? 'Medium' : 'High'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
