import { useState, useEffect, useCallback } from 'react';
import {
  XCircle, IndianRupee, Percent, AlertTriangle,
  Loader2, Database, Clock, FileText, Users,
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
  fetchCancellationKPIs, fetchCancellationByLob, fetchCancellationByRegion,
  fetchCancellationMonthly, fetchCancellationByAgent,
} from '../../api';

export default function CancellationPatterns() {
  const { from, to, isActive } = useDateFilter();
  const { currentOption } = useSchema();
  const { F, FL, symbol, locale } = useCurrency();
  const [kpis, setKpis] = useState(null);
  const [byLob, setByLob] = useState([]);
  const [byRegion, setByRegion] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [byAgent, setByAgent] = useState([]);
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
      const [k, l, r, m, a] = await Promise.all([
        fetchCancellationKPIs(from,to), fetchCancellationByLob(from,to),
        fetchCancellationByRegion(from,to), fetchCancellationMonthly(from,to),
        fetchCancellationByAgent(from,to),
      ]);
      setKpis(k); setByLob(l); setByRegion(r); setMonthly(m); setByAgent(a); setError(null);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }, [from, to]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return (
    <div>
      <PageHeader title="Cancellation Pattern Analytics" subtitle="Detect early cancellation signals by producer, product, and region" breadcrumbs={[{label:'Underwriting & Quotes',path:'/underwriting/quotes'},{label:'Cancellation Patterns'}]} />
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.75rem',padding:'4rem',color:'#64748b'}}><Loader2 size={20} style={{animation:'spin 1s linear infinite'}} /> Loading...</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div>
      <PageHeader title="Cancellation Pattern Analytics" subtitle="Detect early cancellation signals by producer, product, and region" breadcrumbs={[{label:'Underwriting & Quotes',path:'/underwriting/quotes'},{label:'Cancellation Patterns'}]} />
      <div style={{padding:'2rem',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'0.5rem',color:'#dc2626'}}><strong>Error:</strong> {error}</div>
    </div>
  );

  return (
    <div>
      <PageHeader title="Cancellation Pattern Analytics" subtitle="Detect early cancellation signals by producer, product, and region to identify adverse selection and adjust appetite proactively" breadcrumbs={[{label:'Underwriting & Quotes',path:'/underwriting/quotes'},{label:'Cancellation Patterns'}]} />

      <div style={{display:'flex',gap:'0.75rem',marginBottom:'1rem',flexWrap:'wrap'}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#16a34a',fontWeight:500}}><Database size={13}/> Live data — {currentOption?.schema || 'reporting'} schema</div>
        <div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#2563eb',fontWeight:500}}><Clock size={13}/> {isActive ? `Filtered: ${from||'start'} to ${to||'now'}` : 'All Time'}</div>
      </div>

      {/* KPIs */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'1rem',marginBottom:'1.5rem'}}>
        <StatCard icon={FileText} label="Total Policies" value={Number(kpis.total_policies).toLocaleString(locale)} color="#3b82f6" />
        <StatCard icon={XCircle} label="Cancelled Policies" value={Number(kpis.cancelled_count).toLocaleString(locale)} color="#ef4444" />
        <StatCard icon={IndianRupee} label="Cancelled Premium" value={formatKpiCurrency(kpis.cancelled_premium)} color="#f59e0b" />
        <StatCard icon={Percent} label="Cancellation Rate" value={kpis.cancellation_rate} suffix="%" color="#ec4899" />
        <StatCard icon={AlertTriangle} label="Avg Cancelled Premium" value={formatKpiCurrency(kpis.avg_cancelled_premium)} color="#8b5cf6" />
        <StatCard icon={IndianRupee} label="Total Written" value={formatKpiCurrency(kpis.total_written)} color="#22c55e" />
      </div>

      {/* Row 1: Monthly cancellation trend + Cancellations by LOB */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1.5rem'}}>
        <div className="card">
          <div className="card-header"><h3>Cancellation Trend — Monthly</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{fontSize:10}} />
                <YAxis yAxisId="left" tick={{fontSize:11}} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={F} tick={{fontSize:11}} />
                <Tooltip formatter={(v,name)=> name.includes('Premium') ? FL(v) : v} />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="cancelled" name="Cancelled Policies" stroke="#ef4444" fill="#ef444430" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="cancelled_premium" name="Cancelled Premium" stroke="#f59e0b" strokeWidth={2} dot={{r:3}} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Cancellations by LOB</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byLob} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{fontSize:11}} />
                <YAxis dataKey="lob" type="category" tick={{fontSize:9}} width={150} />
                <Tooltip />
                <Legend />
                <Bar dataKey="cancelled" name="Cancelled" fill="#ef4444" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Cancellation rate by LOB + By Region table */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1.5rem'}}>
        <div className="card">
          <div className="card-header"><h3>Cancellation Rate by LOB</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byLob}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="lob" tick={{fontSize:8}} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis unit="%" tick={{fontSize:11}} />
                <Tooltip formatter={(v)=>`${v}%`} />
                <Bar dataKey="cancellation_rate" name="Cancellation Rate %" radius={[4,4,0,0]}>
                  {byLob.map((d,i) => <Cell key={i} fill={Number(d.cancellation_rate)>15?'#ef4444':Number(d.cancellation_rate)>8?'#f59e0b':'#22c55e'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Top Cancellation Regions</h3></div>
          <table className="data-table">
            <thead><tr><th>Region</th><th>Cancelled</th><th>Premium Lost</th><th>Total Policies</th><th>Rate</th><th>Flag</th></tr></thead>
            <tbody>
              {byRegion.map((r,i) => (
                <tr key={i}>
                  <td style={{fontWeight:600}}>{r.region}</td>
                  <td style={{color:'#ef4444',fontWeight:600}}>{r.cancelled}</td>
                  <td>{F(r.cancelled_premium)}</td>
                  <td>{r.total_policies}</td>
                  <td style={{fontWeight:700}}>{r.cancellation_rate}%</td>
                  <td><span className={`badge ${Number(r.cancellation_rate)>15?'badge-red':Number(r.cancellation_rate)>8?'badge-yellow':'badge-green'}`}>{Number(r.cancellation_rate)>15?'High':Number(r.cancellation_rate)>8?'Watch':'Normal'}</span></td>
                </tr>
              ))}
              {byRegion.length===0 && <tr><td colSpan={6} style={{textAlign:'center',color:'#94a3b8',padding:'1.5rem'}}>No data</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 3: Agent cancellation table */}
      <div className="card">
        <div className="card-header"><h3><Users size={16} style={{marginRight:'0.4rem',verticalAlign:'text-bottom'}} />Top 10 Agents — Cancellation Analysis</h3></div>
        <table className="data-table">
          <thead><tr><th>Agent / Producer</th><th>Total Policies</th><th>Cancelled</th><th>Cancellation Rate</th><th>Cancelled Premium</th><th>Total DWP</th><th>Flag</th></tr></thead>
          <tbody>
            {byAgent.map((r,i) => (
              <tr key={i}>
                <td style={{fontWeight:600}}>{r.agent}</td>
                <td>{Number(r.total_policies).toLocaleString(locale)}</td>
                <td style={{color:'#ef4444',fontWeight:600}}>{r.cancelled}</td>
                <td style={{fontWeight:700}}>{r.cancellation_rate}%</td>
                <td>{F(r.cancelled_premium)}</td>
                <td>{F(r.total_dwp)}</td>
                <td><span className={`badge ${Number(r.cancellation_rate)>15?'badge-red':Number(r.cancellation_rate)>8?'badge-yellow':'badge-green'}`}>{Number(r.cancellation_rate)>15?'Adverse':Number(r.cancellation_rate)>8?'Watch':'Normal'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
