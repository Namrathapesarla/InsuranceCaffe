import { useState, useEffect, useCallback } from 'react';
import { IndianRupee, Percent, Shield, TrendingUp, Loader2, Database, Clock, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Line, ComposedChart } from 'recharts';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { useDateFilter } from '../../context/DateFilterContext';
import useCurrency from '../../hooks/useCurrency';
import { fetchSolvencyKPIs, fetchSolvencyYearly } from '../../api';

export default function SolvencyRatio() {
  const {from,to,isActive}=useDateFilter();
  const { F, FL, symbol, locale } = useCurrency();
  const [kpis,setKpis]=useState(null); const [yearly,setYearly]=useState([]);
  const [loading,setLoading]=useState(true); const [error,setError]=useState(null);
  const load=useCallback(async()=>{try{setLoading(true);const[k,y]=await Promise.all([fetchSolvencyKPIs(from,to),fetchSolvencyYearly(from,to)]);setKpis(k);setYearly(y);setError(null);}catch(e){setError(e.message);}finally{setLoading(false);}},[from,to]);
  useEffect(()=>{load();},[load]);
  if(loading)return<div><PageHeader title="Solvency Ratio Monitor" subtitle="Quarterly solvency ratio monitoring per IRDAI mandate" breadcrumbs={[{label:'Billing',path:'/billing/invoices'},{label:'Solvency'}]}/><div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.75rem',padding:'4rem',color:'#64748b'}}><Loader2 size={20} style={{animation:'spin 1s linear infinite'}}/>Loading...</div><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  if(error)return<div><PageHeader title="Solvency Ratio Monitor" breadcrumbs={[{label:'Billing',path:'/billing/invoices'},{label:'Solvency'}]}/><div style={{padding:'2rem',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'0.5rem',color:'#dc2626'}}><strong>Error:</strong> {error}</div></div>;
  return(<div>
    <PageHeader title="Solvency Ratio Monitor (≥150%)" subtitle="Quarterly solvency ratio monitoring per IRDAI mandate with auto-alerts when approaching threshold" breadcrumbs={[{label:'Billing',path:'/billing/invoices'},{label:'Solvency'}]}/>
    <div style={{display:'flex',gap:'0.75rem',marginBottom:'1rem',flexWrap:'wrap'}}><div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#16a34a',fontWeight:500}}><Database size={13}/>Live data</div><div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#2563eb',fontWeight:500}}><Clock size={13}/>{isActive?`Filtered: ${from||'start'} to ${to||'now'}`:'All Time'}</div></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'1rem',marginBottom:'1.5rem'}}>
      <StatCard icon={IndianRupee} label="Earned Premium" value={F(kpis.earned)} color="#22c55e"/>
      <StatCard icon={AlertTriangle} label="Incurred Loss" value={F(kpis.incurred)} color="#ef4444"/>
      <StatCard icon={IndianRupee} label="Commission" value={F(kpis.commission)} color="#8b5cf6"/>
      <StatCard icon={Percent} label="Loss Ratio" value={kpis.loss_ratio} suffix="%" color="#f59e0b"/>
      <StatCard icon={TrendingUp} label="Combined Ratio" value={kpis.combined_ratio} suffix="%" color="#3b82f6"/>
      <StatCard icon={Shield} label="Solvency Proxy" value={kpis.solvency_proxy} suffix="%" color={Number(kpis.solvency_proxy)>=150?'#22c55e':'#ef4444'}/>
    </div>
    {Number(kpis.solvency_proxy)<150&&<div style={{padding:'1rem',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'0.5rem',color:'#dc2626',marginBottom:'1.5rem',fontSize:'0.85rem'}}><strong>ALERT:</strong> Solvency proxy ratio ({kpis.solvency_proxy}%) is below IRDAI minimum of 150%. Immediate action required.</div>}
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1.5rem'}}>
      <div className="card"><div className="card-header"><h3>Earned Premium vs Incurred Loss — Yearly</h3></div><div className="card-body"><ResponsiveContainer width="100%" height={300}><BarChart data={yearly}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis dataKey="year" tick={{fontSize:11}}/><YAxis tickFormatter={F} tick={{fontSize:11}}/><Tooltip formatter={v=>FL(v)}/><Legend/><Bar dataKey="earned" name="Earned" fill="#22c55e" radius={[4,4,0,0]}/><Bar dataKey="incurred" name="Incurred" fill="#ef4444" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div></div>
      <div className="card"><div className="card-header"><h3>Loss Ratio & Combined Ratio — Yearly</h3></div><div className="card-body"><ResponsiveContainer width="100%" height={300}><ComposedChart data={yearly}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis dataKey="year" tick={{fontSize:11}}/><YAxis unit="%" tick={{fontSize:11}}/><Tooltip formatter={v=>`${v}%`}/><Legend/><Bar dataKey="loss_ratio" name="Loss Ratio %" fill="#f59e0b" radius={[4,4,0,0]}/><Line dataKey="combined_ratio" name="Combined Ratio %" stroke="#ef4444" strokeWidth={2} dot={{r:4}}/></ComposedChart></ResponsiveContainer></div></div>
    </div>
    <div className="card"><div className="card-header"><h3>Yearly Solvency Detail</h3></div><table className="data-table"><thead><tr><th>Year</th><th>Earned</th><th>Incurred</th><th>Commission</th><th>Loss Ratio</th><th>Combined</th><th>Status</th></tr></thead><tbody>{yearly.map((r,i)=><tr key={i}><td style={{fontWeight:700}}>{r.year}</td><td>{F(r.earned)}</td><td style={{color:'#ef4444'}}>{F(r.incurred)}</td><td>{F(r.commission)}</td><td style={{fontWeight:700}}>{r.loss_ratio}%</td><td style={{fontWeight:700,color:Number(r.combined_ratio)>100?'#ef4444':'#22c55e'}}>{r.combined_ratio}%</td><td><span className={`badge ${Number(r.combined_ratio)<=85?'badge-green':Number(r.combined_ratio)<=100?'badge-yellow':'badge-red'}`}>{Number(r.combined_ratio)<=85?'Healthy':Number(r.combined_ratio)<=100?'Watch':'Critical'}</span></td></tr>)}</tbody></table></div>
  </div>);
}
