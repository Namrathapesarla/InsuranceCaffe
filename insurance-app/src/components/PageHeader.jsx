import { Link } from 'react-router-dom';

export default function PageHeader({ title, subtitle, breadcrumbs = [], actions }) {
  return (
    <div className="page-header" style={{ padding: 0, marginBottom: '1.5rem' }}>
      {breadcrumbs.length > 0 && (
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          {breadcrumbs.map((b, i) => (
            <span key={i}> / {b.path ? <Link to={b.path}>{b.label}</Link> : b.label}</span>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{title}</h1>
          {subtitle && <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>{subtitle}</p>}
        </div>
        {actions && <div style={{ display: 'flex', gap: '0.5rem' }}>{actions}</div>}
      </div>
    </div>
  );
}
