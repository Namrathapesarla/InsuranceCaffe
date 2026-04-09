import { useState, useEffect, useCallback } from 'react';
import { IndianRupee, Percent, FileText, AlertTriangle, Loader2, Database, Clock, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { useDateFilter } from '../../context/DateFilterContext';
import useCurrency from '../../hooks/useCurrency';
import { fetchCollectionKPIs, fetchCollectionByLob, fetchCollectionYearly } from '../../api';

export default function CollectionRate() {
  const {from,to,isActive}=useDateFilter();
  const { F, FL, symbol, locale } = useCurrency();
  const [kpis,setKpis]=useState(null); const [byLob,setByLob]=useState([]); const [yearly,setYearly]=useState([]);
  const [loading,setLoading]=useState(true); const [error,setError]=useState(null);
  const load=useCallback(async()=>{try{setLoading(true);const[k,l,y]=await Promise.all([fetchCollectionKPIs(from,to),fetchCollectionByLob(from,to),fetchCollectionYearly(from,to)]);setKpis(k);setByLob(l);setYearly(y);setError(null);}catch(e){setError(e.message);}finally{setLoading(false);}},[from,to]);
  useEffect(()=>{load();},[load]);
  if(loading)return<div><PageHeader title="Collection Rate Tracking" subtitle="Real-time premium collection monitoring" breadcrumbs={[{label:'Billing',path:'/billing/invoices'},{label:'Collection Rate'}]}/><div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.75rem',padding:'4rem',color:'#64748b'}}><Loader2 size={20} style={{animation:'spin 1s linear infinite'}}/>Loading...</div><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  if(error)return<div><PageHeader title="Collection Rate Tracking" breadcrumbs={[{label:'Billing',path:'/billing/invoices'},{label:'Collection Rate'}]}/><div style={{padding:'2rem',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'0.5rem',color:'#dc2626'}}><strong>Error:</strong> {error}</div></div>;
  return(<div>
    <PageHeader title="Collection Rate Tracking" subtitle="Real-time premium collection rate monitoring with aging analysis and overdue alerts" breadcrumbs={[{label:'Billing',path:'/billing/invoices'},{label:'Collection Rate'}]}/>
    <div style={{display:'flex',gap:'0.75rem',marginBottom:'1rem',flexWrap:'wrap'}}><div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#16a34a',fontWeight:500}}><Database size={13}/>Live data</div><div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#2563eb',fontWeight:500}}><Clock size={13}/>{isActive?`Filtered: ${from||'start'} to ${to||'now'}`:'All Time'}</div></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'1rem',marginBottom:'1.5rem'}}>
      <StatCard icon={IndianRupee} label="Total Billed" value={F(kpis.billed)} color="#3b82f6"/>
      <StatCard icon={CheckCircle} label="Collected (Earned)" value={F(kpis.collected)} color="#22c55e"/>
      <StatCard icon={AlertTriangle} label="Outstanding" value={F(kpis.outstanding)} color="#f59e0b"/>
      <StatCard icon={Percent} label="Collection Rate" value={kpis.collection_rate} suffix="%" color="#8b5cf6"/>
      <StatCard icon={FileText} label="Total Policies" value={Number(kpis.total_policies).toLocaleString(locale)} color="#06b6d4"/>
      <StatCard icon={IndianRupee} label="Net Collected" value={F(kpis.net_collected)} color="#ec4899"/>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1.5rem'}}>
      <div className="card"><div className="card-header"><h3>Billed vs Collected — Yearly</h3></div><div className="card-body"><ResponsiveContainer width="100%" height={300}><BarChart data={yearly}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis dataKey="year" tick={{fontSize:11}}/><YAxis tickFormatter={F} tick={{fontSize:11}}/><Tooltip formatter={v=>FL(v)}/><Legend/><Bar dataKey="billed" name="Billed" fill="#3b82f6" radius={[4,4,0,0]}/><Bar dataKey="collected" name="Collected" fill="#22c55e" radius={[4,4,0,0]}/><Bar dataKey="outstanding" name="Outstanding" fill="#f59e0b" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div></div>
      <div className="card"><div className="card-header"><h3>Collection Rate by LOB</h3></div><div className="card-body"><ResponsiveContainer width="100%" height={300}><BarChart data={byLob}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis dataKey="lob" tick={{fontSize:8}} interval={0} angle={-20} textAnchor="end" height={60}/><YAxis unit="%" tick={{fontSize:11}}/><Tooltip formatter={v=>`${v}%`}/><Bar dataKey="rate" name="Collection Rate %" radius={[4,4,0,0]}>{byLob.map((d,i)=><Cell key={i} fill={Number(d.rate)>=90?'#22c55e':Number(d.rate)>=80?'#f59e0b':'#ef4444'}/>)}</Bar></BarChart></ResponsiveContainer></div></div>
    </div>
    <div className="card"><div className="card-header"><h3>LOB Collection Detail</h3></div><table className="data-table"><thead><tr><th>LOB</th><th>Billed</th><th>Collected</th><th>Rate</th><th>Status</th></tr></thead><tbody>{byLob.map((r,i)=><tr key={i}><td style={{fontWeight:600}}>{r.lob}</td><td>{F(r.billed)}</td><td>{F(r.collected)}</td><td style={{fontWeight:700,color:Number(r.rate)>=90?'#22c55e':Number(r.rate)>=80?'#f59e0b':'#ef4444'}}>{r.rate}%</td><td><span className={`badge ${Number(r.rate)>=90?'badge-green':Number(r.rate)>=80?'badge-yellow':'badge-red'}`}>{Number(r.rate)>=90?'On Track':Number(r.rate)>=80?'Monitor':'Alert'}</span></td></tr>)}</tbody></table></div>
  </div>);
}
