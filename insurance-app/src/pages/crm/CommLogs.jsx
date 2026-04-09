import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import { interactions } from '../../data/sampleData';

const columns = [
  { header: 'Date', accessor: 'createdAt' },
  { header: 'Customer', accessor: 'partyName', render: (r) => <span style={{ fontWeight: 600 }}>{r.partyName}</span> },
  { header: 'Channel', accessor: 'channel', render: (r) => <span className="badge badge-blue">{r.channel}</span> },
  { header: 'Type', accessor: 'type' },
  { header: 'Subject', accessor: 'subject' },
  { header: 'Handled By', accessor: 'assignedTo' },
  { header: 'Status', accessor: 'status', render: (r) => <span className={`badge ${r.status === 'Resolved' ? 'badge-green' : r.status === 'Open' ? 'badge-blue' : 'badge-yellow'}`}>{r.status}</span> },
];

export default function CommLogs() {
  return (
    <div>
      <PageHeader title="Communication Logs" subtitle="Complete customer interaction history across all channels"
        breadcrumbs={[{ label: 'CRM', path: '/crm' }, { label: 'Logs' }]} />
      <DataTable columns={columns} data={interactions} />
    </div>
  );
}
