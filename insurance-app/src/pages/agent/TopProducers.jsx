import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, Loader2, Database, Clock, IndianRupee, FileText, Users, Percent, AlertTriangle,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { useDateFilter } from '../../context/DateFilterContext';
import { fetchTopProducers } from '../../api';
import useCurrency from '../../hooks/useCurrency';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1'];

export default function TopProducers() {
  const { from, to, isActive } = useDateFilter();
  const { F, FL, symbol, locale } = useCurrency();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchTopProducers(from, to);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => { loadData(); }, [loadData]);

  const breadcrumbs = [{ label: 'Agent/Broker', path: '/agent/list' }, { label: 'Top Producers' }];

  if (loading) {
    return (
      <div>
        <PageHeader title="Top 10 Producers by Premium" subtitle="Ranked performance with loss ratio overlay and profitability" breadcrumbs={breadcrumbs} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '4rem', color: '#64748b' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
          Loading top producers from PostgreSQL...
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Top 10 Producers by Premium" subtitle="Ranked performance with loss ratio overlay and profitability" breadcrumbs={breadcrumbs} />
        <div style={{ padding: '2rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', color: '#dc2626' }}>
          <strong>Database connection error:</strong> {error}
          <br /><span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Make sure the backend server is running: <code>cd server && npm run dev</code></span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Top 10 Producers by Premium" subtitle="Ranked performance with loss ratio overlay and profitability" breadcrumbs={breadcrumbs} />

      {/* Status bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#16a34a', fontWeight: 500 }}><Database size={13} />Live data</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#2563eb', fontWeight: 500 }}><Clock size={13} />{isActive ? `Filtered: ${from || 'start'} to ${to || 'now'}` : 'All Time'}</div>
      </div>

      {/* KPIs derived from data */}
      {(() => {
        const t = data.reduce((a, r) => ({ producers: a.producers + 1, policies: a.policies + Number(r.policies), written: a.written + Number(r.written), earned: a.earned + Number(r.earned), commission: a.commission + Number(r.commission), incurred: a.incurred + Number(r.incurred) }), { producers: 0, policies: 0, written: 0, earned: 0, commission: 0, incurred: 0 });
        const lr = t.earned > 0 ? (t.incurred * 100 / t.earned).toFixed(1) : 0;
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <StatCard icon={Users} label="Top Producers" value={t.producers} color="#3b82f6" />
            <StatCard icon={FileText} label="Total Policies" value={t.policies.toLocaleString(locale)} color="#22c55e" />
            <StatCard icon={IndianRupee} label="Written Premium" value={F(t.written)} color="#8b5cf6" />
            <StatCard icon={IndianRupee} label="Commission" value={F(t.commission)} color="#f59e0b" />
            <StatCard icon={AlertTriangle} label="Incurred Loss" value={F(t.incurred)} color="#ef4444" />
            <StatCard icon={Percent} label="Avg Loss Ratio" value={lr} suffix="%" color="#06b6d4" />
          </div>
        );
      })()}

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Chart 1: Written Premium */}
        <div className="card">
          <div className="card-header"><h3>Written Premium by Producer</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tickFormatter={F} tick={{ fontSize: 11 }} />
                <YAxis dataKey="agent" type="category" tick={{ fontSize: 11 }} width={140} />
                <Tooltip formatter={(v) => FL(v)} />
                <Bar dataKey="written" name="Written Premium" radius={[0, 4, 4, 0]}>
                  {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Loss Ratio by Producer */}
        <div className="card">
          <div className="card-header"><h3>Loss Ratio by Producer</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="agent" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={60} />
                <YAxis unit="%" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="loss_ratio" name="Loss Ratio %" radius={[4, 4, 0, 0]}>
                  {data.map((d, i) => (
                    <Cell key={i} fill={Number(d.loss_ratio) > 80 ? '#ef4444' : Number(d.loss_ratio) > 60 ? '#f59e0b' : '#22c55e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header"><h3>Top Producer Detail</h3></div>
        <div className="card-body" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '0.5rem' }}>Agent</th>
                <th style={{ padding: '0.5rem' }}>Policies</th>
                <th style={{ padding: '0.5rem' }}>Written</th>
                <th style={{ padding: '0.5rem' }}>Earned</th>
                <th style={{ padding: '0.5rem' }}>Commission</th>
                <th style={{ padding: '0.5rem' }}>Incurred</th>
                <th style={{ padding: '0.5rem' }}>Loss Ratio %</th>
                <th style={{ padding: '0.5rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r, i) => {
                const lr = Number(r.loss_ratio);
                const badge = lr <= 60
                  ? { label: 'Profitable', bg: '#f0fdf4', border: '#bbf7d0', color: '#16a34a' }
                  : lr <= 80
                    ? { label: 'Marginal', bg: '#fefce8', border: '#fef08a', color: '#ca8a04' }
                    : { label: 'Unprofitable', bg: '#fef2f2', border: '#fecaca', color: '#dc2626' };
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 600 }}>{r.agent}</td>
                    <td style={{ padding: '0.5rem' }}>{r.policies}</td>
                    <td style={{ padding: '0.5rem' }}>{F(r.written)}</td>
                    <td style={{ padding: '0.5rem' }}>{F(r.earned)}</td>
                    <td style={{ padding: '0.5rem' }}>{F(r.commission)}</td>
                    <td style={{ padding: '0.5rem' }}>{F(r.incurred)}</td>
                    <td style={{ padding: '0.5rem', fontWeight: 600, color: lr > 80 ? '#ef4444' : lr > 60 ? '#f59e0b' : '#22c55e' }}>{r.loss_ratio}%</td>
                    <td style={{ padding: '0.5rem' }}>
                      <span style={{ display: 'inline-block', padding: '0.2rem 0.5rem', background: badge.bg, border: `1px solid ${badge.border}`, borderRadius: '0.375rem', fontSize: '0.7rem', color: badge.color, fontWeight: 600 }}>{badge.label}</span>
                    </td>
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
