import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { ShieldCheck, Users, FileText, IndianRupee, DollarSign, UserCheck, Lock, Plus } from 'lucide-react';
import { useSchema } from '../../context/SchemaContext';
import { isReportingUSSchema } from './reportingUsSchema';

const reportsIN = [
  { id: 1, name: 'Quarterly Solvency Report', type: 'Solvency', frequency: 'Quarterly', lastSubmitted: '2024-09-30', nextDue: '2024-12-31', status: 'Submitted', regulator: 'IRDAI' },
  { id: 2, name: 'Claims TAT Compliance Report', type: 'Claims', frequency: 'Monthly', lastSubmitted: '2024-10-31', nextDue: '2024-11-30', status: 'Due Soon', regulator: 'IRDAI' },
  { id: 3, name: 'AML/KYC Compliance Summary', type: 'AML', frequency: 'Quarterly', lastSubmitted: '2024-09-30', nextDue: '2024-12-31', status: 'Submitted', regulator: 'IRDAI / FIU' },
  { id: 4, name: 'Grievance Redressal Report', type: 'CRM', frequency: 'Monthly', lastSubmitted: '2024-10-31', nextDue: '2024-11-30', status: 'Due Soon', regulator: 'IRDAI / IGMS' },
  { id: 5, name: 'Investment Portfolio Report', type: 'Finance', frequency: 'Quarterly', lastSubmitted: '2024-09-30', nextDue: '2024-12-31', status: 'Submitted', regulator: 'IRDAI' },
  { id: 6, name: 'Agent Licensing Compliance', type: 'Distribution', frequency: 'Annual', lastSubmitted: '2024-03-31', nextDue: '2025-03-31', status: 'On Track', regulator: 'IRDAI' },
  { id: 7, name: 'Cybersecurity Incident Report', type: 'IT', frequency: 'As Needed', lastSubmitted: 'N/A', nextDue: 'N/A', status: 'No Incidents', regulator: 'IRDAI / CERT-In' },
  { id: 8, name: 'Annual Financial Statements', type: 'Finance', frequency: 'Annual', lastSubmitted: '2024-03-31', nextDue: '2025-03-31', status: 'On Track', regulator: 'IRDAI' },
  { id: 9, name: 'FATCA/CRS Declaration Report', type: 'KYC', frequency: 'Annual', lastSubmitted: '2024-03-31', nextDue: '2025-03-31', status: 'On Track', regulator: 'IRDAI / CBDT' },
  { id: 10, name: 'Anti-Mis-selling Compliance', type: 'Distribution', frequency: 'Quarterly', lastSubmitted: '2024-09-30', nextDue: '2024-12-31', status: 'Submitted', regulator: 'IRDAI' },
  { id: 11, name: 'Free-look Cancellation Report', type: 'Policy', frequency: 'Monthly', lastSubmitted: '2024-10-31', nextDue: '2024-11-30', status: 'Due Soon', regulator: 'IRDAI' },
  { id: 12, name: 'BCP & DR Drill Report', type: 'IT', frequency: 'Annual', lastSubmitted: '2024-06-30', nextDue: '2025-06-30', status: 'On Track', regulator: 'IRDAI' },
];

