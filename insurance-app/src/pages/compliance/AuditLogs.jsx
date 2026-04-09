import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import { auditLogs } from '../../data/sampleData';

const columns = [
  { header: 'Timestamp', accessor: 'timestamp', render: (r) => <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{r.timestamp}</span> },
  { header: 'Action', accessor: 'action', render: (r) => <span style={{ fontWeight: 600 }}>{r.action}</span> },
  { header: 'Module', accessor: 'module', render: (r) => <span className="badge badge-blue">{r.module}</span> },
  { header: 'User', accessor: 'user', render: (r) => <span style={{ fontSize: '0.78rem' }}>{r.user}</span> },
  { header: 'Details', accessor: 'details' },
  { header: 'IP Address', accessor: 'ip', render: (r) => <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#94a3b8' }}>{r.ip}</span> },
];

export default function AuditLogs() {
  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="Immutable audit trail of all system actions for IRDAI compliance"
        breadcrumbs={[{ label: 'Compliance', path: '/compliance' }, { label: 'Audit Logs' }]} />
      <DataTable columns={columns} data={auditLogs} />
    </div>
  );
}
