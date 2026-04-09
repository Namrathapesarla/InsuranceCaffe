import { useState, useEffect, useCallback } from 'react';
import { IndianRupee, Percent, FileText, Loader2, Database, Clock, Shield, Layers } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { useDateFilter } from '../../context/DateFilterContext';
import useCurrency from '../../hooks/useCurrency';
import { fetchGSTKPIs, fetchGSTByLob, fetchGSTYearly } from '../../api';

export default function GSTCompliance() {
  const {from,to,isActive}=useDateFilter();
  const { F, FL, symbol, locale } = useCurrency();
  const [kpis,setKpis]=useState(null); const [byLob,setByLob]=useState([]); const [yearly,setYearly]=useState([]);
  const [loading,setLoading]=useState(true); const [error,setError]=useState(null);
  const load=useCallback(async()=>{try{setLoading(true);const[k,l,y]=await Promise.all([fetchGSTKPIs(from,to),fetchGSTByLob(from,to),fetchGSTYearly(from,to)]);setKpis(k);setByLob(l);setYearly(y);setError(null);}catch(e){setError(e.message);}finally{setLoading(false);}},[from,to]);
  useEffect(()=>{load();},[load]);
  if(loading)return<div><PageHeader title="GST Compliance" subtitle="Automated GST calculation with return-ready reporting" breadcrumbs={[{label:'Billing',path:'/billing/invoices'},{label:'GST Compliance'}]}/><div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.75rem',padding:'4rem',color:'#64748b'}}><Loader2 size={20} style={{animation:'spin 1s linear infinite'}}/>Loading...</div><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  if(error)return<div><PageHeader title="GST Compliance" breadcrumbs={[{label:'Billing',path:'/billing/invoices'},{label:'GST Compliance'}]}/><div style={{padding:'2rem',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'0.5rem',color:'#dc2626'}}><strong>Error:</strong> {error}</div></div>;
  return(<div>
    <PageHeader title="GST Compliance" subtitle="Automated GST calculation on premiums and service charges with return-ready reporting" breadcrumbs={[{label:'Billing',path:'/billing/invoices'},{label:'GST Compliance'}]}/>
    <div style={{display:'flex',gap:'0.75rem',marginBottom:'1rem',flexWrap:'wrap'}}><div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#16a34a',fontWeight:500}}><Database size={13}/>Live data</div><div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#2563eb',fontWeight:500}}><Clock size={13}/>{isActive?`Filtered: ${from||'start'} to ${to||'now'}`:'All Time'}</div></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:'1rem',marginBottom:'1.5rem'}}>
      <StatCard icon={IndianRupee} label="Written Premium" value={F(kpis.written)} color="#3b82f6"/>
      <StatCard icon={Shield} label="Total GST" value={F(kpis.total_gst)} color="#ef4444"/>
      <StatCard icon={IndianRupee} label="Surcharges" value={F(kpis.surcharges)} color="#f59e0b"/>
      <StatCard icon={Layers} label="Fees" value={F(kpis.fees)} color="#8b5cf6"/>
      <StatCard icon={IndianRupee} label="Total Statutory" value={F(kpis.total_statutory)} color="#ec4899"/>
      <StatCard icon={Percent} label="Effective Tax Rate" value={kpis.effective_tax_rate} suffix="%" color="#06b6d4"/>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1.5rem'}}>
      <div className="card"><div className="card-header"><h3>GST + Surcharges + Fees — Yearly</h3></div><div className="card-body"><ResponsiveContainer width="100%" height={300}><BarChart data={yearly}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis dataKey="year" tick={{fontSize:11}}/><YAxis tickFormatter={F} tick={{fontSize:11}}/><Tooltip formatter={v=>FL(v)}/><Legend/><Bar dataKey="gst" name="GST" stackId="t" fill="#ef4444"/><Bar dataKey="surcharges" name="Surcharges" stackId="t" fill="#f59e0b"/><Bar dataKey="fees" name="Fees" stackId="t" fill="#8b5cf6" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div></div>
      <div className="card"><div className="card-header"><h3>Effective Tax Rate by LOB</h3></div><div className="card-body"><ResponsiveContainer width="100%" height={300}><BarChart data={byLob}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis dataKey="lob" tick={{fontSize:8}} interval={0} angle={-20} textAnchor="end" height={60}/><YAxis unit="%" tick={{fontSize:11}}/><Tooltip formatter={v=>`${v}%`}/><Bar dataKey="tax_rate" name="Tax Rate %" radius={[4,4,0,0]}>{byLob.map((_,i)=><Cell key={i} fill={['#3b82f6','#22c55e','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#14b8a6','#f97316','#6366f1','#a855f7','#10b981'][i%12]}/>)}</Bar></BarChart></ResponsiveContainer></div></div>
    </div>
    <div className="card"><div className="card-header"><h3>LOB GST Detail</h3></div><table className="data-table"><thead><tr><th>LOB</th><th>Written Premium</th><th>GST</th><th>Surcharges</th><th>Fees</th><th>Tax Rate</th></tr></thead><tbody>{byLob.map((r,i)=><tr key={i}><td style={{fontWeight:600}}>{r.lob}</td><td>{F(r.written)}</td><td style={{color:'#ef4444',fontWeight:600}}>{F(r.gst)}</td><td>{F(r.surcharges)}</td><td>{F(r.fees)}</td><td style={{fontWeight:700}}>{r.tax_rate}%</td></tr>)}</tbody></table></div>
  </div>);
}
