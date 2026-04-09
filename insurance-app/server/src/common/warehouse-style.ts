/**
 * Enterprise / IRDAI-style warehouses use `*_sk` keys (e.g. dim_claim.claim_sk) and FPT-specific
 * column names. Kimball `reporting` uses `*_key` + fact_policy_measure.
 *
 * Insurance_CaffeV1 on DigitalOcean (`Reporting_IND`, `Reporting_US`) uses `*_key` on facts and
 * `dim_claim.claim_key` only — treat like Kimball, not enterprise SQL.
 */
export function isEnterpriseWarehouseSchema(schema: string): boolean {
  const s = schema.trim();
  const sLower = s.toLowerCase();

  if (sLower === 'reporting_ind' || sLower === 'reporting_us') {
    return false;
  }

  const extra =
    process.env.ENTERPRISE_DB_SCHEMAS?.split(',')
      .map((x) => x.trim())
      .filter(Boolean) ?? [];
  if (extra.includes(s)) return true;
  if (/^Reporting_layer/i.test(s) || /^reporting_layer/i.test(s)) return true;

  const india = process.env.INDIA_DB_SCHEMA?.trim();
  if (
    india &&
    sLower === india.toLowerCase() &&
    india.toLowerCase() !== 'reporting'
  ) {
    return true;
  }

  const us = process.env.US_DB_SCHEMA?.trim();
  if (
    us &&
    sLower === us.toLowerCase() &&
    us.toLowerCase() !== 'reporting'
  ) {
    return true;
  }

  return false;
}
