import { Controller, Get, Query } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Controller('policy')
export class PolicyUsecasesController {
  constructor(private readonly db: DatabaseService) {}

  // =====================================================================
  //  1. POLICY MID-TERM CHANGE & AMENDMENT TRACKER
  // =====================================================================

  @Get('amendments/kpis')
  async amendmentsKpis(@Query('from') from?: string, @Query('to') to?: string) {
    const f = this.db.bmFilter(from, to);
    const sql = `
      SELECT
        COUNT(*) AS total_transactions,
        COUNT(DISTINCT fpt.policy_key) AS policies_with_changes,
        COUNT(DISTINCT fpt.event_type_code) AS event_types,
        COALESCE(SUM(fpt.direct_endorsement_premium),0) AS endorsement_premium,
        COALESCE(SUM(fpt.direct_reinstatement_premium),0) AS reinstatement_premium,
        COALESCE(SUM(fpt.direct_written_premium),0) AS total_written,
        COALESCE(SUM(fpt.endorsement_count),0) AS endorsement_count,
        CASE WHEN COUNT(DISTINCT fpt.policy_key)>0
             THEN ROUND(COUNT(*)::numeric / COUNT(DISTINCT fpt.policy_key),1)
             ELSE 0 END AS avg_amendments_per_policy
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
      WHERE 1=1 ${f.where};
    `;
    const { rows } = await this.db.queryWithEnterprise(sql, f.params);
    return rows[0] || {};
  }

  @Get('amendments/by-event-type')
  async amendmentsByEventType(@Query('from') from?: string, @Query('to') to?: string) {
    const f = this.db.bmFilter(from, to);
    const sql = `
      SELECT
        COALESCE(fpt.event_type_code::text, 'UNKNOWN') AS event_type,
        COUNT(*) AS txn_count,
        COUNT(DISTINCT fpt.policy_key) AS policies,
        COALESCE(SUM(fpt.direct_written_premium),0) AS premium
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
      WHERE 1=1 ${f.where}
      GROUP BY fpt.event_type_code
      ORDER BY txn_count DESC;
    `;
    const { rows } = await this.db.queryWithEnterprise(sql, f.params);
    return rows;
  }

  @Get('amendments/monthly')
  async amendmentsMonthly(@Query('from') from?: string, @Query('to') to?: string) {
    const f = this.db.bmFilter(from, to);
    const sql = `
      SELECT
        bm.book_year::text AS year,
        bm.book_year AS period,
        COUNT(*) AS transactions,
        COUNT(DISTINCT fpt.policy_key) AS policies,
        COALESCE(SUM(fpt.direct_written_premium),0) AS written_premium,
        COALESCE(SUM(fpt.direct_earned_premium),0) AS earned_premium,
        COUNT(DISTINCT CASE WHEN fpt.reinstated_in_month_indicator='Y' THEN fpt.policy_key END) AS reinstatements
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
      WHERE 1=1 ${f.where}
      GROUP BY bm.book_year ORDER BY bm.book_year;
    `;
    const { rows } = await this.db.queryWithEnterprise(sql, f.params);
    return rows;
  }

  @Get('amendments/by-lob')
  async amendmentsByLob(@Query('from') from?: string, @Query('to') to?: string) {
    const f = this.db.bmFilter(from, to);
    const sql = `
      SELECT
        COALESCE(lob.line_of_business_description,'Unknown') AS lob,
        COUNT(*) AS transactions,
        COUNT(DISTINCT fpt.policy_key) AS policies,
        COALESCE(SUM(fpt.direct_endorsement_premium),0) AS endorsement_premium,
        CASE WHEN COUNT(DISTINCT fpt.policy_key)>0
             THEN ROUND(COUNT(*)::numeric/COUNT(DISTINCT fpt.policy_key),1)
             ELSE 0 END AS avg_per_policy
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
      LEFT JOIN reporting.dim_line_of_business lob ON lob.line_of_business_key = fpt.line_of_business_key
      WHERE 1=1 ${f.where}
      GROUP BY lob.line_of_business_description ORDER BY transactions DESC;
    `;
    const { rows } = await this.db.queryWithEnterprise(sql, f.params);
    return rows;
  }

