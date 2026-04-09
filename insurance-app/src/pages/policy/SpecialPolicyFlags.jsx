import { useState, useEffect, useCallback } from 'react';
import { Shield, FileText, IndianRupee, AlertTriangle, Loader2, Database, Clock, Flag } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { useDateFilter } from '../../context/DateFilterContext';
import useCurrency from '../../hooks/useCurrency';
import { fetchSpecialFlagsKPIs, fetchSpecialFlagsByFlag, fetchSpecialFlagsByLob } from '../../api';

const COLORS = ['#3b82f6','#22c55e','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4'];

export default function SpecialPolicyFlags() {
  const { from, to, isActive } = useDateFilter();
  const { F, FL, symbol, locale } = useCurrency();
  const [kpis, setKpis] = useState(null);
  const [byFlag, setByFlag] = useState([]);
  const [byLob, setByLob] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try { setLoading(true);
      const [k,f,l] = await Promise.all([fetchSpecialFlagsKPIs(from,to),fetchSpecialFlagsByFlag(from,to),fetchSpecialFlagsByLob(from,to)]);
      setKpis(k); setByFlag(f); setByLob(l); setError(null);
    } catch(e){setError(e.message)} finally{setLoading(false)}
  },[from,to]);
  useEffect(()=>{load()},[load]);

  if(loading) return <div><PageHeader title="Facultative Reinsurance & Special Policy Flag Monitor" subtitle="Surface all policies carrying special flags" breadcrumbs={[{label:'Policy Admin',path:'/policy/list'},{label:'Special Flags'}]}/><div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.75rem',padding:'4rem',color:'#64748b'}}><Loader2 size={20} style={{animation:'spin 1s linear infinite'}}/>Loading...</div><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  if(error) return <div><PageHeader title="Facultative Reinsurance & Special Policy Flag Monitor" breadcrumbs={[{label:'Policy Admin',path:'/policy/list'},{label:'Special Flags'}]}/><div style={{padding:'2rem',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'0.5rem',color:'#dc2626'}}><strong>Error:</strong> {error}</div></div>;

  return (
    <div>
      <PageHeader title="Facultative Reinsurance & Special Policy Flag Monitor" subtitle="Surface facultative RI, special event flags, claims-made policies — ensures correct cession treatment and regulatory reporting" breadcrumbs={[{label:'Policy Admin',path:'/policy/list'},{label:'Special Flags'}]}/>
      <div style={{display:'flex',gap:'0.75rem',marginBottom:'1rem',flexWrap:'wrap'}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#16a34a',fontWeight:500}}><Database size={13}/> Live data</div>
        <div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#2563eb',fontWeight:500}}><Clock size={13}/> {isActive?`Filtered: ${from||'start'} to ${to||'now'}`:'All Time'}</div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'1rem',marginBottom:'1.5rem'}}>
        <StatCard icon={FileText} label="Total Policies" value={Number(kpis.total_policies).toLocaleString(locale)} color="#3b82f6"/>
        <StatCard icon={Shield} label="Fac. RI Policies" value={Number(kpis.fac_ri_policies).toLocaleString(locale)} color="#8b5cf6"/>
        <StatCard icon={IndianRupee} label="Fac. RI Premium" value={F(kpis.fac_ri_premium)} color="#22c55e"/>
        <StatCard icon={AlertTriangle} label="Claims-Made" value={Number(kpis.claims_made_policies).toLocaleString(locale)} color="#f59e0b"/>
        <StatCard icon={Flag} label="Bound Policies" value={Number(kpis.bound_policies).toLocaleString(locale)} color="#06b6d4"/>
        <StatCard icon={IndianRupee} label="Total Written" value={F(kpis.total_written)} color="#ef4444"/>
      </div>

      {/* Flag breakdown cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'1rem',marginBottom:'1.5rem'}}>
        {byFlag.map((f,i)=>(
          <div key={f.flag} className="card" style={{borderLeft:`4px solid ${COLORS[i%COLORS.length]}`}}>
            <div className="card-body" style={{padding:'1rem'}}>
              <div style={{fontSize:'0.8rem',fontWeight:700,color:'#1e293b',marginBottom:'0.3rem'}}>{f.flag}</div>
              <div style={{fontSize:'1.1rem',fontWeight:800,color:COLORS[i%COLORS.length]}}>{Number(f.policies).toLocaleString(locale)} policies</div>
              <div style={{fontSize:'0.75rem',color:'#64748b',marginTop:'0.2rem'}}>{F(f.premium)} premium</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1.5rem'}}>
        <div className="card">
          <div className="card-header"><h3>Policy Flags — Premium Distribution</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byFlag}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis dataKey="flag" tick={{fontSize:10}}/><YAxis tickFormatter={F} tick={{fontSize:11}}/><Tooltip formatter={v=>FL(v)}/><Bar dataKey="premium" name="Premium" radius={[4,4,0,0]}>{byFlag.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Bar></BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3>Fac. RI & Claims-Made by LOB</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byLob} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis type="number" tick={{fontSize:11}}/><YAxis dataKey="lob" type="category" tick={{fontSize:9}} width={140}/><Tooltip/><Legend/><Bar dataKey="fac_ri" name="Fac. RI" fill="#8b5cf6" barSize={12}/><Bar dataKey="claims_made" name="Claims-Made" fill="#f59e0b" barSize={12}/></BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3>LOB Detail — Special Flags</h3></div>
        <table className="data-table">
          <thead><tr><th>LOB</th><th>Policies</th><th>Fac. RI</th><th>Claims-Made</th><th>Written Premium</th></tr></thead>
          <tbody>{byLob.map((r,i)=><tr key={i}><td style={{fontWeight:600}}>{r.lob}</td><td>{Number(r.policies).toLocaleString(locale)}</td><td style={{color:'#8b5cf6',fontWeight:600}}>{r.fac_ri}</td><td style={{color:'#f59e0b',fontWeight:600}}>{r.claims_made}</td><td>{F(r.written)}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
