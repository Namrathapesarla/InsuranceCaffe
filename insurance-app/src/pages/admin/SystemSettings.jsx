import PageHeader from '../../components/PageHeader';
import { useState } from 'react';

export default function SystemSettings() {
  const [settings, setSettings] = useState({
    companyName: 'InsuranceCaffe Pvt Ltd',
    irdaiLicense: 'IRDAI/R3/001/2024',
    currency: 'INR',
    gstRate: '18',
    freeLookDays: '15',
    claimTATDays: '30',
    passwordPolicy: '90',
    mfaEnabled: true,
    auditRetention: '7',
    emailNotifications: true,
    smsNotifications: true,
  });

  const set = (k, v) => setSettings({ ...settings, [k]: v });

  return (
    <div>
      <PageHeader title="System Settings" subtitle="Global configuration for the InsuranceCaffe platform"
        breadcrumbs={[{ label: 'Administration', path: '/admin' }, { label: 'Settings' }]} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <div className="card-header"><h3>Company Details</h3></div>
          <div className="card-body">
            <div className="form-group"><label className="form-label">Company Name</label><input className="form-input" value={settings.companyName} onChange={(e) => set('companyName', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">IRDAI License Number</label><input className="form-input" value={settings.irdaiLicense} onChange={(e) => set('irdaiLicense', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Base Currency</label><input className="form-input" value={settings.currency} disabled /></div>
            <div className="form-group"><label className="form-label">Default GST Rate (%)</label><input className="form-input" type="number" value={settings.gstRate} onChange={(e) => set('gstRate', e.target.value)} /></div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3>Regulatory Compliance</h3></div>
          <div className="card-body">
            <div className="form-group"><label className="form-label">Free-Look Period (days)</label><input className="form-input" type="number" value={settings.freeLookDays} onChange={(e) => set('freeLookDays', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Claim Settlement TAT (days)</label><input className="form-input" type="number" value={settings.claimTATDays} onChange={(e) => set('claimTATDays', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Audit Log Retention (years)</label><input className="form-input" type="number" value={settings.auditRetention} onChange={(e) => set('auditRetention', e.target.value)} /></div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3>Security</h3></div>
          <div className="card-body">
            <div className="form-group"><label className="form-label">Password Rotation (days)</label><input className="form-input" type="number" value={settings.passwordPolicy} onChange={(e) => set('passwordPolicy', e.target.value)} /></div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={settings.mfaEnabled} onChange={(e) => set('mfaEnabled', e.target.checked)} />
              <label className="form-label" style={{ margin: 0 }}>Enforce Multi-Factor Authentication</label>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3>Notifications</h3></div>
          <div className="card-body">
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={settings.emailNotifications} onChange={(e) => set('emailNotifications', e.target.checked)} />
              <label className="form-label" style={{ margin: 0 }}>Email Notifications</label>
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={settings.smsNotifications} onChange={(e) => set('smsNotifications', e.target.checked)} />
              <label className="form-label" style={{ margin: 0 }}>SMS Notifications</label>
            </div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
        <button className="btn btn-secondary">Reset</button>
        <button className="btn btn-primary">Save Settings</button>
      </div>
    </div>
  );
}
