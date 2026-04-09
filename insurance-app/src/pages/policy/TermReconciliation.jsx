import { useState, useEffect, useCallback } from 'react';
import { IndianRupee, Percent, FileText, TrendingDown, Loader2, Database, Clock, Shield, Layers } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { useDateFilter } from '../../context/DateFilterContext';
import useCurrency from '../../hooks/useCurrency';
import { fetchTermReconKPIs, fetchTermReconByLob, fetchTermReconByProduct, fetchTermReconYearly } from '../../api';

export default function TermReconciliation() {
  const { from, to, isActive } = useDateFilter();
  const { F, FL, symbol, locale } = useCurrency();
  const [kpis, setKpis] = useState(null);
  const [byLob, setByLob] = useState([]);
  const [byProduct, setByProduct] = useState([]);
  const [yearly, setYearly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try { setLoading(true);
      const [k,l,p,y] = await Promise.all([fetchTermReconKPIs(from,to),fetchTermReconByLob(from,to),fetchTermReconByProduct(from,to),fetchTermReconYearly(from,to)]);
      setKpis(k); setByLob(l); setByProduct(p); setYearly(y); setError(null);
    } catch(e){setError(e.message)} finally{setLoading(false)}
  },[from,to]);
  useEffect(()=>{load()},[load]);

  if(loading) return <div><PageHeader title="Policy Term Premium vs Actual Earned Reconciliation" subtitle="Compare original pricing against actual earned premium" breadcrumbs={[{label:'Policy Admin',path:'/policy/list'},{label:'Term Reconciliation'}]}/><div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.75rem',padding:'4rem',color:'#64748b'}}><Loader2 size={20} style={{animation:'spin 1s linear infinite'}}/>Loading...</div><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  if(error) return <div><PageHeader title="Policy Term Premium vs Actual Earned Reconciliation" breadcrumbs={[{label:'Policy Admin',path:'/policy/list'},{label:'Term Reconciliation'}]}/><div style={{padding:'2rem',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'0.5rem',color:'#dc2626'}}><strong>Error:</strong> {error}</div></div>;

  return (
    <div>
      <PageHeader title="Policy Term Premium vs Actual Earned Reconciliation" subtitle="Compare what was originally priced (TERM_PREMIUM) against what has actually been earned and what remains unearned — broken down by coverage, LOB, product, and book month" breadcrumbs={[{label:'Policy Admin',path:'/policy/list'},{label:'Term Reconciliation'}]}/>
      <div style={{display:'flex',gap:'0.75rem',marginBottom:'1rem',flexWrap:'wrap'}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#16a34a',fontWeight:500}}><Database size={13}/> Live data</div>
        <div style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',padding:'0.35rem 0.75rem',background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'0.5rem',fontSize:'0.75rem',color:'#2563eb',fontWeight:500}}><Clock size={13}/> {isActive?`Filtered: ${from||'start'} to ${to||'now'}`:'All Time'}</div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:'1rem',marginBottom:'1.5rem'}}>
        <StatCard icon={FileText} label="Total Policies" value={Number(kpis.total_policies).toLocaleString(locale)} color="#3b82f6"/>
        <StatCard icon={IndianRupee} label="Term Premium" value={F(kpis.total_term_premium)} color="#8b5cf6"/>
        <StatCard icon={IndianRupee} label="Earned Premium" value={F(kpis.total_earned)} color="#22c55e"/>
        <StatCard icon={TrendingDown} label="Earning Shortfall" value={F(kpis.earning_shortfall)} color="#ef4444"/>
        <StatCard icon={Percent} label="Earning Accuracy" value={kpis.earning_accuracy_pct} suffix="%" color="#f59e0b"/>
        <StatCard icon={Shield} label="Inforce Policies" value={Number(kpis.inforce_count).toLocaleString(locale)} color="#06b6d4"/>
      </div>

      {/* Row 1: Yearly trend + Shortfall by LOB */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1.5rem'}}>
        <div className="card">
          <div className="card-header"><h3>Term Premium vs Earned — Yearly Trend</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={yearly}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis dataKey="year" tick={{fontSize:11}}/><YAxis tickFormatter={F} tick={{fontSize:11}}/><Tooltip formatter={v=>FL(v)}/><Legend/>
                <Bar dataKey="term_premium" name="Term Premium" fill="#8b5cf6" radius={[4,4,0,0]}/>
                <Bar dataKey="earned" name="Earned" fill="#22c55e" radius={[4,4,0,0]}/>
                <Bar dataKey="shortfall" name="Shortfall" fill="#ef4444" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Earning Shortfall by LOB</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byLob} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis type="number" tickFormatter={F} tick={{fontSize:11}}/><YAxis dataKey="lob" type="category" tick={{fontSize:9}} width={150}/><Tooltip formatter={v=>FL(v)}/><Legend/>
                <Bar dataKey="shortfall" name="Shortfall" fill="#ef4444" radius={[0,4,4,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Accuracy by LOB + By Product */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1.5rem'}}>
        <div className="card">
          <div className="card-header"><h3>Earning Accuracy % by LOB</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byLob}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis dataKey="lob" tick={{fontSize:8}} interval={0} angle={-20} textAnchor="end" height={60}/><YAxis unit="%" tick={{fontSize:11}}/><Tooltip formatter={v=>`${v}%`}/><Bar dataKey="accuracy_pct" name="Accuracy %" radius={[4,4,0,0]}>{byLob.map((d,i)=><Cell key={i} fill={Number(d.accuracy_pct)>=95?'#22c55e':Number(d.accuracy_pct)>=85?'#f59e0b':'#ef4444'}/>)}</Bar></BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Top 10 Products — Earning Accuracy</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byProduct}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis dataKey="product" tick={{fontSize:8}} interval={0} angle={-20} textAnchor="end" height={60}/><YAxis unit="%" tick={{fontSize:11}}/><Tooltip formatter={v=>`${v}%`}/><Bar dataKey="accuracy_pct" name="Accuracy %" radius={[4,4,0,0]}>{byProduct.map((d,i)=><Cell key={i} fill={Number(d.accuracy_pct)>=95?'#22c55e':Number(d.accuracy_pct)>=85?'#f59e0b':'#ef4444'}/>)}</Bar></BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detail table */}
      <div className="card">
        <div className="card-header"><h3>LOB Reconciliation Detail</h3></div>
        <table className="data-table">
          <thead><tr><th>LOB</th><th>Policies</th><th>Term Premium</th><th>Earned</th><th>Unearned</th><th>Shortfall</th><th>Accuracy %</th><th>Status</th></tr></thead>
          <tbody>{byLob.map((r,i)=><tr key={i}>
            <td style={{fontWeight:600}}>{r.lob}</td>
            <td>{Number(r.policies).toLocaleString(locale)}</td>
            <td>{F(r.term_premium)}</td>
            <td>{F(r.earned)}</td>
            <td>{F(r.unearned)}</td>
            <td style={{color:'#ef4444',fontWeight:700}}>{F(r.shortfall)}</td>
            <td style={{fontWeight:700,color:Number(r.accuracy_pct)>=95?'#22c55e':Number(r.accuracy_pct)>=85?'#f59e0b':'#ef4444'}}>{r.accuracy_pct}%</td>
            <td><span className={`badge ${Number(r.accuracy_pct)>=95?'badge-green':Number(r.accuracy_pct)>=85?'badge-yellow':'badge-red'}`}>{Number(r.accuracy_pct)>=95?'On Track':Number(r.accuracy_pct)>=85?'Monitor':'Action Needed'}</span></td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
