import { useState, useEffect, useCallback } from 'react';
import { Scale, IndianRupee, Percent, FileText, AlertTriangle, ArrowDownUp, Loader2, Database, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { useDateFilter } from '../../context/DateFilterContext';
import useCurrency from '../../hooks/useCurrency';
import { fetchReserveKPIs, fetchReserveByLob, fetchReserveByAdjuster } from '../../api';

export default function ReserveAdequacy() {
  const {from,to,isActive}=useDateFilter();
  const { F, FL, symbol, locale } = useCurrency();
  const [kpis,setKpis]=useState(null); const [byLob,setByLob]=useState([]); const [byAdj,setByAdj]=useState([]);
  const [loading,setLoading]=useState(true); const [error,setError]=useState(null);
  const load=useCallback(async()=>{try{setLoading(true);const[k,l,a]=await Promise.all([fetchReserveKPIs(from,to),fetchReserveByLob(from,to),fetchReserveByAdjuster(from,to)]);setKpis(k);setByLob(l);setByAdj(a);setError(null);}catch(e){setError(e.message);}finally{setLoading(false);}},[from,to]);
  useEffect(()=>{load();},[load]);
  if(loading)return<div><PageHeader title="Reserve Adequacy Monitor" subtitle="Loss Paid vs Reserve ratio with over/under-reserving alerts" breadcrumbs={[{label:'Claims',path:'/claims/list'},{label:'Reserve Adequacy'}]}/><div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.75rem',padding:'4rem',color:'#64748b'}}><Loader2 size={20} style={{animation:'spin 1s linear infinite'}}/>Loading...</div><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  if(error)return<div><PageHeader title="Reserve Adequacy Monitor" breadcrumbs={[{label:'Claims',path:'/claims/list'},{label:'Reserve Adequacy'}]}/><div style={{padding:'2rem',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'0.5rem',color:'#dc2626'}}><strong>Error:</strong> {error}</div></div>;
  return(<div>
    <PageHeader title="Reserve Adequacy Monitor" subtitle="Loss Paid vs Reserve ratio with over/under-reserving alerts" breadcrumbs={[{label:'Claims',path:'/claims/list'},{label:'Reserve Adequacy'}]}/>
    <div style={{display:'flex',gap:'0.75rem',marginBottom:'1rem',flexWrap:'wrap'}}><div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#16a34a',fontWeight:500}}><Database size={13}/>Live data</div><div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#2563eb',fontWeight:500}}><Clock size={13}/>{isActive?`Filtered: ${from||'start'} to ${to||'now'}`:'All Time'}</div></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'1rem',marginBottom:'1.5rem'}}>
      <StatCard icon={FileText} label="Total Claims" value={Number(kpis.total_claims).toLocaleString(locale)} color="#3b82f6"/>
      <StatCard icon={IndianRupee} label="Total Paid" value={F(kpis.total_paid)} color="#ef4444"/>
      <StatCard icon={Scale} label="Total Reserve" value={F(kpis.total_reserve)} color="#f59e0b"/>
      <StatCard icon={AlertTriangle} label="IBNR Reserve" value={F(kpis.ibnr_reserve)} color="#8b5cf6"/>
      <StatCard icon={Percent} label="Paid-to-Reserve Ratio" value={kpis.paid_to_reserve_ratio} suffix="%" color="#06b6d4"/>
      <StatCard icon={ArrowDownUp} label="Total Recovery" value={F(kpis.total_recovery)} color="#22c55e"/>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1.5rem'}}>
      <div className="card"><div className="card-header"><h3>Paid vs Reserve by LOB</h3></div><div className="card-body"><ResponsiveContainer width="100%" height={300}><BarChart data={byLob}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis dataKey="lob" tick={{fontSize:9}} interval={0} angle={-20} textAnchor="end" height={60}/><YAxis tickFormatter={F} tick={{fontSize:11}}/><Tooltip formatter={v=>FL(v)}/><Legend/><Bar dataKey="paid" name="Paid" stackId="a" fill="#ef4444" radius={[0,0,0,0]}/><Bar dataKey="reserve" name="Reserve" stackId="a" fill="#f59e0b" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div></div>
      <div className="card"><div className="card-header"><h3>Paid-to-Reserve Ratio by LOB</h3></div><div className="card-body"><ResponsiveContainer width="100%" height={300}><BarChart data={byLob}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis dataKey="lob" tick={{fontSize:9}} interval={0} angle={-20} textAnchor="end" height={60}/><YAxis unit="%" tick={{fontSize:11}}/><Tooltip formatter={v=>`${v}%`}/><Bar dataKey="paid_reserve_ratio" name="Paid/Reserve %" radius={[4,4,0,0]}>{byLob.map((d,i)=><Cell key={i} fill={Number(d.paid_reserve_ratio)>200?'#ef4444':Number(d.paid_reserve_ratio)>100?'#f59e0b':'#22c55e'}/>)}</Bar></BarChart></ResponsiveContainer></div></div>
    </div>
    <div className="card"><div className="card-header"><h3>Adjuster Reserve Detail</h3></div><table className="data-table"><thead><tr><th>Adjuster</th><th>Claims</th><th>Paid</th><th>Reserve</th><th>Ratio</th><th>Status</th></tr></thead><tbody>{byAdj.map((r,i)=><tr key={i}><td style={{fontWeight:600}}>{r.adjuster}</td><td>{Number(r.claims).toLocaleString(locale)}</td><td>{F(r.paid)}</td><td>{F(r.reserve)}</td><td style={{fontWeight:700,color:Number(r.paid_reserve_ratio)>200?'#ef4444':Number(r.paid_reserve_ratio)>100?'#f59e0b':'#22c55e'}}>{r.paid_reserve_ratio}%</td><td><span className={`badge ${Number(r.paid_reserve_ratio)>200?'badge-red':Number(r.paid_reserve_ratio)>100?'badge-yellow':'badge-green'}`}>{Number(r.paid_reserve_ratio)>200?'Over-Reserved':Number(r.paid_reserve_ratio)>100?'Watch':'Adequate'}</span></td></tr>)}</tbody></table></div>
  </div>);
}
