import { useState, useEffect, useCallback } from 'react';
import { Gavel, FileText, CheckCircle, XCircle, Percent, FolderOpen, Loader2, Database, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { useDateFilter } from '../../context/DateFilterContext';
import useCurrency from '../../hooks/useCurrency';
import { fetchRepudiationKPIs, fetchRepudiationByLob } from '../../api';

export default function RepudiationAudit() {
  const {from,to,isActive}=useDateFilter();
  const { F, FL, symbol, locale } = useCurrency();
  const [kpis,setKpis]=useState(null); const [byLob,setByLob]=useState([]);
  const [loading,setLoading]=useState(true); const [error,setError]=useState(null);
  const load=useCallback(async()=>{try{setLoading(true);const[k,l]=await Promise.all([fetchRepudiationKPIs(from,to),fetchRepudiationByLob(from,to)]);setKpis(k);setByLob(l);setError(null);}catch(e){setError(e.message);}finally{setLoading(false);}},[from,to]);
  useEffect(()=>{load();},[load]);
  if(loading)return<div><PageHeader title="Repudiation Audit Trail" subtitle="Claim denial tracking with reason codes for regulator defensibility" breadcrumbs={[{label:'Claims',path:'/claims/list'},{label:'Repudiation Audit'}]}/><div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.75rem',padding:'4rem',color:'#64748b'}}><Loader2 size={20} style={{animation:'spin 1s linear infinite'}}/>Loading...</div><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  if(error)return<div><PageHeader title="Repudiation Audit Trail" breadcrumbs={[{label:'Claims',path:'/claims/list'},{label:'Repudiation Audit'}]}/><div style={{padding:'2rem',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'0.5rem',color:'#dc2626'}}><strong>Error:</strong> {error}</div></div>;
  return(<div>
    <PageHeader title="Repudiation Audit Trail" subtitle="Claim denial tracking with reason codes for regulator defensibility" breadcrumbs={[{label:'Claims',path:'/claims/list'},{label:'Repudiation Audit'}]}/>
    <div style={{display:'flex',gap:'0.75rem',marginBottom:'1rem',flexWrap:'wrap'}}><div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#16a34a',fontWeight:500}}><Database size={13}/>Live data</div><div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#2563eb',fontWeight:500}}><Clock size={13}/>{isActive?`Filtered: ${from||'start'} to ${to||'now'}`:'All Time'}</div></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'1rem',marginBottom:'1.5rem'}}>
      <StatCard icon={FileText} label="Total Claims" value={Number(kpis.total_claims).toLocaleString(locale)} color="#3b82f6"/>
      <StatCard icon={CheckCircle} label="Closed with Payment" value={Number(kpis.with_payment).toLocaleString(locale)} color="#22c55e"/>
      <StatCard icon={XCircle} label="Closed without Payment" value={Number(kpis.without_payment).toLocaleString(locale)} color="#ef4444"/>
      <StatCard icon={Gavel} label="Total Closed" value={Number(kpis.total_closed).toLocaleString(locale)} color="#8b5cf6"/>
      <StatCard icon={FolderOpen} label="Open Claims" value={Number(kpis.open_claims).toLocaleString(locale)} color="#f59e0b"/>
      <StatCard icon={Percent} label="Denial Rate" value={kpis.denial_rate} suffix="%" color="#ef4444"/>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1.5rem'}}>
      <div className="card"><div className="card-header"><h3>Closed With vs Without Payment by LOB</h3></div><div className="card-body"><ResponsiveContainer width="100%" height={300}><BarChart data={byLob}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis dataKey="lob" tick={{fontSize:9}} interval={0} angle={-20} textAnchor="end" height={60}/><YAxis tick={{fontSize:11}}/><Tooltip/><Legend/><Bar dataKey="with_payment" name="With Payment" stackId="a" fill="#22c55e" radius={[0,0,0,0]}/><Bar dataKey="without_payment" name="Without Payment" stackId="a" fill="#ef4444" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div></div>
      <div className="card"><div className="card-header"><h3>Denial Rate by LOB</h3></div><div className="card-body"><ResponsiveContainer width="100%" height={300}><BarChart data={byLob}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis dataKey="lob" tick={{fontSize:9}} interval={0} angle={-20} textAnchor="end" height={60}/><YAxis unit="%" tick={{fontSize:11}}/><Tooltip formatter={v=>`${v}%`}/><Bar dataKey="denial_rate" name="Denial Rate %" radius={[4,4,0,0]}>{byLob.map((d,i)=><Cell key={i} fill={Number(d.denial_rate)>20?'#ef4444':Number(d.denial_rate)>10?'#f59e0b':'#22c55e'}/>)}</Bar></BarChart></ResponsiveContainer></div></div>
    </div>
    <div className="card"><div className="card-header"><h3>LOB Repudiation Detail</h3></div><table className="data-table"><thead><tr><th>LOB</th><th>With Payment</th><th>Without Payment</th><th>Total Closed</th><th>Denial Rate</th><th>Status</th></tr></thead><tbody>{byLob.map((r,i)=><tr key={i}><td style={{fontWeight:600}}>{r.lob}</td><td style={{color:'#22c55e',fontWeight:600}}>{r.with_payment}</td><td style={{color:'#ef4444',fontWeight:600}}>{r.without_payment}</td><td>{r.total_closed}</td><td style={{fontWeight:700,color:Number(r.denial_rate)>20?'#ef4444':Number(r.denial_rate)>10?'#f59e0b':'#22c55e'}}>{r.denial_rate}%</td><td><span className={`badge ${Number(r.denial_rate)>20?'badge-red':Number(r.denial_rate)>10?'badge-yellow':'badge-green'}`}>{Number(r.denial_rate)>20?'High':Number(r.denial_rate)>10?'Monitor':'Normal'}</span></td></tr>)}</tbody></table></div>
  </div>);
}
