import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import { coverageTypes } from '../../data/sampleData';

const columns = [
  { header: 'Code', accessor: 'code', render: (r) => <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{r.code}</span> },
  { header: 'Coverage Name', accessor: 'name', render: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> },
  { header: 'LOB', accessor: 'lob', render: (r) => <span className="badge badge-blue">{r.lob}</span> },
  { header: 'Description', accessor: 'description' },
];

export default function CoverageTypes() {
  return (
    <div>
      <PageHeader title="Coverage Types" subtitle="Standard coverage definitions mapped to products and LOBs"
        breadcrumbs={[{ label: 'Master Data', path: '/master' }, { label: 'Coverage Types' }]} />
      <DataTable columns={columns} data={coverageTypes} />
    </div>
  );
}
