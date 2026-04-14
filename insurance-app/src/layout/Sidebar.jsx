import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Database, FileCheck, Shield, CreditCard,
  AlertTriangle, Truck, Users, Headphones, FileText, Scale,
  Settings, ChevronDown, ChevronRight
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSchema } from '../context/SchemaContext';

const navSections = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    ],
  },
  {
    title: 'Core Operations',
    items: [
      {
        label: 'Master Data', icon: Database, path: '/master',
        children: [
          { label: 'Party / Organization (B2B)', path: '/master/parties' },
          { label: 'Products', path: '/master/products' },
          { label: 'Locations', path: '/master/locations' },
          { label: 'Risk Categories', path: '/master/risk-categories' },
          { label: 'Coverage Types', path: '/master/coverage-types' },
        ],
      },
      {
        label: 'Underwriting & Quotes', icon: FileCheck, path: '/underwriting',
        children: [
          { label: 'Quotes', path: '/underwriting/quotes' },
          { label: 'Risk Assessment', path: '/underwriting/risk' },
          { label: 'Underwriting Rules', path: '/underwriting/rules' },
          { label: 'Premium Calculator', path: '/underwriting/premium' },
        ],
      },
      {
        label: 'Policy Admin', icon: Shield, path: '/policy',
        children: [
          { label: 'All Policies', path: '/policy/list' },
          { label: 'Endorsements', path: '/policy/endorsements' },
          { label: 'Renewals', path: '/policy/renewals' },
          { label: 'Policy History', path: '/policy/history' },
        ],
      },
    ],
  },
  {
    title: 'Finance',
    items: [
      {
        label: 'Billing & Payments', icon: CreditCard, path: '/billing',
        children: [
          { label: 'Invoices', path: '/billing/invoices' },
          { label: 'Payment Collection', path: '/billing/payments' },
          { label: 'Installments', path: '/billing/installments' },
          { label: 'Outstanding', path: '/billing/outstanding' },
        ],
      },
    ],
  },
  {
    title: 'Claims',
    items: [
      {
        label: 'Claims Management', icon: AlertTriangle, path: '/claims',
        children: [
          { label: 'All Claims', path: '/claims/list' },
          { label: 'Investigation', path: '/claims/investigation' },
          { label: 'Assessment', path: '/claims/assessment' },
          { label: 'Settlement', path: '/claims/settlement' },
        ],
      },
    ],
  },
  {
    title: 'Network',
    items: [
      {
        label: 'Vendor / Garage', icon: Truck, path: '/vendor',
        children: [
          { label: 'All Vendors', path: '/vendor/list' },
          { label: 'Garage Network', path: '/vendor/garages' },
          { label: 'Surveyors', path: '/vendor/surveyors' },
          { label: 'Repair Estimates', path: '/vendor/estimates' },
        ],
      },
      {
        label: 'Agent / Broker', icon: Users, path: '/agent',
        children: [
          { label: 'All Agents', path: '/agent/list' },
          { label: 'Commissions', path: '/agent/commissions' },
          { label: 'Performance', path: '/agent/performance' },
        ],
      },
    ],
  },
  {
    title: 'Service',
    items: [
      {
        label: 'CRM & Support', icon: Headphones, path: '/crm',
        children: [
          { label: 'Customer Requests', path: '/crm/requests' },
          { label: 'Complaints', path: '/crm/complaints' },
          { label: 'Communication Logs', path: '/crm/logs' },
        ],
      },
      {
        label: 'Documents', icon: FileText, path: '/documents',
        children: [
          { label: 'All Documents', path: '/documents/list' },
        ],
      },
    ],
  },
  {
    title: 'Governance',
    items: [
      {
        label: 'Compliance', icon: Scale, path: '/compliance',
        children: [
          { label: 'Audit Logs', path: '/compliance/audit' },
          { label: 'Regulatory Reports', path: '/compliance/reports' },
          { label: 'Risk Monitoring', path: '/compliance/risk' },
        ],
      },
      {
        label: 'Administration', icon: Settings, path: '/admin', adminOnly: true,
        children: [
          { label: 'Users', path: '/admin/users' },
          { label: 'Roles & Permissions', path: '/admin/roles' },
          // { label: 'System Settings', path: '/admin/settings' }, // hidden until backend exists
        ],
      },
    ],
  },
];

