import { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw, IndianRupee, FileText, Percent, TrendingUp,
  Loader2, Database, Clock, Shield,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell,
} from 'recharts';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { useDateFilter } from '../../context/DateFilterContext';
import { useSchema } from '../../context/SchemaContext';
import useCurrency from '../../hooks/useCurrency';
import { fetchRenewalKPIs, fetchRenewalByLob, fetchRenewalMonthly } from '../../api';

const COLORS = ['#3b82f6','#22c55e','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#14b8a6','#f97316','#6366f1'];
export default function RenewalPrioritization() {
  const { from, to, isActive } = useDateFilter();
  const { currentOption } = useSchema();
  const { F, FL, symbol, locale } = useCurrency();
  const [kpis, setKpis] = useState(null);
  const [byLob, setByLob] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [k, l, m] = await Promise.all([fetchRenewalKPIs(from,to), fetchRenewalByLob(from,to), fetchRenewalMonthly(from,to)]);
      setKpis(k); setByLob(l); setMonthly(m); setError(null);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }, [from, to]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return (
    <div>
      <PageHeader title="Renewal Prioritization Engine" subtitle="Rank upcoming renewals by churn propensity and profitability" breadcrumbs={[{label:'Underwriting & Quotes',path:'/underwriting/quotes'},{label:'Renewal Prioritization'}]} />
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.75rem',padding:'4rem',color:'#64748b'}}><Loader2 size={20} style={{animation:'spin 1s linear infinite'}} /> Loading...</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div>
      <PageHeader title="Renewal Prioritization Engine" subtitle="Rank upcoming renewals by churn propensity and profitability" breadcrumbs={[{label:'Underwriting & Quotes',path:'/underwriting/quotes'},{label:'Renewal Prioritization'}]} />
      <div style={{padding:'2rem',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'0.5rem',color:'#dc2626'}}><strong>Error:</strong> {error}</div>
    </div>
  );

  return (
    <div>
      <PageHeader title="Renewal Prioritization Engine" subtitle="Rank upcoming renewals by churn propensity and profitability — focus on high-value, at-risk accounts first" breadcrumbs={[{label:'Underwriting & Quotes',path:'/underwriting/quotes'},{label:'Renewal Prioritization'}]} />

      <div style={{display:'flex',gap:'0.75rem',marginBottom:'1rem',flexWrap:'wrap'}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#16a34a',fontWeight:500}}><Database size={13}/> Live data — {currentOption?.schema || 'reporting'} schema</div>
        <div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#2563eb',fontWeight:500}}><Clock size={13}/> {isActive ? `Filtered: ${from||'start'} to ${to||'now'}` : 'All Time'}</div>
      </div>

      {/* KPIs */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'1rem',marginBottom:'1.5rem'}}>
        <StatCard icon={FileText} label="Total Policies" value={Number(kpis.total_policies).toLocaleString(locale)} color="#3b82f6" />
        <StatCard icon={RefreshCw} label="Renewed Policies" value={Number(kpis.renewed_count).toLocaleString(locale)} color="#22c55e" />
        <StatCard icon={IndianRupee} label="Renewal Premium" value={F(kpis.renewal_premium)} color="#8b5cf6" />
        <StatCard icon={Shield} label="Inforce Policies" value={Number(kpis.inforce_count).toLocaleString(locale)} color="#06b6d4" />
        <StatCard icon={Percent} label="Avg Loss Ratio" value={kpis.avg_loss_ratio} suffix="%" color="#ef4444" />
        <StatCard icon={TrendingUp} label="Total Earned" value={F(kpis.total_earned)} color="#f59e0b" />
      </div>

      {/* Row 1: Monthly trend */}
      <div className="card" style={{marginBottom:'1.5rem'}}>
        <div className="card-header"><h3>Renewal vs New Business Premium — Monthly</h3></div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{fontSize:10}} />
              <YAxis tickFormatter={F} tick={{fontSize:11}} />
              <Tooltip formatter={(v)=>FL(v)} />
              <Legend />
              <Bar dataKey="renewal_premium" name="Renewal Premium" stackId="p" fill="#22c55e" />
              <Bar dataKey="new_biz_premium" name="New Business Premium" stackId="p" fill="#3b82f6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Renewal count trend + Detail table */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1.5rem'}}>
        <div className="card">
          <div className="card-header"><h3>Policy Count — Renewals vs New Business</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{fontSize:10}} />
                <YAxis tick={{fontSize:11}} />
                <Tooltip />
                <Legend />
                <Bar dataKey="renewals" name="Renewals" fill="#22c55e" radius={[4,4,0,0]} />
                <Bar dataKey="new_biz" name="New Business" fill="#3b82f6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>LOB Renewal & Risk Summary</h3></div>
          <table className="data-table">
            <thead><tr><th>LOB</th><th>Policies</th><th>Renewals</th><th>Renewal Rate</th><th>Loss Ratio</th><th>Risk</th></tr></thead>
            <tbody>
              {byLob.slice(0,7).map((r,i) => (
                <tr key={i}>
                  <td style={{fontWeight:600}}>{r.lob}</td>
                  <td>{Number(r.policies).toLocaleString(locale)}</td>
                  <td>{Number(r.renewals).toLocaleString(locale)}</td>
                  <td style={{fontWeight:600}}>{r.renewal_rate}%</td>
                  <td style={{color:Number(r.loss_ratio)>80?'#ef4444':Number(r.loss_ratio)>60?'#f59e0b':'#22c55e',fontWeight:700}}>{r.loss_ratio}%</td>
                  <td><span className={`badge ${Number(r.loss_ratio)<=60?'badge-green':Number(r.loss_ratio)<=80?'badge-yellow':'badge-red'}`}>{Number(r.loss_ratio)<=60?'Low':Number(r.loss_ratio)<=80?'Medium':'High'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
