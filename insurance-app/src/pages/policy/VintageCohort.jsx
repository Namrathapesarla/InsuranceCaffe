import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, FileText, IndianRupee, Percent, Loader2, Database, Clock, Layers } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { useDateFilter } from '../../context/DateFilterContext';
import useCurrency from '../../hooks/useCurrency';
import { fetchVintageKPIs, fetchVintageByCohort, fetchVintageNbVsRenewal } from '../../api';

const COLORS = ['#3b82f6','#22c55e','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4'];
const NEW_BUSINESS_COLOR = '#3b82f6';
const RENEWAL_COLOR = '#22c55e';
const OTHER_SEGMENT_COLOR = '#f59e0b';

function getLossRatioColor(value) {
  const ratio = Number(value);
  if (ratio >= 55) return '#f59e0b';
  return '#22c55e';
}

function getSegmentColor(segment) {
  if (segment === 'New Business') return NEW_BUSINESS_COLOR;
  if (segment === 'Renewal') return RENEWAL_COLOR;
  return OTHER_SEGMENT_COLOR;
}

export default function VintageCohort() {
  const { from, to, isActive } = useDateFilter();
  const { F, FL, symbol, locale } = useCurrency();
  const [kpis, setKpis] = useState(null);
  const [cohorts, setCohorts] = useState([]);
  const [nbVsRen, setNbVsRen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try { setLoading(true);
      const [k,c,n] = await Promise.all([fetchVintageKPIs(from,to),fetchVintageByCohort(from,to),fetchVintageNbVsRenewal(from,to)]);
      setKpis(k); setCohorts(c); setNbVsRen(n); setError(null);
    } catch(e){setError(e.message)} finally{setLoading(false)}
  },[from,to]);
  useEffect(()=>{load()},[load]);

  if(loading) return <div><PageHeader title="Policy Vintage & Cohort Loss Development" subtitle="Track loss ratio development by inception year cohort" breadcrumbs={[{label:'Policy Admin',path:'/policy/list'},{label:'Vintage & Cohort'}]}/><div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.75rem',padding:'4rem',color:'#64748b'}}><Loader2 size={20} style={{animation:'spin 1s linear infinite'}}/>Loading...</div><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  if(error) return <div><PageHeader title="Policy Vintage & Cohort Loss Development" breadcrumbs={[{label:'Policy Admin',path:'/policy/list'},{label:'Vintage & Cohort'}]}/><div style={{padding:'2rem',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'0.5rem',color:'#dc2626'}}><strong>Error:</strong> {error}</div></div>;

  return (
    <div>
      <PageHeader title="Policy Vintage & Cohort Loss Development Analysis" subtitle="Group policies by original inception year, track how each cohort's loss ratio develops over time — pricing adequacy validation" breadcrumbs={[{label:'Policy Admin',path:'/policy/list'},{label:'Vintage & Cohort'}]}/>
      <div style={{display:'flex',gap:'0.75rem',marginBottom:'1rem',flexWrap:'wrap'}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#16a34a',fontWeight:500}}><Database size={13}/> Live data</div>
        <div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#2563eb',fontWeight:500}}><Clock size={13}/> {isActive?`Filtered: ${from||'start'} to ${to||'now'}`:'All Time'}</div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'1rem',marginBottom:'1.5rem'}}>
        <StatCard icon={FileText} label="Total Policies" value={Number(kpis.total_policies).toLocaleString(locale)} color="#3b82f6"/>
        <StatCard icon={Layers} label="Cohorts" value={Number(kpis.cohort_count).toLocaleString(locale)} color="#22c55e"/>
        <StatCard icon={IndianRupee} label="Total Earned" value={F(kpis.total_earned)} color="#8b5cf6"/>
        <StatCard icon={TrendingUp} label="Total Ultimate" value={F(kpis.total_ultimate)} color="#ef4444"/>
        <StatCard icon={Percent} label="Ultimate Loss Ratio" value={kpis.ultimate_loss_ratio} suffix="%" color="#f59e0b"/>
        <StatCard icon={IndianRupee} label="Total Written" value={F(kpis.total_written)} color="#06b6d4"/>
      </div>

      {/* Cohort Loss Ratio chart */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1.5rem'}}>
        <div className="card">
          <div className="card-header"><h3>Ultimate Loss Ratio by Inception Year</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cohorts}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis dataKey="cohort" tick={{fontSize:11}}/><YAxis unit="%" tick={{fontSize:11}}/><Tooltip formatter={(v,n)=>n.includes('%')?`${v}%`:FL(v)}/><Legend/>
                <Bar dataKey="ultimate_lr" name="Ultimate LR %" radius={[4,4,0,0]}>{cohorts.map((d,i)=><Cell key={i} fill={getLossRatioColor(d.ultimate_lr)}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Written vs Earned Premium by Cohort</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cohorts}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis dataKey="cohort" tick={{fontSize:11}}/><YAxis tickFormatter={F} tick={{fontSize:11}}/><Tooltip formatter={v=>FL(v)}/><Legend/>
                <Bar dataKey="written" name="Written" fill="#3b82f6" radius={[4,4,0,0]}/>
                <Bar dataKey="earned" name="Earned" fill="#22c55e" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Loss development + NB vs Renewal */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1.5rem'}}>
        <div className="card">
          <div className="card-header"><h3>Loss Development — Paid + Reserve + IBNR by Cohort</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={cohorts}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis dataKey="cohort" tick={{fontSize:11}}/><YAxis tickFormatter={F} tick={{fontSize:11}}/><Tooltip formatter={v=>FL(v)}/><Legend/>
                <Bar dataKey="paid" name="Paid" stackId="loss" fill="#ef4444"/>
                <Bar dataKey="reserve" name="Reserve" stackId="loss" fill="#f59e0b"/>
                <Bar dataKey="ibnr" name="IBNR" stackId="loss" fill="#8b5cf6" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>New Business vs Renewal — Loss Ratio</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={nbVsRen}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis dataKey="segment" tick={{fontSize:11}}/><YAxis unit="%" tick={{fontSize:11}}/><Tooltip formatter={(v,n)=>n.includes('Ratio')?`${v}%`:n.includes('Policies')?v:FL(v)}/><Legend/>
                <Bar dataKey="loss_ratio" name="Loss Ratio %" radius={[4,4,0,0]}>{nbVsRen.map((d,i)=><Cell key={i} fill={getSegmentColor(d.segment)}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Cohort detail table */}
      <div className="card">
        <div className="card-header"><h3>Cohort Development Detail</h3></div>
        <table className="data-table">
          <thead><tr><th>Cohort</th><th>Policies</th><th>New</th><th>Renewal</th><th>Written</th><th>Earned</th><th>Paid</th><th>Reserve</th><th>IBNR</th><th>Ultimate</th><th>ULR</th></tr></thead>
          <tbody>{cohorts.map((r,i)=><tr key={i}>
            <td style={{fontWeight:700}}>{r.cohort}</td>
            <td>{Number(r.policies).toLocaleString(locale)}</td>
            <td>{r.new_biz}</td><td>{r.renewals}</td>
            <td>{F(r.written)}</td><td>{F(r.earned)}</td>
            <td style={{color:'#ef4444'}}>{F(r.paid)}</td>
            <td>{F(r.reserve)}</td><td>{F(r.ibnr)}</td>
            <td style={{fontWeight:700}}>{F(r.ultimate)}</td>
            <td style={{fontWeight:700,color:getLossRatioColor(r.ultimate_lr)}}>{r.ultimate_lr}%</td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
