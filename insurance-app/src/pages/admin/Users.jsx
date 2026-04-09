import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import { users } from '../../data/sampleData';

const columns = [
  { header: 'Username', accessor: 'username', render: (r) => <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{r.username}</span> },
  { header: 'Display Name', accessor: 'displayName' },
  { header: 'Email', accessor: 'email' },
  { header: 'Role', accessor: 'role', render: (r) => <span className="badge badge-purple">{r.role}</span> },
  { header: 'Department', accessor: 'department', render: (r) => <span className="badge badge-blue">{r.department}</span> },
  { header: 'Status', accessor: 'status', render: (r) => <span className={`badge ${r.status === 'Active' ? 'badge-green' : 'badge-red'}`}>{r.status}</span> },
  { header: 'Last Login', accessor: 'lastLogin', render: (r) => <span style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>{r.lastLogin}</span> },
];

export default function Users() {
  return (
    <div>
      <PageHeader title="Users" subtitle="System users with role assignments and access control"
        breadcrumbs={[{ label: 'Administration', path: '/admin' }, { label: 'Users' }]} />
      <DataTable columns={columns} data={users} />
    </div>
  );
}
