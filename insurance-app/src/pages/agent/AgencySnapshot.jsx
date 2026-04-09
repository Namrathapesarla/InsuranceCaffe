import { useState, useEffect, useCallback } from 'react';
import {
  Users, FileText, IndianRupee, Percent, Shield, RefreshCw,
  Loader2, Database, Clock,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { useDateFilter } from '../../context/DateFilterContext';
import { fetchAgentSnapshotKPIs, fetchAgentSnapshotByAgent } from '../../api';
import useCurrency from '../../hooks/useCurrency';

export default function AgencySnapshot() {
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
        fetchAgentSnapshotKPIs(from, to),
        fetchAgentSnapshotByAgent(from, to),
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

  const breadcrumbs = [{ label: 'Agent/Broker', path: '/agent/list' }, { label: 'Agency Snapshot' }];

  if (loading) {
    return (
      <div>
        <PageHeader title="Agency Snapshot" subtitle="KPI overview — production, profitability, retention per agent" breadcrumbs={breadcrumbs} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '4rem', color: '#64748b' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
          Loading agency snapshot from PostgreSQL...
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Agency Snapshot" subtitle="KPI overview — production, profitability, retention per agent" breadcrumbs={breadcrumbs} />
        <div style={{ padding: '2rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', color: '#dc2626' }}>
          <strong>Database connection error:</strong> {error}
          <br /><span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Make sure the backend server is running: <code>cd server && npm run dev</code></span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Agency Snapshot" subtitle="KPI overview — production, profitability, retention per agent" breadcrumbs={breadcrumbs} />

      {/* Status bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#16a34a', fontWeight: 500 }}><Database size={13} />Live data</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#2563eb', fontWeight: 500 }}><Clock size={13} />{isActive ? `Filtered: ${from || 'start'} to ${to || 'now'}` : 'All Time'}</div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard icon={Users} label="Active Agents" value={kpis.agents} color="#3b82f6" />
        <StatCard icon={FileText} label="Total Policies" value={kpis.policies} color="#22c55e" />
        <StatCard icon={IndianRupee} label="Written Premium" value={F(kpis.written)} color="#8b5cf6" />
        <StatCard icon={IndianRupee} label="Commission" value={F(kpis.commission)} color="#f59e0b" />
        <StatCard icon={Percent} label="Loss Ratio" value={kpis.loss_ratio} suffix="%" color="#ef4444" />
        <StatCard icon={RefreshCw} label="Retention Rate" value={kpis.retention_rate} suffix="%" color="#06b6d4" />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Chart 1: Written Premium by Agent */}
        <div className="card">
          <div className="card-header"><h3>Written Premium by Agent</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byAgent} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tickFormatter={F} tick={{ fontSize: 11 }} />
                <YAxis dataKey="agent" type="category" tick={{ fontSize: 11 }} width={140} />
                <Tooltip formatter={(v) => FL(v)} />
                <Bar dataKey="written" name="Written Premium" radius={[0, 4, 4, 0]} fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Retention % by Agent */}
        <div className="card">
          <div className="card-header"><h3>Retention % by Agent</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byAgent}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="agent" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={60} />
                <YAxis unit="%" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="retention" name="Retention %" radius={[4, 4, 0, 0]}>
                  {byAgent.map((d, i) => (
                    <Cell key={i} fill={Number(d.retention) >= 80 ? '#22c55e' : Number(d.retention) >= 50 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header"><h3>Agent Detail</h3></div>
        <div className="card-body" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '0.5rem' }}>Agent</th>
                <th style={{ padding: '0.5rem' }}>Policies</th>
                <th style={{ padding: '0.5rem' }}>Written Premium</th>
                <th style={{ padding: '0.5rem' }}>Commission</th>
                <th style={{ padding: '0.5rem' }}>Renewals</th>
                <th style={{ padding: '0.5rem' }}>Retention %</th>
              </tr>
            </thead>
            <tbody>
              {byAgent.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 600 }}>{r.agent}</td>
                  <td style={{ padding: '0.5rem' }}>{r.policies}</td>
                  <td style={{ padding: '0.5rem' }}>{F(r.written)}</td>
                  <td style={{ padding: '0.5rem' }}>{F(r.commission)}</td>
                  <td style={{ padding: '0.5rem' }}>{r.renewals}</td>
                  <td style={{ padding: '0.5rem', color: Number(r.retention) >= 80 ? '#22c55e' : Number(r.retention) >= 50 ? '#f59e0b' : '#ef4444', fontWeight: 600 }}>{r.retention}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
