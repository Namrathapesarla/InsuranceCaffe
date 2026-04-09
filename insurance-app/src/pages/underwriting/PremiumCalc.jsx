import { useState } from 'react';
import { Calculator } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import useCurrency from '../../hooks/useCurrency';

export default function PremiumCalc() {
  const { symbol, locale } = useCurrency();
  const [form, setForm] = useState({ lob: 'Motor', sumInsured: 1000000, age: 30, zone: 'Low Risk', ncb: 20 });
  const [result, setResult] = useState(null);

  const calculate = () => {
    const base = form.sumInsured * 0.025;
    const ageLoad = form.age > 45 ? base * 0.15 : 0;
    const zoneLoad = form.zone.includes('Flood') ? base * 0.20 : form.zone.includes('Earthquake') ? base * 0.10 : 0;
    const ncbDiscount = base * (form.ncb / 100);
    const net = base + ageLoad + zoneLoad - ncbDiscount;
    const gst = net * 0.18;
    const stampDuty = 100;
    setResult({ base: Math.round(base), ageLoad: Math.round(ageLoad), zoneLoad: Math.round(zoneLoad), ncbDiscount: Math.round(ncbDiscount), net: Math.round(net), gst: Math.round(gst), stampDuty, total: Math.round(net + gst + stampDuty) });
  };

  const set = (k, v) => setForm({ ...form, [k]: v });

  return (
    <div>
      <PageHeader title="Premium Calculator" subtitle="Indicative premium computation with breakup"
        breadcrumbs={[{ label: 'Underwriting', path: '/underwriting' }, { label: 'Premium Calculator' }]} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <div className="card-header"><h3>Input Parameters</h3></div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Line of Business</label>
              <select className="form-input form-select" value={form.lob} onChange={(e) => set('lob', e.target.value)}>
                <option>Motor</option><option>Property</option><option>Marine</option><option>Liability</option><option>Engineering</option><option>Personal Accident</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Sum Insured ({symbol})</label>
              <input className="form-input" type="number" value={form.sumInsured} onChange={(e) => set('sumInsured', +e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Age of Insured</label>
              <input className="form-input" type="number" value={form.age} onChange={(e) => set('age', +e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Risk Zone</label>
              <select className="form-input form-select" value={form.zone} onChange={(e) => set('zone', e.target.value)}>
                <option>Low Risk</option><option>Flood Zone A</option><option>Flood Zone B</option><option>Earthquake Zone III</option><option>Earthquake Zone IV</option><option>Cyclone Zone</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">NCB Discount (%)</label>
              <input className="form-input" type="number" value={form.ncb} onChange={(e) => set('ncb', +e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={calculate} style={{ width: '100%', justifyContent: 'center' }}>
              <Calculator size={15} /> Calculate Premium
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Premium Breakup</h3></div>
          <div className="card-body">
            {result ? (
              <div style={{ fontSize: '0.85rem' }}>
                {[
                  { label: 'Base Premium', value: result.base },
                  { label: 'Age Loading', value: result.ageLoad },
                  { label: 'Zone Loading', value: result.zoneLoad },
                  { label: 'NCB Discount', value: -result.ncbDiscount },
                  { label: 'Net Premium', value: result.net, bold: true },
                  { label: 'GST (18%)', value: result.gst },
                  { label: 'Stamp Duty', value: result.stampDuty },
                  { label: 'Total Premium', value: result.total, bold: true, highlight: true },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0',
                    borderBottom: '1px solid #f1f5f9',
                    fontWeight: item.bold ? 700 : 400,
                    background: item.highlight ? '#eff6ff' : 'transparent',
                    padding: item.highlight ? '0.6rem 0.5rem' : '0.6rem 0',
                    borderRadius: item.highlight ? '0.375rem' : 0,
                    fontSize: item.highlight ? '1rem' : '0.85rem',
                    marginTop: item.highlight ? '0.5rem' : 0,
                  }}>
                    <span>{item.label}</span>
                    <span style={{ color: item.value < 0 ? '#22c55e' : '#0f172a' }}>
                      {item.value < 0 ? '-' : ''}{symbol}{Math.abs(item.value).toLocaleString(locale)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                <Calculator size={40} style={{ marginBottom: '0.5rem' }} />
                <p>Enter parameters and click Calculate</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
