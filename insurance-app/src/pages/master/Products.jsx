import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import { products } from '../../data/sampleData';

const columns = [
  { header: 'Code', accessor: 'code', render: (r) => <span style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.78rem' }}>{r.code}</span> },
  { header: 'Product Name', accessor: 'name', render: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> },
  { header: 'LOB', accessor: 'lob', render: (r) => <span className="badge badge-blue">{r.lob}</span> },
  { header: 'Version', accessor: 'version' },
  { header: 'Effective From', accessor: 'effectiveFrom' },
  { header: 'GST %', accessor: 'gst' },
  { header: 'Status', accessor: 'status', render: (r) => <span className={`badge ${r.status === 'Active' ? 'badge-green' : 'badge-red'}`}>{r.status}</span> },
];

export default function Products() {
  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Insurance products with versioning, LOB mapping, and approval status"
        breadcrumbs={[{ label: 'Master Data', path: '/master' }, { label: 'Products' }]}
      />
      <DataTable columns={columns} data={products} />
    </div>
  );
}