const reportsUS = [
  { id: 1, name: 'Quarterly & Annual NAIC Statement Filing', type: 'Solvency', frequency: 'Quarterly', lastSubmitted: '2024-09-30', nextDue: '2024-12-31', status: 'Submitted', regulator: 'NAIC / State DOI' },
  { id: 2, name: 'Prompt-Pay & Claims Handling Attestation', type: 'Claims', frequency: 'Monthly', lastSubmitted: '2024-10-31', nextDue: '2024-11-30', status: 'Due Soon', regulator: 'State DOI' },
  { id: 3, name: 'AML/BSA & OFAC Sanctions Program Summary', type: 'AML', frequency: 'Quarterly', lastSubmitted: '2024-09-30', nextDue: '2024-12-31', status: 'Submitted', regulator: 'FinCEN / State DOI' },
  { id: 4, name: 'Consumer Complaint & Market Conduct Log', type: 'CRM', frequency: 'Monthly', lastSubmitted: '2024-10-31', nextDue: '2024-11-30', status: 'Due Soon', regulator: 'NAIC / State DOI' },
  { id: 5, name: 'Schedule BA / D Investment & Asset Filing', type: 'Finance', frequency: 'Quarterly', lastSubmitted: '2024-09-30', nextDue: '2024-12-31', status: 'Submitted', regulator: 'NAIC' },
  { id: 6, name: 'Producer Licensing & Appointment Roster', type: 'Distribution', frequency: 'Annual', lastSubmitted: '2024-03-31', nextDue: '2025-03-31', status: 'On Track', regulator: 'NIPR / State DOI' },
  { id: 7, name: 'Cybersecurity & Data Breach Notification', type: 'IT', frequency: 'As Needed', lastSubmitted: 'N/A', nextDue: 'N/A', status: 'No Incidents', regulator: 'State law / NAIC Model' },
  { id: 8, name: 'GAAP / Statutory Annual Report Package', type: 'Finance', frequency: 'Annual', lastSubmitted: '2024-03-31', nextDue: '2025-03-31', status: 'On Track', regulator: 'NAIC / SEC (if applicable)' },
  { id: 9, name: 'FATCA / Chapter 3 & 4 Withholding', type: 'KYC', frequency: 'Annual', lastSubmitted: '2024-03-31', nextDue: '2025-03-31', status: 'On Track', regulator: 'IRS' },
  { id: 10, name: 'Suitability & Best Interest Documentation', type: 'Distribution', frequency: 'Quarterly', lastSubmitted: '2024-09-30', nextDue: '2024-12-31', status: 'Submitted', regulator: 'NAIC Model / SEC Reg BI' },
  { id: 11, name: 'Free-Look / Right of Rescission Report', type: 'Policy', frequency: 'Monthly', lastSubmitted: '2024-10-31', nextDue: '2024-11-30', status: 'Due Soon', regulator: 'State DOI' },
  { id: 12, name: 'BCP & DR Exercise Evidence', type: 'IT', frequency: 'Annual', lastSubmitted: '2024-06-30', nextDue: '2025-06-30', status: 'On Track', regulator: 'NAIC / FFIEC guidance' },
];

const irdaiComplianceAreas = [
  {
    title: 'Customer & KYC',
    icon: Users,
    color: '#3b82f6',
    items: [
      'Mandatory KYC verification (PAN / Aadhaar / CKYC)',
      'AML/PEP screening under PMLA',
      'FATCA/CRS declaration capture & reporting',
    ],
  },
  {
    title: 'Policy Admin',
    icon: FileText,
    color: '#8b5cf6',
    items: [
      'Free-look period tracking (15/30-day)',
      'Guaranteed renewability for Health policies',
      'Endorsement audit trail with full traceability',
    ],
  },
  {
    title: 'Claims',
    icon: ShieldCheck,
    color: '#ef4444',
    items: [
      '30-day settlement TAT enforcement',
      'Interest auto-calculation on delayed settlements',
      'Mandatory repudiation reason codes & clause references',
    ],
  },
  {
    title: 'Finance & Solvency',
    icon: IndianRupee,
    color: '#22c55e',
    items: [
      'Quarterly solvency ratio monitoring (≥150%)',
      'Actuarial reserve certification tracking',
      'GST compliance on premiums & service charges',
    ],
  },
  {
    title: 'Distribution',
    icon: UserCheck,
    color: '#f59e0b',
    items: [
      'Agent license expiry tracking & renewal alerts',
      'Commission caps validation per IRDAI norms',
      'Anti-mis-selling declarations & needs analysis',
    ],
  },
  {
    title: 'Security & Audit',
    icon: Lock,
    color: '#ec4899',
    items: [
      'RBAC & MFA enforcement across all modules',
      'VAPT readiness tracking & vulnerability logs',
      'BCP & DR drill logs with compliance dates',
    ],
  },
];

