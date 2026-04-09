import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import { Shield, AlertTriangle, Eye, CheckCircle } from 'lucide-react';
import useCurrency from '../../hooks/useCurrency';

export default function RiskMonitoring() {
  const { symbol, locale } = useCurrency();

  const riskItems = [
    { category: 'Solvency', indicator: 'Solvency Ratio', current: '185%', threshold: '≥ 150%', status: 'Healthy', severity: 'Low', irdaiRef: 'IRDAI Solvency Margin Regulations' },
    { category: 'Claims', indicator: 'Claim TAT Breach Rate', current: '8.2%', threshold: '< 5%', status: 'Warning', severity: 'Medium', irdaiRef: '30-day settlement mandate' },
    { category: 'Claims', indicator: 'Interest on Delayed Settlements', current: `${symbol}${(12400).toLocaleString(locale)}`, threshold: `${symbol}0`, status: 'Warning', severity: 'Medium', irdaiRef: 'IRDAI Claims TAT Guidelines' },
    { category: 'AML', indicator: 'Pending AML Screenings', current: '3', threshold: '0', status: 'Action Required', severity: 'High', irdaiRef: 'PMLA / IRDAI AML Guidelines' },
    { category: 'KYC', indicator: 'Expired KYC Profiles', current: '12', threshold: '0', status: 'Action Required', severity: 'Medium', irdaiRef: 'CKYC / IRDAI KYC Norms' },
    { category: 'FATCA', indicator: 'Pending FATCA/CRS Declarations', current: '5', threshold: '0', status: 'Action Required', severity: 'Medium', irdaiRef: 'FATCA/CRS Regulations (CBDT)' },
    { category: 'Agent', indicator: 'Expiring Licenses (30d)', current: '2', threshold: '0', status: 'Warning', severity: 'Medium', irdaiRef: 'IRDAI Agent Licensing Regulations' },
    { category: 'Agent', indicator: 'Commission Cap Violations', current: '0', threshold: '0', status: 'Healthy', severity: 'Low', irdaiRef: 'IRDAI Commission Regulations' },
    { category: 'Policy', indicator: 'Free-look Cancellations Pending', current: '3', threshold: '< 5', status: 'Healthy', severity: 'Low', irdaiRef: 'IRDAI Free-look Period (15/30d)' },
    { category: 'Policy', indicator: 'Guaranteed Renewability Breaches', current: '0', threshold: '0', status: 'Healthy', severity: 'Low', irdaiRef: 'IRDAI Health Insurance Regs' },
    { category: 'Finance', indicator: 'Outstanding Receivables > 90d', current: `${symbol}${(35000).toLocaleString(locale)}`, threshold: `< ${symbol}1L`, status: 'Healthy', severity: 'Low', irdaiRef: 'IRDAI Financial Reporting' },
    { category: 'Finance', indicator: 'GST Compliance on Premiums', current: 'Compliant', threshold: 'Compliant', status: 'Healthy', severity: 'Low', irdaiRef: 'GST Act / IRDAI Premium Regs' },
    { category: 'Fraud', indicator: 'SIU Cases Open', current: '0', threshold: '< 5', status: 'Healthy', severity: 'Low', irdaiRef: 'IRDAI Fraud Monitoring Framework' },
    { category: 'Mis-selling', indicator: 'Anti-Mis-selling Declarations', current: '100%', threshold: '100%', status: 'Healthy', severity: 'Low', irdaiRef: 'IRDAI Protection of Policyholders' },
    { category: 'Cyber', indicator: 'Failed Login Attempts (24h)', current: '15', threshold: '< 50', status: 'Healthy', severity: 'Low', irdaiRef: 'IRDAI Cybersecurity Framework 2017' },
    { category: 'Cyber', indicator: 'VAPT Readiness', current: 'Current', threshold: 'Current', status: 'Healthy', severity: 'Low', irdaiRef: 'IRDAI IT Governance Guidelines' },
  ];
  return (
    <div>
      <PageHeader title="Risk Monitoring" subtitle="Enterprise risk dashboard — solvency, compliance, fraud, and operational KPIs aligned to IRDAI norms"
        breadcrumbs={[{ label: 'Compliance', path: '/compliance' }, { label: 'Risk Monitoring' }]} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard icon={Shield} label="Risk Indicators" value={riskItems.length} color="#3b82f6" />
        <StatCard icon={CheckCircle} label="Healthy" value={riskItems.filter(r => r.status === 'Healthy').length} color="#22c55e" />
        <StatCard icon={Eye} label="Warning" value={riskItems.filter(r => r.status === 'Warning').length} color="#f59e0b" />
        <StatCard icon={AlertTriangle} label="Action Required" value={riskItems.filter(r => r.status === 'Action Required').length} color="#ef4444" />
      </div>
      <div className="card">
        <table className="data-table">
          <thead><tr><th>Category</th><th>Indicator</th><th>Current</th><th>Threshold</th><th>IRDAI Reference</th><th>Severity</th><th>Status</th></tr></thead>
          <tbody>
            {riskItems.map((r, i) => (
              <tr key={i}>
                <td><span className="badge badge-blue">{r.category}</span></td>
                <td style={{ fontWeight: 600 }}>{r.indicator}</td>
                <td style={{ fontWeight: 600 }}>{r.current}</td>
                <td style={{ color: '#94a3b8' }}>{r.threshold}</td>
                <td style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.irdaiRef}</td>
                <td><span className={`badge ${r.severity === 'Low' ? 'badge-green' : r.severity === 'Medium' ? 'badge-yellow' : 'badge-red'}`}>{r.severity}</span></td>
                <td><span className={`badge ${r.status === 'Healthy' ? 'badge-green' : r.status === 'Warning' ? 'badge-yellow' : 'badge-red'}`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
