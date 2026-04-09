import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import { agents } from '../../data/sampleData';
import useCurrency from '../../hooks/useCurrency';

export default function Commissions() {
  const { F, FL, symbol, locale } = useCurrency();

  const columns = [
    { header: 'Agent Code', accessor: 'agentCode', render: (r) => <span style={{ fontWeight: 600, color: '#8b5cf6' }}>{r.agentCode}</span> },
    { header: 'Agent Name', accessor: 'name' },
    { header: 'Type', accessor: 'type', render: (r) => <span className="badge badge-blue">{r.type}</span> },
    { header: 'Total Premium', accessor: 'totalPremium', render: (r) => `${symbol}${r.totalPremium.toLocaleString(locale)}` },
    { header: 'Commission Rate', render: (r) => { const rate = (r.commissionEarned / r.totalPremium * 100).toFixed(1); return `${rate}%`; }},
    { header: 'Commission Earned', accessor: 'commissionEarned', render: (r) => <span style={{ fontWeight: 600, color: '#22c55e' }}>{symbol}{r.commissionEarned.toLocaleString(locale)}</span> },
    { header: 'Policies', accessor: 'policiesSold' },
    { header: 'Avg per Policy', render: (r) => `${symbol}${Math.round(r.commissionEarned / r.policiesSold).toLocaleString(locale)}` },
  ];
  return (
    <div>
      <PageHeader title="Commissions" subtitle="Agent commission earnings, rates, and payout tracking"
        breadcrumbs={[{ label: 'Agent/Broker', path: '/agent' }, { label: 'Commissions' }]} />
      <DataTable columns={columns} data={agents} />
    </div>
  );
}
