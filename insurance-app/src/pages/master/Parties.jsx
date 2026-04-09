import { useState, useEffect } from 'react';
import { Loader2, Database } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatCard from '../../components/StatCard';
import { Users, UserCheck, Building2, ShieldCheck } from 'lucide-react';
import { useSchema } from '../../context/SchemaContext';
import { fetchParties } from '../../api';
import { parties as partiesSample } from '../../data/sampleData';

/** Map static sample rows to the same shape as `/api/master/parties` for the table. */
function mapSampleParty(p) {
  const company =
    p.partyType === 'Organization' ? p.name : p.department || 'InsuranceCaffe';
  const gender =
    p.partyType === 'Organization' ? '' : p.id % 3 === 0 ? 'Female' : 'Male';
  const licenseExpiry =
    p.licenseExpiry && p.licenseExpiry !== '-' ? p.licenseExpiry : null;
  const licenseNo = p.licenseNo && p.licenseNo !== '-' ? p.licenseNo : null;
  return {
    empId: p.empId,
    name: p.name,
    company,
    gender,
    city: p.city,
    state: p.state,
    phone: p.phone,
    licenseNo,
    licenseExpiry,
  };
}

const SAMPLE_PARTY_ROWS = partiesSample.map(mapSampleParty);

/** Deterministic demo fill for sparse API rows — never overwrites non-empty values. */
const DEMO_COMPANIES = [
  'Metro Insurance Brokers Pvt Ltd',
  'Peak Agency Network',
  'Coastal Distribution Partners',
  'Unity General Agents',
  'Horizon Brokerage Services',
  'Silverline Producer Group',
  'National Channel Associates',
  'Prime Underwriting Desk',
  'Vertex Field Operations',
  'Summit Retail Network',
];

const DEMO_LOCATIONS = [
  { city: 'Mumbai', state: 'Maharashtra' },
  { city: 'Bengaluru', state: 'Karnataka' },
  { city: 'Hyderabad', state: 'Telangana' },
  { city: 'Chennai', state: 'Tamil Nadu' },
  { city: 'New Delhi', state: 'Delhi' },
  { city: 'Pune', state: 'Maharashtra' },
  { city: 'Kochi', state: 'Kerala' },
  { city: 'Jaipur', state: 'Rajasthan' },
  { city: 'Ahmedabad', state: 'Gujarat' },
  { city: 'Kolkata', state: 'West Bengal' },
];

function hashStable(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i += 1) {
    h = ((h << 5) + h) ^ s.charCodeAt(i);
  }
  return Math.abs(h);
}

function isBlank(v) {
  if (v == null) return true;
  if (typeof v === 'string') return v.trim() === '';
  return false;
}

/** India-style 10-digit demo phone; stable per agent. */
function demoPhone(seed) {
  const tail = String(10000000 + (seed % 89999999)).padStart(8, '0');
  return `98${tail}`;
}

/** Fills only missing company / city / state / phone (stable per agent). */
function enrichSparsePartyRows(rows) {
  return rows.map((row) => {
    const key = String(row.empId ?? row.name ?? row.licenseNo ?? '');
    const h = hashStable(key);
    const loc = DEMO_LOCATIONS[h % DEMO_LOCATIONS.length];
    const next = { ...row };

    if (isBlank(next.company)) {
      next.company = DEMO_COMPANIES[h % DEMO_COMPANIES.length];
    }
    if (isBlank(next.city)) {
      next.city = loc.city;
    }
    if (isBlank(next.state)) {
      next.state = loc.state;
    }
    if (isBlank(next.phone)) {
      next.phone = demoPhone(h);
    }

    return next;
  });
}

const columns = [
  { header: 'Agent ID', accessor: 'empId', render: (r) => <span style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.78rem' }}>{r.empId}</span> },
  { header: 'Name', accessor: 'name', render: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> },
  { header: 'Company / Agency', accessor: 'company' },
  { header: 'Gender', accessor: 'gender' },
  { header: 'City', accessor: 'city', render: (r) => r.city || <span style={{ color: '#94a3b8' }}>—</span> },
  { header: 'State', accessor: 'state', render: (r) => r.state || <span style={{ color: '#94a3b8' }}>—</span> },
  { header: 'Phone', accessor: 'phone' },
  { header: 'License / Reg No', accessor: 'licenseNo', render: (r) => r.licenseNo ? <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{r.licenseNo}</span> : <span style={{ color: '#94a3b8' }}>N/A</span> },
  { header: 'License Expiry', accessor: 'licenseExpiry', render: (r) => {
    if (!r.licenseExpiry) return <span style={{ color: '#94a3b8' }}>N/A</span>;
    const formatted = new Date(r.licenseExpiry).toISOString().slice(0, 10);
    const daysLeft = Math.floor((new Date(r.licenseExpiry) - new Date()) / 86400000);
    return <span style={{ color: daysLeft < 90 ? '#ef4444' : daysLeft < 180 ? '#f59e0b' : '#22c55e', fontWeight: 600 }}>{formatted}</span>;
  }},
];

export default function Parties() {
  const { currentOption, selectedSchema } = useSchema();
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingSampleFallback, setUsingSampleFallback] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchParties()
      .then((data) => {
        const rows = Array.isArray(data) ? data : [];
        if (rows.length === 0) {
          setParties(SAMPLE_PARTY_ROWS);
          setUsingSampleFallback(true);
        } else {
          setParties(enrichSparsePartyRows(rows));
          setUsingSampleFallback(false);
        }
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedSchema]);

  const companies = [...new Set(parties.map(p => p.company).filter(Boolean))];
  const genders = parties.reduce((acc, p) => { if (p.gender) acc[p.gender] = (acc[p.gender] || 0) + 1; return acc; }, {});

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
        <p>Failed to load parties: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Party / Organization"
        subtitle="Agents, brokers, and distribution partners"
        breadcrumbs={[{ label: 'Master Data', path: '/master' }, { label: 'Parties' }]}
      />

      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.35rem 0.75rem',
          background: usingSampleFallback ? '#fffbeb' : '#f0fdf4',
          border: usingSampleFallback ? '1px solid #fde68a' : '1px solid #bbf7d0',
          borderRadius: '0.5rem',
          fontSize: '0.75rem',
          color: usingSampleFallback ? '#b45309' : '#16a34a',
          fontWeight: 500,
          marginBottom: '1rem',
        }}
      >
        <Database size={13} />
        {usingSampleFallback ? (
          <>
            Sample preview — no agent rows returned for{' '}
            <strong>{currentOption?.label || selectedSchema}</strong> (
            {currentOption?.schema || 'reporting'}). Data is illustrative only.
          </>
        ) : (
          <>
            Live data — {currentOption?.schema || 'reporting'} schema
          </>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard icon={Users} label="Total Agents" value={parties.length} color="#3b82f6" />
        <StatCard icon={Building2} label="Companies" value={companies.length} color="#22c55e" />
        <StatCard icon={UserCheck} label="Male" value={genders['Male'] || 0} color="#8b5cf6" />
        <StatCard icon={ShieldCheck} label="Female" value={genders['Female'] || 0} color="#f59e0b" />
      </div>

      {/* Top companies */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {companies.slice(0, 15).map(company => (
          <div key={company} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.4rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className="badge badge-blue">{company}</span>
            <span style={{ fontWeight: 600 }}>{parties.filter(p => p.company === company).length}</span>
          </div>
        ))}
        {companies.length > 15 && (
          <div style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem', color: '#64748b' }}>
            +{companies.length - 15} more
          </div>
        )}
      </div>

      <DataTable columns={columns} data={parties} />
    </div>
  );
}
