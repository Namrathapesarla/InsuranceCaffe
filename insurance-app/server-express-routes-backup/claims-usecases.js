import { Router } from 'express';
import pool from '../db.js';
const router = Router();

function bmf(from,to,alias='bm',s=1){const c=[],p=[];let i=s;if(from){c.push(`${alias}.book_start_date >= $${i++}`);p.push(from);}if(to){c.push(`${alias}.book_end_date <= $${i++}`);p.push(to);}return{w:c.length?'AND '+c.join(' AND '):'',p,n:i};}

// =====================================================================
//  1. CLAIM TAT TRACKER
// =====================================================================
router.get('/tat/kpis', async (req,res)=>{
  const {from,to}=req.query; const f=bmf(from,to);
  try{const sql=`
    SELECT
      COUNT(DISTINCT fcc.claim_key) AS total_claims,
      ROUND(AVG(fcc.direct_claim_days_open),1) AS avg_tat_days,
      MAX(fcc.direct_claim_days_open) AS max_tat_days,
      MIN(CASE WHEN fcc.direct_claim_days_open>0 THEN fcc.direct_claim_days_open END) AS min_tat_days,
      COUNT(DISTINCT CASE WHEN fcc.direct_claim_days_open>30 THEN fcc.claim_key END) AS breach_30day,
      COUNT(DISTINCT CASE WHEN fcc.claim_close_date IS NOT NULL THEN fcc.claim_key END) AS closed_claims,
      COUNT(DISTINCT CASE WHEN fcc.claim_close_date IS NULL THEN fcc.claim_key END) AS open_claims,
      COALESCE(SUM(fcc.direct_loss_paid),0) AS total_paid
    FROM reporting.fact_claim_component fcc
    JOIN reporting.dim_book_month bm ON bm.book_month_key=fcc.book_month_key
    WHERE 1=1 ${f.w};`;
    const{rows}=await pool.query(sql,f.p);res.json(rows[0]||{});
  }catch(e){res.status(500).json({error:e.message});}
});

router.get('/tat/by-lob', async (req,res)=>{
  const {from,to}=req.query; const f=bmf(from,to);
  try{const sql=`
    SELECT COALESCE(lob.line_of_business_description,'Unknown') AS lob,
      COUNT(DISTINCT fcc.claim_key) AS claims,
      ROUND(AVG(fcc.direct_claim_days_open),1) AS avg_tat,
      COUNT(DISTINCT CASE WHEN fcc.direct_claim_days_open>30 THEN fcc.claim_key END) AS breaches,
      COALESCE(SUM(fcc.direct_loss_paid),0) AS paid
    FROM reporting.fact_claim_component fcc
    JOIN reporting.dim_book_month bm ON bm.book_month_key=fcc.book_month_key
    LEFT JOIN reporting.dim_line_of_business lob ON lob.line_of_business_key=fcc.line_of_business_key
    WHERE 1=1 ${f.w} GROUP BY lob.line_of_business_description ORDER BY avg_tat DESC;`;
    const{rows}=await pool.query(sql,f.p);res.json(rows);
  }catch(e){res.status(500).json({error:e.message});}
});

router.get('/tat/by-adjuster', async (req,res)=>{
  const {from,to}=req.query; const f=bmf(from,to);
  try{const sql=`
    SELECT COALESCE(adj.full_legal_name,'Adjuster '||fcc.adjuster_key) AS adjuster,
      COUNT(DISTINCT fcc.claim_key) AS claims,
      ROUND(AVG(fcc.direct_claim_days_open),1) AS avg_tat,
      COUNT(DISTINCT CASE WHEN fcc.direct_claim_days_open>30 THEN fcc.claim_key END) AS breaches,
      COALESCE(SUM(fcc.direct_loss_paid),0) AS paid
    FROM reporting.fact_claim_component fcc
    JOIN reporting.dim_book_month bm ON bm.book_month_key=fcc.book_month_key
    LEFT JOIN reporting.dim_adjuster adj ON adj.adjuster_key=fcc.adjuster_key
    WHERE 1=1 ${f.w} GROUP BY adjuster ORDER BY avg_tat DESC LIMIT 10;`;
    const{rows}=await pool.query(sql,f.p);res.json(rows);
  }catch(e){res.status(500).json({error:e.message});}
});

