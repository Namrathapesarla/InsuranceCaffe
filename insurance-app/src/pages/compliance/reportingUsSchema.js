/**
 * Whether the app is pointed at the US reporting warehouse (Reporting_US).
 * Uses the same session key as api.js (`ic_schema`) / X-Schema, and accepts
 * legacy values where the DB schema name was stored instead of the short key.
 */
export function isReportingUSSchema(selectedSchema, currentOption) {
  if (currentOption?.key === 'us') return true;
  const raw =
    (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('ic_schema')) ||
    selectedSchema ||
    'local';
  const s = String(raw).trim().toLowerCase();
  return s === 'us' || s === 'reporting_us';
}
