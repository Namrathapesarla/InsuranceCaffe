import { useState, useEffect, useCallback } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import useCurrency from '../../hooks/useCurrency';
import { API_BASE } from '../../api';

function apiFetch(url) {
  const schema = sessionStorage.getItem('ic_schema') || 'local';
  return fetch(url, { headers: { 'X-Schema': schema } });
}

const agentUseCases = [
  { title: 'Agency Snapshot', desc: 'KPI overview: production, profitability, retention per agent with real-time dashboards.', color: '#3b82f6', link: '/agent/snapshot' },
  { title: 'Producer Production Report', desc: 'Written premium, exposure, new business YTD by producer with trend analysis.', color: '#22c55e', link: '/agent/production-report' },
  { title: 'Commission Calculation', desc: 'IRDAI cap validation, payment processing, audit trail for all commission payouts.', color: '#f59e0b', link: '/agent/commission-calc' },
  { title: 'Top 10 Producers by Premium', desc: 'Ranked performance dashboards with loss ratio overlay and profitability metrics.', color: '#8b5cf6', link: '/agent/top-producers' },
];

export default function AgentList() {
  const navigate = useNavigate();
  const { F } = useCurrency();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`${API_BASE}/master/parties`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setAgents(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { header: 'Code', accessor: 'empId', render: (r) => <span style={{ fontWeight: 600, color: '#8b5cf6' }}>{r.empId}</span> },
    { header: 'Name', accessor: 'name', render: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> },
    { header: 'Designation', accessor: 'designation' },
    { header: 'Gender', accessor: 'gender' },
    { header: 'Region', accessor: 'regionCode' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Annual Revenue', accessor: 'annualRevenue', render: (r) => F(r.annualRevenue) },
    { header: 'Status', accessor: 'currentFlag', render: (r) => <span className={`badge ${r.currentFlag === 'Y' ? 'badge-green' : 'badge-red'}`}>{r.currentFlag === 'Y' ? 'Active' : 'Inactive'}</span> },
  ];

  return (
    <div>
      <PageHeader title="Agents & Brokers" subtitle="Agent network with licensing, performance, and compliance status"
        breadcrumbs={[{ label: 'Agent/Broker', path: '/agent' }, { label: 'All Agents' }]} />

      {loading ? (
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.75rem',padding:'3rem',color:'#64748b'}}><Loader2 size={20} style={{animation:'spin 1s linear infinite'}} /> Loading agents...</div>
      ) : (
        <DataTable columns={columns} data={agents} />
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Agent/Producer Module Use Cases */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b' }}>Key Use Cases — Agent / Producer Analytics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {agentUseCases.map((uc) => (
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