  // =====================================================================
  //  2. MULTI-STATE & MULTI-LOCATION CONCENTRATION MONITOR
  // =====================================================================

  @Get('concentration/kpis')
  async concentrationKpis(@Query('from') from?: string, @Query('to') to?: string) {
    const f = this.db.bmFilter(from, to);
    const sql = `
      SELECT
        COUNT(DISTINCT fpt.policy_key) AS total_policies,
        COUNT(DISTINCT fpt.geography_key) AS unique_regions,
        COALESCE(SUM(fpt.direct_written_premium),0) AS total_written,
        COALESCE(SUM(fpt.exposure_amount),0) AS total_exposure,
        COALESCE(SUM(fpt.written_exposures),0) AS written_exposures,
        COALESCE(SUM(fpt.ext_gloccagglimit),0) AS aggregate_limit,
        COUNT(DISTINCT CASE WHEN dp.multistate_policy_indicator='Y' THEN fpt.policy_key END) AS multistate_policies
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
      LEFT JOIN reporting.dim_policy dp ON dp.policy_key = fpt.policy_key
      WHERE 1=1 ${f.where};
    `;
    const { rows } = await this.db.queryWithEnterprise(sql, f.params);
    return rows[0] || {};
  }

  @Get('concentration/by-region')
  async concentrationByRegion(@Query('from') from?: string, @Query('to') to?: string) {
    const f = this.db.bmFilter(from, to);
    const sql = `
      SELECT
        COALESCE(g.region_name, g.state_name, 'Region '||fpt.geography_key) AS region,
        COUNT(DISTINCT fpt.policy_key) AS policies,
        COALESCE(SUM(fpt.direct_written_premium),0) AS written,
        COALESCE(SUM(fpt.exposure_amount),0) AS exposure,
        COALESCE(SUM(fpt.written_exposures),0) AS written_exposures
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
      LEFT JOIN reporting.dim_geography g ON g.geography_key = fpt.geography_key
      WHERE 1=1 ${f.where}
      GROUP BY COALESCE(g.region_name, g.state_name, 'Region '||fpt.geography_key)
      ORDER BY written DESC LIMIT 10;
    `;
    const { rows } = await this.db.queryWithEnterprise(sql, f.params);
    return rows;
  }

  @Get('concentration/by-lob')
  async concentrationByLob(@Query('from') from?: string, @Query('to') to?: string) {
    const f = this.db.bmFilter(from, to);
    const sql = `
      SELECT
        COALESCE(lob.line_of_business_description,'Unknown') AS lob,
        COUNT(DISTINCT fpt.policy_key) AS policies,
        COALESCE(SUM(fpt.direct_written_premium),0) AS written,
        COALESCE(SUM(fpt.exposure_amount),0) AS exposure,
        COALESCE(SUM(fpt.ext_covllimit),0) AS coverage_limit
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
      LEFT JOIN reporting.dim_line_of_business lob ON lob.line_of_business_key = fpt.line_of_business_key
      WHERE 1=1 ${f.where}
      GROUP BY lob.line_of_business_description ORDER BY written DESC;
    `;
    const { rows } = await this.db.queryWithEnterprise(sql, f.params);
    return rows;
  }

  @Get('concentration/by-territory')
  async concentrationByTerritory(@Query('from') from?: string, @Query('to') to?: string) {
    const f = this.db.bmFilter(from, to);
    const sql = `
      SELECT
        COALESCE(rt.rating_territory_code,'T-'||fpt.rating_territory_key) AS territory,
        COUNT(DISTINCT fpt.policy_key) AS policies,
        COALESCE(SUM(fpt.direct_written_premium),0) AS written,
        COALESCE(SUM(fpt.written_exposures),0) AS exposures
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
      LEFT JOIN reporting.dim_rating_territory rt ON rt.rating_territory_key = fpt.rating_territory_key
      WHERE 1=1 ${f.where}
      GROUP BY COALESCE(rt.rating_territory_code,'T-'||fpt.rating_territory_key)
      ORDER BY written DESC LIMIT 10;
    `;
    const { rows } = await this.db.queryWithEnterprise(sql, f.params);
    return rows;
  }