// =====================================================================
//  2. FRAUD DETECTION ENGINE (pattern-based)
// =====================================================================
router.get('/fraud/kpis', async (req,res)=>{
  const {from,to}=req.query; const f=bmf(from,to);
  try{const sql=`
    SELECT
      COUNT(DISTINCT fcc.claim_key) AS total_claims,
      COUNT(DISTINCT CASE WHEN fcc.direct_claim_days_open<=1 THEN fcc.claim_key END) AS rapid_claims,
      COUNT(DISTINCT CASE WHEN fcc.direct_loss_paid > fcc.direct_initial_loss_reserve*2 AND fcc.direct_initial_loss_reserve>0 THEN fcc.claim_key END) AS over_reserve_claims,
      COUNT(DISTINCT CASE WHEN fcc.direct_reopened_claim_count>0 THEN fcc.claim_key END) AS reopened_claims,
      COALESCE(SUM(fcc.direct_loss_paid),0) AS total_paid,
      COALESCE(SUM(fcc.direct_salvage_received),0) AS salvage,
      COALESCE(SUM(fcc.direct_subrogation_received),0) AS subrogation
    FROM reporting.fact_claim_component fcc
    JOIN reporting.dim_book_month bm ON bm.book_month_key=fcc.book_month_key
    WHERE 1=1 ${f.w};`;
    const{rows}=await pool.query(sql,f.p);res.json(rows[0]||{});
  }catch(e){res.status(500).json({error:e.message});}
});

router.get('/fraud/by-lob', async (req,res)=>{
  const {from,to}=req.query; const f=bmf(from,to);
  try{const sql=`
    SELECT COALESCE(lob.line_of_business_description,'Unknown') AS lob,
      COUNT(DISTINCT fcc.claim_key) AS claims,
      COALESCE(SUM(fcc.direct_loss_paid),0) AS paid,
      COALESCE(SUM(fcc.direct_salvage_received),0) AS salvage,
      COALESCE(SUM(fcc.direct_subrogation_received),0) AS subrogation,
      COALESCE(SUM(fcc.direct_medical_paid),0) AS medical,
      COALESCE(SUM(fcc.direct_ao_paid+fcc.direct_dcc_paid),0) AS alae,
      ROUND(AVG(fcc.direct_claim_days_open),1) AS avg_tat
    FROM reporting.fact_claim_component fcc
    JOIN reporting.dim_book_month bm ON bm.book_month_key=fcc.book_month_key
    LEFT JOIN reporting.dim_line_of_business lob ON lob.line_of_business_key=fcc.line_of_business_key
    WHERE 1=1 ${f.w} GROUP BY lob.line_of_business_description ORDER BY paid DESC;`;
    const{rows}=await pool.query(sql,f.p);res.json(rows);
  }catch(e){res.status(500).json({error:e.message});}
});

// =====================================================================
//  3. RESERVE ADEQUACY MONITOR
// =====================================================================
router.get('/reserves/kpis', async (req,res)=>{
  const {from,to}=req.query; const f=bmf(from,to);
  try{const sql=`
    SELECT
      COUNT(DISTINCT fcc.claim_key) AS total_claims,
      COALESCE(SUM(fcc.direct_loss_paid),0) AS total_paid,
      COALESCE(SUM(fcc.direct_loss_reserve),0) AS total_reserve,
      COALESCE(SUM(fcc.direct_initial_loss_reserve),0) AS initial_reserve,
      COALESCE(SUM(fcc.direct_ibnr_loss_reserve),0) AS ibnr_reserve,
      COALESCE(SUM(fcc.direct_loss_reserve_outstanding),0) AS outstanding_reserve,
      CASE WHEN SUM(fcc.direct_loss_reserve)>0
           THEN ROUND(SUM(fcc.direct_loss_paid)*100.0/SUM(fcc.direct_loss_reserve),1) ELSE 0 END AS paid_to_reserve_ratio,
      COALESCE(SUM(fcc.direct_salvage_received+fcc.direct_subrogation_received),0) AS total_recovery
    FROM reporting.fact_claim_component fcc
    JOIN reporting.dim_book_month bm ON bm.book_month_key=fcc.book_month_key
    WHERE 1=1 ${f.w};`;
    const{rows}=await pool.query(sql,f.p);res.json(rows[0]||{});
  }catch(e){res.status(500).json({error:e.message});}
});

