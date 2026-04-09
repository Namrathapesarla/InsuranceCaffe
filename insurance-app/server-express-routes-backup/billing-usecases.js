import { Router } from 'express';
import pool from '../db.js';
const router = Router();

function bmf(from, to, alias='bm', s=1) {
  const c=[],p=[]; let i=s;
  if(from){c.push(`${alias}.book_start_date >= $${i++}`);p.push(from);}
  if(to){c.push(`${alias}.book_end_date <= $${i++}`);p.push(to);}
  return {w:c.length?'AND '+c.join(' AND '):'',p,n:i};
}

// =====================================================================
//  1. COLLECTION RATE TRACKING
// =====================================================================
router.get('/collection/kpis', async (req,res) => {
  const {from,to}=req.query; const f=bmf(from,to);
  try { const sql=`
    SELECT
      COALESCE(SUM(fpt.direct_written_premium),0) AS billed,
      COALESCE(SUM(fpt.direct_earned_premium),0) AS collected,
      COALESCE(SUM(fpt.direct_unearned_premium),0) AS outstanding,
      COALESCE(SUM(fpt.net_written_premium),0) AS net_collected,
      COUNT(DISTINCT fpt.policy_key) AS total_policies,
      CASE WHEN SUM(fpt.direct_written_premium)>0
           THEN ROUND(SUM(fpt.direct_earned_premium)*100.0/SUM(fpt.direct_written_premium),1)
           ELSE 0 END AS collection_rate,
      COUNT(DISTINCT CASE WHEN fpt.cancelled_in_month_indicator='Y' THEN fpt.policy_key END) AS overdue_policies
    FROM reporting.fact_policy_transaction fpt
    JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key
    WHERE 1=1 ${f.w};`;
    const {rows}=await pool.query(sql,f.p); res.json(rows[0]||{});
  } catch(e){res.status(500).json({error:e.message});}
});

router.get('/collection/by-lob', async (req,res) => {
  const {from,to}=req.query; const f=bmf(from,to);
  try { const sql=`
    SELECT COALESCE(lob.line_of_business_description,'Unknown') AS lob,
      COALESCE(SUM(fpt.direct_written_premium),0) AS billed,
      COALESCE(SUM(fpt.direct_earned_premium),0) AS collected,
      CASE WHEN SUM(fpt.direct_written_premium)>0
           THEN ROUND(SUM(fpt.direct_earned_premium)*100.0/SUM(fpt.direct_written_premium),1) ELSE 0 END AS rate
    FROM reporting.fact_policy_transaction fpt
    JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key
    LEFT JOIN reporting.dim_line_of_business lob ON lob.line_of_business_key=fpt.line_of_business_key
    WHERE 1=1 ${f.w} GROUP BY lob.line_of_business_description ORDER BY billed DESC;`;
    const {rows}=await pool.query(sql,f.p); res.json(rows);
  } catch(e){res.status(500).json({error:e.message});}
});

router.get('/collection/yearly', async (req,res) => {
  const {from,to}=req.query; const f=bmf(from,to);
  try { const sql=`
    SELECT bm.book_year::text AS year,
      COALESCE(SUM(fpt.direct_written_premium),0) AS billed,
      COALESCE(SUM(fpt.direct_earned_premium),0) AS collected,
      COALESCE(SUM(fpt.direct_unearned_premium),0) AS outstanding
    FROM reporting.fact_policy_transaction fpt
    JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key
    WHERE 1=1 ${f.w} GROUP BY bm.book_year ORDER BY bm.book_year;`;
    const {rows}=await pool.query(sql,f.p); res.json(rows);
  } catch(e){res.status(500).json({error:e.message});}
});

// =====================================================================
//  2. REFUND TAT MONITORING (using cancelled premium as proxy)
// =====================================================================
router.get('/refund/kpis', async (req,res) => {
  const {from,to}=req.query; const f=bmf(from,to);
  try { const sql=`
    SELECT
      COUNT(DISTINCT fpt.policy_key) AS total_policies,
      COUNT(DISTINCT CASE WHEN fpt.cancelled_in_month_indicator='Y' THEN fpt.policy_key END) AS cancelled_policies,
      COALESCE(SUM(fpt.direct_cancelled_premium),0) AS cancelled_premium,
      COALESCE(SUM(CASE WHEN fpt.cancelled_in_month_indicator='Y' THEN fpt.direct_written_premium ELSE 0 END),0) AS refund_eligible_premium,
      COALESCE(SUM(fpt.direct_reinstatement_premium),0) AS reinstatement_premium,
      COUNT(DISTINCT CASE WHEN fpt.reinstated_in_month_indicator='Y' THEN fpt.policy_key END) AS reinstated_count
    FROM reporting.fact_policy_transaction fpt
    JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key
    WHERE 1=1 ${f.w};`;
    const {rows}=await pool.query(sql,f.p); res.json(rows[0]||{});
  } catch(e){res.status(500).json({error:e.message});}
});

