import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import { auditLogs, auditLogsUS } from '../../data/sampleData';
import { useSchema } from '../../context/SchemaContext';
import { isReportingUSSchema } from './reportingUsSchema';

const columns = [
  { header: 'Timestamp', accessor: 'timestamp', render: (r) => <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{r.timestamp}</span> },
  { header: 'Action', accessor: 'action', render: (r) => <span style={{ fontWeight: 600 }}>{r.action}</span> },
  { header: 'Module', accessor: 'module', render: (r) => <span className="badge badge-blue">{r.module}</span> },
  { header: 'User', accessor: 'user', render: (r) => <span style={{ fontSize: '0.78rem' }}>{r.user}</span> },
  { header: 'Details', accessor: 'details' },
  { header: 'IP Address', accessor: 'ip', render: (r) => <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#94a3b8' }}>{r.ip}</span> },
];

export default function AuditLogs() {
  const { selectedSchema, currentOption } = useSchema();
  const reportingUS = isReportingUSSchema(selectedSchema, currentOption);
  const rows = reportingUS ? auditLogsUS : auditLogs;
  const subtitle = reportingUS
    ? 'Immutable audit trail of all system actions for NAIC, state DOI, and federal (e.g. FinCEN, IRS) compliance'
    : 'Immutable audit trail of all system actions for IRDAI compliance';
  return (
    <div>
      <PageHeader title="Audit Logs" subtitle={subtitle}
        breadcrumbs={[{ label: 'Compliance', path: '/compliance' }, { label: 'Audit Logs' }]} />
      <DataTable columns={columns} data={rows} />
    </div>
  );
}