router.get('/reserves/by-lob', async (req,res)=>{
  const {from,to}=req.query; const f=bmf(from,to);
  try{const sql=`
    SELECT COALESCE(lob.line_of_business_description,'Unknown') AS lob,
      COUNT(DISTINCT fcc.claim_key) AS claims,
      COALESCE(SUM(fcc.direct_loss_paid),0) AS paid,
      COALESCE(SUM(fcc.direct_loss_reserve),0) AS reserve,
      COALESCE(SUM(fcc.direct_ibnr_loss_reserve),0) AS ibnr,
      CASE WHEN SUM(fcc.direct_loss_reserve)>0
           THEN ROUND(SUM(fcc.direct_loss_paid)*100.0/SUM(fcc.direct_loss_reserve),1) ELSE 0 END AS paid_reserve_ratio
    FROM reporting.fact_claim_component fcc
    JOIN reporting.dim_book_month bm ON bm.book_month_key=fcc.book_month_key
    LEFT JOIN reporting.dim_line_of_business lob ON lob.line_of_business_key=fcc.line_of_business_key
    WHERE 1=1 ${f.w} GROUP BY lob.line_of_business_description ORDER BY reserve DESC;`;
    const{rows}=await pool.query(sql,f.p);res.json(rows);
  }catch(e){res.status(500).json({error:e.message});}
});

router.get('/reserves/by-adjuster', async (req,res)=>{
  const {from,to}=req.query; const f=bmf(from,to);
  try{const sql=`
    SELECT COALESCE(adj.full_legal_name,'Adjuster '||fcc.adjuster_key) AS adjuster,
      COUNT(DISTINCT fcc.claim_key) AS claims,
      COALESCE(SUM(fcc.direct_loss_paid),0) AS paid,
      COALESCE(SUM(fcc.direct_loss_reserve),0) AS reserve,
      CASE WHEN SUM(fcc.direct_loss_reserve)>0
           THEN ROUND(SUM(fcc.direct_loss_paid)*100.0/SUM(fcc.direct_loss_reserve),1) ELSE 0 END AS ratio
    FROM reporting.fact_claim_component fcc
    JOIN reporting.dim_book_month bm ON bm.book_month_key=fcc.book_month_key
    LEFT JOIN reporting.dim_adjuster adj ON adj.adjuster_key=fcc.adjuster_key
    WHERE 1=1 ${f.w} GROUP BY adjuster ORDER BY reserve DESC LIMIT 10;`;
    const{rows}=await pool.query(sql,f.p);res.json(rows);
  }catch(e){res.status(500).json({error:e.message});}
});

// =====================================================================
//  4. REPUDIATION AUDIT TRAIL
// =====================================================================
router.get('/repudiation/kpis', async (req,res)=>{
  const {from,to}=req.query; const f=bmf(from,to);
  try{const sql=`
    SELECT
      COUNT(DISTINCT fcc.claim_key) AS total_claims,
      SUM(fcc.direct_closed_with_payment_claim_count) AS closed_with_payment,
      SUM(fcc.direct_closed_without_payment_claim_count) AS closed_without_payment,
      SUM(fcc.direct_closed_claim_count) AS total_closed,
      SUM(fcc.direct_open_claim_count) AS open_claims,
      SUM(fcc.direct_reopened_claim_count) AS reopened,
      COALESCE(SUM(fcc.direct_loss_paid),0) AS total_paid,
      CASE WHEN SUM(fcc.direct_closed_claim_count)>0
           THEN ROUND(SUM(fcc.direct_closed_without_payment_claim_count)*100.0/SUM(fcc.direct_closed_claim_count),1) ELSE 0 END AS denial_rate
    FROM reporting.fact_claim_component fcc
    JOIN reporting.dim_book_month bm ON bm.book_month_key=fcc.book_month_key
    WHERE 1=1 ${f.w};`;
    const{rows}=await pool.query(sql,f.p);res.json(rows[0]||{});
  }catch(e){res.status(500).json({error:e.message});}
});