  // =====================================================================
  //  3. FACULTATIVE REINSURANCE & SPECIAL POLICY FLAG MONITOR
  // =====================================================================

  @Get('special-flags/kpis')
  async specialFlagsKpis(@Query('from') from?: string, @Query('to') to?: string) {
    const f = this.db.bmFilter(from, to);
    const sql = `
      SELECT
        COUNT(DISTINCT fpt.policy_key) AS total_policies,
        COUNT(DISTINCT CASE WHEN dp.facultative_reinsurance_indicator='Y' THEN fpt.policy_key END) AS fac_ri_policies,
        COALESCE(SUM(CASE WHEN dp.facultative_reinsurance_indicator='Y' THEN fpt.direct_written_premium ELSE 0 END),0) AS fac_ri_premium,
        COUNT(DISTINCT CASE WHEN dp.claims_made_date IS NOT NULL THEN fpt.policy_key END) AS claims_made_policies,
        COUNT(DISTINCT CASE WHEN dp.isbound='Y' THEN fpt.policy_key END) AS bound_policies,
        COUNT(DISTINCT CASE WHEN dp.isbound='N' OR dp.isbound IS NULL THEN fpt.policy_key END) AS unbound_policies,
        COALESCE(SUM(fpt.direct_written_premium),0) AS total_written,
        COALESCE(SUM(fpt.direct_earned_premium),0) AS total_earned
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
      LEFT JOIN reporting.dim_policy dp ON dp.policy_key = fpt.policy_key
      WHERE 1=1 ${f.where};
    `;
    const { rows } = await this.db.queryWithEnterprise(sql, f.params);
    return rows[0] || {};
  }

  @Get('special-flags/by-flag')
  async specialFlagsByFlag(@Query('from') from?: string, @Query('to') to?: string) {
    const f = this.db.bmFilter(from, to);
    const sql = `
      SELECT flag, policies, premium FROM (
        SELECT 'Facultative RI' AS flag,
               COUNT(DISTINCT CASE WHEN dp.facultative_reinsurance_indicator='Y' THEN fpt.policy_key END) AS policies,
               COALESCE(SUM(CASE WHEN dp.facultative_reinsurance_indicator='Y' THEN fpt.direct_written_premium ELSE 0 END),0) AS premium
        FROM reporting.fact_policy_transaction fpt
        JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
        LEFT JOIN reporting.dim_policy dp ON dp.policy_key = fpt.policy_key
        WHERE 1=1 ${f.where}
      ) t1
      UNION ALL
      SELECT * FROM (
        SELECT 'Claims-Made' AS flag,
               COUNT(DISTINCT CASE WHEN dp.claims_made_date IS NOT NULL THEN fpt.policy_key END),
               COALESCE(SUM(CASE WHEN dp.claims_made_date IS NOT NULL THEN fpt.direct_written_premium ELSE 0 END),0)
        FROM reporting.fact_policy_transaction fpt
        JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
        LEFT JOIN reporting.dim_policy dp ON dp.policy_key = fpt.policy_key
        WHERE 1=1 ${f.where}
      ) t2
      UNION ALL
      SELECT * FROM (
        SELECT 'Bound' AS flag,
               COUNT(DISTINCT CASE WHEN dp.isbound='Y' THEN fpt.policy_key END),
               COALESCE(SUM(CASE WHEN dp.isbound='Y' THEN fpt.direct_written_premium ELSE 0 END),0)
        FROM reporting.fact_policy_transaction fpt
        JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
        LEFT JOIN reporting.dim_policy dp ON dp.policy_key = fpt.policy_key
        WHERE 1=1 ${f.where}
      ) t3
      UNION ALL
      SELECT * FROM (
        SELECT 'Inforce' AS flag,
               COUNT(DISTINCT CASE WHEN fpt.inforce_indicator='Y' THEN fpt.policy_key END),
               COALESCE(SUM(CASE WHEN fpt.inforce_indicator='Y' THEN fpt.direct_written_premium ELSE 0 END),0)
        FROM reporting.fact_policy_transaction fpt
        JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
        WHERE 1=1 ${f.where}
      ) t4
      UNION ALL
      SELECT * FROM (
        SELECT 'Multistate' AS flag,
               COUNT(DISTINCT CASE WHEN dp.multistate_policy_indicator='Y' THEN fpt.policy_key END),
               COALESCE(SUM(CASE WHEN dp.multistate_policy_indicator='Y' THEN fpt.direct_written_premium ELSE 0 END),0)
        FROM reporting.fact_policy_transaction fpt
        JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
        LEFT JOIN reporting.dim_policy dp ON dp.policy_key = fpt.policy_key
        WHERE 1=1 ${f.where}
      ) t5
      ORDER BY premium DESC;
    `;
    const { rows } = await this.db.queryWithEnterprise(sql, f.params);
    return rows;
  }

