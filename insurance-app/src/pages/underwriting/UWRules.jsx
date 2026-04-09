import PageHeader from '../../components/PageHeader';
import useCurrency from '../../hooks/useCurrency';

export default function UWRules() {
  const { symbol } = useCurrency();

  const rules = [
    { id: 1, name: 'Auto-Approval — Low Risk Motor', condition: `Risk Score ≤ 25 AND LOB = Motor AND Sum Insured ≤ ${symbol}15L`, action: 'Auto-approve, no manual review', status: 'Active' },
    { id: 2, name: 'Auto-Approval — Standard Health', condition: 'Risk Score ≤ 30 AND Age ≤ 45 AND No pre-existing conditions', action: 'Auto-approve with standard rates', status: 'Active' },
    { id: 3, name: 'Manual Referral — High Sum Insured', condition: `Sum Insured > ${symbol}1Cr (any LOB)`, action: 'Refer to Senior Underwriter', status: 'Active' },
    { id: 4, name: 'Medical UW Required — Life', condition: `LOB = Life AND (Age > 45 OR Sum Insured > ${symbol}50L)`, action: 'Require medical examination', status: 'Active' },
    { id: 5, name: 'AML Block — High Risk Party', condition: 'AML Screening = Positive OR Party Risk = High', action: 'Block quote, escalate to Compliance', status: 'Active' },
    { id: 6, name: 'Loading — Flood Zone', condition: 'Risk Location in Flood Zone A/B', action: 'Apply 15-25% loading on base premium', status: 'Active' },
    { id: 7, name: 'Decline — Sanctioned Entity', condition: 'Party on OFAC/UN sanctions list', action: 'Auto-decline, log to AML', status: 'Active' },
    { id: 8, name: 'Referral — Multiple Claims', condition: 'Party has ≥ 3 claims in last 12 months', action: 'Refer to manual review with claims history', status: 'Active' },
  ];

  return (
    <div>
      <PageHeader title="Underwriting Rules" subtitle="Rule-based decisioning engine for automated and manual underwriting"
        breadcrumbs={[{ label: 'Underwriting', path: '/underwriting' }, { label: 'Rules' }]} />
      <div className="card">
        <table className="data-table">
          <thead><tr><th>#</th><th>Rule Name</th><th>Condition</th><th>Action</th><th>Status</th></tr></thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td style={{ fontWeight: 600 }}>{r.name}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{r.condition}</td>
                <td>{r.action}</td>
                <td><span className="badge badge-green">{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
