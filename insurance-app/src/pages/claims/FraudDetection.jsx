import { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, IndianRupee, Loader2, Database, Clock, FileText, Anchor, Search, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { useDateFilter } from '../../context/DateFilterContext';
import useCurrency from '../../hooks/useCurrency';
import { fetchFraudKPIs, fetchFraudByLob } from '../../api';

export default function FraudDetection() {
  const {from,to,isActive}=useDateFilter();
  const { F, FL, symbol, locale } = useCurrency();
  const [kpis,setKpis]=useState(null); const [byLob,setByLob]=useState([]);
  const [loading,setLoading]=useState(true); const [error,setError]=useState(null);
  const load=useCallback(async()=>{try{setLoading(true);const[k,l]=await Promise.all([fetchFraudKPIs(from,to),fetchFraudByLob(from,to)]);setKpis(k);setByLob(l);setError(null);}catch(e){setError(e.message);}finally{setLoading(false);}},[from,to]);
  useEffect(()=>{load();},[load]);
  if(loading)return<div><PageHeader title="Fraud Detection Engine" subtitle="Pattern-based fraud flagging with suspicious claim detection" breadcrumbs={[{label:'Claims',path:'/claims/list'},{label:'Fraud Detection'}]}/><div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.75rem',padding:'4rem',color:'#64748b'}}><Loader2 size={20} style={{animation:'spin 1s linear infinite'}}/>Loading...</div><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  if(error)return<div><PageHeader title="Fraud Detection Engine" breadcrumbs={[{label:'Claims',path:'/claims/list'},{label:'Fraud Detection'}]}/><div style={{padding:'2rem',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'0.5rem',color:'#dc2626'}}><strong>Error:</strong> {error}</div></div>;

  const signals = [
    { label: 'Total Loss Paid', desc: 'Aggregate claim payments across all LOBs', value: F(kpis.total_paid), color: '#ef4444' },
    { label: 'Salvage Recovered', desc: 'Salvage amounts received from damaged property', value: F(kpis.salvage), color: '#22c55e' },
    { label: 'Subrogation Recovered', desc: 'Amounts recovered from at-fault third parties', value: F(kpis.subrogation), color: '#3b82f6' },
  ];

  return(<div>
    <PageHeader title="Fraud Detection Engine" subtitle="Pattern-based fraud flagging — loss paid analysis, salvage & subrogation tracking, ALAE monitoring by LOB" breadcrumbs={[{label:'Claims',path:'/claims/list'},{label:'Fraud Detection'}]}/>
    <div style={{display:'flex',gap:'0.75rem',marginBottom:'1rem',flexWrap:'wrap'}}><div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#16a34a',fontWeight:500}}><Database size={13}/>Live data</div><div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#2563eb',fontWeight:500}}><Clock size={13}/>{isActive?`Filtered: ${from||'start'} to ${to||'now'}`:'All Time'}</div></div>

    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'1rem',marginBottom:'1.5rem'}}>
      <StatCard icon={FileText} label="Total Claims" value={Number(kpis.total_claims).toLocaleString(locale)} color="#3b82f6"/>
      <StatCard icon={IndianRupee} label="Total Paid" value={F(kpis.total_paid)} color="#ef4444"/>
      <StatCard icon={Anchor} label="Salvage Recovered" value={F(kpis.salvage)} color="#22c55e"/>
      <StatCard icon={Search} label="Subrogation Recovered" value={F(kpis.subrogation)} color="#8b5cf6"/>
      <StatCard icon={ShieldAlert} label="Rapid Claims" value={Number(kpis.rapid_claims).toLocaleString(locale)} color="#f59e0b"/>
      <StatCard icon={Activity} label="Reopened Claims" value={Number(kpis.reopened_claims).toLocaleString(locale)} color="#06b6d4"/>
    </div>

    {/* Charts */}
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1.5rem'}}>
      <div className="card"><div className="card-header"><h3>Loss Paid by LOB</h3></div><div className="card-body">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={byLob} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis type="number" tickFormatter={F} tick={{fontSize:11}}/><YAxis dataKey="lob" type="category" tick={{fontSize:9}} width={150}/><Tooltip formatter={v=>FL(v)}/><Legend/>
            <Bar dataKey="paid" name="Loss Paid" fill="#ef4444" radius={[0,4,4,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div></div>

      <div className="card"><div className="card-header"><h3>Salvage, Subrogation & ALAE by LOB</h3></div><div className="card-body">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={byLob}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis dataKey="lob" tick={{fontSize:8}} interval={0} angle={-20} textAnchor="end" height={60}/><YAxis tickFormatter={F} tick={{fontSize:11}}/><Tooltip formatter={v=>FL(v)}/><Legend/>
            <Bar dataKey="salvage" name="Salvage" fill="#22c55e" radius={[4,4,0,0]}/>
            <Bar dataKey="subrogation" name="Subrogation" fill="#3b82f6" radius={[4,4,0,0]}/>
            <Bar dataKey="alae" name="ALAE (AO+DCC)" fill="#f59e0b" radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div></div>
    </div>

    {/* Detail table */}
    <div className="card"><div className="card-header"><h3>LOB Fraud Analysis Detail</h3></div>
      <table className="data-table">
        <thead><tr><th>LOB</th><th>Claims</th><th>Loss Paid</th><th>Salvage</th><th>Subrogation</th><th>Medical</th><th>ALAE</th><th>Avg TAT</th></tr></thead>
        <tbody>{byLob.map((r,i)=><tr key={i}>
          <td style={{fontWeight:600}}>{r.lob}</td>
          <td>{Number(r.claims).toLocaleString(locale)}</td>
          <td style={{color:'#ef4444',fontWeight:700}}>{F(r.paid)}</td>
          <td style={{color:'#22c55e'}}>{F(r.salvage)}</td>
          <td style={{color:'#3b82f6'}}>{F(r.subrogation)}</td>
          <td>{F(r.medical)}</td>
          <td>{F(r.alae)}</td>
          <td>{r.avg_tat} days</td>
        </tr>)}</tbody>
      </table>
    </div>
  </div>);
}