router.get('/refund/by-lob', async (req,res) => {
  const {from,to}=req.query; const f=bmf(from,to);
  try { const sql=`
    SELECT COALESCE(lob.line_of_business_description,'Unknown') AS lob,
      COUNT(DISTINCT CASE WHEN fpt.cancelled_in_month_indicator='Y' THEN fpt.policy_key END) AS cancelled,
      COALESCE(SUM(CASE WHEN fpt.cancelled_in_month_indicator='Y' THEN fpt.direct_written_premium ELSE 0 END),0) AS refund_premium,
      COUNT(DISTINCT fpt.policy_key) AS total
    FROM reporting.fact_policy_transaction fpt
    JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key
    LEFT JOIN reporting.dim_line_of_business lob ON lob.line_of_business_key=fpt.line_of_business_key
    WHERE 1=1 ${f.w} GROUP BY lob.line_of_business_description ORDER BY refund_premium DESC;`;
    const {rows}=await pool.query(sql,f.p); res.json(rows);
  } catch(e){res.status(500).json({error:e.message});}
});

// =====================================================================
//  3. COMMISSION PAYOUT
// =====================================================================
router.get('/commission/kpis', async (req,res) => {
  const {from,to}=req.query; const f=bmf(from,to);
  try { const sql=`
    SELECT
      COALESCE(SUM(fpt.direct_written_premium),0) AS total_written,
      COALESCE(SUM(fpt.direct_company_commission),0) AS company_comm,
      COALESCE(SUM(fpt.direct_producer_commission),0) AS producer_comm,
      COALESCE(SUM(fpt.direct_producer_contingent_commission),0) AS contingent_comm,
      COALESCE(SUM(fpt.direct_company_commission+fpt.direct_producer_commission),0) AS total_comm,
      CASE WHEN SUM(fpt.direct_written_premium)>0
           THEN ROUND(SUM(fpt.direct_company_commission+fpt.direct_producer_commission)*100.0/SUM(fpt.direct_written_premium),1)
           ELSE 0 END AS comm_ratio,
      COUNT(DISTINCT fpt.agent_key) AS active_agents
    FROM reporting.fact_policy_transaction fpt
    JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key
    WHERE 1=1 ${f.w};`;
    const {rows}=await pool.query(sql,f.p); res.json(rows[0]||{});
  } catch(e){res.status(500).json({error:e.message});}
});

router.get('/commission/by-agent', async (req,res) => {
  const {from,to}=req.query; const f=bmf(from,to);
  try { const sql=`
    SELECT COALESCE(a.full_legal_name,'Agent '||fpt.agent_key) AS agent,
      COUNT(DISTINCT fpt.policy_key) AS policies,
      COALESCE(SUM(fpt.direct_written_premium),0) AS written,
      COALESCE(SUM(fpt.direct_producer_commission),0) AS commission,
      CASE WHEN SUM(fpt.direct_written_premium)>0
           THEN ROUND(SUM(fpt.direct_producer_commission)*100.0/SUM(fpt.direct_written_premium),1) ELSE 0 END AS comm_rate
    FROM reporting.fact_policy_transaction fpt
    JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key
    LEFT JOIN reporting.dim_agent a ON a.agent_key=fpt.agent_key
    WHERE 1=1 ${f.w} GROUP BY agent ORDER BY commission DESC LIMIT 10;`;
    const {rows}=await pool.query(sql,f.p); res.json(rows);
  } catch(e){res.status(500).json({error:e.message});}
});

router.get('/commission/by-lob', async (req,res) => {
  const {from,to}=req.query; const f=bmf(from,to);
  try { const sql=`
    SELECT COALESCE(lob.line_of_business_description,'Unknown') AS lob,
      COALESCE(SUM(fpt.direct_company_commission),0) AS co_comm,
      COALESCE(SUM(fpt.direct_producer_commission),0) AS pr_comm,
      COALESCE(SUM(fpt.direct_written_premium),0) AS written,
      CASE WHEN SUM(fpt.direct_written_premium)>0
           THEN ROUND(SUM(fpt.direct_company_commission+fpt.direct_producer_commission)*100.0/SUM(fpt.direct_written_premium),1) ELSE 0 END AS ratio
    FROM reporting.fact_policy_transaction fpt
    JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key
    LEFT JOIN reporting.dim_line_of_business lob ON lob.line_of_business_key=fpt.line_of_business_key
    WHERE 1=1 ${f.w} GROUP BY lob.line_of_business_description ORDER BY pr_comm DESC;`;
    const {rows}=await pool.query(sql,f.p); res.json(rows);
  } catch(e){res.status(500).json({error:e.message});}
});