router.get('/repudiation/by-lob', async (req,res)=>{
  const {from,to}=req.query; const f=bmf(from,to);
  try{const sql=`
    SELECT COALESCE(lob.line_of_business_description,'Unknown') AS lob,
      SUM(fcc.direct_closed_with_payment_claim_count) AS with_payment,
      SUM(fcc.direct_closed_without_payment_claim_count) AS without_payment,
      SUM(fcc.direct_closed_claim_count) AS total_closed,
      CASE WHEN SUM(fcc.direct_closed_claim_count)>0
           THEN ROUND(SUM(fcc.direct_closed_without_payment_claim_count)*100.0/SUM(fcc.direct_closed_claim_count),1) ELSE 0 END AS denial_rate
    FROM reporting.fact_claim_component fcc
    JOIN reporting.dim_book_month bm ON bm.book_month_key=fcc.book_month_key
    LEFT JOIN reporting.dim_line_of_business lob ON lob.line_of_business_key=fcc.line_of_business_key
    WHERE 1=1 ${f.w} GROUP BY lob.line_of_business_description ORDER BY denial_rate DESC;`;
    const{rows}=await pool.query(sql,f.p);res.json(rows);
  }catch(e){res.status(500).json({error:e.message});}
});

// =====================================================================
//  5. CLAIMS ANALYTICS SUITE
// =====================================================================
router.get('/analytics/kpis', async (req,res)=>{
  const {from,to}=req.query;
  const f1=bmf(from,to,'bm',1); const f2=bmf(from,to,'bm',f1.n);
  try{const sql=`
    WITH clm AS (
      SELECT COUNT(DISTINCT fcc.claim_key) AS total_claims,
        COALESCE(SUM(fcc.direct_loss_paid),0) AS paid,
        COALESCE(SUM(fcc.direct_loss_reserve),0) AS reserve,
        COALESCE(SUM(fcc.direct_salvage_received),0) AS salvage,
        COALESCE(SUM(fcc.direct_subrogation_received),0) AS subrogation,
        COALESCE(SUM(fcc.direct_ao_paid+fcc.direct_dcc_paid),0) AS alae,
        ROUND(AVG(fcc.direct_claim_days_open),1) AS avg_tat,
        SUM(fcc.direct_open_claim_count) AS open_ct
      FROM reporting.fact_claim_component fcc
      JOIN reporting.dim_book_month bm ON bm.book_month_key=fcc.book_month_key
      WHERE 1=1 ${f1.w}
    ), prem AS (
      SELECT COALESCE(SUM(fpt.direct_earned_premium),0) AS earned
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key
      WHERE 1=1 ${f2.w}
    )
    SELECT c.*, p.earned,
      CASE WHEN p.earned>0 THEN ROUND(c.paid*100.0/p.earned,1) ELSE 0 END AS loss_ratio
    FROM clm c, prem p;`;
    const{rows}=await pool.query(sql,[...f1.p,...f2.p]);res.json(rows[0]||{});
  }catch(e){res.status(500).json({error:e.message});}
});

