import { useState, useEffect, useCallback } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { AlertTriangle, CheckCircle, Search, XCircle, FileText } from 'lucide-react';
import { useDateFilter } from '../../context/DateFilterContext';
import useCurrency from '../../hooks/useCurrency';
import { fetchClaimsList } from '../../api';

const claimBadge = (s) => {
  const map = { Settled: 'badge-green', Approved: 'badge-green', Closed: 'badge-green', 'Under Investigation': 'badge-blue', 'Documents Pending': 'badge-yellow', FNOL: 'badge-purple', Denied: 'badge-red', Open: 'badge-blue', 'Active/Default': 'badge-gray' };
  return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>;
};

const makeColumns = (FL) => [
  { header: 'Claim #', accessor: 'claimNumber', render: (r) => <span style={{ fontWeight: 600, color: '#f59e0b' }}>{r.claimNumber}</span> },
  { header: 'Policy #', accessor: 'policyNumber', render: (r) => <span style={{ color: '#3b82f6' }}>{r.policyNumber}</span> },
  { header: 'Customer', accessor: 'partyName' },
  { header: 'LOB', accessor: 'lob', render: (r) => <span className="badge badge-blue">{r.lob}</span> },
  { header: 'Loss Date', accessor: 'lossDate', render: (r) => r.lossDate ? String(r.lossDate).slice(0, 10) : '-' },
  { header: 'Claim Amount', accessor: 'claimAmount', render: (r) => r.claimAmount ? FL(r.claimAmount) : '-' },
  { header: 'Reserve', accessor: 'reserveAmount', render: (r) => FL(r.reserveAmount) },
  { header: 'Paid', accessor: 'paidAmount', render: (r) => r.paidAmount ? FL(r.paidAmount) : '-' },
  { header: 'Status', accessor: 'status', render: (r) => claimBadge(r.status) },
];

const claimsUseCases = [
  { title: 'Claim TAT Tracker', desc: 'Real-time dashboard: Settlement Date - FNOL Date. Breach alerts for IRDAI 30-day limit with interest auto-calc.', color: '#3b82f6', link: '/claims/tat-tracker' },
  { title: 'Fraud Detection Engine', desc: 'Pattern rules flagging suspicious claims. Duplicate detection, outlier reserve analysis, adjuster over-reserving alerts.', color: '#ef4444', link: '/claims/fraud-detection' },
  { title: 'Reserve Adequacy Monitor', desc: 'Loss Paid vs Initial Reserve ratio. Over/under-reserving alerts per adjuster. Examiner reserve adequacy workflow.', color: '#f59e0b', link: '/claims/reserve-adequacy' },
];

export default function ClaimsList() {
  const { from, to } = useDateFilter();
  const { F, FL, symbol, locale } = useCurrency();
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchClaimsList(from, to);
      setClaims(data);
      setError(null);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }, [from, to]);

  useEffect(() => { loadData(); }, [loadData]);

  const columns = makeColumns(FL);

  const totalClaims = claims.length;
  const settled = claims.filter(c => c.status === 'Closed' || c.status === 'Settled').length;
  const open = claims.filter(c => c.status === 'Open' || c.status === 'FNOL' || c.status === 'Active/Default').length;
  const denied = claims.filter(c => c.status === 'Denied').length;

  return (
    <div>
      <PageHeader title="All Claims" subtitle="End-to-end claims register from FNOL to settlement"
        breadcrumbs={[{ label: 'Claims', path: '/claims' }, { label: 'All Claims' }]} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard icon={FileText} label="Total Claims" value={totalClaims} color="#3b82f6" />
        <StatCard icon={CheckCircle} label="Settled / Closed" value={settled} color="#22c55e" />
        <StatCard icon={Search} label="Open / FNOL" value={open} color="#f59e0b" />
        <StatCard icon={XCircle} label="Denied" value={denied} color="#ef4444" />
      </div>

      {loading ? (
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.75rem',padding:'3rem',color:'#64748b'}}><Loader2 size={20} style={{animation:'spin 1s linear infinite'}} /> Loading claims...</div>
      ) : error ? (
        <div style={{padding:'2rem',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'0.5rem',color:'#dc2626'}}><strong>Error:</strong> {error}</div>
      ) : (
        <DataTable columns={columns} data={claims} />
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Claims Module Use Cases */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b' }}>Key Use Cases — Claims Management</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {claimsUseCases.map((uc) => (
            <div
              key={uc.title}
              className="card"
              style={{ borderLeft: `4px solid ${uc.color}`, cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s' }}
              onClick={() => navigate(uc.link)}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
            >
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.4rem', color: '#1e293b' }}>{uc.title}</div>
                  <ExternalLink size={14} color={uc.color} />
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>{uc.desc}</p>
                <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: uc.color, fontWeight: 600 }}>Click to open dashboard →</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