  @Get('special-flags/by-lob')
  async specialFlagsByLob(@Query('from') from?: string, @Query('to') to?: string) {
    const f = this.db.bmFilter(from, to);
    const sql = `
      SELECT
        COALESCE(lob.line_of_business_description,'Unknown') AS lob,
        COUNT(DISTINCT fpt.policy_key) AS policies,
        COUNT(DISTINCT CASE WHEN dp.facultative_reinsurance_indicator='Y' THEN fpt.policy_key END) AS fac_ri,
        COUNT(DISTINCT CASE WHEN dp.claims_made_date IS NOT NULL THEN fpt.policy_key END) AS claims_made,
        COALESCE(SUM(fpt.direct_written_premium),0) AS written
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
      LEFT JOIN reporting.dim_policy dp ON dp.policy_key = fpt.policy_key
      LEFT JOIN reporting.dim_line_of_business lob ON lob.line_of_business_key = fpt.line_of_business_key
      WHERE 1=1 ${f.where}
      GROUP BY lob.line_of_business_description ORDER BY written DESC;
    `;
    const { rows } = await this.db.queryWithEnterprise(sql, f.params);
    return rows;
  }

  // =====================================================================
  //  4. POLICY VINTAGE & COHORT LOSS DEVELOPMENT
  // =====================================================================

  @Get('vintage/kpis')
  async vintageKpis(@Query('from') from?: string, @Query('to') to?: string) {
    const f1 = this.db.bmFilter(from, to, 'bm', 1);
    const f2 = this.db.bmFilter(from, to, 'bm', f1.nextIdx);
    const sql = `
      WITH pol AS (
        SELECT fpt.policy_key,
               (EXTRACT(YEAR FROM NULLIF(BTRIM(dp.original_inception_date::text), '')::timestamp))::int AS inception_year,
               fpt.direct_written_premium, fpt.direct_earned_premium,
               fpt.new_or_renewal_code
        FROM reporting.fact_policy_transaction fpt
        JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
        LEFT JOIN reporting.dim_policy dp ON dp.policy_key = fpt.policy_key
        WHERE 1=1 ${f1.where}
      ),
      clm AS (
        SELECT fcc.policy_key,
               COALESCE(fcc.direct_loss_paid_itd,0) + COALESCE(fcc.direct_loss_reserve,0) + COALESCE(fcc.direct_ibnr_loss_reserve,0) AS ultimate
        FROM reporting.fact_claim_component fcc
        JOIN reporting.dim_book_month bm ON bm.book_month_key = fcc.book_month_key
        WHERE 1=1 ${f2.where}
      )
      SELECT
        COUNT(DISTINCT pol.policy_key) AS total_policies,
        COUNT(DISTINCT pol.inception_year) AS cohort_count,
        COALESCE(SUM(pol.direct_written_premium),0) AS total_written,
        COALESCE(SUM(pol.direct_earned_premium),0) AS total_earned,
        COALESCE(SUM(c.ultimate),0) AS total_ultimate,
        CASE WHEN SUM(pol.direct_earned_premium)>0
             THEN ROUND(SUM(COALESCE(c.ultimate,0))*100.0/SUM(pol.direct_earned_premium),1)
             ELSE 0 END AS ultimate_loss_ratio
      FROM pol LEFT JOIN clm c ON c.policy_key = pol.policy_key;
    `;
    const { rows } = await this.db.queryWithEnterprise(sql, [...f1.params, ...f2.params]);
    return rows[0] || {};
  }