router.get('/analytics/by-lob', async (req,res)=>{
  const {from,to}=req.query;
  const f1=bmf(from,to,'bm',1); const f2=bmf(from,to,'bm',f1.n);
  try{const sql=`
    WITH clm AS (
      SELECT fcc.line_of_business_key,
        COUNT(DISTINCT fcc.claim_key) AS claims,
        COALESCE(SUM(fcc.direct_loss_paid),0) AS paid,
        COALESCE(SUM(fcc.direct_salvage_received),0) AS salvage,
        COALESCE(SUM(fcc.direct_subrogation_received),0) AS subro,
        ROUND(AVG(fcc.direct_claim_days_open),1) AS avg_tat
      FROM reporting.fact_claim_component fcc
      JOIN reporting.dim_book_month bm ON bm.book_month_key=fcc.book_month_key
      WHERE 1=1 ${f1.w} GROUP BY fcc.line_of_business_key
    ), prem AS (
      SELECT fpt.line_of_business_key, COALESCE(SUM(fpt.direct_earned_premium),0) AS earned
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key
      WHERE 1=1 ${f2.w} GROUP BY fpt.line_of_business_key
    )
    SELECT COALESCE(lob.line_of_business_description,'Unknown') AS lob,
      c.claims, c.paid, c.salvage, c.subro, c.avg_tat,
      COALESCE(p.earned,0) AS earned,
      CASE WHEN COALESCE(p.earned,0)>0 THEN ROUND(c.paid*100.0/p.earned,1) ELSE 0 END AS loss_ratio
    FROM clm c LEFT JOIN prem p ON p.line_of_business_key=c.line_of_business_key
    LEFT JOIN reporting.dim_line_of_business lob ON lob.line_of_business_key=c.line_of_business_key
    ORDER BY c.paid DESC;`;
    const{rows}=await pool.query(sql,[...f1.p,...f2.p]);res.json(rows);
  }catch(e){res.status(500).json({error:e.message});}
});

// =====================================================================
//  6. IRDAI COMPLIANCE ENGINE
// =====================================================================
router.get('/compliance/kpis', async (req,res)=>{
  const {from,to}=req.query; const f=bmf(from,to);
  try{const sql=`
    SELECT
      COUNT(DISTINCT fcc.claim_key) AS total_claims,
      COUNT(DISTINCT CASE WHEN fcc.direct_claim_days_open>30 THEN fcc.claim_key END) AS tat_breaches,
      CASE WHEN COUNT(DISTINCT fcc.claim_key)>0
           THEN ROUND(COUNT(DISTINCT CASE WHEN fcc.direct_claim_days_open>30 THEN fcc.claim_key END)*100.0
                      / COUNT(DISTINCT fcc.claim_key),1) ELSE 0 END AS breach_rate,
      COUNT(DISTINCT CASE WHEN fcc.direct_claim_days_open<=30 THEN fcc.claim_key END) AS compliant_claims,
      ROUND(AVG(fcc.direct_claim_days_open),1) AS avg_tat,
      SUM(fcc.direct_closed_claim_count) AS closed_total,
      SUM(fcc.direct_closed_without_payment_claim_count) AS denied_total,
      COALESCE(SUM(fcc.direct_loss_paid),0) AS total_paid
    FROM reporting.fact_claim_component fcc
    JOIN reporting.dim_book_month bm ON bm.book_month_key=fcc.book_month_key
    WHERE 1=1 ${f.w};`;
    const{rows}=await pool.query(sql,f.p);res.json(rows[0]||{});
  }catch(e){res.status(500).json({error:e.message});}
});

router.get('/compliance/by-lob', async (req,res)=>{
  const {from,to}=req.query; const f=bmf(from,to);
  try{const sql=`
    SELECT COALESCE(lob.line_of_business_description,'Unknown') AS lob,
      COUNT(DISTINCT fcc.claim_key) AS claims,
      COUNT(DISTINCT CASE WHEN fcc.direct_claim_days_open>30 THEN fcc.claim_key END) AS breaches,
      CASE WHEN COUNT(DISTINCT fcc.claim_key)>0
           THEN ROUND(COUNT(DISTINCT CASE WHEN fcc.direct_claim_days_open>30 THEN fcc.claim_key END)*100.0
                      / COUNT(DISTINCT fcc.claim_key),1) ELSE 0 END AS breach_rate,
      ROUND(AVG(fcc.direct_claim_days_open),1) AS avg_tat
    FROM reporting.fact_claim_component fcc
    JOIN reporting.dim_book_month bm ON bm.book_month_key=fcc.book_month_key
    LEFT JOIN reporting.dim_line_of_business lob ON lob.line_of_business_key=fcc.line_of_business_key
    WHERE 1=1 ${f.w} GROUP BY lob.line_of_business_description ORDER BY breach_rate DESC;`;
    const{rows}=await pool.query(sql,f.p);res.json(rows);
  }catch(e){res.status(500).json({error:e.message});}
});

export default router;