// =====================================================================
//  4. SOLVENCY RATIO (earned vs incurred proxy)
// =====================================================================
router.get('/solvency/kpis', async (req,res) => {
  const {from,to}=req.query;
  const f1=bmf(from,to,'bm',1); const f2=bmf(from,to,'bm',f1.n);
  try { const sql=`
    WITH prem AS (
      SELECT COALESCE(SUM(fpt.direct_earned_premium),0) AS earned,
             COALESCE(SUM(fpt.direct_written_premium),0) AS written,
             COALESCE(SUM(fpt.direct_company_commission+fpt.direct_producer_commission),0) AS commission,
             COALESCE(SUM(fpt.direct_surcharges+fpt.direct_taxes+fpt.direct_fees),0) AS expenses
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key WHERE 1=1 ${f1.w}
    ), loss AS (
      SELECT COALESCE(SUM(fcc.direct_loss_paid+fcc.direct_ao_paid+fcc.direct_dcc_paid),0) AS incurred,
             COALESCE(SUM(fcc.direct_loss_reserve_outstanding),0) AS reserves
      FROM reporting.fact_claim_component fcc
      JOIN reporting.dim_book_month bm ON bm.book_month_key=fcc.book_month_key WHERE 1=1 ${f2.w}
    )
    SELECT p.earned, p.written, p.commission, p.expenses, l.incurred, l.reserves,
      CASE WHEN l.incurred>0 THEN ROUND(p.earned*100.0/l.incurred,1) ELSE 0 END AS solvency_proxy,
      CASE WHEN p.earned>0 THEN ROUND(l.incurred*100.0/p.earned,1) ELSE 0 END AS loss_ratio,
      CASE WHEN p.earned>0 THEN ROUND((l.incurred+p.commission)*100.0/p.earned,1) ELSE 0 END AS combined_ratio
    FROM prem p, loss l;`;
    const {rows}=await pool.query(sql,[...f1.p,...f2.p]); res.json(rows[0]||{});
  } catch(e){res.status(500).json({error:e.message});}
});

router.get('/solvency/yearly', async (req,res) => {
  const {from,to}=req.query;
  const f1=bmf(from,to,'bm',1); const f2=bmf(from,to,'bm',f1.n);
  try { const sql=`
    WITH prem AS (
      SELECT bm.book_year AS yr, COALESCE(SUM(fpt.direct_earned_premium),0) AS earned,
             COALESCE(SUM(fpt.direct_company_commission+fpt.direct_producer_commission),0) AS commission
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key WHERE 1=1 ${f1.w}
      GROUP BY bm.book_year
    ), loss AS (
      SELECT bm.book_year AS yr, COALESCE(SUM(fcc.direct_loss_paid+fcc.direct_ao_paid+fcc.direct_dcc_paid),0) AS incurred
      FROM reporting.fact_claim_component fcc
      JOIN reporting.dim_book_month bm ON bm.book_month_key=fcc.book_month_key WHERE 1=1 ${f2.w}
      GROUP BY bm.book_year
    )
    SELECT p.yr::text AS year, p.earned, COALESCE(l.incurred,0) AS incurred, p.commission,
      CASE WHEN p.earned>0 THEN ROUND(COALESCE(l.incurred,0)*100.0/p.earned,1) ELSE 0 END AS loss_ratio,
      CASE WHEN p.earned>0 THEN ROUND((COALESCE(l.incurred,0)+p.commission)*100.0/p.earned,1) ELSE 0 END AS combined_ratio
    FROM prem p LEFT JOIN loss l ON l.yr=p.yr ORDER BY p.yr;`;
    const {rows}=await pool.query(sql,[...f1.p,...f2.p]); res.json(rows);
  } catch(e){res.status(500).json({error:e.message});}
});

// =====================================================================
//  5. GL RECONCILIATION (written vs net vs earned vs commission)
// =====================================================================
router.get('/gl-recon/kpis', async (req,res) => {
  const {from,to}=req.query; const f=bmf(from,to);
  try { const sql=`
    SELECT
      COALESCE(SUM(fpt.direct_written_premium),0) AS written,
      COALESCE(SUM(fpt.net_written_premium),0) AS net_written,
      COALESCE(SUM(fpt.direct_earned_premium),0) AS earned,
      COALESCE(SUM(fpt.direct_unearned_premium),0) AS unearned,
      COALESCE(SUM(fpt.direct_company_commission+fpt.direct_producer_commission),0) AS commission,
      COALESCE(SUM(fpt.direct_surcharges),0) AS surcharges,
      COALESCE(SUM(fpt.direct_taxes),0) AS taxes,
      COALESCE(SUM(fpt.direct_fees),0) AS fees,
      COALESCE(SUM(fpt.direct_written_premium)-SUM(fpt.net_written_premium)-SUM(fpt.direct_company_commission+fpt.direct_producer_commission),0) AS variance
    FROM reporting.fact_policy_transaction fpt
    JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key
    WHERE 1=1 ${f.w};`;
    const {rows}=await pool.query(sql,f.p); res.json(rows[0]||{});
  } catch(e){res.status(500).json({error:e.message});}
});

