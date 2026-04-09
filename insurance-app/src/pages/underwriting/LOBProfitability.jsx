import { useState, useEffect, useCallback } from 'react';
import {
  IndianRupee, Percent, TrendingUp, TrendingDown,
  Loader2, Database, Clock, Layers, DollarSign,
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
import { fetchProfitabilityKPIs, fetchProfitabilityByLob, fetchProfitabilityMonthly } from '../../api';

const COLORS = ['#3b82f6','#22c55e','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#14b8a6','#f97316','#6366f1'];
export default function LOBProfitability() {
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
      const [k, l, m] = await Promise.all([fetchProfitabilityKPIs(from,to), fetchProfitabilityByLob(from,to), fetchProfitabilityMonthly(from,to)]);
      setKpis(k); setByLob(l); setMonthly(m); setError(null);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }, [from, to]);

  useEffect(() => { loadData(); }, [loadData]);

  // Sorted by earned premium desc — top slices for charts/table
  const sortedByLob = [...byLob].sort((a, b) => Number(b.earned) - Number(a.earned));
  const top5Lob = sortedByLob.slice(0, 5);
  const top10Lob = sortedByLob.slice(0, 10);

  if (loading) return (
    <div>
      <PageHeader title="LOB Profitability Drill-down" subtitle="Live loss ratio, earned vs. unearned premium, and discount impact by line" breadcrumbs={[{label:'Underwriting & Quotes',path:'/underwriting/quotes'},{label:'LOB Profitability'}]} />
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.75rem',padding:'4rem',color:'#64748b'}}><Loader2 size={20} style={{animation:'spin 1s linear infinite'}} /> Loading...</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div>
      <PageHeader title="LOB Profitability Drill-down" subtitle="Live loss ratio, earned vs. unearned premium, and discount impact by line" breadcrumbs={[{label:'Underwriting & Quotes',path:'/underwriting/quotes'},{label:'LOB Profitability'}]} />
      <div style={{padding:'2rem',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'0.5rem',color:'#dc2626'}}><strong>Error:</strong> {error}</div>
    </div>
  );

  return (
    <div>
      <PageHeader title="LOB Profitability Drill-down" subtitle="Live loss ratio, earned vs. unearned premium, and discount impact by line — surfacing underperforming segments before quarter-end" breadcrumbs={[{label:'Underwriting & Quotes',path:'/underwriting/quotes'},{label:'LOB Profitability'}]} />

      <div style={{display:'flex',gap:'0.75rem',marginBottom:'1rem',flexWrap:'wrap'}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#16a34a',fontWeight:500}}><Database size={13}/> Live data — {currentOption?.schema || 'reporting'} schema</div>
        <div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#2563eb',fontWeight:500}}><Clock size={13}/> {isActive ? `Filtered: ${from||'start'} to ${to||'now'}` : 'All Time'}</div>
      </div>

      {/* KPIs */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:'1rem',marginBottom:'1.5rem'}}>
        <StatCard icon={IndianRupee} label="Earned Premium" value={F(kpis.earned)} color="#22c55e" />
        <StatCard icon={Layers} label="Unearned Premium" value={F(kpis.unearned)} color="#3b82f6" />
        <StatCard icon={TrendingDown} label="Incurred Loss" value={F(kpis.incurred)} color="#ef4444" />
        <StatCard icon={Percent} label="Loss Ratio" value={kpis.loss_ratio} suffix="%" color="#f59e0b" />
        <StatCard icon={TrendingUp} label="Combined Ratio" value={kpis.combined_ratio} suffix="%" color="#8b5cf6" />
        <StatCard icon={DollarSign} label="Surcharges + Taxes" value={F(Number(kpis.surcharges) + Number(kpis.taxes))} color="#06b6d4" />
      </div>

      {/* Row 1: Earned vs Unearned by LOB + Loss Ratio by LOB */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1.5rem'}}>
        <div className="card">
          <div className="card-header"><h3>Earned vs Unearned Premium by LOB</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={top5Lob} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tickFormatter={F} tick={{fontSize:11}} />
                <YAxis dataKey="lob" type="category" tick={{fontSize:10}} width={150} />
                <Tooltip formatter={(v)=>FL(v)} />
                <Legend />
                <Bar dataKey="earned" name="Earned" stackId="p" fill="#22c55e" />
                <Bar dataKey="unearned" name="Unearned" stackId="p" fill="#3b82f6" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Loss Ratio & Combined Ratio by LOB</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={top5Lob}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="lob" tick={{fontSize:9}} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis unit="%" tick={{fontSize:11}} />
                <Tooltip formatter={(v)=>`${v}%`} />
                <Legend />
                <Bar dataKey="loss_ratio" name="Loss Ratio %" fill="#f59e0b" radius={[4,4,0,0]} barSize={20}>
                  {top5Lob.map((d,i) => <Cell key={i} fill={Number(d.loss_ratio)>80?'#ef4444':Number(d.loss_ratio)>60?'#f59e0b':'#22c55e'} />)}
                </Bar>
                <Bar dataKey="combined_ratio" name="Combined Ratio %" fill="#8b5cf6" radius={[4,4,0,0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Monthly profitability trend */}
      <div className="card" style={{marginBottom:'1.5rem'}}>
        <div className="card-header"><h3>Monthly Profitability Trend — Earned Premium vs Incurred Loss</h3></div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{fontSize:10}} />
              <YAxis yAxisId="left" tickFormatter={F} tick={{fontSize:11}} />
              <YAxis yAxisId="right" orientation="right" unit="%" tick={{fontSize:11}} />
              <Tooltip formatter={(v,name)=> name==='Loss Ratio %' ? `${v}%` : FL(v)} />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="earned" name="Earned Premium" stroke="#22c55e" fill="#22c55e20" strokeWidth={2} />
              <Area yAxisId="left" type="monotone" dataKey="incurred" name="Incurred Loss" stroke="#ef4444" fill="#ef444420" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="loss_ratio" name="Loss Ratio %" stroke="#f59e0b" strokeWidth={2} dot={{r:3}} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Detail table */}
      <div className="card">
        <div className="card-header"><h3>LOB Profitability Detail</h3></div>
        <table className="data-table">
          <thead><tr><th>LOB</th><th>Written</th><th>Earned</th><th>Unearned</th><th>Incurred</th><th>Commission</th><th>Loss Ratio</th><th>Combined</th><th>Status</th></tr></thead>
          <tbody>
            {top10Lob.map((r,i) => (
              <tr key={i}>
                <td style={{fontWeight:600}}>{r.lob}</td>
                <td>{F(r.written)}</td>
                <td>{F(r.earned)}</td>
                <td>{F(r.unearned)}</td>
                <td style={{color:'#ef4444'}}>{F(r.incurred)}</td>
                <td>{F(r.commission)}</td>
                <td style={{fontWeight:700,color:Number(r.loss_ratio)>80?'#ef4444':Number(r.loss_ratio)>60?'#f59e0b':'#22c55e'}}>{r.loss_ratio}%</td>
                <td style={{fontWeight:700,color:Number(r.combined_ratio)>100?'#ef4444':Number(r.combined_ratio)>85?'#f59e0b':'#22c55e'}}>{r.combined_ratio}%</td>
                <td><span className={`badge ${Number(r.combined_ratio)<=85?'badge-green':Number(r.combined_ratio)<=100?'badge-yellow':'badge-red'}`}>{Number(r.combined_ratio)<=85?'Profitable':Number(r.combined_ratio)<=100?'Marginal':'Unprofitable'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
