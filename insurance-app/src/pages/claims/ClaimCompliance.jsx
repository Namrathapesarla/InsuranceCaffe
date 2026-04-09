import { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, AlertTriangle, Percent, FileText, Timer, IndianRupee, Loader2, Database, Clock, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { useDateFilter } from '../../context/DateFilterContext';
import useCurrency from '../../hooks/useCurrency';
import { fetchClaimComplianceKPIs, fetchClaimComplianceByLob } from '../../api';

export default function ClaimCompliance() {
  const {from,to,isActive}=useDateFilter();
  const { F, FL, symbol, locale } = useCurrency();
  const [kpis,setKpis]=useState(null); const [byLob,setByLob]=useState([]);
  const [loading,setLoading]=useState(true); const [error,setError]=useState(null);
  const load=useCallback(async()=>{try{setLoading(true);const[k,l]=await Promise.all([fetchClaimComplianceKPIs(from,to),fetchClaimComplianceByLob(from,to)]);setKpis(k);setByLob(l);setError(null);}catch(e){setError(e.message);}finally{setLoading(false);}},[from,to]);
  useEffect(()=>{load();},[load]);
  if(loading)return<div><PageHeader title="IRDAI Compliance Engine" subtitle="30-day TAT enforcement with auto-alerts and decision logs" breadcrumbs={[{label:'Claims',path:'/claims/list'},{label:'Claim Compliance'}]}/><div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.75rem',padding:'4rem',color:'#64748b'}}><Loader2 size={20} style={{animation:'spin 1s linear infinite'}}/>Loading...</div><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  if(error)return<div><PageHeader title="IRDAI Compliance Engine" breadcrumbs={[{label:'Claims',path:'/claims/list'},{label:'Claim Compliance'}]}/><div style={{padding:'2rem',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'0.5rem',color:'#dc2626'}}><strong>Error:</strong> {error}</div></div>;
  return(<div>
    <PageHeader title="IRDAI Compliance Engine" subtitle="30-day TAT enforcement with auto-alerts and decision logs" breadcrumbs={[{label:'Claims',path:'/claims/list'},{label:'Claim Compliance'}]}/>
    <div style={{display:'flex',gap:'0.75rem',marginBottom:'1rem',flexWrap:'wrap'}}><div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#16a34a',fontWeight:500}}><Database size={13}/>Live data</div><div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#2563eb',fontWeight:500}}><Clock size={13}/>{isActive?`Filtered: ${from||'start'} to ${to||'now'}`:'All Time'}</div></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'1rem',marginBottom:'1.5rem'}}>
      <StatCard icon={FileText} label="Total Claims" value={Number(kpis.total_claims).toLocaleString(locale)} color="#3b82f6"/>
      <StatCard icon={AlertTriangle} label="TAT Breaches" value={Number(kpis.breaches).toLocaleString(locale)} color="#ef4444"/>
      <StatCard icon={Percent} label="Breach Rate" value={kpis.breach_rate} suffix="%" color="#ef4444"/>
      <StatCard icon={CheckCircle} label="Compliant Claims" value={Number(kpis.compliant).toLocaleString(locale)} color="#22c55e"/>
      <StatCard icon={Timer} label="Avg TAT" value={kpis.avg_tat} suffix=" days" color="#8b5cf6"/>
      <StatCard icon={IndianRupee} label="Total Paid" value={F(kpis.total_paid)} color="#06b6d4"/>
    </div>
    {Number(kpis.breach_rate)>10&&<div style={{padding:'1rem',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'0.5rem',color:'#dc2626',marginBottom:'1.5rem',fontSize:'0.85rem'}}><strong>ALERT:</strong> Breach rate ({kpis.breach_rate}%) exceeds 10% threshold. IRDAI compliance at risk — immediate remediation required.</div>}
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1.5rem'}}>
      <div className="card"><div className="card-header"><h3>Breaches vs Compliant by LOB</h3></div><div className="card-body"><ResponsiveContainer width="100%" height={300}><BarChart data={byLob}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis dataKey="lob" tick={{fontSize:9}} interval={0} angle={-20} textAnchor="end" height={60}/><YAxis tick={{fontSize:11}}/><Tooltip/><Legend/><Bar dataKey="compliant" name="Compliant" stackId="a" fill="#22c55e" radius={[0,0,0,0]}/><Bar dataKey="breaches" name="Breaches" stackId="a" fill="#ef4444" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div></div>
      <div className="card"><div className="card-header"><h3>Breach Rate by LOB</h3></div><div className="card-body"><ResponsiveContainer width="100%" height={300}><BarChart data={byLob}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis dataKey="lob" tick={{fontSize:9}} interval={0} angle={-20} textAnchor="end" height={60}/><YAxis unit="%" tick={{fontSize:11}}/><Tooltip formatter={v=>`${v}%`}/><Bar dataKey="breach_rate" name="Breach Rate %" radius={[4,4,0,0]}>{byLob.map((d,i)=><Cell key={i} fill={Number(d.breach_rate)>10?'#ef4444':Number(d.breach_rate)>5?'#f59e0b':'#22c55e'}/>)}</Bar></BarChart></ResponsiveContainer></div></div>
    </div>
    <div className="card"><div className="card-header"><h3>LOB Compliance Detail</h3></div><table className="data-table"><thead><tr><th>LOB</th><th>Claims</th><th>Breaches</th><th>Breach Rate</th><th>Avg TAT</th><th>Status</th></tr></thead><tbody>{byLob.map((r,i)=><tr key={i}><td style={{fontWeight:600}}>{r.lob}</td><td>{Number(r.claims).toLocaleString(locale)}</td><td style={{fontWeight:700,color:Number(r.breaches)>0?'#ef4444':'#22c55e'}}>{r.breaches}</td><td style={{fontWeight:700,color:Number(r.breach_rate)>10?'#ef4444':Number(r.breach_rate)>5?'#f59e0b':'#22c55e'}}>{r.breach_rate}%</td><td>{r.avg_tat} days</td><td><span className={`badge ${Number(r.breach_rate)>10?'badge-red':Number(r.breach_rate)>5?'badge-yellow':'badge-green'}`}>{Number(r.breach_rate)>10?'Fail':Number(r.breach_rate)>5?'Watch':'Pass'}</span></td></tr>)}</tbody></table></div>
  </div>);
}
