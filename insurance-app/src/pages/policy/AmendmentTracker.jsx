import { useState, useEffect, useCallback } from 'react';
import { FileText, RefreshCw, IndianRupee, Layers, Loader2, Database, Clock, Percent } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie, AreaChart, Area } from 'recharts';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { useDateFilter } from '../../context/DateFilterContext';
import { useSchema } from '../../context/SchemaContext';
import useCurrency from '../../hooks/useCurrency';
import { fetchAmendmentKPIs, fetchAmendmentsByType, fetchAmendmentsMonthly, fetchAmendmentsByLob } from '../../api';

const COLORS = ['#3b82f6','#22c55e','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4'];

export default function AmendmentTracker() {
  const { from, to, isActive } = useDateFilter();
  const { currentOption } = useSchema();
  const { F, FL, symbol, locale } = useCurrency();
  const [kpis, setKpis] = useState(null);
  const [byType, setByType] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [byLob, setByLob] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try { setLoading(true);
      const [k,t,m,l] = await Promise.all([fetchAmendmentKPIs(from,to),fetchAmendmentsByType(from,to),fetchAmendmentsMonthly(from,to),fetchAmendmentsByLob(from,to)]);
      setKpis(k); setByType(t); setMonthly(m); setByLob(l); setError(null);
    } catch(e){setError(e.message)} finally{setLoading(false)}
  },[from,to]);
  useEffect(()=>{load()},[load]);

  if(loading) return <div><PageHeader title="Policy Mid-Term Change & Amendment Tracker" subtitle="Track every mid-term policy change in a live timeline" breadcrumbs={[{label:'Policy Admin',path:'/policy/list'},{label:'Amendment Tracker'}]}/><div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.75rem',padding:'4rem',color:'#64748b'}}><Loader2 size={20} style={{animation:'spin 1s linear infinite'}}/>Loading...</div><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  if(error) return <div><PageHeader title="Policy Mid-Term Change & Amendment Tracker" breadcrumbs={[{label:'Policy Admin',path:'/policy/list'},{label:'Amendment Tracker'}]}/><div style={{padding:'2rem',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'0.5rem',color:'#dc2626'}}><strong>Error:</strong> {error}</div></div>;

  const pieData = byType.map((d,i)=>({...d, color: COLORS[i%COLORS.length], txn_count: Number(d.txn_count)}));

  return (
    <div>
      <PageHeader title="Policy Mid-Term Change & Amendment Tracker" subtitle="Track every mid-term policy change — coverage additions, limit adjustments, endorsements, corrections — reducing E&O exposure" breadcrumbs={[{label:'Policy Admin',path:'/policy/list'},{label:'Amendment Tracker'}]}/>
      <div style={{display:'flex',gap:'0.75rem',marginBottom:'1rem',flexWrap:'wrap'}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#16a34a',fontWeight:500}}><Database size={13}/> Live data — {currentOption?.schema || 'reporting'} schema</div>
        <div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#2563eb',fontWeight:500}}><Clock size={13}/> {isActive?`Filtered: ${from||'start'} to ${to||'now'}`:'All Time'}</div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'1rem',marginBottom:'1.5rem'}}>
        <StatCard icon={FileText} label="Total Transactions" value={Number(kpis.total_transactions).toLocaleString(locale)} color="#3b82f6"/>
        <StatCard icon={Layers} label="Policies with Changes" value={Number(kpis.policies_with_changes).toLocaleString(locale)} color="#22c55e"/>
        <StatCard icon={Percent} label="Avg Amendments/Policy" value={kpis.avg_amendments_per_policy} color="#f59e0b"/>
        <StatCard icon={IndianRupee} label="Endorsement Premium" value={F(kpis.endorsement_premium)} color="#8b5cf6"/>
        <StatCard icon={RefreshCw} label="Reinstatement Premium" value={F(kpis.reinstatement_premium)} color="#06b6d4"/>
        <StatCard icon={IndianRupee} label="Total Written" value={F(kpis.total_written)} color="#ec4899"/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1.5rem'}}>
        <div className="card">
          <div className="card-header"><h3>Transaction Type Breakdown</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart><Pie data={pieData} dataKey="txn_count" nameKey="event_type" cx="50%" cy="50%" innerRadius={55} outerRadius={100} paddingAngle={3} label={({event_type,txn_count})=>`${event_type} (${txn_count})`} labelLine={{stroke:'#94a3b8'}}>{pieData.map((d,i)=><Cell key={i} fill={d.color}/>)}</Pie><Tooltip formatter={(v,n,p)=>[`${v} txns (${FL(p.payload.premium)})`,n]}/></PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3>Yearly Amendment Volume</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis dataKey="year" tick={{fontSize:10}}/><YAxis tick={{fontSize:11}}/>
                <Tooltip/><Legend/>
                <Area type="monotone" dataKey="transactions" name="Transactions" stroke="#3b82f6" fill="#3b82f620" strokeWidth={2}/>
                <Area type="monotone" dataKey="reinstatements" name="Reinstatements" stroke="#f59e0b" fill="#f59e0b20" strokeWidth={2}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card" style={{marginBottom:'1.5rem'}}>
        <div className="card-header"><h3>Written vs Earned Premium — Yearly Trend</h3></div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthly}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis dataKey="year" tick={{fontSize:10}}/><YAxis tickFormatter={F} tick={{fontSize:11}}/><Tooltip formatter={v=>FL(v)}/><Legend/><Bar dataKey="written_premium" name="Written Premium" fill="#3b82f6" radius={[4,4,0,0]}/><Bar dataKey="earned_premium" name="Earned Premium" fill="#22c55e" radius={[4,4,0,0]}/></BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3>Amendment Activity by LOB</h3></div>
        <table className="data-table">
          <thead><tr><th>LOB</th><th>Transactions</th><th>Policies</th><th>Avg/Policy</th><th>Endorsement Premium</th></tr></thead>
          <tbody>{byLob.map((r,i)=><tr key={i}><td style={{fontWeight:600}}>{r.lob}</td><td>{Number(r.transactions).toLocaleString(locale)}</td><td>{Number(r.policies).toLocaleString(locale)}</td><td style={{fontWeight:600}}>{r.avg_per_policy}</td><td>{F(r.endorsement_premium)}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
