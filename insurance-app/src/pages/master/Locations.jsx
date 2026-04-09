import { useState, useEffect } from 'react';
import { MapPin, Loader2, Database } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import { useSchema } from '../../context/SchemaContext';
import { fetchMasterLocations } from '../../api';

const columns = [
  { header: 'Name', accessor: 'name', render: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> },
  { header: 'Type', accessor: 'type', render: (r) => <span className="badge badge-blue">{r.type}</span> },
  { header: 'City', accessor: 'city', render: (r) => r.city || <span style={{ color: '#94a3b8' }}>—</span> },
  { header: 'State', accessor: 'state', render: (r) => r.state || <span style={{ color: '#94a3b8' }}>—</span> },
  { header: 'Region', accessor: 'region', render: (r) => r.region || <span style={{ color: '#94a3b8' }}>—</span> },
  { header: 'Country', accessor: 'country' },
  { header: 'Pincode', accessor: 'pincode', render: (r) => r.pincode || <span style={{ color: '#94a3b8' }}>—</span> },
  { header: 'Risk Zone', accessor: 'riskZone', render: (r) => {
    const zone = r.riskZone || '—';
    const cls = zone.includes('Low') ? 'badge-green' : (zone.includes('Flood') || zone.includes('Cyclone') || zone.includes('High')) ? 'badge-red' : zone === '—' ? 'badge-gray' : 'badge-yellow';
    return <span className={`badge ${cls}`}>{zone}</span>;
  }},
];

export default function Locations() {
  const { currentOption, selectedSchema } = useSchema();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchMasterLocations()
      .then((data) => { setLocations(data); setError(null); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedSchema]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Loader2 size={32} className="spin" style={{ color: '#6366f1' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
        <p>Failed to load locations: {error}</p>
      </div>
    );
  }

  const regions = [...new Set(locations.map(l => l.region).filter(Boolean))];

  return (
    <div>
      <PageHeader
        title="Locations"
        subtitle="Manage office locations, risk locations, and hazard zone mappings"
        breadcrumbs={[{ label: 'Master Data', path: '/master' }, { label: 'Locations' }]}
      />

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#16a34a', fontWeight: 500, marginBottom: '1rem' }}>
        <Database size={13} />
        Live data — {currentOption?.schema || 'reporting'} schema — {locations.length} records
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {regions.slice(0, 10).map(region => (
          <div key={region} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.4rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={12} style={{ color: '#6366f1' }} />
            <span style={{ fontWeight: 600 }}>{region}</span>
            <span className="badge badge-blue">{locations.filter(l => l.region === region).length}</span>
          </div>
        ))}
      </div>

      <DataTable columns={columns} data={locations} />
    </div>
  );
}
