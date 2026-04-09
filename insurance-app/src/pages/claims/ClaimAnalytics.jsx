import { useState, useEffect, useCallback } from 'react';
import { BarChart3, IndianRupee, Percent, FileText, Timer, Anchor, Loader2, Database, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { useDateFilter } from '../../context/DateFilterContext';
import useCurrency from '../../hooks/useCurrency';
import { fetchClaimAnalyticsKPIs, fetchClaimAnalyticsByLob } from '../../api';

export default function ClaimAnalytics() {
  const {from,to,isActive}=useDateFilter();
  const { F, FL, symbol, locale } = useCurrency();
  const [kpis,setKpis]=useState(null); const [byLob,setByLob]=useState([]);
  const [loading,setLoading]=useState(true); const [error,setError]=useState(null);
  const load=useCallback(async()=>{try{setLoading(true);const[k,l]=await Promise.all([fetchClaimAnalyticsKPIs(from,to),fetchClaimAnalyticsByLob(from,to)]);setKpis(k);setByLob(l);setError(null);}catch(e){setError(e.message);}finally{setLoading(false);}},[from,to]);
  useEffect(()=>{load();},[load]);
  if(loading)return<div><PageHeader title="Claims Analytics Suite" subtitle="50+ reports: Loss Bordereaux, Open Claims, Subrogation, Salvage analysis" breadcrumbs={[{label:'Claims',path:'/claims/list'},{label:'Claim Analytics'}]}/><div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.75rem',padding:'4rem',color:'#64748b'}}><Loader2 size={20} style={{animation:'spin 1s linear infinite'}}/>Loading...</div><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  if(error)return<div><PageHeader title="Claims Analytics Suite" breadcrumbs={[{label:'Claims',path:'/claims/list'},{label:'Claim Analytics'}]}/><div style={{padding:'2rem',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'0.5rem',color:'#dc2626'}}><strong>Error:</strong> {error}</div></div>;
  return(<div>
    <PageHeader title="Claims Analytics Suite" subtitle="50+ reports: Loss Bordereaux, Open Claims, Subrogation, Salvage analysis" breadcrumbs={[{label:'Claims',path:'/claims/list'},{label:'Claim Analytics'}]}/>
    <div style={{display:'flex',gap:'0.75rem',marginBottom:'1rem',flexWrap:'wrap'}}><div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#16a34a',fontWeight:500}}><Database size={13}/>Live data</div><div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#2563eb',fontWeight:500}}><Clock size={13}/>{isActive?`Filtered: ${from||'start'} to ${to||'now'}`:'All Time'}</div></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'1rem',marginBottom:'1.5rem'}}>
      <StatCard icon={FileText} label="Total Claims" value={Number(kpis.total_claims).toLocaleString(locale)} color="#3b82f6"/>
      <StatCard icon={IndianRupee} label="Total Paid" value={F(kpis.total_paid)} color="#ef4444"/>
      <StatCard icon={IndianRupee} label="Earned Premium" value={F(kpis.earned_premium)} color="#22c55e"/>
      <StatCard icon={Percent} label="Loss Ratio" value={kpis.loss_ratio} suffix="%" color="#f59e0b"/>
      <StatCard icon={Anchor} label="Salvage + Subrogation" value={F(kpis.salvage_subro)} color="#8b5cf6"/>
      <StatCard icon={Timer} label="Avg TAT" value={kpis.avg_tat} suffix=" days" color="#06b6d4"/>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1.5rem'}}>
      <div className="card"><div className="card-header"><h3>Paid vs Earned Premium by LOB</h3></div><div className="card-body"><ResponsiveContainer width="100%" height={300}><BarChart data={byLob}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis dataKey="lob" tick={{fontSize:9}} interval={0} angle={-20} textAnchor="end" height={60}/><YAxis tickFormatter={F} tick={{fontSize:11}}/><Tooltip formatter={v=>FL(v)}/><Legend/><Bar dataKey="paid" name="Total Paid" fill="#ef4444" radius={[4,4,0,0]}/><Bar dataKey="earned" name="Earned Premium" fill="#22c55e" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div></div>
      <div className="card"><div className="card-header"><h3>Loss Ratio by LOB</h3></div><div className="card-body"><ResponsiveContainer width="100%" height={300}><BarChart data={byLob}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis dataKey="lob" tick={{fontSize:9}} interval={0} angle={-20} textAnchor="end" height={60}/><YAxis unit="%" tick={{fontSize:11}}/><Tooltip formatter={v=>`${v}%`}/><Bar dataKey="loss_ratio" name="Loss Ratio %" radius={[4,4,0,0]}>{byLob.map((d,i)=><Cell key={i} fill={Number(d.loss_ratio)>80?'#ef4444':Number(d.loss_ratio)>60?'#f59e0b':'#22c55e'}/>)}</Bar></BarChart></ResponsiveContainer></div></div>
    </div>
    <div className="card"><div className="card-header"><h3>LOB Claims Detail</h3></div><table className="data-table"><thead><tr><th>LOB</th><th>Claims</th><th>Paid</th><th>Earned</th><th>Loss Ratio</th><th>Salvage</th><th>Subrogation</th><th>Avg TAT</th></tr></thead><tbody>{byLob.map((r,i)=><tr key={i}><td style={{fontWeight:600}}>{r.lob}</td><td>{Number(r.claims).toLocaleString(locale)}</td><td>{F(r.paid)}</td><td>{F(r.earned)}</td><td style={{fontWeight:700,color:Number(r.loss_ratio)>80?'#ef4444':Number(r.loss_ratio)>60?'#f59e0b':'#22c55e'}}>{r.loss_ratio}%</td><td>{F(r.salvage)}</td><td>{F(r.subro)}</td><td>{r.avg_tat} days</td></tr>)}</tbody></table></div>
  </div>);
}
