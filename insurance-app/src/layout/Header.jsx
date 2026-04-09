import { useState, useRef, useEffect } from 'react';
import { Bell, Search, Menu, User, LogOut, Calendar, ChevronDown, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDateFilter } from '../context/DateFilterContext';
import { useSchema } from '../context/SchemaContext';
import { useNavigate } from 'react-router-dom';

const SEARCH_ROUTES = [
  { keywords: ['policy', 'policies', 'all policies'], path: '/policy/list', label: 'All Policies' },
  { keywords: ['endorsement'], path: '/policy/endorsements', label: 'Endorsements' },
  { keywords: ['renewal'], path: '/policy/renewals', label: 'Renewals' },
  { keywords: ['claim', 'claims'], path: '/claims/list', label: 'All Claims' },
  { keywords: ['investigation'], path: '/claims/investigation', label: 'Investigation' },
  { keywords: ['settlement'], path: '/claims/settlement', label: 'Settlement' },
  { keywords: ['quote', 'quotes', 'underwriting'], path: '/underwriting/quotes', label: 'Quotes' },
  { keywords: ['risk scoring', 'risk'], path: '/underwriting/risk-scoring', label: 'Risk Scoring' },
  { keywords: ['production report', 'production'], path: '/underwriting/production-report', label: 'Production Report' },
  { keywords: ['premium leakage', 'leakage'], path: '/underwriting/premium-leakage', label: 'Premium Leakage' },
  { keywords: ['lob profitability', 'profitability'], path: '/underwriting/lob-profitability', label: 'LOB Profitability' },
  { keywords: ['cancellation'], path: '/underwriting/cancellation-patterns', label: 'Cancellation Patterns' },
  { keywords: ['renewal prioritization'], path: '/underwriting/renewal-prioritization', label: 'Renewal Prioritization' },
  { keywords: ['party', 'parties', 'customer', 'organization'], path: '/master/parties', label: 'Parties' },
  { keywords: ['product', 'products'], path: '/master/products', label: 'Products' },
  { keywords: ['agent', 'broker'], path: '/agent/list', label: 'Agents' },
  { keywords: ['commission'], path: '/agent/commissions', label: 'Commissions' },
  { keywords: ['vendor', 'garage'], path: '/vendor/list', label: 'Vendors' },
  { keywords: ['invoice', 'billing'], path: '/billing/invoices', label: 'Invoices' },
  { keywords: ['payment'], path: '/billing/payments', label: 'Payments' },
  { keywords: ['complaint', 'grievance'], path: '/crm/complaints', label: 'Complaints' },
  { keywords: ['document'], path: '/documents/list', label: 'Documents' },
  { keywords: ['audit', 'compliance'], path: '/compliance/audit', label: 'Audit Logs' },
  { keywords: ['user', 'admin'], path: '/admin/users', label: 'Users' },
  { keywords: ['dashboard'], path: '/', label: 'Dashboard' },
];

