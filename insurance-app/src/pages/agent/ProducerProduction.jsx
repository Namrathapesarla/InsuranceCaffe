import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, Loader2, Database, Clock, IndianRupee, FileText, Users, Layers,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { useDateFilter } from '../../context/DateFilterContext';
import { fetchAgentProductionByAgent, fetchAgentProductionByLob } from '../../api';
import useCurrency from '../../hooks/useCurrency';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1'];

export default function ProducerProduction() {
  const { from, to, isActive } = useDateFilter();
  const { F, FL, symbol, locale } = useCurrency();
  const [byAgent, setByAgent] = useState([]);
  const [byLob, setByLob] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [agentData, lobData] = await Promise.all([
        fetchAgentProductionByAgent(from, to),
        fetchAgentProductionByLob(from, to),
      ]);
      setByAgent(agentData);
      setByLob(lobData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => { loadData(); }, [loadData]);

  const breadcrumbs = [{ label: 'Agent/Broker', path: '/agent/list' }, { label: 'Production Report' }];

  if (loading) {
    return (
      <div>
        <PageHeader title="Producer Production Report" subtitle="Written premium, exposure, new business by producer with trend analysis" breadcrumbs={breadcrumbs} />
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
        <PageHeader title="Producer Production Report" subtitle="Written premium, exposure, new business by producer with trend analysis" breadcrumbs={breadcrumbs} />
        <div style={{ padding: '2rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', color: '#dc2626' }}>
          <strong>Database connection error:</strong> {error}
          <br /><span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Make sure the backend server is running: <code>cd server && npm run dev</code></span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Producer Production Report" subtitle="Written premium, exposure, new business by producer with trend analysis" breadcrumbs={breadcrumbs} />

      {/* Status bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#16a34a', fontWeight: 500 }}><Database size={13} />Live data</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#2563eb', fontWeight: 500 }}><Clock size={13} />{isActive ? `Filtered: ${from || 'start'} to ${to || 'now'}` : 'All Time'}</div>
      </div>

      {/* KPIs derived from data */}
      {(() => {
        const totals = byAgent.reduce((a, r) => ({ agents: a.agents + 1, policies: a.policies + Number(r.policies), written: a.written + Number(r.written), earned: a.earned + Number(r.earned), newBiz: a.newBiz + Number(r.new_biz), renewals: a.renewals + Number(r.renewals) }), { agents: 0, policies: 0, written: 0, earned: 0, newBiz: 0, renewals: 0 });
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <StatCard icon={Users} label="Producers" value={totals.agents} color="#3b82f6" />
            <StatCard icon={FileText} label="Total Policies" value={totals.policies.toLocaleString(locale)} color="#22c55e" />
            <StatCard icon={IndianRupee} label="Written Premium" value={F(totals.written)} color="#8b5cf6" />
            <StatCard icon={IndianRupee} label="Earned Premium" value={F(totals.earned)} color="#06b6d4" />
            <StatCard icon={TrendingUp} label="New Business" value={totals.newBiz.toLocaleString(locale)} color="#f59e0b" />
            <StatCard icon={Layers} label="Renewals" value={totals.renewals.toLocaleString(locale)} color="#ec4899" />
          </div>
        );
      })()}

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
                <Bar dataKey="written" name="Written Premium" radius={[0, 4, 4, 0]}>
                  {byAgent.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Production by LOB */}
        <div className="card">
          <div className="card-header"><h3>Production by LOB</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byLob} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tickFormatter={F} tick={{ fontSize: 11 }} />
                <YAxis dataKey="lob" type="category" tick={{ fontSize: 11 }} width={140} />
                <Tooltip formatter={(v) => FL(v)} />
                <Bar dataKey="written" name="Written Premium" radius={[0, 4, 4, 0]}>
                  {byLob.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header"><h3>Agent Production Detail</h3></div>
        <div className="card-body" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '0.5rem' }}>Agent</th>
                <th style={{ padding: '0.5rem' }}>Policies</th>
                <th style={{ padding: '0.5rem' }}>Written Premium</th>
                <th style={{ padding: '0.5rem' }}>Earned Premium</th>
                <th style={{ padding: '0.5rem' }}>New Biz</th>
                <th style={{ padding: '0.5rem' }}>Renewals</th>
                <th style={{ padding: '0.5rem' }}>Exposures</th>
              </tr>
            </thead>
            <tbody>
              {byAgent.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 600 }}>{r.agent}</td>
                  <td style={{ padding: '0.5rem' }}>{r.policies}</td>
                  <td style={{ padding: '0.5rem' }}>{F(r.written)}</td>
                  <td style={{ padding: '0.5rem' }}>{F(r.earned)}</td>
                  <td style={{ padding: '0.5rem' }}>{r.new_biz}</td>
                  <td style={{ padding: '0.5rem' }}>{r.renewals}</td>
                  <td style={{ padding: '0.5rem' }}>{r.exposures}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