const usComplianceAreas = [
  {
    title: 'Customer & KYC',
    icon: Users,
    color: '#3b82f6',
    items: [
      'Customer Identification Program (CIP) under USA PATRIOT Act',
      'AML/BSA monitoring, OFAC sanctions & SAR escalation paths',
      'FATCA / Chapter 4 and IRS withholding documentation',
    ],
  },
  {
    title: 'Policy Admin',
    icon: FileText,
    color: '#8b5cf6',
    items: [
      'State-specific free-look / right of rescission tracking',
      'ACA / HIPAA renewability & portability where applicable',
      'Endorsement audit trail with full traceability',
    ],
  },
  {
    title: 'Claims',
    icon: ShieldCheck,
    color: '#ef4444',
    items: [
      'State prompt-payment law tracking and breach alerts',
      'Statutory interest on late claim payments (where applicable)',
      'Adverse determination notices with citation to policy language',
    ],
  },
  {
    title: 'Finance & Solvency',
    icon: DollarSign,
    color: '#22c55e',
    items: [
      'NAIC RBC and liquidity ratio monitoring with thresholds',
      'Appointed actuary opinion & loss reserve certification',
      'Premium tax, surplus lines, and escheat reporting readiness',
    ],
  },
  {
    title: 'Distribution',
    icon: UserCheck,
    color: '#f59e0b',
    items: [
      'NIPR / state producer license & appointment tracking',
      'Compensation disclosure & suitability / best-interest controls',
      'Unfair trade practices & advertising file reviews',
    ],
  },
  {
    title: 'Security & Audit',
    icon: Lock,
    color: '#ec4899',
    items: [
      'RBAC & MFA enforcement across all modules',
      'SOC 2 / penetration test readiness & vulnerability management',
      'BCP & DR drill logs with exam-ready evidence',
    ],
  },
];