  @Get('vintage/by-cohort')
  async vintageByCohort(@Query('from') from?: string, @Query('to') to?: string) {
    const f1 = this.db.bmFilter(from, to, 'bm', 1);
    const f2 = this.db.bmFilter(from, to, 'bm', f1.nextIdx);
    const sql = `
      WITH pol AS (
        SELECT fpt.policy_key,
               COALESCE((EXTRACT(YEAR FROM NULLIF(BTRIM(dp.original_inception_date::text), '')::timestamp))::int, bm.book_year) AS cohort,
               fpt.direct_written_premium, fpt.direct_earned_premium,
               fpt.new_or_renewal_code
        FROM reporting.fact_policy_transaction fpt
        JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
        LEFT JOIN reporting.dim_policy dp ON dp.policy_key = fpt.policy_key
        WHERE 1=1 ${f1.where}
      ),
      clm AS (
        SELECT fcc.policy_key,
               COALESCE(fcc.direct_loss_paid,0) AS paid,
               COALESCE(fcc.direct_loss_reserve,0) AS reserve,
               COALESCE(fcc.direct_ibnr_loss_reserve,0) AS ibnr
        FROM reporting.fact_claim_component fcc
        JOIN reporting.dim_book_month bm ON bm.book_month_key = fcc.book_month_key
        WHERE 1=1 ${f2.where}
      )
      SELECT
        pol.cohort,
        COUNT(DISTINCT pol.policy_key) AS policies,
        COALESCE(SUM(pol.direct_written_premium),0) AS written,
        COALESCE(SUM(pol.direct_earned_premium),0) AS earned,
        COALESCE(SUM(c.paid),0) AS paid,
        COALESCE(SUM(c.reserve),0) AS reserve,
        COALESCE(SUM(c.ibnr),0) AS ibnr,
        COALESCE(SUM(c.paid)+SUM(c.reserve)+SUM(c.ibnr),0) AS ultimate,
        CASE WHEN SUM(pol.direct_earned_premium)>0
             THEN ROUND((COALESCE(SUM(c.paid),0)+COALESCE(SUM(c.reserve),0)+COALESCE(SUM(c.ibnr),0))*100.0
                        / SUM(pol.direct_earned_premium),1)
             ELSE 0 END AS ultimate_lr,
        COUNT(DISTINCT CASE WHEN pol.new_or_renewal_code='NEW' THEN pol.policy_key END) AS new_biz,
        COUNT(DISTINCT CASE WHEN pol.new_or_renewal_code='RNW' THEN pol.policy_key END) AS renewals
      FROM pol LEFT JOIN clm c ON c.policy_key = pol.policy_key
      GROUP BY pol.cohort ORDER BY pol.cohort;
    `;
    const { rows } = await this.db.queryWithEnterprise(sql, [...f1.params, ...f2.params]);
    return rows;
  }

