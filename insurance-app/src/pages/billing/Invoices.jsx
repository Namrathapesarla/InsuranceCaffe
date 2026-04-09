import { ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { invoices } from '../../data/sampleData';
import { IndianRupee, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { useDateFilter, filterByDate } from '../../context/DateFilterContext';
import useCurrency from '../../hooks/useCurrency';

const baseColumns = [
  { header: 'Invoice #', accessor: 'invoiceNumber', render: (r) => <span style={{ fontWeight: 600, color: '#3b82f6' }}>{r.invoiceNumber}</span> },
  { header: 'Policy #', accessor: 'policyNumber' },
  { header: 'Customer', accessor: 'partyName' },
  { header: 'Bill Date', accessor: 'billDate' },
  { header: 'Due Date', accessor: 'dueDate' },
  { header: 'Amount', accessor: 'amount' },
  { header: 'Paid', accessor: 'paidAmount' },
  { header: 'Mode', accessor: 'paymentMode' },
  { header: 'Status', accessor: 'status', render: (r) => <span className={`badge ${r.status === 'Paid' ? 'badge-green' : r.status === 'Overdue' ? 'badge-red' : r.status === 'Partial' ? 'badge-yellow' : 'badge-gray'}`}>{r.status}</span> },
];

const billingUseCases = [
  { title: 'Collection Rate Tracking', desc: 'Real-time premium collection rate monitoring with aging analysis and overdue alerts.', color: '#3b82f6', link: '/billing/collection-rate' },
  { title: 'Refund TAT Monitoring', desc: 'Track refund processing turnaround time with SLA breach alerts for IRDAI compliance.', color: '#ef4444', link: '/billing/refund-monitor' },
  { title: 'Commission Payout', desc: 'Agent commission calculation with IRDAI cap validation, payment processing, and audit trail.', color: '#22c55e', link: '/billing/commission-payout' },
  { title: 'Solvency Ratio (≥150%)', desc: 'Quarterly solvency ratio monitoring per IRDAI mandate with auto-alerts when approaching threshold.', color: '#f59e0b', link: '/billing/solvency' },
  { title: 'GL Reconciliation', desc: 'General ledger reconciliation across premium, claims, and commission accounts with variance detection.', color: '#8b5cf6', link: '/billing/gl-reconciliation' },
];

export default function Invoices() {
  const { from, to } = useDateFilter();
  const { F, FL, symbol, locale } = useCurrency();
  const navigate = useNavigate();
  const filtered = filterByDate(invoices, 'billDate', from, to);
  const columns = baseColumns.map(c =>
    c.accessor === 'amount' ? { ...c, render: (r) => `${symbol}${r.amount.toLocaleString(locale)}` } :
    c.accessor === 'paidAmount' ? { ...c, render: (r) => `${symbol}${r.paidAmount.toLocaleString(locale)}` } : c
  );
  const totalBilled = filtered.reduce((s, i) => s + i.amount, 0);
  const totalPaid = filtered.reduce((s, i) => s + i.paidAmount, 0);
  return (
    <div>
      <PageHeader title="Premium Invoices" subtitle="Invoice register with payment status and reconciliation"
        breadcrumbs={[{ label: 'Billing', path: '/billing' }, { label: 'Invoices' }]} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard icon={IndianRupee} label="Total Billed" value={F(totalBilled)} color="#3b82f6" />
        <StatCard icon={CheckCircle} label="Total Collected" value={F(totalPaid)} color="#22c55e" />
        <StatCard icon={AlertTriangle} label="Overdue" value={filtered.filter(i => i.status === 'Overdue').length} color="#ef4444" />
        <StatCard icon={Clock} label="Partial Payments" value={filtered.filter(i => i.status === 'Partial').length} color="#f59e0b" />
      </div>
      <DataTable columns={columns} data={filtered} />

      {/* Billing Module Use Cases */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b' }}>Key Use Cases — Billing & Premium Accounting</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {billingUseCases.map((uc) => (
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
