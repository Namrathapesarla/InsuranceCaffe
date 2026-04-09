import { useState, useEffect, useCallback } from 'react';
import {
  IndianRupee, Percent, Users, FileText, Shield,
  Loader2, Database, Clock,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell,
} from 'recharts';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { useDateFilter } from '../../context/DateFilterContext';
import { fetchAgentCommKPIs, fetchAgentCommByAgent } from '../../api';
import useCurrency from '../../hooks/useCurrency';

export default function AgentCommission() {
  const { from, to, isActive } = useDateFilter();
  const { F, FL, symbol, locale } = useCurrency();
  const [kpis, setKpis] = useState(null);
  const [byAgent, setByAgent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [kpiData, agentData] = await Promise.all([
        fetchAgentCommKPIs(from, to),
        fetchAgentCommByAgent(from, to),
      ]);
      setKpis(kpiData);
      setByAgent(agentData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => { loadData(); }, [loadData]);

  const breadcrumbs = [{ label: 'Agent/Broker', path: '/agent/list' }, { label: 'Commission' }];

  if (loading) {
    return (
      <div>
        <PageHeader title="Commission Calculation" subtitle="IRDAI cap validation, payment processing, and audit trail" breadcrumbs={breadcrumbs} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '4rem', color: '#64748b' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
          Loading commission data from PostgreSQL...
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Commission Calculation" subtitle="IRDAI cap validation, payment processing, and audit trail" breadcrumbs={breadcrumbs} />
        <div style={{ padding: '2rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', color: '#dc2626' }}>
          <strong>Database connection error:</strong> {error}
          <br /><span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Make sure the backend server is running: <code>cd server && npm run dev</code></span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Commission Calculation" subtitle="IRDAI cap validation, payment processing, and audit trail" breadcrumbs={breadcrumbs} />

      {/* Status bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#16a34a', fontWeight: 500 }}><Database size={13} />Live data</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#2563eb', fontWeight: 500 }}><Clock size={13} />{isActive ? `Filtered: ${from || 'start'} to ${to || 'now'}` : 'All Time'}</div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard icon={IndianRupee} label="Total Written" value={F(kpis.written)} color="#3b82f6" />
        <StatCard icon={IndianRupee} label="Company Commission" value={F(kpis.co_comm)} color="#22c55e" />
        <StatCard icon={IndianRupee} label="Producer Commission" value={F(kpis.pr_comm)} color="#8b5cf6" />
        <StatCard icon={IndianRupee} label="Total Commission" value={F(kpis.total_comm)} color="#f59e0b" />
        <StatCard icon={Percent} label="Avg Rate" value={kpis.avg_rate} suffix="%" color="#ef4444" />
        <StatCard icon={Users} label="Active Agents" value={kpis.agents} color="#06b6d4" />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Chart 1: Company vs Producer Commission */}
        <div className="card">
          <div className="card-header"><h3>Company vs Producer Commission by Agent</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byAgent} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tickFormatter={F} tick={{ fontSize: 11 }} />
                <YAxis dataKey="agent" type="category" tick={{ fontSize: 11 }} width={140} />
                <Tooltip formatter={(v) => FL(v)} />
                <Legend />
                <Bar dataKey="co_comm" name="Company Commission" stackId="comm" fill="#3b82f6" />
                <Bar dataKey="pr_comm" name="Producer Commission" stackId="comm" fill="#22c55e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Total Commission by Agent (stacked co + producer) */}
        <div className="card">
          <div className="card-header"><h3>Total Commission Payout by Agent</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byAgent}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="agent" tick={{ fontSize: 9 }} interval={0} angle={-25} textAnchor="end" height={60} />
                <YAxis tickFormatter={F} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => FL(v)} />
                <Legend />
                <Bar dataKey="co_comm" name="Company" stackId="c" fill="#3b82f6" />
                <Bar dataKey="pr_comm" name="Producer" stackId="c" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header"><h3>Commission Detail by Agent</h3></div>
        <table className="data-table">
          <thead><tr><th>Agent</th><th>Policies</th><th>Written</th><th>Net Written</th><th>Co. Comm</th><th>Prod. Comm</th><th>Total Comm</th><th>Rate</th><th>Retention</th></tr></thead>
          <tbody>
            {byAgent.map((r, i) => (
              <tr key={i}>
                <td style={{fontWeight:600}}>{r.agent}</td>
                <td>{r.policies}</td>
                <td>{F(r.written)}</td>
                <td>{F(r.net_written)}</td>
                <td>{F(r.co_comm)}</td>
                <td style={{color:'#8b5cf6',fontWeight:600}}>{F(r.pr_comm)}</td>
                <td style={{fontWeight:700}}>{F(r.total_comm)}</td>
                <td style={{fontWeight:600}}>{r.rate}%</td>
                <td style={{fontWeight:600,color:Number(r.retention_pct)>=85?'#22c55e':'#f59e0b'}}>{r.retention_pct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
