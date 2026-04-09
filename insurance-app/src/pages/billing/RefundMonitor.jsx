import { useState, useEffect, useCallback } from 'react';
import { IndianRupee, FileText, XCircle, RefreshCw, Loader2, Database, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { useDateFilter } from '../../context/DateFilterContext';
import useCurrency from '../../hooks/useCurrency';
import { fetchRefundKPIs, fetchRefundByLob } from '../../api';

export default function RefundMonitor() {
  const {from,to,isActive}=useDateFilter();
  const { F, FL, symbol, locale } = useCurrency();
  const [kpis,setKpis]=useState(null); const [byLob,setByLob]=useState([]);
  const [loading,setLoading]=useState(true); const [error,setError]=useState(null);
  const load=useCallback(async()=>{try{setLoading(true);const[k,l]=await Promise.all([fetchRefundKPIs(from,to),fetchRefundByLob(from,to)]);setKpis(k);setByLob(l);setError(null);}catch(e){setError(e.message);}finally{setLoading(false);}},[from,to]);
  useEffect(()=>{load();},[load]);
  if(loading)return<div><PageHeader title="Refund TAT Monitoring" subtitle="Track refund processing with SLA breach alerts" breadcrumbs={[{label:'Billing',path:'/billing/invoices'},{label:'Refund TAT'}]}/><div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.75rem',padding:'4rem',color:'#64748b'}}><Loader2 size={20} style={{animation:'spin 1s linear infinite'}}/>Loading...</div><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  if(error)return<div><PageHeader title="Refund TAT Monitoring" breadcrumbs={[{label:'Billing',path:'/billing/invoices'},{label:'Refund TAT'}]}/><div style={{padding:'2rem',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'0.5rem',color:'#dc2626'}}><strong>Error:</strong> {error}</div></div>;
  return(<div>
    <PageHeader title="Refund TAT Monitoring" subtitle="Track refund processing turnaround time with SLA breach alerts for IRDAI compliance" breadcrumbs={[{label:'Billing',path:'/billing/invoices'},{label:'Refund TAT'}]}/>
    <div style={{display:'flex',gap:'0.75rem',marginBottom:'1rem',flexWrap:'wrap'}}><div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#16a34a',fontWeight:500}}><Database size={13}/>Live data</div><div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#2563eb',fontWeight:500}}><Clock size={13}/>{isActive?`Filtered: ${from||'start'} to ${to||'now'}`:'All Time'}</div></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'1rem',marginBottom:'1.5rem'}}>
      <StatCard icon={FileText} label="Total Policies" value={Number(kpis.total_policies).toLocaleString(locale)} color="#3b82f6"/>
      <StatCard icon={XCircle} label="Cancelled Policies" value={Number(kpis.cancelled_policies).toLocaleString(locale)} color="#ef4444"/>
      <StatCard icon={IndianRupee} label="Refund Eligible" value={F(kpis.refund_eligible_premium)} color="#f59e0b"/>
      <StatCard icon={IndianRupee} label="Cancelled Premium" value={F(kpis.cancelled_premium)} color="#8b5cf6"/>
      <StatCard icon={RefreshCw} label="Reinstated" value={Number(kpis.reinstated_count).toLocaleString(locale)} color="#22c55e"/>
      <StatCard icon={IndianRupee} label="Reinstatement Premium" value={F(kpis.reinstatement_premium)} color="#06b6d4"/>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1.5rem'}}>
      <div className="card"><div className="card-header"><h3>Refund-Eligible Premium by LOB</h3></div><div className="card-body"><ResponsiveContainer width="100%" height={300}><BarChart data={byLob} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis type="number" tickFormatter={F} tick={{fontSize:11}}/><YAxis dataKey="lob" type="category" tick={{fontSize:9}} width={150}/><Tooltip formatter={v=>FL(v)}/><Bar dataKey="refund_premium" name="Refund Premium" fill="#ef4444" radius={[0,4,4,0]}/></BarChart></ResponsiveContainer></div></div>
      <div className="card"><div className="card-header"><h3>Cancellations by LOB</h3></div><div className="card-body"><ResponsiveContainer width="100%" height={300}><BarChart data={byLob}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis dataKey="lob" tick={{fontSize:8}} interval={0} angle={-20} textAnchor="end" height={60}/><YAxis tick={{fontSize:11}}/><Tooltip/><Bar dataKey="cancelled" name="Cancelled" fill="#f59e0b" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div></div>
    </div>
    <div className="card"><div className="card-header"><h3>LOB Refund Detail</h3></div><table className="data-table"><thead><tr><th>LOB</th><th>Total Policies</th><th>Cancelled</th><th>Refund Premium</th></tr></thead><tbody>{byLob.map((r,i)=><tr key={i}><td style={{fontWeight:600}}>{r.lob}</td><td>{Number(r.total).toLocaleString(locale)}</td><td style={{color:'#ef4444',fontWeight:600}}>{r.cancelled}</td><td>{F(r.refund_premium)}</td></tr>)}</tbody></table></div>
  </div>);
}