export default function RegulatoryReports() {
  const { selectedSchema, currentOption } = useSchema();
  const reportingUS = isReportingUSSchema(selectedSchema, currentOption);
  const [reports, setReports] = useState(reportingUS ? reportsUS : reportsIN);
  const [complianceAreas, setComplianceAreas] = useState(reportingUS ? usComplianceAreas : irdaiComplianceAreas);
  const [showAddCompliance, setShowAddCompliance] = useState(false);
  const [showAddCalendar, setShowAddCalendar] = useState(false);
  const [complianceForm, setComplianceForm] = useState({
    title: '',
    color: '#3b82f6',
    itemOne: '',
    itemTwo: '',
    itemThree: '',
  });
  const [calendarForm, setCalendarForm] = useState({
    name: '',
    type: 'Compliance',
    frequency: 'Monthly',
    lastSubmitted: '',
    nextDue: '',
    regulator: '',
    status: 'Due Soon',
  });
  const subtitle = reportingUS
    ? 'NAIC, state department of insurance, and federal (FinCEN, IRS) submission calendar and status tracker'
    : 'IRDAI compliance submissions calendar and status tracker';
  const moduleHeading = reportingUS
    ? 'US Regulatory Compliance — Built Into Every Module'
    : 'IRDAI Compliance — Built Into Every Module';

  useEffect(() => {
    setReports(reportingUS ? reportsUS : reportsIN);
    setComplianceAreas(reportingUS ? usComplianceAreas : irdaiComplianceAreas);
    setShowAddCompliance(false);
    setShowAddCalendar(false);
  }, [reportingUS]);

  const updateComplianceForm = (key, value) => {
    setComplianceForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateCalendarForm = (key, value) => {
    setCalendarForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddCompliance = (e) => {
    e.preventDefault();
    const items = [complianceForm.itemOne, complianceForm.itemTwo, complianceForm.itemThree]
      .map((item) => item.trim())
      .filter(Boolean);

    if (!complianceForm.title.trim() || items.length === 0) return;

    setComplianceAreas((prev) => ([
      ...prev,
      {
        title: complianceForm.title.trim(),
        icon: FileText,
        color: complianceForm.color,
        items,
      },
    ]));
    setComplianceForm({
      title: '',
      color: '#3b82f6',
      itemOne: '',
      itemTwo: '',
      itemThree: '',
    });
    setShowAddCompliance(false);
  };

  const handleAddCalendar = (e) => {
    e.preventDefault();
    if (!calendarForm.name.trim() || !calendarForm.regulator.trim() || !calendarForm.nextDue) return;

    setReports((prev) => ([
      ...prev,
      {
        id: prev.length ? Math.max(...prev.map((report) => report.id)) + 1 : 1,
        name: calendarForm.name.trim(),
        type: calendarForm.type.trim(),
        frequency: calendarForm.frequency,
        lastSubmitted: calendarForm.lastSubmitted || 'N/A',
        nextDue: calendarForm.nextDue,
        regulator: calendarForm.regulator.trim(),
        status: calendarForm.status,
      },
    ]));
    setCalendarForm({
      name: '',
      type: 'Compliance',
      frequency: 'Monthly',
      lastSubmitted: '',
      nextDue: '',
      regulator: '',
      status: 'Due Soon',
    });
    setShowAddCalendar(false);
  };

  return (
    <div>
      <PageHeader
        title="Regulatory Reports"
        subtitle={subtitle}
        breadcrumbs={[{ label: 'Compliance', path: '/compliance' }, { label: 'Reports' }]}
        actions={[
          <button key="add-compliance" className="btn btn-secondary" type="button" onClick={() => setShowAddCompliance(true)}>
            <Plus size={16} />
            Add Compliance
          </button>,
        ]}
      />

      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b' }}>{moduleHeading}</h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>All 13 regulatory areas pre-configured with controls, TAT trackers, audit trails & automated reporting.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {complianceAreas.map((area) => {
            const Icon = area.icon;
            return (
              <div key={area.title} className="card" style={{ borderTop: `3px solid ${area.color}` }}>
                <div className="card-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${area.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={16} color={area.color} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{area.title}</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', listStyle: 'none' }}>
                    {area.items.map((item, i) => (
                      <li key={i} style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.4rem', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                        <span style={{ color: '#22c55e', fontWeight: 700, flexShrink: 0 }}>✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Regulatory Submission Calendar</h3>
        <button className="btn btn-primary" type="button" onClick={() => setShowAddCalendar(true)}>
          <Plus size={16} />
          Add Regulatory Submission Calendar
        </button>
      </div>
      <div className="card">
        <table className="data-table">
          <thead><tr><th>Report Name</th><th>Type</th><th>Frequency</th><th>Last Submitted</th><th>Next Due</th><th>Regulator</th><th>Status</th></tr></thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id}>
                <td style={{ fontWeight: 600 }}>{r.name}</td>
                <td><span className="badge badge-blue">{r.type}</span></td>
                <td>{r.frequency}</td>
                <td>{r.lastSubmitted}</td>
                <td>{r.nextDue}</td>
                <td style={{ fontSize: '0.78rem' }}>{r.regulator}</td>
                <td><span className={`badge ${r.status === 'Submitted' ? 'badge-green' : r.status === 'Due Soon' ? 'badge-yellow' : r.status === 'On Track' ? 'badge-blue' : 'badge-gray'}`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddCompliance && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 620 }}>
            <div className="modal-header">
              <h2>Add Compliance</h2>
              <button className="btn btn-secondary" type="button" onClick={() => setShowAddCompliance(false)}>
                Close
              </button>
            </div>
            <form onSubmit={handleAddCompliance} className="modal-body" style={{ display: 'grid', gap: '1rem' }}>
              <label className="form-group" style={{ marginBottom: 0 }}>
                <span className="form-label">Compliance Title</span>
                <input
                  className="form-input"
                  value={complianceForm.title}
                  onChange={(e) => updateComplianceForm('title', e.target.value)}
                  placeholder="Enter compliance title"
                />
              </label>
              <label className="form-group" style={{ marginBottom: 0 }}>
                <span className="form-label">Accent Color</span>
                <input
                  className="form-input"
                  type="color"
                  value={complianceForm.color}
                  onChange={(e) => updateComplianceForm('color', e.target.value)}
                  style={{ height: '2.75rem', padding: '0.35rem' }}
                />
              </label>
              <label className="form-group" style={{ marginBottom: 0 }}>
                <span className="form-label">Checklist Item 1</span>
                <input
                  className="form-input"
                  value={complianceForm.itemOne}
                  onChange={(e) => updateComplianceForm('itemOne', e.target.value)}
                  placeholder="Enter the first checklist item"
                />
              </label>
              <label className="form-group" style={{ marginBottom: 0 }}>
                <span className="form-label">Checklist Item 2</span>
                <input
                  className="form-input"
                  value={complianceForm.itemTwo}
                  onChange={(e) => updateComplianceForm('itemTwo', e.target.value)}
                  placeholder="Optional"
                />
              </label>
              <label className="form-group" style={{ marginBottom: 0 }}>
                <span className="form-label">Checklist Item 3</span>
                <input
                  className="form-input"
                  value={complianceForm.itemThree}
                  onChange={(e) => updateComplianceForm('itemThree', e.target.value)}
                  placeholder="Optional"
                />
              </label>
              <div className="modal-footer" style={{ padding: 0, borderTop: 'none' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddCompliance(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Compliance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddCalendar && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 680 }}>
            <div className="modal-header">
              <h2>Add Regulatory Submission Calendar</h2>
              <button className="btn btn-secondary" type="button" onClick={() => setShowAddCalendar(false)}>
                Close
              </button>
            </div>
            <form onSubmit={handleAddCalendar} className="modal-body" style={{ display: 'grid', gap: '1rem' }}>
              <label className="form-group" style={{ marginBottom: 0 }}>
                <span className="form-label">Report Name</span>
                <input
                  className="form-input"
                  value={calendarForm.name}
                  onChange={(e) => updateCalendarForm('name', e.target.value)}
                  placeholder="Enter report name"
                />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
                <label className="form-group" style={{ marginBottom: 0 }}>
                  <span className="form-label">Type</span>
                  <input
                    className="form-input"
                    value={calendarForm.type}
                    onChange={(e) => updateCalendarForm('type', e.target.value)}
                    placeholder="Claims / AML / Finance"
                  />
                </label>
                <label className="form-group" style={{ marginBottom: 0 }}>
                  <span className="form-label">Frequency</span>
                  <select
                    className="form-input form-select"
                    value={calendarForm.frequency}
                    onChange={(e) => updateCalendarForm('frequency', e.target.value)}
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annual">Annual</option>
                    <option value="As Needed">As Needed</option>
                  </select>
                </label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
                <label className="form-group" style={{ marginBottom: 0 }}>
                  <span className="form-label">Last Submitted</span>
                  <input
                    className="form-input"
                    type="date"
                    value={calendarForm.lastSubmitted}
                    onChange={(e) => updateCalendarForm('lastSubmitted', e.target.value)}
                  />
                </label>
                <label className="form-group" style={{ marginBottom: 0 }}>
                  <span className="form-label">Next Due</span>
                  <input
                    className="form-input"
                    type="date"
                    value={calendarForm.nextDue}
                    onChange={(e) => updateCalendarForm('nextDue', e.target.value)}
                  />
                </label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
                <label className="form-group" style={{ marginBottom: 0 }}>
                  <span className="form-label">Regulator</span>
                  <input
                    className="form-input"
                    value={calendarForm.regulator}
                    onChange={(e) => updateCalendarForm('regulator', e.target.value)}
                    placeholder="Enter regulator"
                  />
                </label>
                <label className="form-group" style={{ marginBottom: 0 }}>
                  <span className="form-label">Status</span>
                  <select
                    className="form-input form-select"
                    value={calendarForm.status}
                    onChange={(e) => updateCalendarForm('status', e.target.value)}
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="Due Soon">Due Soon</option>
                    <option value="On Track">On Track</option>
                    <option value="No Incidents">No Incidents</option>
                  </select>
                </label>
              </div>
              <div className="modal-footer" style={{ padding: 0, borderTop: 'none' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddCalendar(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Calendar Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
