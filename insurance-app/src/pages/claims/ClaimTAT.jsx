import { useState, useEffect, useCallback } from 'react';
import { Timer, AlertTriangle, CheckCircle, IndianRupee, FileText, Users, Loader2, Database, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { useDateFilter } from '../../context/DateFilterContext';
import useCurrency from '../../hooks/useCurrency';
import { fetchTatKPIs, fetchTatByLob, fetchTatByAdjuster } from '../../api';

export default function ClaimTAT() {
  const {from,to,isActive}=useDateFilter();
  const { F, FL, symbol, locale } = useCurrency();
  const [kpis,setKpis]=useState(null); const [byLob,setByLob]=useState([]); const [byAdj,setByAdj]=useState([]);
  const [loading,setLoading]=useState(true); const [error,setError]=useState(null);
  const load=useCallback(async()=>{try{setLoading(true);const[k,l,a]=await Promise.all([fetchTatKPIs(from,to),fetchTatByLob(from,to),fetchTatByAdjuster(from,to)]);setKpis(k);setByLob(l);setByAdj(a);setError(null);}catch(e){setError(e.message);}finally{setLoading(false);}},[from,to]);
  useEffect(()=>{load();},[load]);
  if(loading)return<div><PageHeader title="Claim TAT Tracker" subtitle="Real-time settlement TAT dashboard with IRDAI 30-day breach alerts" breadcrumbs={[{label:'Claims',path:'/claims/list'},{label:'Claim TAT'}]}/><div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.75rem',padding:'4rem',color:'#64748b'}}><Loader2 size={20} style={{animation:'spin 1s linear infinite'}}/>Loading...</div><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  if(error)return<div><PageHeader title="Claim TAT Tracker" breadcrumbs={[{label:'Claims',path:'/claims/list'},{label:'Claim TAT'}]}/><div style={{padding:'2rem',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'0.5rem',color:'#dc2626'}}><strong>Error:</strong> {error}</div></div>;
  return(<div>
    <PageHeader title="Claim TAT Tracker" subtitle="Real-time settlement TAT dashboard with IRDAI 30-day breach alerts" breadcrumbs={[{label:'Claims',path:'/claims/list'},{label:'Claim TAT'}]}/>
    <div style={{display:'flex',gap:'0.75rem',marginBottom:'1rem',flexWrap:'wrap'}}><div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#16a34a',fontWeight:500}}><Database size={13}/>Live data</div><div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#2563eb',fontWeight:500}}><Clock size={13}/>{isActive?`Filtered: ${from||'start'} to ${to||'now'}`:'All Time'}</div></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'1rem',marginBottom:'1.5rem'}}>
      <StatCard icon={FileText} label="Total Claims" value={Number(kpis.total_claims).toLocaleString(locale)} color="#3b82f6"/>
      <StatCard icon={Timer} label="Avg TAT" value={kpis.avg_tat_days} suffix=" days" color="#8b5cf6"/>
      <StatCard icon={Timer} label="Max TAT" value={kpis.max_tat_days} suffix=" days" color="#f59e0b"/>
      <StatCard icon={AlertTriangle} label="30-Day Breaches" value={Number(kpis.breach_30day).toLocaleString(locale)} color="#ef4444"/>
      <StatCard icon={CheckCircle} label="Closed Claims" value={Number(kpis.closed_claims).toLocaleString(locale)} color="#22c55e"/>
      <StatCard icon={IndianRupee} label="Total Paid" value={F(kpis.total_paid)} color="#06b6d4"/>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1.5rem'}}>
      <div className="card"><div className="card-header"><h3>TAT by LOB</h3></div><div className="card-body"><ResponsiveContainer width="100%" height={300}><BarChart data={byLob} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis type="number" unit=" d" tick={{fontSize:11}}/><YAxis dataKey="lob" type="category" tick={{fontSize:10}} width={100}/><Tooltip formatter={v=>`${v} days`}/><Legend/><Bar dataKey="avg_tat" name="Avg TAT (days)" fill="#8b5cf6" radius={[0,4,4,0]}/><Bar dataKey="max_tat" name="Max TAT (days)" fill="#f59e0b" radius={[0,4,4,0]}/></BarChart></ResponsiveContainer></div></div>
      <div className="card"><div className="card-header"><h3>TAT by Adjuster</h3></div><div className="card-body"><ResponsiveContainer width="100%" height={300}><BarChart data={byAdj}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis dataKey="adjuster" tick={{fontSize:9}} interval={0} angle={-20} textAnchor="end" height={60}/><YAxis unit=" d" tick={{fontSize:11}}/><Tooltip formatter={v=>`${v} days`}/><Legend/><Bar dataKey="avg_tat" name="Avg TAT" fill="#3b82f6" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div></div>
    </div>
    <div className="card"><div className="card-header"><h3>Adjuster TAT Detail</h3></div><table className="data-table"><thead><tr><th>Adjuster</th><th>Claims</th><th>Avg TAT</th><th>Breaches</th><th>Total Paid</th><th>Status</th></tr></thead><tbody>{byAdj.map((r,i)=><tr key={i}><td style={{fontWeight:600}}>{r.adjuster}</td><td>{Number(r.claims).toLocaleString(locale)}</td><td style={{fontWeight:700}}>{r.avg_tat} days</td><td style={{fontWeight:700,color:Number(r.breaches)>0?'#ef4444':'#22c55e'}}>{r.breaches}</td><td>{F(r.paid)}</td><td><span className={`badge ${Number(r.breaches)>0?'badge-red':'badge-green'}`}>{Number(r.breaches)>0?'Breach':'Clean'}</span></td></tr>)}</tbody></table></div>
  </div>);
}
