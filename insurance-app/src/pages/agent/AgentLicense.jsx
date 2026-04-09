import { useState, useEffect, useCallback } from 'react';
import {
  Users, FileText, IndianRupee, Shield, UserCheck,
  Loader2, Database, Clock,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { useDateFilter } from '../../context/DateFilterContext';
import { fetchAgentLicenseKPIs, fetchAgentLicenseByAgent } from '../../api';
import useCurrency from '../../hooks/useCurrency';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1'];

export default function AgentLicense() {
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
        fetchAgentLicenseKPIs(from, to),
        fetchAgentLicenseByAgent(from, to),
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

  const breadcrumbs = [{ label: 'Agent/Broker', path: '/agent/list' }, { label: 'License Tracking' }];

  if (loading) {
    return (
      <div>
        <PageHeader title="Agent License Tracking" subtitle="Expiry alerts, renewal reminders, training compliance tracking" breadcrumbs={breadcrumbs} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '4rem', color: '#64748b' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
          Loading license data from PostgreSQL...
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Agent License Tracking" subtitle="Expiry alerts, renewal reminders, training compliance tracking" breadcrumbs={breadcrumbs} />
        <div style={{ padding: '2rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', color: '#dc2626' }}>
          <strong>Database connection error:</strong> {error}
          <br /><span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Make sure the backend server is running: <code>cd server && npm run dev</code></span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Agent License Tracking" subtitle="Expiry alerts, renewal reminders, training compliance tracking" breadcrumbs={breadcrumbs} />

      {/* Status bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#16a34a', fontWeight: 500 }}><Database size={13} />Live data</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#2563eb', fontWeight: 500 }}><Clock size={13} />{isActive ? `Filtered: ${from || 'start'} to ${to || 'now'}` : 'All Time'}</div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard icon={Users} label="Total Agents" value={kpis.total_agents} color="#3b82f6" />
        <StatCard icon={UserCheck} label="Active Agents" value={kpis.active_agents} color="#22c55e" />
        <StatCard icon={FileText} label="Total Policies" value={kpis.total_policies} color="#8b5cf6" />
        <StatCard icon={IndianRupee} label="Total Written" value={F(kpis.total_written)} color="#f59e0b" />
        <StatCard icon={IndianRupee} label="Total Commission" value={F(kpis.total_commission)} color="#ef4444" />
      </div>

      {/* Chart: Written Premium by Agent */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="card-header"><h3>Written Premium by Agent</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byAgent} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tickFormatter={F} tick={{ fontSize: 11 }} />
                <YAxis dataKey="agent" type="category" tick={{ fontSize: 11 }} width={140} />
                <Tooltip formatter={(v) => FL(v)} />
                <Bar dataKey="written" name="Written Premium" radius={[0, 4, 4, 0]}>
                  {byAgent.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header"><h3>Agent License Detail</h3></div>
        <div className="card-body" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '0.5rem' }}>Agent</th>
                <th style={{ padding: '0.5rem' }}>License</th>
                <th style={{ padding: '0.5rem' }}>Status</th>
                <th style={{ padding: '0.5rem' }}>Territory</th>
                <th style={{ padding: '0.5rem' }}>Policies</th>
                <th style={{ padding: '0.5rem' }}>Written Premium</th>
              </tr>
            </thead>
            <tbody>
              {byAgent.map((r, i) => {
                const status = r.status || null;
                const badge = status === 'Active'
                  ? { bg: '#f0fdf4', border: '#bbf7d0', color: '#16a34a' }
                  : status === 'Expired' || status === 'Suspended'
                    ? { bg: '#fef2f2', border: '#fecaca', color: '#dc2626' }
                    : status === 'Expiring'
                      ? { bg: '#fefce8', border: '#fef08a', color: '#ca8a04' }
                      : { bg: '#f1f5f9', border: '#e2e8f0', color: '#64748b' };
                const statusLabel = status || 'Unknown';
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 600 }}>{r.agent}</td>
                    <td style={{ padding: '0.5rem', fontFamily: 'monospace', fontSize: '0.75rem' }}>{r.license}</td>
                    <td style={{ padding: '0.5rem' }}>
                      <span style={{ display: 'inline-block', padding: '0.2rem 0.5rem', background: badge.bg, border: `1px solid ${badge.border}`, borderRadius: '0.375rem', fontSize: '0.7rem', color: badge.color, fontWeight: 600 }}>{statusLabel}</span>
                    </td>
                    <td style={{ padding: '0.5rem' }}>{r.territory}</td>
                    <td style={{ padding: '0.5rem' }}>{r.policies}</td>
                    <td style={{ padding: '0.5rem' }}>{F(r.written)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
