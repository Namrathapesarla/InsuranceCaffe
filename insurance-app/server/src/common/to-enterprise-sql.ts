/**
 * Rewrites Kimball-style SQL (written for `reporting` with `*_key` columns) for enterprise
 * warehouses such as `Reporting_layer_India` (`*_sk`, FPT premium column names).
 */
export function kimballSqlToEnterprise(sql: string): string {
  let s = sql;

  // Production-report KPIs: policy_base must expose Kimball column names to agg (pb.*), not anonymous CASE outputs.
  s = s.replace(
    /\s+WITH policy_base AS \(\s*SELECT\s*\n\s*fpt\.policy_key,\s*\n\s*fpt\.direct_written_premium,\s*\n\s*fpt\.direct_earned_premium,\s*\n\s*fpt\.direct_new_business_premium,\s*\n\s*fpt\.direct_renewal_premium,\s*\n\s*fpt\.direct_cancelled_premium,\s*\n\s*fpt\.inforce_indicator,\s*\n\s*fpt\.new_or_renewal_code,\s*\n\s*fpt\.policy_number\s*\n\s*FROM reporting\.fact_policy_transaction fpt\s*\n\s*JOIN reporting\.dim_book_month bm ON bm\.book_month_key = fpt\.book_month_key\s*\n\s*WHERE 1=1([\s\S]*?)\)\s*,/g,
    `WITH policy_base AS (
        SELECT
          fpt.policy_sk AS policy_key,
          fpt.term_premium_amount AS direct_written_premium,
          fpt.minimum_earned_premium_amount AS direct_earned_premium,
          (CASE WHEN fpt.new_or_renewal_code = 'NEW' THEN fpt.term_premium_amount ELSE 0 END) AS direct_new_business_premium,
          (CASE WHEN fpt.new_or_renewal_code = 'RNW' THEN fpt.term_premium_amount ELSE 0 END) AS direct_renewal_premium,
          0::numeric AS direct_cancelled_premium,
          fpt.inforce_indicator,
          fpt.new_or_renewal_code,
          COALESCE(fpt.policy_source_identifier::text, '') AS policy_number
        FROM reporting.fact_policy_transaction fpt
        JOIN reporting.dim_book_month bm ON bm.book_month_sk = fpt.book_month_sk
        WHERE 1=1$1 ),`,
  );

  s = s.replace(
    /clm AS \(\s*SELECT fcc\.policy_key,\s*\n\s*SUM\(fcc\.direct_loss_paid \+ fcc\.direct_ao_paid \+ fcc\.direct_dcc_paid\) AS incurred\s*FROM reporting\.fact_claim_component fcc\s*JOIN reporting\.dim_book_month bm ON bm\.book_month_key = fcc\.book_month_key\s*WHERE 1=1([\s\S]*?)GROUP BY fcc\.policy_key\s*\)/g,
    'clm AS ( SELECT cl.policy_sk AS policy_key, SUM(fcc.direct_loss_paid + fcc.direct_ao_paid + fcc.direct_dcc_paid) AS incurred FROM reporting.fact_claim_component fcc JOIN reporting.dim_book_month bm ON bm.book_month_sk = fcc.book_month_sk JOIN reporting.dim_claim cl ON cl.claim_sk = fcc.claim_sk WHERE 1=1$1GROUP BY cl.policy_sk )',
  );

  s = s.replace(
    /losses AS \(\s*SELECT fcc\.line_of_business_key,\s*\n\s*COALESCE\(SUM\(fcc\.direct_loss_paid \+ fcc\.direct_ao_paid \+ fcc\.direct_dcc_paid\), 0\) AS incurred\s*FROM reporting\.fact_claim_component fcc\s*JOIN reporting\.dim_book_month bm ON bm\.book_month_key = fcc\.book_month_key\s*WHERE 1=1([\s\S]*?)GROUP BY fcc\.line_of_business_key\s*\)/g,
    'losses AS ( SELECT p.lob_sk AS lob_sk, COALESCE(SUM(fcc.direct_loss_paid + fcc.direct_ao_paid + fcc.direct_dcc_paid), 0) AS incurred FROM reporting.fact_claim_component fcc JOIN reporting.dim_book_month bm ON bm.book_month_sk = fcc.book_month_sk JOIN reporting.dim_claim cl ON cl.claim_sk = fcc.claim_sk LEFT JOIN reporting.dim_policy p ON p.policy_sk = cl.policy_sk WHERE 1=1$1GROUP BY p.lob_sk )',
  );

  s = s.replace(
    /losses AS \(\s*SELECT fcc\.line_of_business_key,\s*\n\s*COALESCE\(SUM\(fcc\.direct_loss_paid \+ fcc\.direct_ao_paid \+ fcc\.direct_dcc_paid\),0\) AS incurred\s*FROM reporting\.fact_claim_component fcc\s*JOIN reporting\.dim_book_month bm ON bm\.book_month_key = fcc\.book_month_key\s*WHERE 1=1([\s\S]*?)GROUP BY fcc\.line_of_business_key\s*\)/g,
    'losses AS ( SELECT p.lob_sk AS lob_sk, COALESCE(SUM(fcc.direct_loss_paid + fcc.direct_ao_paid + fcc.direct_dcc_paid),0) AS incurred FROM reporting.fact_claim_component fcc JOIN reporting.dim_book_month bm ON bm.book_month_sk = fcc.book_month_sk JOIN reporting.dim_claim cl ON cl.claim_sk = fcc.claim_sk LEFT JOIN reporting.dim_policy p ON p.policy_sk = cl.policy_sk WHERE 1=1$1GROUP BY p.lob_sk )',
  );

  s = s.replace(
    /losses AS \(\s*SELECT\s*\n\s*fcc\.line_of_business_key,\s*\n\s*COALESCE\(SUM\(fcc\.direct_loss_paid \+ fcc\.direct_ao_paid \+ fcc\.direct_dcc_paid\), 0\) AS incurred\s*FROM reporting\.fact_claim_component fcc\s*JOIN reporting\.dim_book_month bm ON bm\.book_month_key = fcc\.book_month_key\s*WHERE 1=1([\s\S]*?)GROUP BY fcc\.line_of_business_key\s*\)/g,
    'losses AS ( SELECT p.lob_sk AS lob_sk, COALESCE(SUM(fcc.direct_loss_paid + fcc.direct_ao_paid + fcc.direct_dcc_paid), 0) AS incurred FROM reporting.fact_claim_component fcc JOIN reporting.dim_book_month bm ON bm.book_month_sk = fcc.book_month_sk JOIN reporting.dim_claim cl ON cl.claim_sk = fcc.claim_sk LEFT JOIN reporting.dim_policy p ON p.policy_sk = cl.policy_sk WHERE 1=1$1GROUP BY p.lob_sk )',
  );

  // Risk scoring (and similar): losses by FCC geography → COALESCE(fcc.geo, policy.geo) via dim_claim → dim_policy.
  s = s.replace(
    /losses AS \(\s*SELECT\s*\n\s*fcc\.geography_key,\s*\n\s*COALESCE\(SUM\(fcc\.direct_loss_paid \+ fcc\.direct_ao_paid \+ fcc\.direct_dcc_paid\), 0\) AS incurred\s*FROM reporting\.fact_claim_component fcc\s*\n\s*JOIN reporting\.dim_book_month bm ON bm\.book_month_key = fcc\.book_month_key\s*\n\s*WHERE 1=1([\s\S]*?)GROUP BY fcc\.geography_key\s*\)/g,
    'losses AS ( SELECT COALESCE(fcc.geography_key, p.geography_key) AS geography_key, COALESCE(SUM(fcc.direct_loss_paid + fcc.direct_ao_paid + fcc.direct_dcc_paid), 0) AS incurred FROM reporting.fact_claim_component fcc JOIN reporting.dim_book_month bm ON bm.book_month_key = fcc.book_month_key JOIN reporting.dim_claim cl ON cl.claim_key = fcc.claim_key LEFT JOIN reporting.dim_policy p ON p.policy_key = cl.policy_key WHERE 1=1$1GROUP BY COALESCE(fcc.geography_key, p.geography_key) )',
  );

  s = s.replace(
    /claim_base AS \(\s*SELECT\s*\n\s*fcc\.policy_key,\s*\n\s*fcc\.direct_loss_paid,\s*\n\s*fcc\.direct_ao_paid,\s*\n\s*fcc\.direct_dcc_paid\s*FROM reporting\.fact_claim_component fcc\s*JOIN reporting\.dim_book_month bm ON bm\.book_month_key = fcc\.book_month_key\s*WHERE 1=1([\s\S]*?)\)\s*,/g,
    'claim_base AS ( SELECT cl.policy_sk AS policy_key, fcc.direct_loss_paid, fcc.direct_ao_paid, fcc.direct_dcc_paid FROM reporting.fact_claim_component fcc JOIN reporting.dim_book_month bm ON bm.book_month_sk = fcc.book_month_sk JOIN reporting.dim_claim cl ON cl.claim_sk = fcc.claim_sk WHERE 1=1$1 ),',
  );

  s = s.replace(
    /LEFT JOIN reporting\.dim_line_of_business lob ON lob\.line_of_business_key\s*=\s*fcc\.line_of_business_key/g,
    'JOIN reporting.dim_claim _ic_cl2 ON _ic_cl2.claim_sk = fcc.claim_sk LEFT JOIN reporting.dim_policy _ic_pol2 ON _ic_pol2.policy_sk = _ic_cl2.policy_sk LEFT JOIN reporting.dim_line_of_business lob ON lob.lob_sk = _ic_pol2.lob_sk',
  );

  // Enterprise FCC often has no policy column; global policy_key→policy_sk would wrongly produce fcc.policy_sk.
  if (/\bfcc\.policy_key\b/.test(s)) {
    s = s.replace(
      /\bFROM reporting\.fact_claim_component fcc(\s+)JOIN reporting\.dim_book_month/g,
      'FROM reporting.fact_claim_component fcc$1JOIN reporting.dim_claim _fcc_pol_bridge ON _fcc_pol_bridge.claim_key = fcc.claim_key$1JOIN reporting.dim_book_month',
    );
    s = s.replace(/\bfcc\.policy_key\b/g, '_fcc_pol_bridge.policy_key');
  }

  s = s.replace(/\bline_of_business_key\b/g, 'lob_sk');
  s = s.replace(/\bbook_month_key\b/g, 'book_month_sk');
  s = s.replace(/\bpolicy_key\b/g, 'policy_sk');
  s = s.replace(/\bclaim_key\b/g, 'claim_sk');
  s = s.replace(/\bproduct_key\b/g, 'product_sk');
  s = s.replace(/\binsured_key\b/g, 'insured_sk');
  s = s.replace(/\bagent_key\b/g, 'agent_sk');
  s = s.replace(/\bgeography_key\b/g, 'geography_sk');
  s = s.replace(/\badjuster_key\b/g, 'adjuster_sk');
  s = s.replace(/\bclaim_status_key\b/g, 'claim_status_sk');
  s = s.replace(/\bunderwriter_key\b/g, 'underwriter_sk');
  s = s.replace(/\brating_territory_key\b/g, 'rating_territory_sk');

  // Only rewrite fpt.* (not pb.* / CTE aliases — production KPIs agg uses pb.direct_*).
  s = s.replace(
    /\bfpt\.direct_new_business_premium\b/g,
    "(CASE WHEN fpt.new_or_renewal_code = 'NEW' THEN fpt.term_premium_amount ELSE 0 END)",
  );
  s = s.replace(
    /\bfpt\.direct_renewal_premium\b/g,
    "(CASE WHEN fpt.new_or_renewal_code = 'RNW' THEN fpt.term_premium_amount ELSE 0 END)",
  );
  s = s.replace(/\bwritten_exposures\b/g, 'exposure_amount');
  s = s.replace(/\bdirect_written_premium\b/g, 'term_premium_amount');
  s = s.replace(/\bdirect_earned_premium\b/g, 'minimum_earned_premium_amount');
  s = s.replace(/\bdirect_unearned_premium\b/g, '0::numeric');
  s = s.replace(/\bdirect_surcharges\b/g, '0::numeric');
  s = s.replace(/\bdirect_taxes\b/g, '0::numeric');
  s = s.replace(/\bdirect_fees\b/g, '0::numeric');
  const commFromRate =
    '(COALESCE(fpt.term_premium_amount,0) * COALESCE(fpt.commission_rate,0) / 100.0)';
  // Match fpt-prefixed first — bare \bdirect_*_commission\b would turn fpt.direct_* into fpt.(expr) (invalid SQL).
  s = s.replace(
    /\bfpt\.direct_company_commission\s*\+\s*fpt\.direct_producer_commission\b/g,
    commFromRate,
  );
  s = s.replace(/\bfpt\.direct_producer_commission\b/g, commFromRate);
  s = s.replace(/\bfpt\.direct_company_commission\b/g, '0::numeric');
  s = s.replace(/\bfpt\.direct_producer_contingent_commission\b/g, '0::numeric');
  s = s.replace(/(?<!\.)direct_producer_contingent_commission\b/g, '0::numeric');
  s = s.replace(/(?<!\.)direct_producer_commission\b/g, commFromRate);
  s = s.replace(/(?<!\.)direct_company_commission\b/g, '0::numeric');
  // Some Reporting_layer FPTs omit direct_cancelled_premium (and refund_amt); keep Kimball alias names via CTEs.
  s = s.replace(/\bfpt\.direct_cancelled_premium\b/g, '0::numeric');
  s = s.replace(/\bfpt\.policy_number\b/g, 'COALESCE(fpt.policy_source_identifier::text, \'\')');

  // Reporting_layer / some IRDAI facts store new_or_renewal as integer (SK); comparing to 'NEW' coerces
  // the literal to int and errors. Compare as text so varchar Kimball still works; map SK→codes in dim if needed.
  s = s.replace(/\bnew_or_renewal_code\s*=\s*'NEW'/gi, 'new_or_renewal_code::text = \'NEW\'');
  s = s.replace(/\bnew_or_renewal_code\s*=\s*'RNW'/gi, 'new_or_renewal_code::text = \'RNW\'');

  // Enterprise FPT often has no cancelled_in_month_indicator; when direct_cancelled_premium is also absent, no reliable lapse flag.
  s = s.replace(/fpt\.cancelled_in_month_indicator\s*=\s*'Y'/g, 'FALSE');

  return s;
}