  @Get('vintage/nb-vs-renewal')
  async vintageNbVsRenewal(@Query('from') from?: string, @Query('to') to?: string) {
    const f1 = this.db.bmFilter(from, to, 'bm', 1);
    const f2 = this.db.bmFilter(from, to, 'bm', f1.nextIdx);
    const sql = `
      WITH pol AS (
        SELECT fpt.policy_key, fpt.new_or_renewal_code,
               fpt.direct_earned_premium
        FROM reporting.fact_policy_transaction fpt
        JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
        WHERE 1=1 ${f1.where}
      ),
      clm AS (
        SELECT fcc.policy_key,
               COALESCE(SUM(fcc.direct_loss_paid+fcc.direct_ao_paid+fcc.direct_dcc_paid),0) AS incurred
        FROM reporting.fact_claim_component fcc
        JOIN reporting.dim_book_month bm ON bm.book_month_key = fcc.book_month_key
        WHERE 1=1 ${f2.where}
        GROUP BY fcc.policy_key
      )
      SELECT
        CASE WHEN pol.new_or_renewal_code='NEW' THEN 'New Business'
             WHEN pol.new_or_renewal_code='RNW' THEN 'Renewal'
             ELSE 'Other' END AS segment,
        COUNT(DISTINCT pol.policy_key) AS policies,
        COALESCE(SUM(pol.direct_earned_premium),0) AS earned,
        COALESCE(SUM(c.incurred),0) AS incurred,
        CASE WHEN SUM(pol.direct_earned_premium)>0
             THEN ROUND(SUM(COALESCE(c.incurred,0))*100.0/SUM(pol.direct_earned_premium),1)
             ELSE 0 END AS loss_ratio
      FROM pol LEFT JOIN clm c ON c.policy_key = pol.policy_key
      GROUP BY segment ORDER BY earned DESC;
    `;
    const { rows } = await this.db.queryWithEnterprise(sql, [...f1.params, ...f2.params]);
    return rows;
  }

  // =====================================================================
  //  5. POLICY TERM PREMIUM vs ACTUAL EARNED RECONCILIATION
  // =====================================================================

  @Get('term-recon/kpis')
  async termReconKpis(@Query('from') from?: string, @Query('to') to?: string) {
    const f = this.db.bmFilter(from, to);
    const sql = `
      SELECT
        COUNT(DISTINCT fpt.policy_key) AS total_policies,
        COALESCE(SUM(fpt.term_premium_amount),0) AS total_term_premium,
        COALESCE(SUM(fpt.direct_earned_premium),0) AS total_earned,
        COALESCE(SUM(fpt.direct_unearned_premium),0) AS total_unearned,
        COALESCE(SUM(fpt.direct_written_premium),0) AS total_written,
        COALESCE(SUM(fpt.term_premium_amount) - SUM(fpt.direct_earned_premium),0) AS earning_shortfall,
        CASE WHEN SUM(fpt.term_premium_amount)>0
             THEN ROUND(SUM(fpt.direct_earned_premium)*100.0/SUM(fpt.term_premium_amount),1)
             ELSE 0 END AS earning_accuracy_pct,
        COALESCE(SUM(fpt.minimum_earned_premium_amount),0) AS min_earned_total,
        COUNT(DISTINCT CASE WHEN fpt.direct_earned_premium < COALESCE(fpt.minimum_earned_premium_amount,0)
                              AND fpt.minimum_earned_premium_amount > 0 THEN fpt.policy_key END) AS min_earned_breaches,
        COUNT(DISTINCT CASE WHEN fpt.inforce_indicator='Y' THEN fpt.policy_key END) AS inforce_count
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
      WHERE 1=1 ${f.where};
    `;
    const { rows } = await this.db.queryWithEnterprise(sql, f.params);
    return rows[0] || {};
  }

