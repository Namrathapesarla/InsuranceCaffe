import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import useCurrency from '../../hooks/useCurrency';

export default function UWRules() {
  const { symbol } = useCurrency();
  const [rules, setRules] = useState([
    { id: 1, name: 'Auto-Approval — Low Risk Motor', condition: `Risk Score ≤ 25 AND LOB = Motor AND Sum Insured ≤ ${symbol}15L`, action: 'Auto-approve, no manual review', status: 'Active' },
    { id: 2, name: 'Auto-Approval — Standard Health', condition: 'Risk Score ≤ 30 AND Age ≤ 45 AND No pre-existing conditions', action: 'Auto-approve with standard rates', status: 'Active' },
    { id: 3, name: 'Manual Referral — High Sum Insured', condition: `Sum Insured > ${symbol}1Cr (any LOB)`, action: 'Refer to Senior Underwriter', status: 'Active' },
    { id: 4, name: 'Medical UW Required — Life', condition: `LOB = Life AND (Age > 45 OR Sum Insured > ${symbol}50L)`, action: 'Require medical examination', status: 'Active' },
    { id: 5, name: 'AML Block — High Risk Party', condition: 'AML Screening = Positive OR Party Risk = High', action: 'Block quote, escalate to Compliance', status: 'Active' },
    { id: 6, name: 'Loading — Flood Zone', condition: 'Risk Location in Flood Zone A/B', action: 'Apply 15-25% loading on base premium', status: 'Active' },
    { id: 7, name: 'Decline — Sanctioned Entity', condition: 'Party on OFAC/UN sanctions list', action: 'Auto-decline, log to AML', status: 'Active' },
    { id: 8, name: 'Referral — Multiple Claims', condition: 'Party has ≥ 3 claims in last 12 months', action: 'Refer to manual review with claims history', status: 'Active' },
  ]);
  const [showAddRule, setShowAddRule] = useState(false);
  const [form, setForm] = useState({
    name: '',
    condition: '',
    action: '',
    status: 'Active',
  });

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddRule = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.condition.trim() || !form.action.trim()) return;

    setRules((prev) => ([
      ...prev,
      {
        id: prev.length ? Math.max(...prev.map((r) => r.id)) + 1 : 1,
        name: form.name.trim(),
        condition: form.condition.trim(),
        action: form.action.trim(),
        status: form.status,
      },
    ]));
    setForm({ name: '', condition: '', action: '', status: 'Active' });
    setShowAddRule(false);
  };

  return (
    <div>
      <PageHeader title="Underwriting Rules" subtitle="Rule-based decisioning engine for automated and manual underwriting"
        breadcrumbs={[{ label: 'Underwriting', path: '/underwriting' }, { label: 'Rules' }]}
        actions={(
          <button className="btn btn-primary" onClick={() => setShowAddRule(true)}>
            Add Rule
          </button>
        )} />
      <div className="card">
        <table className="data-table">
          <thead><tr><th>#</th><th>Rule Name</th><th>Condition</th><th>Action</th><th>Status</th></tr></thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td style={{ fontWeight: 600 }}>{r.name}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{r.condition}</td>
                <td>{r.action}</td>
                <td><span className="badge badge-green">{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddRule && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '1rem',
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 620 }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Add Underwriting Rule</h3>
              <button
                className="btn btn-secondary"
                onClick={() => setShowAddRule(false)}
                style={{ padding: '0.35rem 0.75rem' }}
              >
                Close
              </button>
            </div>
            <form onSubmit={handleAddRule} className="card-body" style={{ display: 'grid', gap: '1rem' }}>
              <label style={{ display: 'grid', gap: '0.4rem', fontSize: '0.85rem', color: '#334155' }}>
                Rule Name
                <input
                  value={form.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                  placeholder="Enter rule name"
                  style={{ padding: '0.7rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', outline: 'none' }}
                />
              </label>
              <label style={{ display: 'grid', gap: '0.4rem', fontSize: '0.85rem', color: '#334155' }}>
                Condition
                <textarea
                  value={form.condition}
                  onChange={(e) => updateForm('condition', e.target.value)}
                  placeholder="Enter rule condition"
                  rows={3}
                  style={{ padding: '0.7rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', outline: 'none', resize: 'vertical' }}
                />
              </label>
              <label style={{ display: 'grid', gap: '0.4rem', fontSize: '0.85rem', color: '#334155' }}>
                Action
                <textarea
                  value={form.action}
                  onChange={(e) => updateForm('action', e.target.value)}
                  placeholder="Enter rule action"
                  rows={3}
                  style={{ padding: '0.7rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', outline: 'none', resize: 'vertical' }}
                />
              </label>
              <label style={{ display: 'grid', gap: '0.4rem', fontSize: '0.85rem', color: '#334155' }}>
                Status
                <select
                  value={form.status}
                  onChange={(e) => updateForm('status', e.target.value)}
                  style={{ padding: '0.7rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', outline: 'none', background: '#fff' }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddRule(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
