import { ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import { policies } from '../../data/sampleData';
import { useDateFilter, filterByDate } from '../../context/DateFilterContext';
import useCurrency from '../../hooks/useCurrency';

const statusBadge = (s) => {
  const map = { Active: 'badge-green', Pending: 'badge-yellow', Lapsed: 'badge-red', Cancelled: 'badge-gray' };
  return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>;
};

const policyUseCases = [
  { title: 'Policy Mid-Term Change & Amendment Tracker', desc: 'Track every mid-term policy change — coverage additions, limit adjustments, endorsements, corrections — in a live timeline per policy. Gives underwriters instant visibility of what changed, when, and what premium impact it had.', color: '#3b82f6', link: '/policy/amendment-tracker' },
  { title: 'Multi-State & Multi-Location Concentration Monitor', desc: 'Identify policies spanning multiple states or locations, map premium and exposure concentration by territory and county, and flag where aggregate limits are approaching capacity thresholds.', color: '#22c55e', link: '/policy/concentration-monitor' },
  { title: 'Facultative Reinsurance & Special Policy Flag Monitor', desc: 'Surface all policies carrying facultative reinsurance, special event flags, and claims-made policies in a single compliance dashboard. Ensures high-touch policies receive correct cession treatment and regulatory reporting.', color: '#8b5cf6', link: '/policy/special-flags' },
  { title: 'Policy Vintage & Cohort Loss Development Analysis', desc: 'Group policies by original inception year and track how each cohort\'s loss ratio develops over time — comparing incurred losses at 12, 24, 36 months of maturity. A powerful tool for pricing adequacy validation.', color: '#f59e0b', link: '/policy/vintage-cohort' },
  { title: 'Policy Term Premium vs Actual Earned Reconciliation', desc: 'Compare what was originally priced (TERM_PREMIUM_AMOUNT) against what has actually been earned and what remains unearned — broken down by coverage, LOB, product, agent, and book month. Surfaces pricing drift and pro-rata earning anomalies.', color: '#06b6d4', link: '/policy/term-reconciliation' },
];

export default function PolicyList() {
  const { from, to } = useDateFilter();
  const navigate = useNavigate();
  const { symbol, locale } = useCurrency();
  const filtered = filterByDate(policies, 'effectiveDate', from, to);

  const columns = [
    { header: 'Policy #', accessor: 'policyNumber', render: (r) => <span style={{ fontWeight: 600, color: '#3b82f6' }}>{r.policyNumber}</span> },
    { header: 'Customer', accessor: 'partyName' },
    { header: 'Product', accessor: 'productName' },
    { header: 'LOB', accessor: 'lob', render: (r) => <span className="badge badge-blue">{r.lob}</span> },
    { header: 'Effective', accessor: 'effectiveDate' },
    { header: 'Expiry', accessor: 'expiryDate' },
    { header: 'Sum Insured', accessor: 'sumInsured', render: (r) => `${symbol}${r.sumInsured.toLocaleString(locale)}` },
    { header: 'Premium', accessor: 'grossPremium', render: (r) => `${symbol}${r.grossPremium.toLocaleString(locale)}` },
    { header: 'Status', accessor: 'status', render: (r) => statusBadge(r.status) },
  ];
  return (
    <div>
      <PageHeader title="All Policies" subtitle="Complete policy register with coverage and premium details"
        breadcrumbs={[{ label: 'Policy Admin', path: '/policy' }, { label: 'All Policies' }]} />
      <DataTable columns={columns} data={filtered} />

      {/* Policy Admin Module Use Cases */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b' }}>Key Use Cases — Policy Administration</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {policyUseCases.map((uc) => (
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
