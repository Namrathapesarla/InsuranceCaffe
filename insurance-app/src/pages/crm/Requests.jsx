import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import { interactions } from '../../data/sampleData';

const columns = [
  { header: 'ID', accessor: 'id' },
  { header: 'Customer', accessor: 'partyName', render: (r) => <span style={{ fontWeight: 600 }}>{r.partyName}</span> },
  { header: 'Type', accessor: 'type', render: (r) => <span className={`badge ${r.type === 'Complaint' ? 'badge-red' : r.type === 'Grievance' ? 'badge-orange' : r.type === 'Query' ? 'badge-blue' : 'badge-gray'}`}>{r.type}</span> },
  { header: 'Channel', accessor: 'channel', render: (r) => <span className="badge badge-gray">{r.channel}</span> },
  { header: 'Subject', accessor: 'subject' },
  { header: 'Priority', accessor: 'priority', render: (r) => <span className={`badge ${r.priority === 'Critical' ? 'badge-red' : r.priority === 'High' ? 'badge-orange' : r.priority === 'Medium' ? 'badge-yellow' : 'badge-gray'}`}>{r.priority}</span> },
  { header: 'Assigned To', accessor: 'assignedTo' },
  { header: 'Status', accessor: 'status', render: (r) => <span className={`badge ${r.status === 'Resolved' ? 'badge-green' : r.status === 'Open' ? 'badge-blue' : r.status === 'Escalated' ? 'badge-red' : 'badge-yellow'}`}>{r.status}</span> },
  { header: 'Date', accessor: 'createdAt' },
];

export default function Requests() {
  return (
    <div>
      <PageHeader title="Customer Requests" subtitle="Service tickets, queries, and complaint management"
        breadcrumbs={[{ label: 'CRM', path: '/crm' }, { label: 'Requests' }]} />
      <DataTable columns={columns} data={interactions} />
    </div>
  );
}