  @Get('term-recon/by-lob')
  async termReconByLob(@Query('from') from?: string, @Query('to') to?: string) {
    const f = this.db.bmFilter(from, to);
    const sql = `
      SELECT
        COALESCE(lob.line_of_business_description,'Unknown') AS lob,
        COUNT(DISTINCT fpt.policy_key) AS policies,
        COALESCE(SUM(fpt.term_premium_amount),0) AS term_premium,
        COALESCE(SUM(fpt.direct_earned_premium),0) AS earned,
        COALESCE(SUM(fpt.direct_unearned_premium),0) AS unearned,
        COALESCE(SUM(fpt.term_premium_amount)-SUM(fpt.direct_earned_premium),0) AS shortfall,
        CASE WHEN SUM(fpt.term_premium_amount)>0
             THEN ROUND(SUM(fpt.direct_earned_premium)*100.0/SUM(fpt.term_premium_amount),1)
             ELSE 0 END AS accuracy_pct
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
      LEFT JOIN reporting.dim_line_of_business lob ON lob.line_of_business_key = fpt.line_of_business_key
      WHERE 1=1 ${f.where}
      GROUP BY lob.line_of_business_description ORDER BY shortfall DESC;
    `;
    const { rows } = await this.db.queryWithEnterprise(sql, f.params);
    return rows;
  }

  @Get('term-recon/by-product')
  async termReconByProduct(@Query('from') from?: string, @Query('to') to?: string) {
    const f = this.db.bmFilter(from, to);
    const sql = `
      SELECT
        COALESCE(p.licensed_product_name,'Product '||fpt.product_key) AS product,
        COUNT(DISTINCT fpt.policy_key) AS policies,
        COALESCE(SUM(fpt.term_premium_amount),0) AS term_premium,
        COALESCE(SUM(fpt.direct_earned_premium),0) AS earned,
        COALESCE(SUM(fpt.term_premium_amount)-SUM(fpt.direct_earned_premium),0) AS shortfall,
        CASE WHEN SUM(fpt.term_premium_amount)>0
             THEN ROUND(SUM(fpt.direct_earned_premium)*100.0/SUM(fpt.term_premium_amount),1)
             ELSE 0 END AS accuracy_pct
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
      LEFT JOIN reporting.dim_product p ON p.product_key = fpt.product_key
      WHERE 1=1 ${f.where}
      GROUP BY product ORDER BY shortfall DESC LIMIT 10;
    `;
    const { rows } = await this.db.queryWithEnterprise(sql, f.params);
    return rows;
  }

  @Get('term-recon/yearly')
  async termReconYearly(@Query('from') from?: string, @Query('to') to?: string) {
    const f = this.db.bmFilter(from, to);
    const sql = `
      SELECT
        bm.book_year::text AS year,
        COALESCE(SUM(fpt.term_premium_amount),0) AS term_premium,
        COALESCE(SUM(fpt.direct_earned_premium),0) AS earned,
        COALESCE(SUM(fpt.direct_unearned_premium),0) AS unearned,
        COALESCE(SUM(fpt.term_premium_amount)-SUM(fpt.direct_earned_premium),0) AS shortfall
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
      WHERE 1=1 ${f.where}
      GROUP BY bm.book_year ORDER BY bm.book_year;
    `;
    const { rows } = await this.db.queryWithEnterprise(sql, f.params);
    return rows;
  }

  // =====================================================================
  //  6. POLICY FORM & COVERAGE PERIL COMPLETENESS AUDIT
  // =====================================================================

  @Get('peril-audit/kpis')
  async perilAuditKpis(@Query('from') from?: string, @Query('to') to?: string) {
    const f = this.db.bmFilter(from, to);
    const sql = `
      SELECT
        COUNT(DISTINCT fpt.policy_key) AS total_policies,
        COUNT(DISTINCT fpt.coverage_key) AS unique_coverages,
        COUNT(DISTINCT fpt.form_key) AS unique_forms,
        COUNT(DISTINCT CASE WHEN fpt.inforce_indicator='Y' THEN fpt.policy_key END) AS inforce_policies,
        COUNT(DISTINCT CASE WHEN fm.policy_form_number IS NULL THEN fpt.policy_key END) AS missing_form_policies,
        CASE WHEN COUNT(DISTINCT CASE WHEN fpt.inforce_indicator='Y' THEN fpt.policy_key END)>0
             THEN ROUND(COUNT(DISTINCT CASE WHEN fm.policy_form_number IS NULL THEN fpt.policy_key END)*100.0
                        / COUNT(DISTINCT CASE WHEN fpt.inforce_indicator='Y' THEN fpt.policy_key END),1)
             ELSE 0 END AS missing_form_rate,
        COUNT(DISTINCT cov.coverage_code) AS coverage_codes,
        COUNT(DISTINCT cov.coverage_group_code) AS coverage_groups
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
      LEFT JOIN reporting.dim_form fm ON fm.form_key = fpt.form_key
      LEFT JOIN reporting.dim_coverage cov ON cov.coverage_key = fpt.coverage_key
      WHERE 1=1 ${f.where};
    `;
    const { rows } = await this.db.queryWithEnterprise(sql, f.params);
    return rows[0] || {};
  }

