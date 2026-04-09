import { Router } from 'express';
import pool from '../db.js';

const router = Router();

function bmFilter(from, to, alias = 'bm', startIdx = 1) {
  const clauses = [];
  const params = [];
  let idx = startIdx;
  if (from) { clauses.push(`${alias}.book_start_date >= $${idx++}`); params.push(from); }
  if (to)   { clauses.push(`${alias}.book_end_date   <= $${idx++}`); params.push(to); }
  return { where: clauses.length ? 'AND ' + clauses.join(' AND ') : '', params, nextIdx: idx };
}

// =====================================================================
//  RENEWAL PRIORITIZATION ENGINE
// =====================================================================

router.get('/renewal/kpis', async (req, res) => {
  const { from, to } = req.query;
  const f1 = bmFilter(from, to, 'bm', 1);
  const f2 = bmFilter(from, to, 'bm', f1.nextIdx);
  try {
    const sql = `
      WITH ren AS (
        SELECT
          fpt.policy_key,
          fpt.direct_written_premium,
          fpt.direct_earned_premium,
          fpt.direct_renewal_premium,
          fpt.new_or_renewal_code,
          fpt.inforce_indicator,
          dp.policy_expiration_date,
          dp.renewal_of_policy_number
        FROM reporting.fact_policy_transaction fpt
        JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
        LEFT JOIN reporting.dim_policy dp ON dp.policy_key = fpt.policy_key
        WHERE 1=1 ${f1.where}
      ),
      clm AS (
        SELECT fcc.policy_key,
               SUM(fcc.direct_loss_paid + fcc.direct_ao_paid + fcc.direct_dcc_paid) AS incurred
        FROM reporting.fact_claim_component fcc
        JOIN reporting.dim_book_month bm ON bm.book_month_key = fcc.book_month_key
        WHERE 1=1 ${f2.where}
        GROUP BY fcc.policy_key
      )
      SELECT
        COUNT(DISTINCT ren.policy_key) AS total_policies,
        COUNT(DISTINCT CASE WHEN ren.new_or_renewal_code = 'RNW' THEN ren.policy_key END) AS renewed_count,
        COALESCE(SUM(CASE WHEN ren.new_or_renewal_code = 'RNW' THEN ren.direct_written_premium ELSE 0 END), 0) AS renewal_premium,
        COUNT(DISTINCT CASE WHEN ren.inforce_indicator = 'Y' THEN ren.policy_key END) AS inforce_count,
        COALESCE(SUM(ren.direct_earned_premium), 0) AS total_earned,
        COALESCE(SUM(c.incurred), 0) AS total_incurred,
        CASE WHEN SUM(ren.direct_earned_premium) > 0
             THEN ROUND(COALESCE(SUM(c.incurred), 0) * 100.0 / SUM(ren.direct_earned_premium), 1)
             ELSE 0 END AS avg_loss_ratio
      FROM ren
      LEFT JOIN clm c ON c.policy_key = ren.policy_key;
    `;
    const { rows } = await pool.query(sql, [...f1.params, ...f2.params]);
    res.json(rows[0] || {});
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/renewal/by-lob', async (req, res) => {
  const { from, to } = req.query;
  const f1 = bmFilter(from, to, 'bm', 1);
  const f2 = bmFilter(from, to, 'bm', f1.nextIdx);
  try {
    const sql = `
      WITH prem AS (
        SELECT fpt.line_of_business_key,
               COUNT(DISTINCT fpt.policy_key) AS policies,
               COALESCE(SUM(fpt.direct_written_premium), 0) AS dwp,
               COALESCE(SUM(fpt.direct_earned_premium), 0) AS earned,
               COALESCE(SUM(CASE WHEN fpt.new_or_renewal_code = 'RNW' THEN fpt.direct_written_premium ELSE 0 END), 0) AS renewal_premium,
               COUNT(DISTINCT CASE WHEN fpt.new_or_renewal_code = 'RNW' THEN fpt.policy_key END) AS renewals
        FROM reporting.fact_policy_transaction fpt
        JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
        WHERE 1=1 ${f1.where}
        GROUP BY fpt.line_of_business_key
      ),
      losses AS (
        SELECT fcc.line_of_business_key,
               COALESCE(SUM(fcc.direct_loss_paid + fcc.direct_ao_paid + fcc.direct_dcc_paid), 0) AS incurred
        FROM reporting.fact_claim_component fcc
        JOIN reporting.dim_book_month bm ON bm.book_month_key = fcc.book_month_key
        WHERE 1=1 ${f2.where}
        GROUP BY fcc.line_of_business_key
      )
      SELECT
        COALESCE(lob.line_of_business_description, 'Unknown') AS lob,
        p.policies, p.dwp, p.renewal_premium, p.renewals,
        CASE WHEN p.earned > 0 THEN ROUND(COALESCE(l.incurred,0)*100.0/p.earned,1) ELSE 0 END AS loss_ratio,
        CASE WHEN p.policies > 0 THEN ROUND(p.renewals*100.0/p.policies,1) ELSE 0 END AS renewal_rate
      FROM prem p
      LEFT JOIN losses l ON l.line_of_business_key = p.line_of_business_key
      LEFT JOIN reporting.dim_line_of_business lob ON lob.line_of_business_key = p.line_of_business_key
      ORDER BY p.renewal_premium DESC;
    `;
    const { rows } = await pool.query(sql, [...f1.params, ...f2.params]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/renewal/monthly', async (req, res) => {
  const { from, to } = req.query;
  const f = bmFilter(from, to);
  try {
    const sql = `
      SELECT
        bm.book_year || '-' || LPAD(bm.book_month::text,2,'0') AS month,
        bm.book_year * 100 + bm.book_month AS period,
        COUNT(DISTINCT CASE WHEN fpt.new_or_renewal_code = 'RNW' THEN fpt.policy_key END) AS renewals,
        COUNT(DISTINCT CASE WHEN fpt.new_or_renewal_code = 'NEW' THEN fpt.policy_key END) AS new_biz,
        COALESCE(SUM(CASE WHEN fpt.new_or_renewal_code = 'RNW' THEN fpt.direct_written_premium ELSE 0 END),0) AS renewal_premium,
        COALESCE(SUM(CASE WHEN fpt.new_or_renewal_code = 'NEW' THEN fpt.direct_written_premium ELSE 0 END),0) AS new_biz_premium
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
      WHERE 1=1 ${f.where}
      GROUP BY bm.book_year, bm.book_month, bm.book_month_name
      ORDER BY period;
    `;
    const { rows } = await pool.query(sql, f.params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// =====================================================================
//  LOB PROFITABILITY DRILL-DOWN
// =====================================================================

router.get('/profitability/kpis', async (req, res) => {
  const { from, to } = req.query;
  const f1 = bmFilter(from, to, 'bm', 1);
  const f2 = bmFilter(from, to, 'bm', f1.nextIdx);
  try {
    const sql = `
      WITH prem AS (
        SELECT
          COALESCE(SUM(fpt.direct_earned_premium),0) AS earned,
          COALESCE(SUM(fpt.direct_unearned_premium),0) AS unearned,
          COALESCE(SUM(fpt.direct_written_premium),0) AS written,
          COALESCE(SUM(fpt.direct_surcharges),0) AS surcharges,
          COALESCE(SUM(fpt.direct_taxes),0) AS taxes,
          COALESCE(SUM(fpt.direct_fees),0) AS fees,
          COALESCE(SUM(fpt.direct_company_commission + fpt.direct_producer_commission),0) AS total_commission
        FROM reporting.fact_policy_transaction fpt
        JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
        WHERE 1=1 ${f1.where}
      ),
      loss AS (
        SELECT COALESCE(SUM(fcc.direct_loss_paid + fcc.direct_ao_paid + fcc.direct_dcc_paid),0) AS incurred,
               COALESCE(SUM(fcc.direct_loss_reserve_outstanding),0) AS reserves
        FROM reporting.fact_claim_component fcc
        JOIN reporting.dim_book_month bm ON bm.book_month_key = fcc.book_month_key
        WHERE 1=1 ${f2.where}
      )
      SELECT
        p.earned, p.unearned, p.written, p.surcharges, p.taxes, p.fees, p.total_commission,
        l.incurred, l.reserves,
        CASE WHEN p.earned > 0 THEN ROUND(l.incurred*100.0/p.earned,1) ELSE 0 END AS loss_ratio,
        CASE WHEN p.earned > 0 THEN ROUND((l.incurred + p.total_commission)*100.0/p.earned,1) ELSE 0 END AS combined_ratio
      FROM prem p, loss l;
    `;
    const { rows } = await pool.query(sql, [...f1.params, ...f2.params]);
    res.json(rows[0] || {});
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/profitability/by-lob', async (req, res) => {
  const { from, to } = req.query;
  const f1 = bmFilter(from, to, 'bm', 1);
  const f2 = bmFilter(from, to, 'bm', f1.nextIdx);
  try {
    const sql = `
      WITH prem AS (
        SELECT fpt.line_of_business_key,
               COALESCE(SUM(fpt.direct_earned_premium),0) AS earned,
               COALESCE(SUM(fpt.direct_unearned_premium),0) AS unearned,
               COALESCE(SUM(fpt.direct_written_premium),0) AS written,
               COALESCE(SUM(fpt.direct_surcharges),0) AS surcharges,
               COALESCE(SUM(fpt.direct_taxes),0) AS taxes,
               COALESCE(SUM(fpt.direct_company_commission + fpt.direct_producer_commission),0) AS commission
        FROM reporting.fact_policy_transaction fpt
        JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
        WHERE 1=1 ${f1.where}
        GROUP BY fpt.line_of_business_key
      ),
      losses AS (
        SELECT fcc.line_of_business_key,
               COALESCE(SUM(fcc.direct_loss_paid + fcc.direct_ao_paid + fcc.direct_dcc_paid),0) AS incurred
        FROM reporting.fact_claim_component fcc
        JOIN reporting.dim_book_month bm ON bm.book_month_key = fcc.book_month_key
        WHERE 1=1 ${f2.where}
        GROUP BY fcc.line_of_business_key
      )
      SELECT
        COALESCE(lob.line_of_business_description, 'Unknown') AS lob,
        p.earned, p.unearned, p.written, p.surcharges, p.taxes, p.commission,
        COALESCE(l.incurred,0) AS incurred,
        CASE WHEN p.earned > 0 THEN ROUND(COALESCE(l.incurred,0)*100.0/p.earned,1) ELSE 0 END AS loss_ratio,
        CASE WHEN p.earned > 0 THEN ROUND((COALESCE(l.incurred,0)+p.commission)*100.0/p.earned,1) ELSE 0 END AS combined_ratio
      FROM prem p
      LEFT JOIN losses l ON l.line_of_business_key = p.line_of_business_key
      LEFT JOIN reporting.dim_line_of_business lob ON lob.line_of_business_key = p.line_of_business_key
      ORDER BY p.earned DESC;
    `;
    const { rows } = await pool.query(sql, [...f1.params, ...f2.params]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/profitability/monthly', async (req, res) => {
  const { from, to } = req.query;
  const f1 = bmFilter(from, to, 'bm', 1);
  const f2 = bmFilter(from, to, 'bm', f1.nextIdx);
  try {
    const sql = `
      WITH prem AS (
        SELECT bm.book_year*100+bm.book_month AS period,
               bm.book_year||'-'||LPAD(bm.book_month::text,2,'0') AS month,
               COALESCE(SUM(fpt.direct_earned_premium),0) AS earned,
               COALESCE(SUM(fpt.direct_unearned_premium),0) AS unearned
        FROM reporting.fact_policy_transaction fpt
        JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
        WHERE 1=1 ${f1.where}
        GROUP BY bm.book_year, bm.book_month
      ),
      losses AS (
        SELECT bm.book_year*100+bm.book_month AS period,
               COALESCE(SUM(fcc.direct_loss_paid+fcc.direct_ao_paid+fcc.direct_dcc_paid),0) AS incurred
        FROM reporting.fact_claim_component fcc
        JOIN reporting.dim_book_month bm ON bm.book_month_key = fcc.book_month_key
        WHERE 1=1 ${f2.where}
        GROUP BY bm.book_year, bm.book_month
      )
      SELECT p.month, p.earned, p.unearned, COALESCE(l.incurred,0) AS incurred,
             CASE WHEN p.earned>0 THEN ROUND(COALESCE(l.incurred,0)*100.0/p.earned,1) ELSE 0 END AS loss_ratio
      FROM prem p LEFT JOIN losses l ON l.period=p.period
      ORDER BY p.period;
    `;
    const { rows } = await pool.query(sql, [...f1.params, ...f2.params]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// =====================================================================
//  CANCELLATION PATTERN ANALYTICS
// =====================================================================

router.get('/cancellation/kpis', async (req, res) => {
  const { from, to } = req.query;
  const f = bmFilter(from, to);
  try {
    const sql = `
      SELECT
        COUNT(DISTINCT fpt.policy_key) AS total_policies,
        COUNT(DISTINCT CASE WHEN fpt.cancelled_in_month_indicator='Y' THEN fpt.policy_key END) AS cancelled_count,
        COALESCE(SUM(fpt.direct_cancelled_premium),0) AS cancelled_premium,
        COALESCE(SUM(fpt.direct_written_premium),0) AS total_written,
        CASE WHEN COUNT(DISTINCT fpt.policy_key)>0
             THEN ROUND(COUNT(DISTINCT CASE WHEN fpt.cancelled_in_month_indicator='Y' THEN fpt.policy_key END)*100.0
                        / COUNT(DISTINCT fpt.policy_key),1)
             ELSE 0 END AS cancellation_rate,
        CASE WHEN COUNT(DISTINCT CASE WHEN fpt.cancelled_in_month_indicator='Y' THEN fpt.policy_key END)>0
             THEN ROUND(COALESCE(SUM(fpt.direct_cancelled_premium),0)
                        / COUNT(DISTINCT CASE WHEN fpt.cancelled_in_month_indicator='Y' THEN fpt.policy_key END),0)
             ELSE 0 END AS avg_cancelled_premium
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
      WHERE 1=1 ${f.where};
    `;
    const { rows } = await pool.query(sql, f.params);
    res.json(rows[0] || {});
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/cancellation/by-lob', async (req, res) => {
  const { from, to } = req.query;
  const f = bmFilter(from, to);
  try {
    const sql = `
      SELECT
        COALESCE(lob.line_of_business_description,'Unknown') AS lob,
        COUNT(DISTINCT CASE WHEN fpt.cancelled_in_month_indicator='Y' THEN fpt.policy_key END) AS cancelled,
        COALESCE(SUM(fpt.direct_cancelled_premium),0) AS cancelled_premium,
        COUNT(DISTINCT fpt.policy_key) AS total_policies,
        CASE WHEN COUNT(DISTINCT fpt.policy_key)>0
             THEN ROUND(COUNT(DISTINCT CASE WHEN fpt.cancelled_in_month_indicator='Y' THEN fpt.policy_key END)*100.0
                        / COUNT(DISTINCT fpt.policy_key),1)
             ELSE 0 END AS cancellation_rate
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
      LEFT JOIN reporting.dim_line_of_business lob ON lob.line_of_business_key = fpt.line_of_business_key
      WHERE 1=1 ${f.where}
      GROUP BY lob.line_of_business_description
      ORDER BY cancelled DESC;
    `;
    const { rows } = await pool.query(sql, f.params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/cancellation/by-region', async (req, res) => {
  const { from, to } = req.query;
  const f = bmFilter(from, to);
  try {
    const sql = `
      SELECT
        COALESCE(g.region_name, g.state_name, 'Region '||fpt.geography_key) AS region,
        COUNT(DISTINCT CASE WHEN fpt.cancelled_in_month_indicator='Y' THEN fpt.policy_key END) AS cancelled,
        COALESCE(SUM(fpt.direct_cancelled_premium),0) AS cancelled_premium,
        COUNT(DISTINCT fpt.policy_key) AS total_policies,
        CASE WHEN COUNT(DISTINCT fpt.policy_key)>0
             THEN ROUND(COUNT(DISTINCT CASE WHEN fpt.cancelled_in_month_indicator='Y' THEN fpt.policy_key END)*100.0
                        / COUNT(DISTINCT fpt.policy_key),1)
             ELSE 0 END AS cancellation_rate
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
      LEFT JOIN reporting.dim_geography g ON g.geography_key = fpt.geography_key
      WHERE 1=1 ${f.where}
      GROUP BY region
      ORDER BY cancelled DESC
      LIMIT 10;
    `;
    const { rows } = await pool.query(sql, f.params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/cancellation/monthly', async (req, res) => {
  const { from, to } = req.query;
  const f = bmFilter(from, to);
  try {
    const sql = `
      SELECT
        bm.book_year||'-'||LPAD(bm.book_month::text,2,'0') AS month,
        bm.book_year*100+bm.book_month AS period,
        COUNT(DISTINCT CASE WHEN fpt.cancelled_in_month_indicator='Y' THEN fpt.policy_key END) AS cancelled,
        COALESCE(SUM(fpt.direct_cancelled_premium),0) AS cancelled_premium,
        COUNT(DISTINCT fpt.policy_key) AS total_policies
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
      WHERE 1=1 ${f.where}
      GROUP BY bm.book_year, bm.book_month
      ORDER BY period;
    `;
    const { rows } = await pool.query(sql, f.params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/cancellation/by-agent', async (req, res) => {
  const { from, to } = req.query;
  const f = bmFilter(from, to);
  try {
    const sql = `
      SELECT
        COALESCE(a.full_legal_name, 'Agent '||fpt.agent_key) AS agent,
        COUNT(DISTINCT CASE WHEN fpt.cancelled_in_month_indicator='Y' THEN fpt.policy_key END) AS cancelled,
        COALESCE(SUM(fpt.direct_cancelled_premium),0) AS cancelled_premium,
        COUNT(DISTINCT fpt.policy_key) AS total_policies,
        COALESCE(SUM(fpt.direct_written_premium),0) AS total_dwp,
        CASE WHEN COUNT(DISTINCT fpt.policy_key)>0
             THEN ROUND(COUNT(DISTINCT CASE WHEN fpt.cancelled_in_month_indicator='Y' THEN fpt.policy_key END)*100.0
                        / COUNT(DISTINCT fpt.policy_key),1)
             ELSE 0 END AS cancellation_rate
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
      LEFT JOIN reporting.dim_agent a ON a.agent_key = fpt.agent_key
      WHERE 1=1 ${f.where}
      GROUP BY agent
      ORDER BY cancelled DESC
      LIMIT 10;
    `;
    const { rows } = await pool.query(sql, f.params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// =====================================================================
//  PREMIUM LEAKAGE DETECTION & RECOVERY
//  Uses: written vs net_written gap, commission split, earned gap,
//        surcharges/taxes/fees breakdown
// =====================================================================

router.get('/leakage/kpis', async (req, res) => {
  const { from, to } = req.query;
  const f = bmFilter(from, to);
  try {
    const sql = `
      SELECT
        COALESCE(SUM(fpt.direct_written_premium),0) AS written_premium,
        COALESCE(SUM(fpt.net_written_premium),0) AS net_written,
        COALESCE(SUM(fpt.direct_earned_premium),0) AS earned_premium,
        COALESCE(SUM(fpt.direct_written_premium) - SUM(fpt.net_written_premium),0) AS gross_to_net_gap,
        COALESCE(SUM(fpt.direct_written_premium) - SUM(fpt.direct_earned_premium),0) AS earned_gap,
        COALESCE(SUM(fpt.direct_company_commission),0) AS company_commission,
        COALESCE(SUM(fpt.direct_producer_commission),0) AS producer_commission,
        COALESCE(SUM(fpt.direct_company_commission + fpt.direct_producer_commission),0) AS total_commission,
        COALESCE(SUM(fpt.direct_surcharges),0) AS surcharges,
        COALESCE(SUM(fpt.direct_taxes),0) AS taxes,
        COALESCE(SUM(fpt.direct_fees),0) AS fees,
        CASE WHEN SUM(fpt.direct_written_premium)>0
             THEN ROUND((SUM(fpt.direct_written_premium)-SUM(fpt.net_written_premium))*100.0
                        / SUM(fpt.direct_written_premium),1)
             ELSE 0 END AS leakage_pct,
        CASE WHEN SUM(fpt.direct_written_premium)>0
             THEN ROUND(SUM(fpt.direct_company_commission+fpt.direct_producer_commission)*100.0
                        / SUM(fpt.direct_written_premium),1)
             ELSE 0 END AS commission_ratio,
        CASE WHEN SUM(fpt.direct_written_premium)>0
             THEN ROUND((SUM(fpt.direct_written_premium)-SUM(fpt.direct_earned_premium))*100.0
                        / SUM(fpt.direct_written_premium),1)
             ELSE 0 END AS earned_gap_pct
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
      WHERE 1=1 ${f.where};
    `;
    const { rows } = await pool.query(sql, f.params);
    res.json(rows[0] || {});
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/leakage/by-lob', async (req, res) => {
  const { from, to } = req.query;
  const f = bmFilter(from, to);
  try {
    const sql = `
      SELECT
        COALESCE(lob.line_of_business_description,'Unknown') AS lob,
        COALESCE(SUM(fpt.direct_written_premium),0) AS written,
        COALESCE(SUM(fpt.net_written_premium),0) AS net_written,
        COALESCE(SUM(fpt.direct_written_premium)-SUM(fpt.net_written_premium),0) AS leakage,
        COALESCE(SUM(fpt.direct_earned_premium),0) AS earned,
        COALESCE(SUM(fpt.direct_company_commission),0) AS co_commission,
        COALESCE(SUM(fpt.direct_producer_commission),0) AS pr_commission,
        COALESCE(SUM(fpt.direct_surcharges+fpt.direct_taxes+fpt.direct_fees),0) AS cost_load,
        CASE WHEN SUM(fpt.direct_written_premium)>0
             THEN ROUND((SUM(fpt.direct_written_premium)-SUM(fpt.net_written_premium))*100.0
                        / SUM(fpt.direct_written_premium),1)
             ELSE 0 END AS leakage_pct,
        CASE WHEN SUM(fpt.direct_written_premium)>0
             THEN ROUND(SUM(fpt.direct_company_commission+fpt.direct_producer_commission)*100.0
                        / SUM(fpt.direct_written_premium),1)
             ELSE 0 END AS commission_ratio
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
      LEFT JOIN reporting.dim_line_of_business lob ON lob.line_of_business_key = fpt.line_of_business_key
      WHERE 1=1 ${f.where}
      GROUP BY lob.line_of_business_description
      ORDER BY leakage DESC;
    `;
    const { rows } = await pool.query(sql, f.params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/leakage/by-product', async (req, res) => {
  const { from, to } = req.query;
  const f = bmFilter(from, to);
  try {
    const sql = `
      SELECT
        COALESCE(p.licensed_product_name, 'Product '||fpt.product_key) AS product,
        COALESCE(SUM(fpt.direct_written_premium),0) AS written,
        COALESCE(SUM(fpt.net_written_premium),0) AS net_written,
        COALESCE(SUM(fpt.direct_written_premium)-SUM(fpt.net_written_premium),0) AS leakage,
        COALESCE(SUM(fpt.direct_company_commission+fpt.direct_producer_commission),0) AS commission,
        CASE WHEN SUM(fpt.direct_written_premium)>0
             THEN ROUND((SUM(fpt.direct_written_premium)-SUM(fpt.net_written_premium))*100.0
                        / SUM(fpt.direct_written_premium),1)
             ELSE 0 END AS leakage_pct,
        CASE WHEN SUM(fpt.direct_written_premium)>0
             THEN ROUND(SUM(fpt.direct_company_commission+fpt.direct_producer_commission)*100.0
                        / SUM(fpt.direct_written_premium),1)
             ELSE 0 END AS commission_ratio
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
      LEFT JOIN reporting.dim_product p ON p.product_key = fpt.product_key
      WHERE 1=1 ${f.where}
      GROUP BY product
      ORDER BY leakage DESC
      LIMIT 10;
    `;
    const { rows } = await pool.query(sql, f.params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/leakage/monthly', async (req, res) => {
  const { from, to } = req.query;
  const f = bmFilter(from, to);
  try {
    const sql = `
      SELECT
        bm.book_year||'-'||LPAD(bm.book_month::text,2,'0') AS month,
        bm.book_year*100+bm.book_month AS period,
        COALESCE(SUM(fpt.direct_written_premium),0) AS written,
        COALESCE(SUM(fpt.net_written_premium),0) AS net_written,
        COALESCE(SUM(fpt.direct_written_premium)-SUM(fpt.net_written_premium),0) AS leakage,
        COALESCE(SUM(fpt.direct_company_commission+fpt.direct_producer_commission),0) AS commission,
        COALESCE(SUM(fpt.direct_surcharges+fpt.direct_taxes+fpt.direct_fees),0) AS cost_load
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
      WHERE 1=1 ${f.where}
      GROUP BY bm.book_year, bm.book_month
      ORDER BY period;
    `;
    const { rows } = await pool.query(sql, f.params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/leakage/by-underwriter', async (req, res) => {
  const { from, to } = req.query;
  const f = bmFilter(from, to);
  try {
    const sql = `
      SELECT
        COALESCE(a.full_legal_name, 'Agent '||fpt.agent_key) AS underwriter,
        COUNT(DISTINCT fpt.policy_key) AS policies,
        COALESCE(SUM(fpt.direct_written_premium),0) AS written,
        COALESCE(SUM(fpt.net_written_premium),0) AS net_written,
        COALESCE(SUM(fpt.direct_written_premium)-SUM(fpt.net_written_premium),0) AS leakage,
        COALESCE(SUM(fpt.direct_company_commission),0) AS co_commission,
        COALESCE(SUM(fpt.direct_producer_commission),0) AS pr_commission,
        CASE WHEN SUM(fpt.direct_written_premium)>0
             THEN ROUND((SUM(fpt.direct_written_premium)-SUM(fpt.net_written_premium))*100.0
                        / SUM(fpt.direct_written_premium),1)
             ELSE 0 END AS leakage_pct,
        CASE WHEN SUM(fpt.direct_written_premium)>0
             THEN ROUND(SUM(fpt.direct_company_commission+fpt.direct_producer_commission)*100.0
                        / SUM(fpt.direct_written_premium),1)
             ELSE 0 END AS commission_ratio
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
      LEFT JOIN reporting.dim_agent a ON a.agent_key = fpt.agent_key
      WHERE 1=1 ${f.where}
      GROUP BY underwriter
      ORDER BY leakage DESC
      LIMIT 10;
    `;
    const { rows } = await pool.query(sql, f.params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