export default function Header({ onMenuToggle }) {
  const { currentUser, logout } = useAuth();
  const { preset, from, to, isActive, applyPreset, setFrom, setTo, clearFilter, PRESETS } = useDateFilter();
  const { clearSchema } = useSchema();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropRef = useRef(null);
  const searchRef = useRef(null);

  const handleSearch = (val) => {
    setSearchTerm(val);
    if (!val.trim()) { setSuggestions([]); setShowSuggestions(false); return; }
    const q = val.toLowerCase();
    const matches = SEARCH_ROUTES.filter(r => r.keywords.some(k => k.includes(q)) || r.label.toLowerCase().includes(q));
    setSuggestions(matches.slice(0, 6));
    setShowSuggestions(matches.length > 0);
  };

  const goTo = (path) => {
    navigate(path);
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    clearSchema();
    navigate('/login', { replace: true });
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const activeLabel = PRESETS.find((p) => p.key === preset)?.label || 'All Time';

  return (
    <header style={{
      background: 'white', borderBottom: '1px solid #e2e8f0', padding: '0 1.5rem',
      height: '3.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 30
    }}>
      {/* Left side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={onMenuToggle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}>
          <Menu size={20} />
        </button>
        <div ref={searchRef} style={{ position: 'relative' }}>
          <div className="search-box" style={{ width: '280px' }}>
            <Search size={15} color="#94a3b8" />
            <input
              placeholder="Search policies, claims, parties..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => { if (suggestions.length) setShowSuggestions(true); }}
              onKeyDown={(e) => { if (e.key === 'Enter' && suggestions.length) { goTo(suggestions[0].path); } }}
            />
          </div>
          {showSuggestions && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, marginTop: '0.3rem', width: '320px',
              background: 'white', borderRadius: '0.5rem', border: '1px solid #e2e8f0',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 50, overflow: 'hidden',
            }}>
              {suggestions.map((s) => (
                <div
                  key={s.path}
                  onClick={() => goTo(s.path)}
                  style={{
                    padding: '0.6rem 0.85rem', cursor: 'pointer', fontSize: '0.82rem',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    borderBottom: '1px solid #f8fafc',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}
                >
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{s.label}</span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{s.path}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

        {/* Date Filter */}
        <div ref={dropRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setOpen(!open)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.35rem 0.7rem', borderRadius: '0.5rem', fontSize: '0.78rem', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s',
              background: isActive ? '#eff6ff' : '#f8fafc',
              border: `1px solid ${isActive ? '#3b82f6' : '#e2e8f0'}`,
              color: isActive ? '#2563eb' : '#475569',
            }}
          >
            <Calendar size={14} />
            <span>{activeLabel}</span>
            {isActive && from && (
              <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 400 }}>
                {from}{to ? ` — ${to}` : ''}
              </span>
            )}
            <ChevronDown size={13} />
          </button>

          {open && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: '0.4rem',
              background: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0',
              boxShadow: '0 12px 40px rgba(0,0,0,0.12)', width: '320px', zIndex: 50,
              overflow: 'hidden',
            }}>
              {/* Preset buttons */}
              <div style={{ padding: '0.75rem' }}>
                <p style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Quick Select
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {PRESETS.filter(p => p.key !== 'custom').map((p) => (
                    <button
                      key={p.key}
                      onClick={() => { applyPreset(p.key); if (p.key !== 'custom') setOpen(false); }}
                      style={{
                        padding: '0.3rem 0.6rem', borderRadius: '0.375rem', fontSize: '0.73rem', fontWeight: 500,
                        border: 'none', cursor: 'pointer', transition: 'all 0.12s',
                        background: preset === p.key ? '#3b82f6' : '#f1f5f9',
                        color: preset === p.key ? 'white' : '#475569',
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: '#e2e8f0' }} />

              {/* Custom range */}
              <div style={{ padding: '0.75rem' }}>
                <p style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Custom Range
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>From</label>
                    <input
                      type="date"
                      value={from}
                      onChange={(e) => { setFrom(e.target.value); }}
                      style={{
                        width: '100%', padding: '0.35rem 0.5rem', borderRadius: '0.375rem',
                        border: '1px solid #e2e8f0', fontSize: '0.76rem', color: '#334155', outline: 'none',
                      }}
                    />
                  </div>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '1rem' }}>to</span>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>To</label>
                    <input
                      type="date"
                      value={to}
                      onChange={(e) => { setTo(e.target.value); }}
                      style={{
                        width: '100%', padding: '0.35rem 0.5rem', borderRadius: '0.375rem',
                        border: '1px solid #e2e8f0', fontSize: '0.76rem', color: '#334155', outline: 'none',
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem', marginTop: '0.6rem' }}>
                  {isActive && (
                    <button
                      onClick={() => { clearFilter(); setOpen(false); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.25rem',
                        padding: '0.3rem 0.6rem', borderRadius: '0.375rem', fontSize: '0.73rem',
                        border: '1px solid #e2e8f0', background: 'white', color: '#64748b',
                        cursor: 'pointer', fontWeight: 500,
                      }}
                    >
                      <X size={12} /> Clear
                    </button>
                  )}
                  <button
                    onClick={() => setOpen(false)}
                    style={{
                      padding: '0.3rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.73rem',
                      border: 'none', background: '#3b82f6', color: 'white',
                      cursor: 'pointer', fontWeight: 600,
                    }}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <Bell size={18} color="#64748b" />
          <span style={{
            position: 'absolute', top: -4, right: -4, background: '#ef4444', color: 'white',
            fontSize: '0.6rem', width: '14px', height: '14px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
          }}>3</span>
        </div>

        <div style={{ width: '1px', height: '1.5rem', background: '#e2e8f0' }} />

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <div className="avatar" style={{ background: currentUser?.role === 'Admin' ? '#8b5cf6' : '#3b82f6' }}>
            <User size={14} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a' }}>{currentUser?.displayName || 'User'}</div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{currentUser?.role || ''}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Sign out"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', padding: '0.25rem' }}
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
