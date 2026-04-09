import { createContext, useContext, useState } from 'react';

const SchemaContext = createContext(null);

export const SCHEMA_OPTIONS = [
  {
    key: 'local',
    label: 'Local (India)',
    description: 'Local PostgreSQL server',
    schema: 'reporting',
    database: 'Insurance',
    host: 'localhost',
    flag: '🏠',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
  },
  {
    key: 'india',
    label: 'India',
    description: 'Maps to INDIA_DB_SCHEMA on the API (see server .env)',
    schema: 'Reporting_IND',
    database: 'Insurance_CaffeV1',
    host: 'DigitalOcean',
    flag: '🇮🇳',
    color: '#f97316',
    gradient: 'linear-gradient(135deg, #ea580c, #f59e0b)',
  },
  {
    key: 'us',
    label: 'United States',
    description: 'Maps to US_DB_SCHEMA on the API (see server .env)',
    schema: 'Reporting_US',
    database: 'Insurance_CaffeV1',
    host: 'DigitalOcean',
    flag: '🇺🇸',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
  },
];

export function SchemaProvider({ children }) {
  const [selectedSchema, setSelectedSchema] = useState(() => {
    return sessionStorage.getItem('ic_schema') || 'local';
  });

  const selectSchema = (key) => {
    setSelectedSchema(key);
    sessionStorage.setItem('ic_schema', key);
    // Force a reload so all dashboard queries refetch with the new schema header
    window.location.reload();
  };

  const clearSchema = () => {
    setSelectedSchema(null);
    sessionStorage.removeItem('ic_schema');
  };

  const currentOption = SCHEMA_OPTIONS.find((o) => o.key === selectedSchema) || null;

  return (
    <SchemaContext.Provider value={{ selectedSchema, selectSchema, clearSchema, currentOption, SCHEMA_OPTIONS }}>
      {children}
    </SchemaContext.Provider>
  );
}

export function useSchema() {
  const ctx = useContext(SchemaContext);
  if (!ctx) throw new Error('useSchema must be used within SchemaProvider');
  return ctx;
}