  @Get('peril-audit/by-lob')
  async perilAuditByLob(@Query('from') from?: string, @Query('to') to?: string) {
    const f = this.db.bmFilter(from, to);
    const sql = `
      SELECT
        COALESCE(lob.line_of_business_description,'Unknown') AS lob,
        COUNT(DISTINCT fpt.policy_key) AS policies,
        COUNT(DISTINCT fpt.coverage_key) AS coverages,
        COUNT(DISTINCT fpt.form_key) AS forms,
        COUNT(DISTINCT CASE WHEN fm.policy_form_number IS NULL THEN fpt.policy_key END) AS missing_forms,
        CASE WHEN COUNT(DISTINCT fpt.policy_key)>0
             THEN ROUND(COUNT(DISTINCT CASE WHEN fm.policy_form_number IS NULL THEN fpt.policy_key END)*100.0
                        / COUNT(DISTINCT fpt.policy_key),1)
             ELSE 0 END AS missing_form_rate,
        COALESCE(SUM(fpt.direct_written_premium),0) AS written
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
      LEFT JOIN reporting.dim_form fm ON fm.form_key = fpt.form_key
      LEFT JOIN reporting.dim_line_of_business lob ON lob.line_of_business_key = fpt.line_of_business_key
      WHERE 1=1 ${f.where}
      GROUP BY lob.line_of_business_description ORDER BY missing_forms DESC;
    `;
    const { rows } = await this.db.queryWithEnterprise(sql, f.params);
    return rows;
  }

  @Get('peril-audit/by-coverage')
  async perilAuditByCoverage(@Query('from') from?: string, @Query('to') to?: string) {
    const f = this.db.bmFilter(from, to);
    const sql = `
      SELECT
        COALESCE(cov.coverage_description, 'Coverage '||fpt.coverage_key) AS coverage,
        COALESCE(cov.coverage_group_description,'Unknown') AS coverage_group,
        COUNT(DISTINCT fpt.policy_key) AS policies,
        COUNT(DISTINCT fpt.form_key) AS forms,
        COALESCE(SUM(fpt.direct_written_premium),0) AS written
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
      LEFT JOIN reporting.dim_coverage cov ON cov.coverage_key = fpt.coverage_key
      WHERE 1=1 ${f.where}
      GROUP BY coverage, coverage_group ORDER BY policies DESC LIMIT 12;
    `;
    const { rows } = await this.db.queryWithEnterprise(sql, f.params);
    return rows;
  }

  @Get('peril-audit/form-detail')
  async perilAuditFormDetail(@Query('from') from?: string, @Query('to') to?: string) {
    const f = this.db.bmFilter(from, to);
    const sql = `
      SELECT
        COALESCE(fm.policy_form_number,'(Missing)') AS form_number,
        COALESCE(fm.policy_form_description,'No Description') AS form_description,
        COUNT(DISTINCT fpt.policy_key) AS policies,
        COUNT(DISTINCT fpt.coverage_key) AS coverages,
        COALESCE(SUM(fpt.direct_written_premium),0) AS written
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
      LEFT JOIN reporting.dim_form fm ON fm.form_key = fpt.form_key
      WHERE 1=1 ${f.where}
      GROUP BY fm.policy_form_number, fm.policy_form_description
      ORDER BY policies DESC LIMIT 15;
    `;
    const { rows } = await this.db.queryWithEnterprise(sql, f.params);
    return rows;
  }
}
