import { useState, useEffect, useCallback } from 'react';
import { IndianRupee, Layers, AlertTriangle, Loader2, Database, Clock, FileText, Percent } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { useDateFilter } from '../../context/DateFilterContext';
import useCurrency from '../../hooks/useCurrency';
import { fetchGLReconKPIs, fetchGLReconByLob } from '../../api';

export default function GLReconciliation() {
  const {from,to,isActive}=useDateFilter();
  const { F, FL, symbol, locale } = useCurrency();
  const [kpis,setKpis]=useState(null); const [byLob,setByLob]=useState([]);
  const [loading,setLoading]=useState(true); const [error,setError]=useState(null);
  const load=useCallback(async()=>{try{setLoading(true);const[k,l]=await Promise.all([fetchGLReconKPIs(from,to),fetchGLReconByLob(from,to)]);setKpis(k);setByLob(l);setError(null);}catch(e){setError(e.message);}finally{setLoading(false);}},[from,to]);
  useEffect(()=>{load();},[load]);
  if(loading)return<div><PageHeader title="GL Reconciliation" subtitle="General ledger reconciliation with variance detection" breadcrumbs={[{label:'Billing',path:'/billing/invoices'},{label:'GL Reconciliation'}]}/><div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.75rem',padding:'4rem',color:'#64748b'}}><Loader2 size={20} style={{animation:'spin 1s linear infinite'}}/>Loading...</div><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  if(error)return<div><PageHeader title="GL Reconciliation" breadcrumbs={[{label:'Billing',path:'/billing/invoices'},{label:'GL Reconciliation'}]}/><div style={{padding:'2rem',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'0.5rem',color:'#dc2626'}}><strong>Error:</strong> {error}</div></div>;

  const waterfall = [
    {name:'Written Premium', value:Number(kpis.written), fill:'#3b82f6'},
    {name:'- Commission', value:-Number(kpis.commission), fill:'#ef4444'},
    {name:'- Surcharges', value:-Number(kpis.surcharges), fill:'#f59e0b'},
    {name:'- Taxes', value:-Number(kpis.taxes), fill:'#f59e0b'},
    {name:'- Fees', value:-Number(kpis.fees), fill:'#f59e0b'},
    {name:'= Net Written', value:Number(kpis.net_written), fill:'#22c55e'},
  ];

  return(<div>
    <PageHeader title="GL Reconciliation" subtitle="General ledger reconciliation across premium, claims, and commission accounts with variance detection" breadcrumbs={[{label:'Billing',path:'/billing/invoices'},{label:'GL Reconciliation'}]}/>
    <div style={{display:'flex',gap:'0.75rem',marginBottom:'1rem',flexWrap:'wrap'}}><div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#16a34a',fontWeight:500}}><Database size={13}/>Live data</div><div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#2563eb',fontWeight:500}}><Clock size={13}/>{isActive?`Filtered: ${from||'start'} to ${to||'now'}`:'All Time'}</div></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:'1rem',marginBottom:'1.5rem'}}>
      <StatCard icon={IndianRupee} label="Written Premium" value={F(kpis.written)} color="#3b82f6"/>
      <StatCard icon={Layers} label="Net Written" value={F(kpis.net_written)} color="#22c55e"/>
      <StatCard icon={IndianRupee} label="Earned" value={F(kpis.earned)} color="#8b5cf6"/>
      <StatCard icon={IndianRupee} label="Commission" value={F(kpis.commission)} color="#f59e0b"/>
      <StatCard icon={FileText} label="Taxes" value={F(kpis.taxes)} color="#ef4444"/>
      <StatCard icon={AlertTriangle} label="Variance" value={F(kpis.variance)} color="#ec4899"/>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1.5rem'}}>
      <div className="card"><div className="card-header"><h3>Premium Waterfall</h3></div><div className="card-body"><ResponsiveContainer width="100%" height={300}><BarChart data={waterfall}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis dataKey="name" tick={{fontSize:9}}/><YAxis tickFormatter={F} tick={{fontSize:11}}/><Tooltip formatter={v=>FL(Math.abs(v))}/><Bar dataKey="value" name="Amount">{waterfall.map((d,i)=><Bar key={i} dataKey="value" fill={d.fill}/>)}</Bar></BarChart></ResponsiveContainer></div></div>
      <div className="card"><div className="card-header"><h3>Written vs Net vs Earned by LOB</h3></div><div className="card-body"><ResponsiveContainer width="100%" height={300}><BarChart data={byLob} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis type="number" tickFormatter={F} tick={{fontSize:11}}/><YAxis dataKey="lob" type="category" tick={{fontSize:9}} width={150}/><Tooltip formatter={v=>FL(v)}/><Legend/><Bar dataKey="written" name="Written" fill="#3b82f6" barSize={8}/><Bar dataKey="net_written" name="Net" fill="#22c55e" barSize={8}/><Bar dataKey="earned" name="Earned" fill="#8b5cf6" barSize={8}/></BarChart></ResponsiveContainer></div></div>
    </div>
    <div className="card"><div className="card-header"><h3>LOB GL Detail</h3></div><table className="data-table"><thead><tr><th>LOB</th><th>Written</th><th>Net Written</th><th>Earned</th><th>Commission</th><th>Cost Load</th></tr></thead><tbody>{byLob.map((r,i)=><tr key={i}><td style={{fontWeight:600}}>{r.lob}</td><td>{F(r.written)}</td><td>{F(r.net_written)}</td><td>{F(r.earned)}</td><td>{F(r.commission)}</td><td>{F(r.cost_load)}</td></tr>)}</tbody></table></div>
  </div>);
}
