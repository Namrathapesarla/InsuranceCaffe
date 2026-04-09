import { useState, useEffect } from 'react';
import { ExternalLink, Loader2, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import useCurrency from '../../hooks/useCurrency';
import { useSchema } from '../../context/SchemaContext';
import { fetchMasterQuotes } from '../../api';

const useCases = [
  { title: 'Production Reports (50+)', desc: 'Inforce Policy, Line of Business Production, Profitability, New Business, Renewal, Retention by Premium & Count.', color: '#3b82f6', link: '/underwriting/production-report' },
  { title: 'Risk Scoring & Selection', desc: 'Automated underwriting with risk score capture, referral & override tracking, premium rate justification logs.', color: '#22c55e', link: '/underwriting/risk-scoring' },
  { title: 'Premium Leakage Detection & Recovery', desc: 'Identify where premium is lost through uncontrolled discounts, audit variances, under-charged endorsements, and commission misalignments — quantify recoverable amount by underwriter, product, and LOB.', color: '#f59e0b', link: '/underwriting/premium-leakage' },
  { title: 'Renewal Prioritization Engine', desc: 'Rank upcoming renewals by churn propensity and profitability so underwriters focus on high-value, at-risk accounts first.', color: '#8b5cf6', link: '/underwriting/renewal-prioritization' },
  { title: 'LOB Profitability Drill-down', desc: 'Live loss ratio, earned vs. unearned premium, and discount impact by line — surfacing underperforming segments before quarter-end.', color: '#ec4899', link: '/underwriting/lob-profitability' },
  { title: 'Cancellation Pattern Analytics', desc: 'Detect early cancellation signals by producer, product, and region to identify adverse selection and adjust appetite proactively.', color: '#ef4444', link: '/underwriting/cancellation-patterns' },
];

export default function Quotes() {
  const navigate = useNavigate();
  const { symbol, locale } = useCurrency();
  const { currentOption, selectedSchema } = useSchema();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchMasterQuotes()
      .then((data) => { setQuotes(data); setError(null); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedSchema]);

  const columns = [
    { header: 'Quote #', accessor: 'quoteNumber', render: (r) => <span style={{ fontWeight: 600, color: '#8b5cf6' }}>{r.quoteNumber}</span> },
    { header: 'Product', accessor: 'product' },
    { header: 'LOB', accessor: 'lob', render: (r) => r.lob ? <span className="badge badge-blue">{r.lob}</span> : <span style={{ color: '#94a3b8' }}>—</span> },
    { header: 'Sum Insured', accessor: 'sumInsured', render: (r) => `${symbol}${Number(r.sumInsured || 0).toLocaleString(locale)}` },
    { header: 'Premium', accessor: 'premium', render: (r) => `${symbol}${Number(r.premium || 0).toLocaleString(locale)}` },
    { header: 'Risk Score', accessor: 'riskScore', render: (r) => {
      const score = Number(r.riskScore) || 0;
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="progress-bar" style={{ width: 60 }}>
            <div className="progress-fill" style={{ width: `${score}%`, background: score < 30 ? '#22c55e' : score < 50 ? '#f59e0b' : '#ef4444' }} />
          </div>
          <span style={{ fontSize: '0.75rem' }}>{score}</span>
        </div>
      );
    }},
    { header: 'UW Decision', accessor: 'uwDecision', render: (r) => {
      const d = r.uwDecision || 'Pending';
      const cls = d.includes('Auto') ? 'badge-green' : d === 'Pending' ? 'badge-gray' : d.includes('Loading') ? 'badge-orange' : d.includes('Declined') ? 'badge-red' : 'badge-yellow';
      return <span className={`badge ${cls}`}>{d}</span>;
    }},
    { header: 'Status', accessor: 'status', render: (r) => {
      const s = r.status || 'Pending';
      const cls = s === 'Approved' ? 'badge-green' : s === 'Pending' ? 'badge-yellow' : s === 'Declined' ? 'badge-red' : 'badge-orange';
      return <span className={`badge ${cls}`}>{s}</span>;
    }},
    { header: 'Date', accessor: 'createdAt', render: (r) => r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 10) : '—' },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Loader2 size={32} className="spin" style={{ color: '#6366f1' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
        <p>Failed to load quotes: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Quotes" subtitle="Underwriting quotes with risk scoring and approval workflow"
        breadcrumbs={[{ label: 'Underwriting', path: '/underwriting' }, { label: 'Quotes' }]} />

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#16a34a', fontWeight: 500, marginBottom: '1rem' }}>
        <Database size={13} />
        Live data — {currentOption?.schema || 'reporting'} schema — {quotes.length} records
      </div>

      <DataTable columns={columns} data={quotes} />

      {/* Underwriting Module Use Cases */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b' }}>Key Use Cases — Underwriting & Quote</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {useCases.map((uc) => (
            <div
              key={uc.title}
              className="card"
              style={{ borderLeft: `4px solid ${uc.color}`, cursor: uc.link ? 'pointer' : 'default', transition: 'box-shadow 0.2s, transform 0.2s' }}
              onClick={() => uc.link && navigate(uc.link)}
              onMouseEnter={(e) => { if (uc.link) { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
            >
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.4rem', color: '#1e293b' }}>{uc.title}</div>
                  {uc.link && <ExternalLink size={14} color={uc.color} />}
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>{uc.desc}</p>
                {uc.link && <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: uc.color, fontWeight: 600 }}>Click to open dashboard →</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
