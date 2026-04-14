import { useMemo } from 'react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import { documents } from '../../data/sampleData';
import { useSchema } from '../../context/SchemaContext';
import { isReportingUSSchema } from '../compliance/reportingUsSchema';

function documentsRowsForSchema(selectedSchema, currentOption) {
  if (!isReportingUSSchema(selectedSchema, currentOption)) return documents;
  return documents.map((d) => {
    if (d.id === 2) {
      return { ...d, name: 'KYC - Priya Nair - Government-issued photo ID (driver license)' };
    }
    if (d.id === 8) {
      return { ...d, name: 'IRS Form W-9 (TIN certification) - Amit Patel' };
    }
    return d;
  });
}

const columns = [
  { header: 'Document Name', accessor: 'name', render: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> },
  { header: 'Type', accessor: 'type', render: (r) => <span className={`badge ${r.type.includes('Policy') ? 'badge-blue' : r.type.includes('Claim') ? 'badge-yellow' : 'badge-green'}`}>{r.type}</span> },
  { header: 'Module', accessor: 'module' },
  { header: 'Related ID', accessor: 'relatedId', render: (r) => <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{r.relatedId}</span> },
  { header: 'Uploaded By', accessor: 'uploadedBy' },
  { header: 'Upload Date', accessor: 'uploadedAt' },
  { header: 'Size', accessor: 'size' },
];

export default function DocumentList() {
  const { selectedSchema, currentOption } = useSchema();
  const rows = useMemo(
    () => documentsRowsForSchema(selectedSchema, currentOption),
    [selectedSchema, currentOption],
  );
  return (
    <div>
      <PageHeader title="All Documents" subtitle="Centralized document repository — policies, claims, KYC"
        breadcrumbs={[{ label: 'Documents', path: '/documents' }, { label: 'All Documents' }]} />
      <DataTable columns={columns} data={rows} />
    </div>
  );
}
