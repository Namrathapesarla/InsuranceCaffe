/** Override with INDIA_DB_SCHEMA / US_DB_SCHEMA in .env. Defaults match Insurance_CaffeV1 on DigitalOcean. */
const DEFAULT_BY_KEY: Record<string, string> = {
  local: 'reporting',
  india: 'Reporting_IND',
  us: 'Reporting_US',
};

/**
 * Maps frontend `X-Schema` / session `ic_schema` to a PostgreSQL schema name.
 * Reads env at call time so `dotenv.config()` in main.ts has already run.
 */
export function resolveSchemaFromHeader(header: string | undefined): string {
  const key = (header || 'local').toLowerCase().trim();
  if (key === 'india') {
    return process.env.INDIA_DB_SCHEMA?.trim() || DEFAULT_BY_KEY.india;
  }
  if (key === 'us') {
    return process.env.US_DB_SCHEMA?.trim() || DEFAULT_BY_KEY.us;
  }
  return process.env.DB_SCHEMA?.trim() || DEFAULT_BY_KEY.local;
}

/** Double-quote schema for SQL (mixed case, spaces e.g. "Reporting Layer"). */
export function quoteSchemaForSql(schema: string): string {
  const s = schema.trim();
  if (!s) {
    return `"${DEFAULT_BY_KEY.local.replace(/"/g, '""')}"`;
  }
  return `"${s.replace(/"/g, '""')}"`;
}
