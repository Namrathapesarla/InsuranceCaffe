import { useState, useEffect, useCallback } from 'react';
import { IndianRupee, Percent, Users, FileText, Loader2, Database, Clock, Layers } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { useDateFilter } from '../../context/DateFilterContext';
import useCurrency from '../../hooks/useCurrency';
import { fetchCommissionKPIs, fetchCommissionByAgent, fetchCommissionByLob } from '../../api';

export default function CommissionPayout() {
  const {from,to,isActive}=useDateFilter();
  const { F, FL, symbol, locale } = useCurrency();
  const [kpis,setKpis]=useState(null); const [byAgent,setByAgent]=useState([]); const [byLob,setByLob]=useState([]);
  const [loading,setLoading]=useState(true); const [error,setError]=useState(null);
  const load=useCallback(async()=>{try{setLoading(true);const[k,a,l]=await Promise.all([fetchCommissionKPIs(from,to),fetchCommissionByAgent(from,to),fetchCommissionByLob(from,to)]);setKpis(k);setByAgent(a);setByLob(l);setError(null);}catch(e){setError(e.message);}finally{setLoading(false);}},[from,to]);
  useEffect(()=>{load();},[load]);
  if(loading)return<div><PageHeader title="Commission Payout" subtitle="Agent commission with IRDAI cap validation" breadcrumbs={[{label:'Billing',path:'/billing/invoices'},{label:'Commission'}]}/><div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.75rem',padding:'4rem',color:'#64748b'}}><Loader2 size={20} style={{animation:'spin 1s linear infinite'}}/>Loading...</div><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  if(error)return<div><PageHeader title="Commission Payout" breadcrumbs={[{label:'Billing',path:'/billing/invoices'},{label:'Commission'}]}/><div style={{padding:'2rem',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'0.5rem',color:'#dc2626'}}><strong>Error:</strong> {error}</div></div>;
  return(<div>
    <PageHeader title="Commission Payout" subtitle="Agent commission calculation with IRDAI cap validation, payment processing, and audit trail" breadcrumbs={[{label:'Billing',path:'/billing/invoices'},{label:'Commission'}]}/>
    <div style={{display:'flex',gap:'0.75rem',marginBottom:'1rem',flexWrap:'wrap'}}><div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#16a34a',fontWeight:500}}><Database size={13}/>Live data</div><div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#2563eb',fontWeight:500}}><Clock size={13}/>{isActive?`Filtered: ${from||'start'} to ${to||'now'}`:'All Time'}</div></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'1rem',marginBottom:'1.5rem'}}>
      <StatCard icon={IndianRupee} label="Total Written" value={F(kpis.total_written)} color="#3b82f6"/>
      <StatCard icon={Layers} label="Company Commission" value={F(kpis.company_comm)} color="#22c55e"/>
      <StatCard icon={Users} label="Producer Commission" value={F(kpis.producer_comm)} color="#8b5cf6"/>
      <StatCard icon={IndianRupee} label="Total Commission" value={F(kpis.total_comm)} color="#f59e0b"/>
      <StatCard icon={Percent} label="Commission Ratio" value={kpis.comm_ratio} suffix="%" color="#ef4444"/>
      <StatCard icon={FileText} label="Active Agents" value={Number(kpis.active_agents).toLocaleString(locale)} color="#06b6d4"/>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1.5rem'}}>
      <div className="card"><div className="card-header"><h3>Commission by LOB (Company vs Producer)</h3></div><div className="card-body"><ResponsiveContainer width="100%" height={320}><BarChart data={byLob} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis type="number" tickFormatter={F} tick={{fontSize:11}}/><YAxis dataKey="lob" type="category" tick={{fontSize:9}} width={150}/><Tooltip formatter={v=>FL(v)}/><Legend/><Bar dataKey="co_comm" name="Company" stackId="c" fill="#22c55e"/><Bar dataKey="pr_comm" name="Producer" stackId="c" fill="#8b5cf6" radius={[0,4,4,0]}/></BarChart></ResponsiveContainer></div></div>
      <div className="card"><div className="card-header"><h3>Commission Ratio by LOB</h3></div><div className="card-body"><ResponsiveContainer width="100%" height={320}><BarChart data={byLob}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis dataKey="lob" tick={{fontSize:8}} interval={0} angle={-20} textAnchor="end" height={60}/><YAxis unit="%" tick={{fontSize:11}}/><Tooltip formatter={v=>`${v}%`}/><Bar dataKey="ratio" name="Commission %" radius={[4,4,0,0]}>{byLob.map((d,i)=><Cell key={i} fill={Number(d.ratio)>20?'#ef4444':Number(d.ratio)>15?'#f59e0b':'#22c55e'}/>)}</Bar></BarChart></ResponsiveContainer></div></div>
    </div>
    <div className="card"><div className="card-header"><h3>Top 10 Agents — Commission Payout</h3></div><table className="data-table"><thead><tr><th>Agent</th><th>Policies</th><th>Written Premium</th><th>Commission</th><th>Rate</th><th>Status</th></tr></thead><tbody>{byAgent.map((r,i)=><tr key={i}><td style={{fontWeight:600}}>{r.agent}</td><td>{Number(r.policies).toLocaleString(locale)}</td><td>{F(r.written)}</td><td style={{color:'#8b5cf6',fontWeight:700}}>{F(r.commission)}</td><td style={{fontWeight:600}}>{r.comm_rate}%</td><td><span className={`badge ${Number(r.comm_rate)>20?'badge-red':Number(r.comm_rate)>15?'badge-yellow':'badge-green'}`}>{Number(r.comm_rate)>20?'Cap Breach':Number(r.comm_rate)>15?'Watch':'Normal'}</span></td></tr>)}</tbody></table></div>
  </div>);
}
