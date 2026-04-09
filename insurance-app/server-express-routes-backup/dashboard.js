import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// Helper: build date filter clause for policies (via book_month)
function policyDateFilter(params, prefix = 'bm') {
  const clauses = [];
  if (params.from) {
    clauses.push(`${prefix}.book_start_date >= $${params.values.length + 1}`);
    params.values.push(params.from);
  }
  if (params.to) {
    clauses.push(`${prefix}.book_end_date <= $${params.values.length + 1}`);
    params.values.push(params.to);
  }
  return clauses.length ? ' AND ' + clauses.join(' AND ') : '';
}

// Helper: build date filter clause for claims (via claim_date_of_loss)
function claimDateFilter(params, prefix = 'fc') {
  const clauses = [];
  if (params.from) {
    clauses.push(`${prefix}.claim_date_of_loss >= $${params.values.length + 1}`);
    params.values.push(params.from);
  }
  if (params.to) {
    clauses.push(`${prefix}.claim_date_of_loss <= $${params.values.length + 1}`);
    params.values.push(params.to);
  }
  return clauses.length ? ' AND ' + clauses.join(' AND ') : '';
}

// KPI Cards — aggregated from fact tables
router.get('/kpis', async (req, res) => {
  try {
    const { from, to } = req.query;
    const params = [];
    let pClauses = '';
    let cClauses = '';

    if (from) {
      params.push(from);
      pClauses += ` AND bm.book_start_date >= $${params.length}`;
      params.push(from);
      cClauses += ` AND fc.claim_date_of_loss >= $${params.length}`;
    }
    if (to) {
      params.push(to);
      pClauses += ` AND bm.book_end_date <= $${params.length}`;
      params.push(to);
      cClauses += ` AND fc.claim_date_of_loss <= $${params.length}`;
    }

    const finalQuery = `
      WITH policy_stats AS (
        SELECT
          COUNT(DISTINCT p.policy_key) AS total_policies,
          COUNT(DISTINCT CASE WHEN ps.policy_status_description IN ('Active','In Force') OR ps.policy_status_code = 'ACT' THEN p.policy_key END) AS active_policies,
          COALESCE(SUM(fpm.direct_written_premium), 0) AS gwp,
          COALESCE(SUM(fpm.direct_earned_premium), 0) AS earned_premium
        FROM reporting.fact_policy_measure fpm
        JOIN reporting.dim_policy p ON fpm.policy_key = p.policy_key
        JOIN reporting.dim_book_month bm ON fpm.book_month_key = bm.book_month_key
        LEFT JOIN reporting.dim_policy_status ps ON fpm.policy_status_key = ps.policy_status_key
        WHERE 1=1 ${pClauses}
      ),
      claim_stats AS (
        SELECT
          COUNT(DISTINCT CASE WHEN cs.claim_status_description NOT IN ('Archived') THEN fc.claim_key END) AS total_claims,
          COUNT(DISTINCT CASE WHEN cs.claim_status_description IN ('FNOL','Open','Under Investigation','Approved','Reopened') THEN fc.claim_key END) AS open_claims,
          COALESCE(SUM(fc.direct_loss_paid), 0) AS total_paid,
          COALESCE(SUM(fc.direct_loss_reserve_outstanding), 0) AS total_reserves,
          COALESCE(AVG(CASE WHEN cs.claim_status_description NOT IN ('Archived') THEN fc.direct_claim_days_open END), 0) AS avg_claim_tat
        FROM reporting.fact_claim_component fc
        LEFT JOIN reporting.dim_claim_status cs ON fc.claim_status_key = cs.claim_status_key
        WHERE 1=1 ${cClauses}
      )
      SELECT
        ps.gwp, ps.earned_premium, ps.active_policies, ps.total_policies,
        cs.total_claims, cs.open_claims, cs.total_paid, cs.total_reserves, cs.avg_claim_tat,
        CASE WHEN ps.earned_premium > 0 THEN ROUND((cs.total_paid / ps.earned_premium * 100)::numeric, 1) ELSE 0 END AS loss_ratio
      FROM policy_stats ps, claim_stats cs
    `;

    const result = await pool.query(finalQuery, params);
    const row = result.rows[0];

    res.json({
      gwp: { value: parseFloat(row.gwp), label: 'Gross Written Premium' },
      activePolicies: { value: parseInt(row.active_policies), label: 'Active Policies' },
      openClaims: { value: parseInt(row.open_claims), label: 'Open Claims' },
      claimRatio: { value: parseFloat(row.loss_ratio), label: 'Loss Ratio %' },
      avgClaimTAT: { value: parseFloat(row.avg_claim_tat) || 0, label: 'Avg Claim TAT (days)' },
      totalClaims: { value: parseInt(row.total_claims), label: 'Total Claims' },
      totalPolicies: { value: parseInt(row.total_policies), label: 'Total Policies' },
      totalPaid: { value: parseFloat(row.total_paid), label: 'Claims Paid' },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Premium by LOB — for pie chart
router.get('/lob-distribution', async (req, res) => {
  try {
    const { from, to } = req.query;
    const params = [];
    let dateFilter = '';
    if (from) { params.push(from); dateFilter += ` AND bm.book_start_date >= $${params.length}`; }
    if (to) { params.push(to); dateFilter += ` AND bm.book_end_date <= $${params.length}`; }

    const result = await pool.query(`
      SELECT
        lob.line_of_business_description AS name,
        COALESCE(SUM(fpm.direct_written_premium), 0) AS premium,
        COUNT(DISTINCT fpm.policy_key) AS policy_count
      FROM reporting.fact_policy_measure fpm
      JOIN reporting.dim_line_of_business lob ON fpm.line_of_business_key = lob.line_of_business_key
      JOIN reporting.dim_book_month bm ON fpm.book_month_key = bm.book_month_key
      WHERE 1=1 ${dateFilter}
      GROUP BY lob.line_of_business_description
      ORDER BY premium DESC
      LIMIT 10
    `, params);

    const colors = ['#3b82f6', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#64748b', '#22c55e', '#ef4444', '#14b8a6', '#f97316'];
    const total = result.rows.reduce((s, r) => s + parseFloat(r.premium), 0);

    res.json(result.rows.map((r, i) => ({
      name: r.name,
      value: total > 0 ? Math.round(parseFloat(r.premium) / total * 100) : 0,
      premium: parseFloat(r.premium),
      policyCount: parseInt(r.policy_count),
      color: colors[i % colors.length],
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Claims by Status — for bar chart
router.get('/claims-by-status', async (req, res) => {
  try {
    const { from, to } = req.query;
    const params = [];
    let dateFilter = '';
    if (from) { params.push(from); dateFilter += ` AND fc.claim_date_of_loss >= $${params.length}`; }
    if (to) { params.push(to); dateFilter += ` AND fc.claim_date_of_loss <= $${params.length}`; }

    const result = await pool.query(`
      SELECT
        cs.claim_status_description AS status,
        COUNT(DISTINCT fc.claim_key) AS count
      FROM reporting.fact_claim_component fc
      JOIN reporting.dim_claim_status cs ON fc.claim_status_key = cs.claim_status_key
      WHERE 1=1 ${dateFilter}
      GROUP BY cs.claim_status_description
      ORDER BY count DESC
    `, params);

    const statusColors = {
      'Open': '#3b82f6', 'Closed': '#22c55e', 'Reopened': '#f59e0b',
      'Denied': '#ef4444', 'Settled': '#22c55e', 'Under Investigation': '#8b5cf6',
      'FNOL': '#06b6d4', 'Pending': '#f59e0b', 'Approved': '#8b5cf6',
      'Closed Without Payment': '#64748b', 'Archived': '#94a3b8',
    };
    const defaultColors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b'];

    res.json(result.rows.map((r, i) => ({
      status: r.status,
      count: parseInt(r.count),
      color: statusColors[r.status] || defaultColors[i % defaultColors.length],
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Recent Policies — for table
router.get('/recent-policies', async (req, res) => {
  try {
    const { from, to } = req.query;
    const params = [];
    let dateFilter = '';
    if (from) { params.push(from); dateFilter += ` AND bm.book_start_date >= $${params.length}`; }
    if (to) { params.push(to); dateFilter += ` AND bm.book_end_date <= $${params.length}`; }

    const result = await pool.query(`
      SELECT
        p.full_policy_number AS policy_number,
        ins.full_legal_name AS party_name,
        pr.licensed_product_name AS product_name,
        lob.line_of_business_description AS lob,
        ps.policy_status_description AS status,
        fpm.direct_written_premium AS gross_premium,
        p.policy_effective_date AS effective_date
      FROM reporting.fact_policy_measure fpm
      JOIN reporting.dim_policy p ON fpm.policy_key = p.policy_key
      JOIN reporting.dim_book_month bm ON fpm.book_month_key = bm.book_month_key
      LEFT JOIN reporting.dim_insured ins ON fpm.insured_key = ins.insured_key
      LEFT JOIN reporting.dim_product pr ON fpm.product_key = pr.product_key
      LEFT JOIN reporting.dim_line_of_business lob ON fpm.line_of_business_key = lob.line_of_business_key
      LEFT JOIN reporting.dim_policy_status ps ON fpm.policy_status_key = ps.policy_status_key
      WHERE 1=1 ${dateFilter}
      ORDER BY p.policy_effective_date DESC NULLS LAST
      LIMIT 10
    `, params);

    res.json(result.rows.map(r => ({
      policyNumber: r.policy_number || 'N/A',
      partyName: r.party_name || 'Unknown',
      productName: r.product_name || 'N/A',
      lob: r.lob || 'N/A',
      status: r.status || 'N/A',
      grossPremium: parseFloat(r.gross_premium) || 0,
      effectiveDate: r.effective_date,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Recent Claims — for table
router.get('/recent-claims', async (req, res) => {
  try {
    const { from, to } = req.query;
    const params = [];
    let dateFilter = '';
    if (from) { params.push(from); dateFilter += ` AND fc.claim_date_of_loss >= $${params.length}`; }
    if (to) { params.push(to); dateFilter += ` AND fc.claim_date_of_loss <= $${params.length}`; }

    const result = await pool.query(`
      SELECT
        fc.claim_key,
        cs.claim_status_description AS status,
        fc.claim_date_of_loss AS loss_date,
        fc.claim_reported_date AS reported_date,
        fc.direct_loss_paid AS paid_amount,
        fc.direct_loss_reserve_outstanding AS reserve_amount,
        lob.line_of_business_description AS lob,
        ins.full_legal_name AS party_name,
        p.full_policy_number AS policy_number
      FROM reporting.fact_claim_component fc
      LEFT JOIN reporting.dim_claim_status cs ON fc.claim_status_key = cs.claim_status_key
      LEFT JOIN reporting.dim_line_of_business lob ON fc.line_of_business_key = lob.line_of_business_key
      LEFT JOIN reporting.dim_policy p ON fc.policy_key = p.policy_key
      LEFT JOIN reporting.dim_insured ins ON fc.insured_key = ins.insured_key
      WHERE 1=1 ${dateFilter}
      ORDER BY fc.claim_date_of_loss DESC NULLS LAST
      LIMIT 10
    `, params);

    res.json(result.rows.map(r => ({
      claimKey: r.claim_key,
      policyNumber: r.policy_number || 'N/A',
      partyName: r.party_name || 'Unknown',
      lob: r.lob || 'N/A',
      status: r.status || 'N/A',
      lossDate: r.loss_date,
      paidAmount: parseFloat(r.paid_amount) || 0,
      reserveAmount: parseFloat(r.reserve_amount) || 0,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Available years for filtering
router.get('/years', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT bm.book_year AS year
      FROM reporting.fact_policy_measure fpm
      JOIN reporting.dim_book_month bm ON fpm.book_month_key = bm.book_month_key
      ORDER BY year DESC
    `);
    res.json(result.rows.map(r => r.year));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Monthly premium trend — for area chart (supports ?year=2024)
router.get('/premium-trend', async (req, res) => {
  try {
    const year = parseInt(req.query.year) || 2024;
    const result = await pool.query(`
      SELECT
        bm.book_month,
        bm.book_month_name,
        COALESCE(SUM(fpm.direct_written_premium), 0) AS written,
        COALESCE(SUM(fpm.direct_earned_premium), 0) AS earned,
        COALESCE(SUM(fpm.direct_company_commission), 0) AS commission
      FROM reporting.dim_book_month bm
      LEFT JOIN reporting.fact_policy_measure fpm ON fpm.book_month_key = bm.book_month_key
      WHERE bm.book_year = $1
      GROUP BY bm.book_month, bm.book_month_name
      ORDER BY bm.book_month
    `, [year]);

    res.json(result.rows.map(r => ({
      month: r.book_month_name.substring(0, 3),
      written: parseFloat(r.written),
      earned: parseFloat(r.earned),
      commission: parseFloat(r.commission),
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Premium by product — for additional chart
router.get('/premium-by-product', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        pr.licensed_product_name AS product,
        COALESCE(SUM(fpm.direct_written_premium), 0) AS premium,
        COUNT(DISTINCT fpm.policy_key) AS policies
      FROM reporting.fact_policy_measure fpm
      JOIN reporting.dim_product pr ON fpm.product_key = pr.product_key
      GROUP BY pr.licensed_product_name
      ORDER BY premium DESC
      LIMIT 10
    `);

    res.json(result.rows.map(r => ({
      product: r.product,
      premium: parseFloat(r.premium),
      policies: parseInt(r.policies),
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
