import { useState, useEffect, useCallback } from 'react';
import { Shield, FileText, AlertTriangle, Percent, Loader2, Database, Clock, Layers, IndianRupee } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { useDateFilter } from '../../context/DateFilterContext';
import useCurrency from '../../hooks/useCurrency';
import { fetchPerilAuditKPIs, fetchPerilAuditByLob, fetchPerilAuditByCoverage, fetchPerilAuditFormDetail } from '../../api';

const COLORS = ['#3b82f6','#22c55e','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#14b8a6','#f97316','#6366f1','#a855f7','#10b981'];

export default function PerilAudit() {
  const { from, to, isActive } = useDateFilter();
  const { F, FL, symbol, locale } = useCurrency();
  const [kpis, setKpis] = useState(null);
  const [byLob, setByLob] = useState([]);
  const [byCoverage, setByCoverage] = useState([]);
  const [formDetail, setFormDetail] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try { setLoading(true);
      const [k,l,c,f] = await Promise.all([fetchPerilAuditKPIs(from,to),fetchPerilAuditByLob(from,to),fetchPerilAuditByCoverage(from,to),fetchPerilAuditFormDetail(from,to)]);
      setKpis(k); setByLob(l); setByCoverage(c); setFormDetail(f); setError(null);
    } catch(e){setError(e.message)} finally{setLoading(false)}
  },[from,to]);
  useEffect(()=>{load()},[load]);

  if(loading) return <div><PageHeader title="Policy Form & Coverage Peril Completeness Audit" subtitle="Verify policy form, covered perils, and coverage group consistency" breadcrumbs={[{label:'Policy Admin',path:'/policy/list'},{label:'Peril Audit'}]}/><div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.75rem',padding:'4rem',color:'#64748b'}}><Loader2 size={20} style={{animation:'spin 1s linear infinite'}}/>Loading...</div><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  if(error) return <div><PageHeader title="Policy Form & Coverage Peril Completeness Audit" breadcrumbs={[{label:'Policy Admin',path:'/policy/list'},{label:'Peril Audit'}]}/><div style={{padding:'2rem',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'0.5rem',color:'#dc2626'}}><strong>Error:</strong> {error}</div></div>;

  const covPie = byCoverage.map((d,i)=>({...d, policies: Number(d.policies), color: COLORS[i%COLORS.length]}));

  return (
    <div>
      <PageHeader title="Policy Form & Coverage Peril Completeness Audit" subtitle="Systematically audit every active policy to verify correct policy form, covered perils, loss settlement type, and coverage group — flag mismatches and incomplete structures" breadcrumbs={[{label:'Policy Admin',path:'/policy/list'},{label:'Peril Audit'}]}/>
      <div style={{display:'flex',gap:'0.75rem',marginBottom:'1rem',flexWrap:'wrap'}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#16a34a',fontWeight:500}}><Database size={13}/> Live data</div>
        <div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#2563eb',fontWeight:500}}><Clock size={13}/> {isActive?`Filtered: ${from||'start'} to ${to||'now'}`:'All Time'}</div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:'1rem',marginBottom:'1.5rem'}}>
        <StatCard icon={FileText} label="Total Policies" value={Number(kpis.total_policies).toLocaleString(locale)} color="#3b82f6"/>
        <StatCard icon={Layers} label="Unique Coverages" value={Number(kpis.unique_coverages).toLocaleString(locale)} color="#22c55e"/>
        <StatCard icon={Shield} label="Unique Forms" value={Number(kpis.unique_forms).toLocaleString(locale)} color="#8b5cf6"/>
        <StatCard icon={AlertTriangle} label="Missing Forms" value={Number(kpis.missing_form_policies).toLocaleString(locale)} color="#ef4444"/>
        <StatCard icon={Percent} label="Missing Form Rate" value={kpis.missing_form_rate} suffix="%" color="#f59e0b"/>
        <StatCard icon={Layers} label="Coverage Groups" value={Number(kpis.coverage_groups).toLocaleString(locale)} color="#06b6d4"/>
      </div>

      {/* Row 1: Missing form rate by LOB + Coverage distribution pie */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1.5rem'}}>
        <div className="card">
          <div className="card-header"><h3>Missing Form Rate by LOB</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byLob}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis dataKey="lob" tick={{fontSize:8}} interval={0} angle={-20} textAnchor="end" height={60}/><YAxis unit="%" tick={{fontSize:11}}/><Tooltip formatter={v=>`${v}%`}/><Bar dataKey="missing_form_rate" name="Missing Form %" radius={[4,4,0,0]}>{byLob.map((d,i)=><Cell key={i} fill={Number(d.missing_form_rate)>10?'#ef4444':Number(d.missing_form_rate)>0?'#f59e0b':'#22c55e'}/>)}</Bar></BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Policy Distribution by Coverage</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart><Pie data={covPie} dataKey="policies" nameKey="coverage" cx="50%" cy="50%" innerRadius={50} outerRadius={100} paddingAngle={2} label={({coverage,policies})=>`${coverage?.substring(0,12)||'?'} (${policies})`} labelLine={{stroke:'#94a3b8'}}>{covPie.map((d,i)=><Cell key={i} fill={d.color}/>)}</Pie><Tooltip formatter={(v,n,p)=>[`${v} policies (${FL(p.payload.written)})`,n]}/></PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Policies & Forms by LOB + Coverage by group */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1.5rem'}}>
        <div className="card">
          <div className="card-header"><h3>Policies, Coverages & Forms by LOB</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byLob} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis type="number" tick={{fontSize:11}}/><YAxis dataKey="lob" type="category" tick={{fontSize:9}} width={150}/><Tooltip/><Legend/>
                <Bar dataKey="policies" name="Policies" fill="#3b82f6" barSize={10}/>
                <Bar dataKey="coverages" name="Coverages" fill="#22c55e" barSize={10}/>
                <Bar dataKey="forms" name="Forms" fill="#8b5cf6" barSize={10}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Coverage Detail</h3></div>
          <table className="data-table">
            <thead><tr><th>Coverage</th><th>Group</th><th>Policies</th><th>Forms</th><th>Written</th></tr></thead>
            <tbody>{byCoverage.map((r,i)=><tr key={i}>
              <td style={{fontWeight:600,fontSize:'0.8rem'}}>{r.coverage}</td>
              <td style={{fontSize:'0.75rem',color:'#64748b'}}>{r.coverage_group}</td>
              <td>{Number(r.policies).toLocaleString(locale)}</td>
              <td>{r.forms}</td>
              <td>{F(r.written)}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </div>

      {/* Form detail table */}
      <div className="card" style={{marginBottom:'1.5rem'}}>
        <div className="card-header"><h3>Policy Form Register</h3></div>
        <table className="data-table">
          <thead><tr><th>Form Number</th><th>Description</th><th>Policies</th><th>Coverages</th><th>Written Premium</th><th>Status</th></tr></thead>
          <tbody>{formDetail.map((r,i)=><tr key={i}>
            <td style={{fontWeight:600,color:r.form_number==='(Missing)'?'#ef4444':'#3b82f6'}}>{r.form_number}</td>
            <td style={{fontSize:'0.8rem'}}>{r.form_description}</td>
            <td>{Number(r.policies).toLocaleString(locale)}</td>
            <td>{r.coverages}</td>
            <td>{F(r.written)}</td>
            <td><span className={`badge ${r.form_number==='(Missing)'?'badge-red':'badge-green'}`}>{r.form_number==='(Missing)'?'Missing':'Complete'}</span></td>
          </tr>)}</tbody>
        </table>
      </div>

      {/* LOB audit summary */}
      <div className="card">
        <div className="card-header"><h3>LOB Audit Summary</h3></div>
        <table className="data-table">
          <thead><tr><th>LOB</th><th>Policies</th><th>Coverages</th><th>Forms</th><th>Missing Forms</th><th>Missing %</th><th>Written</th><th>Audit Status</th></tr></thead>
          <tbody>{byLob.map((r,i)=><tr key={i}>
            <td style={{fontWeight:600}}>{r.lob}</td>
            <td>{Number(r.policies).toLocaleString(locale)}</td>
            <td>{r.coverages}</td>
            <td>{r.forms}</td>
            <td style={{color:'#ef4444',fontWeight:Number(r.missing_forms)>0?700:400}}>{r.missing_forms}</td>
            <td style={{fontWeight:700,color:Number(r.missing_form_rate)>10?'#ef4444':Number(r.missing_form_rate)>0?'#f59e0b':'#22c55e'}}>{r.missing_form_rate}%</td>
            <td>{F(r.written)}</td>
            <td><span className={`badge ${Number(r.missing_form_rate)===0?'badge-green':Number(r.missing_form_rate)<=10?'badge-yellow':'badge-red'}`}>{Number(r.missing_form_rate)===0?'Pass':Number(r.missing_form_rate)<=10?'Review':'Fail'}</span></td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
