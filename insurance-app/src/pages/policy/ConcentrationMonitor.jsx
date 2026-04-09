import { useState, useEffect, useCallback } from 'react';
import { MapPin, FileText, IndianRupee, Layers, Loader2, Database, Clock, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { useDateFilter } from '../../context/DateFilterContext';
import useCurrency from '../../hooks/useCurrency';
import { fetchConcentrationKPIs, fetchConcentrationByRegion, fetchConcentrationByLob, fetchConcentrationByTerritory } from '../../api';

const COLORS = ['#3b82f6','#22c55e','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#14b8a6','#f97316','#6366f1'];

export default function ConcentrationMonitor() {
  const { from, to, isActive } = useDateFilter();
  const { F, FL, symbol, locale } = useCurrency();
  const [kpis, setKpis] = useState(null);
  const [byRegion, setByRegion] = useState([]);
  const [byLob, setByLob] = useState([]);
  const [byTerritory, setByTerritory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try { setLoading(true);
      const [k,r,l,t] = await Promise.all([fetchConcentrationKPIs(from,to),fetchConcentrationByRegion(from,to),fetchConcentrationByLob(from,to),fetchConcentrationByTerritory(from,to)]);
      setKpis(k); setByRegion(r); setByLob(l); setByTerritory(t); setError(null);
    } catch(e){setError(e.message)} finally{setLoading(false)}
  },[from,to]);
  useEffect(()=>{load()},[load]);

  if(loading) return <div><PageHeader title="Multi-State & Multi-Location Concentration Monitor" subtitle="Map premium and exposure concentration by territory" breadcrumbs={[{label:'Policy Admin',path:'/policy/list'},{label:'Concentration Monitor'}]}/><div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.75rem',padding:'4rem',color:'#64748b'}}><Loader2 size={20} style={{animation:'spin 1s linear infinite'}}/>Loading...</div><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  if(error) return <div><PageHeader title="Multi-State & Multi-Location Concentration Monitor" breadcrumbs={[{label:'Policy Admin',path:'/policy/list'},{label:'Concentration Monitor'}]}/><div style={{padding:'2rem',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'0.5rem',color:'#dc2626'}}><strong>Error:</strong> {error}</div></div>;

  return (
    <div>
      <PageHeader title="Multi-State & Multi-Location Concentration Monitor" subtitle="Identify policies spanning multiple states/locations, map premium and exposure concentration, flag capacity thresholds" breadcrumbs={[{label:'Policy Admin',path:'/policy/list'},{label:'Concentration Monitor'}]}/>
      <div style={{display:'flex',gap:'0.75rem',marginBottom:'1rem',flexWrap:'wrap'}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#16a34a',fontWeight:500}}><Database size={13}/> Live data</div>
        <div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#2563eb',fontWeight:500}}><Clock size={13}/> {isActive?`Filtered: ${from||'start'} to ${to||'now'}`:'All Time'}</div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
        <StatCard icon={FileText} label="Total Policies" value={Number(kpis.total_policies).toLocaleString(locale)} color="#3b82f6"/>
        <StatCard icon={MapPin} label="Unique Regions" value={Number(kpis.unique_regions).toLocaleString(locale)} color="#22c55e"/>
        <StatCard icon={Shield} label="Multi-State Policies" value={Number(kpis.multistate_policies).toLocaleString(locale)} color="#8b5cf6"/>
        <StatCard icon={IndianRupee} label="Total Written" value={F(kpis.total_written)} color="#f59e0b"/>
        <StatCard icon={Layers} label="Written Exposures" value={F(kpis.written_exposures)} color="#06b6d4"/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1.5rem'}}>
        <div className="card">
          <div className="card-header"><h3>Premium Concentration — Top 10 Regions</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byRegion} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis type="number" tickFormatter={F} tick={{fontSize:11}}/><YAxis dataKey="region" type="category" tick={{fontSize:9}} width={120}/><Tooltip formatter={v=>FL(v)}/><Legend/><Bar dataKey="written" name="Written Premium" fill="#3b82f6" radius={[0,4,4,0]}/></BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3>Exposure by LOB</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byLob} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis type="number" tickFormatter={F} tick={{fontSize:11}}/><YAxis dataKey="lob" type="category" tick={{fontSize:9}} width={150}/><Tooltip formatter={v=>FL(v)}/><Legend/><Bar dataKey="written" name="Written Premium" fill="#22c55e" radius={[0,4,4,0]}/></BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1.5rem'}}>
        <div className="card">
          <div className="card-header"><h3>Top 10 Territories by Written Premium</h3></div>
          <table className="data-table">
            <thead><tr><th>Territory</th><th>Policies</th><th>Written Premium</th><th>Exposures</th></tr></thead>
            <tbody>{byTerritory.map((r,i)=><tr key={i}><td style={{fontWeight:600}}>{r.territory}</td><td>{Number(r.policies).toLocaleString(locale)}</td><td>{F(r.written)}</td><td>{Number(r.exposures).toLocaleString(locale)}</td></tr>)}</tbody>
          </table>
        </div>
        <div className="card">
          <div className="card-header"><h3>Region Detail</h3></div>
          <table className="data-table">
            <thead><tr><th>Region</th><th>Policies</th><th>Written Premium</th><th>Exposure</th></tr></thead>
            <tbody>{byRegion.map((r,i)=><tr key={i}><td style={{fontWeight:600}}>{r.region}</td><td>{Number(r.policies).toLocaleString(locale)}</td><td>{F(r.written)}</td><td>{Number(r.exposure).toLocaleString(locale)}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