function NavItem({ item }) {
  const [open, setOpen] = useState(false);
  const Icon = item.icon;

  if (!item.children) {
    return (
      <NavLink to={item.path} end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Icon size={17} />
        <span>{item.label}</span>
      </NavLink>
    );
  }

  return (
    <div>
      <div className="nav-item" onClick={() => setOpen(!open)} style={{ userSelect: 'none' }}>
        <Icon size={17} />
        <span style={{ flex: 1 }}>{item.label}</span>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </div>
      {open && (
        <div>
          {item.children.map((child) => (
            <NavLink
              key={child.path}
              to={child.path}
              className={({ isActive }) => `nav-item nav-sub ${isActive ? 'active' : ''}`}
            >
              <span>{child.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ collapsed, onToggle }) {
  const { currentUser } = useAuth();
  const { selectedSchema, selectSchema, SCHEMA_OPTIONS } = useSchema();
  const isAdmin = currentUser?.role === 'Admin';
  const [schemaOpen, setSchemaOpen] = useState(false);
  const schemaRef = useRef(null);
  const currentSchema = SCHEMA_OPTIONS.find((option) => option.key === selectedSchema) || SCHEMA_OPTIONS[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (schemaRef.current && !schemaRef.current.contains(event.target)) {
        setSchemaOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* ── Branding ── */}
      <div style={{ padding: '1rem 1.1rem 0.9rem', borderBottom: '1px solid #1e293b', flexShrink: 0 }}>

        {/* Logo + Name row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
          <img
            src="/datacaffe_new_logo.png"
            onError={(e) => {
              e.target.onerror = null;
              // Fallback to the old logo if the user hasn't saved the new one to the public folder yet
              e.target.src = '/datacaffe_logo_transparent.png'; 
            }}
            alt="DataCaffe"
            width="36"
            height="36"
            style={{ objectFit: 'contain', flexShrink: 0, background: 'transparent' }}
          />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc', lineHeight: 1.2 }}>InsuranceCaffe</div>
            <div style={{ fontSize: '0.62rem', color: '#64748b', letterSpacing: '0.03em' }}>Analytics Platform</div>
          </div>
        </div>

        {/* Schema / Region Dropdown */}
        <div ref={schemaRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setSchemaOpen((prev) => !prev)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              padding: '0.5rem 0.65rem',
              borderRadius: '0.6rem',
              border: `1px solid ${currentSchema.color}44`,
              background: `${currentSchema.color}14`,
              color: '#e2e8f0',
              cursor: 'pointer',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
              <span style={{ fontSize: '1rem', lineHeight: 1 }}>{currentSchema.flag}</span>
              <span style={{ minWidth: 0, textAlign: 'left' }}>
                <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentSchema.label}
                </span>
                <span style={{ display: 'block', fontSize: '0.61rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentSchema.schema}
                </span>
              </span>
            </span>
            <ChevronDown size={13} color="#94a3b8" style={{ flexShrink: 0, transform: schemaOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {schemaOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 0.4rem)',
                left: 0,
                right: 0,
                background: '#0d1829',
                border: '1px solid #1e3a5f',
                borderRadius: '0.75rem',
                boxShadow: '0 16px 36px rgba(0,0,0,0.4)',
                padding: '0.35rem',
                zIndex: 60,
              }}
            >
              {SCHEMA_OPTIONS.map((option) => {
                const isSelected = option.key === selectedSchema;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => {
                      if (option.key === selectedSchema) {
                        setSchemaOpen(false);
                        return;
                      }
                      selectSchema(option.key);
                      setSchemaOpen(false);
                      window.location.reload();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.6rem 0.65rem',
                      borderRadius: '0.55rem',
                      border: 'none',
                      background: isSelected ? `${option.color}18` : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: '1rem', lineHeight: 1 }}>{option.flag}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#f8fafc' }}>{option.label}</span>
                      <span style={{ display: 'block', fontSize: '0.62rem', color: '#94a3b8' }}>{option.host} · {option.schema}</span>
                    </span>
                    {isSelected && (
                      <span style={{ fontSize: '0.6rem', fontWeight: 700, color: option.color, flexShrink: 0 }}>ACTIVE</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav style={{ padding: '0.5rem 0', overflowY: 'auto', overflowX: 'hidden', flex: 1, minHeight: 0 }}>
        {navSections.map((section) => {
          const visibleItems = section.items.filter((item) => !item.adminOnly || isAdmin);
          if (visibleItems.length === 0) return null;
          return (
            <div key={section.title}>
              <div className="nav-group-title">{section.title}</div>
              {visibleItems.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