router.get('/gl-recon/by-lob', async (req,res) => {
  const {from,to}=req.query; const f=bmf(from,to);
  try { const sql=`
    SELECT COALESCE(lob.line_of_business_description,'Unknown') AS lob,
      COALESCE(SUM(fpt.direct_written_premium),0) AS written,
      COALESCE(SUM(fpt.net_written_premium),0) AS net_written,
      COALESCE(SUM(fpt.direct_earned_premium),0) AS earned,
      COALESCE(SUM(fpt.direct_company_commission+fpt.direct_producer_commission),0) AS commission,
      COALESCE(SUM(fpt.direct_surcharges+fpt.direct_taxes+fpt.direct_fees),0) AS cost_load
    FROM reporting.fact_policy_transaction fpt
    JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key
    LEFT JOIN reporting.dim_line_of_business lob ON lob.line_of_business_key=fpt.line_of_business_key
    WHERE 1=1 ${f.w} GROUP BY lob.line_of_business_description ORDER BY written DESC;`;
    const {rows}=await pool.query(sql,f.p); res.json(rows);
  } catch(e){res.status(500).json({error:e.message});}
});

// =====================================================================
//  6. GST COMPLIANCE
// =====================================================================
router.get('/gst/kpis', async (req,res) => {
  const {from,to}=req.query; const f=bmf(from,to);
  try { const sql=`
    SELECT
      COALESCE(SUM(fpt.direct_written_premium),0) AS written,
      COALESCE(SUM(fpt.direct_taxes),0) AS total_gst,
      COALESCE(SUM(fpt.direct_surcharges),0) AS surcharges,
      COALESCE(SUM(fpt.direct_fees),0) AS fees,
      COALESCE(SUM(fpt.direct_taxes+fpt.direct_surcharges+fpt.direct_fees),0) AS total_statutory,
      CASE WHEN SUM(fpt.direct_written_premium)>0
           THEN ROUND(SUM(fpt.direct_taxes)*100.0/SUM(fpt.direct_written_premium),2) ELSE 0 END AS effective_tax_rate,
      COUNT(DISTINCT fpt.policy_key) AS policies_with_tax
    FROM reporting.fact_policy_transaction fpt
    JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key
    WHERE 1=1 ${f.w};`;
    const {rows}=await pool.query(sql,f.p); res.json(rows[0]||{});
  } catch(e){res.status(500).json({error:e.message});}
});

router.get('/gst/by-lob', async (req,res) => {
  const {from,to}=req.query; const f=bmf(from,to);
  try { const sql=`
    SELECT COALESCE(lob.line_of_business_description,'Unknown') AS lob,
      COALESCE(SUM(fpt.direct_written_premium),0) AS written,
      COALESCE(SUM(fpt.direct_taxes),0) AS gst,
      COALESCE(SUM(fpt.direct_surcharges),0) AS surcharges,
      COALESCE(SUM(fpt.direct_fees),0) AS fees,
      CASE WHEN SUM(fpt.direct_written_premium)>0
           THEN ROUND(SUM(fpt.direct_taxes)*100.0/SUM(fpt.direct_written_premium),2) ELSE 0 END AS tax_rate
    FROM reporting.fact_policy_transaction fpt
    JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key
    LEFT JOIN reporting.dim_line_of_business lob ON lob.line_of_business_key=fpt.line_of_business_key
    WHERE 1=1 ${f.w} GROUP BY lob.line_of_business_description ORDER BY gst DESC;`;
    const {rows}=await pool.query(sql,f.p); res.json(rows);
  } catch(e){res.status(500).json({error:e.message});}
});

router.get('/gst/yearly', async (req,res) => {
  const {from,to}=req.query; const f=bmf(from,to);
  try { const sql=`
    SELECT bm.book_year::text AS year,
      COALESCE(SUM(fpt.direct_taxes),0) AS gst,
      COALESCE(SUM(fpt.direct_surcharges),0) AS surcharges,
      COALESCE(SUM(fpt.direct_fees),0) AS fees,
      COALESCE(SUM(fpt.direct_written_premium),0) AS written
    FROM reporting.fact_policy_transaction fpt
    JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key
    WHERE 1=1 ${f.w} GROUP BY bm.book_year ORDER BY bm.book_year;`;
    const {rows}=await pool.query(sql,f.p); res.json(rows);
  } catch(e){res.status(500).json({error:e.message});}
});

export default router;
