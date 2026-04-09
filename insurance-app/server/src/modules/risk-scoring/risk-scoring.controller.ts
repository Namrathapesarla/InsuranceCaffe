import {
  Controller,
  Get,
  InternalServerErrorException,
  Query,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Controller('risk-scoring')
export class RiskScoringController {
  constructor(private readonly db: DatabaseService) {}

  private async queryEnt(sql: string, params: unknown[]) {
    try {
      return await this.db.queryWithEnterprise(sql, params);
    } catch (e) {
      throw new InternalServerErrorException(
        e instanceof Error ? e.message : 'query failed',
      );
    }
  }

  /* ================================================================== */
  /*  1. KPIs                                                           */
  /* ================================================================== */
  @Get('kpis')
  async kpis(@Query('from') from: string, @Query('to') to: string) {
    const f1 = this.db.bmFilter(from, to, 'bm', 1);
    const f2 = this.db.bmFilter(from, to, 'bm', f1.nextIdx);
    const sql = `
      WITH pol AS (
        SELECT
          fpt.policy_key,
          fpt.direct_written_premium,
          fpt.direct_earned_premium,
          fpt.new_or_renewal_code,
          fpt.event_type_code
        FROM reporting.fact_policy_transaction fpt
        JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
        WHERE 1=1 ${f1.where}
      ),
      clm AS (
        SELECT
          fcc.direct_loss_paid + fcc.direct_ao_paid + fcc.direct_dcc_paid AS incurred
        FROM reporting.fact_claim_component fcc
        JOIN reporting.dim_book_month bm ON bm.book_month_key = fcc.book_month_key
        WHERE 1=1 ${f2.where}
      ),
      agg AS (
        SELECT
          COUNT(DISTINCT policy_key) AS total_policies,
          COALESCE(SUM(direct_written_premium), 0) AS total_dwp,
          COALESCE(SUM(direct_earned_premium), 0) AS total_earned,
          COUNT(DISTINCT CASE WHEN new_or_renewal_code = 'NEW' THEN policy_key END) AS new_biz,
          COUNT(DISTINCT CASE WHEN new_or_renewal_code = 'RNW' THEN policy_key END) AS renewals
        FROM pol
      ),
      loss AS (
        SELECT COALESCE(SUM(incurred), 0) AS total_incurred FROM clm
      )
      SELECT
        a.total_policies,
        a.total_dwp,
        a.new_biz,
        a.renewals,
        CASE WHEN a.total_policies > 0 THEN ROUND(a.total_dwp / a.total_policies, 0) ELSE 0 END AS avg_premium,
        CASE WHEN a.total_earned > 0 THEN ROUND(l.total_incurred * 100.0 / a.total_earned, 1) ELSE 0 END AS loss_ratio,
        CASE WHEN a.total_policies > 0
          THEN ROUND((a.new_biz + a.renewals)::numeric * 100.0 / a.total_policies, 1)
          ELSE 0 END AS hit_ratio,
        CASE WHEN (a.new_biz + a.renewals) > 0
          THEN ROUND(a.renewals * 100.0 / (a.new_biz + a.renewals), 1)
          ELSE 0 END AS renewal_rate
      FROM agg a, loss l;
    `;
    const { rows } = await this.queryEnt(sql, [...f1.params, ...f2.params]);
    return rows[0] || {};
  }

  /* ================================================================== */
  /*  2. Risk Profile by LOB (premium, loss ratio, policy count)        */
  /* ================================================================== */
  @Get('risk-by-lob')
  async riskByLob(@Query('from') from: string, @Query('to') to: string) {
    const f1 = this.db.bmFilter(from, to, 'bm', 1);
    const f2 = this.db.bmFilter(from, to, 'bm', f1.nextIdx);
    const sql = `
      WITH prem AS (
        SELECT
          fpt.line_of_business_key,
          COUNT(DISTINCT fpt.policy_key) AS policies,
          COALESCE(SUM(fpt.direct_written_premium), 0) AS dwp,
          COALESCE(SUM(fpt.direct_earned_premium), 0) AS earned
        FROM reporting.fact_policy_transaction fpt
        JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
        WHERE 1=1 ${f1.where}
        GROUP BY fpt.line_of_business_key
      ),
      losses AS (
        SELECT
          fcc.line_of_business_key,
          COALESCE(SUM(fcc.direct_loss_paid + fcc.direct_ao_paid + fcc.direct_dcc_paid), 0) AS incurred
        FROM reporting.fact_claim_component fcc
        JOIN reporting.dim_book_month bm ON bm.book_month_key = fcc.book_month_key
        WHERE 1=1 ${f2.where}
        GROUP BY fcc.line_of_business_key
      )
      SELECT
        COALESCE(lob.line_of_business_description, 'Unknown') AS lob,
        COALESCE(p.policies, 0) AS policies,
        COALESCE(p.dwp, 0) AS dwp,
        CASE WHEN COALESCE(p.earned, 0) > 0
             THEN ROUND(COALESCE(l.incurred, 0) * 100.0 / p.earned, 1)
             ELSE 0 END AS loss_ratio
      FROM prem p
      LEFT JOIN losses l ON l.line_of_business_key = p.line_of_business_key
      LEFT JOIN reporting.dim_line_of_business lob ON lob.line_of_business_key = p.line_of_business_key
      ORDER BY dwp DESC;
    `;
    const { rows } = await this.queryEnt(sql, [...f1.params, ...f2.params]);
    return rows;
  }

  /* ================================================================== */
  /*  3. Premium & Loss by Geography                                    */
  /* ================================================================== */
  @Get('risk-by-region')
  async riskByRegion(@Query('from') from: string, @Query('to') to: string) {
    const f1 = this.db.bmFilter(from, to, 'bm', 1);
    const f2 = this.db.bmFilter(from, to, 'bm', f1.nextIdx);
    const sql = `
      WITH prem AS (
        SELECT
          fpt.geography_key,
          COUNT(DISTINCT fpt.policy_key) AS policies,
          COALESCE(SUM(fpt.direct_written_premium), 0) AS dwp,
          COALESCE(SUM(fpt.direct_earned_premium), 0) AS earned
        FROM reporting.fact_policy_transaction fpt
        JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
        WHERE 1=1 ${f1.where}
        GROUP BY fpt.geography_key
      ),
      losses AS (
        SELECT
          fcc.geography_key,
          COALESCE(SUM(fcc.direct_loss_paid + fcc.direct_ao_paid + fcc.direct_dcc_paid), 0) AS incurred
        FROM reporting.fact_claim_component fcc
        JOIN reporting.dim_book_month bm ON bm.book_month_key = fcc.book_month_key
        WHERE 1=1 ${f2.where}
        GROUP BY fcc.geography_key
      )
      SELECT
        COALESCE(g.region_name, g.state_name, 'Region ' || p.geography_key) AS region,
        p.policies,
        p.dwp,
        CASE WHEN p.earned > 0
             THEN ROUND(COALESCE(l.incurred, 0) * 100.0 / p.earned, 1)
             ELSE 0 END AS loss_ratio
      FROM prem p
      LEFT JOIN losses l ON l.geography_key = p.geography_key
      LEFT JOIN reporting.dim_geography g ON g.geography_key = p.geography_key
      ORDER BY p.dwp DESC
      LIMIT 5;
    `;
    const { rows } = await this.queryEnt(sql, [...f1.params, ...f2.params]);
    return rows;
  }

  /* ================================================================== */
  /*  4. Monthly Trend (policies, premium, loss ratio)                  */
  /* ================================================================== */
  @Get('monthly-trend')
  async monthlyTrend(@Query('from') from: string, @Query('to') to: string) {
    const f1 = this.db.bmFilter(from, to, 'bm', 1);
    const f2 = this.db.bmFilter(from, to, 'bm', f1.nextIdx);
    const sql = `
      WITH prem AS (
        SELECT
          bm.book_year * 100 + bm.book_month AS period,
          bm.book_year || '-' || LPAD(bm.book_month::text, 2, '0') AS month,
          COUNT(DISTINCT fpt.policy_key) AS policies,
          COALESCE(SUM(fpt.direct_written_premium), 0) AS dwp,
          COALESCE(SUM(fpt.direct_earned_premium), 0) AS earned,
          COUNT(DISTINCT CASE WHEN fpt.new_or_renewal_code = 'NEW' THEN fpt.policy_key END) AS new_biz
        FROM reporting.fact_policy_transaction fpt
        JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
        WHERE 1=1 ${f1.where}
        GROUP BY bm.book_year, bm.book_month
      ),
      losses AS (
        SELECT
          bm.book_year * 100 + bm.book_month AS period,
          COALESCE(SUM(fcc.direct_loss_paid + fcc.direct_ao_paid + fcc.direct_dcc_paid), 0) AS incurred
        FROM reporting.fact_claim_component fcc
        JOIN reporting.dim_book_month bm ON bm.book_month_key = fcc.book_month_key
        WHERE 1=1 ${f2.where}
        GROUP BY bm.book_year, bm.book_month
      )
      SELECT
        p.month,
        p.policies,
        p.dwp,
        p.new_biz,
        CASE WHEN p.earned > 0 THEN ROUND(COALESCE(l.incurred, 0) * 100.0 / p.earned, 1) ELSE 0 END AS loss_ratio
      FROM prem p
      LEFT JOIN losses l ON l.period = p.period
      ORDER BY p.period;
    `;
    const { rows } = await this.queryEnt(sql, [...f1.params, ...f2.params]);
    return rows;
  }

  /* ================================================================== */
  /*  5. UW Decision Distribution (event_type_code breakdown)           */
  /* ================================================================== */
  @Get('uw-decisions')
  async uwDecisions(@Query('from') from: string, @Query('to') to: string) {
    const f = this.db.bmFilter(from, to);
    const sql = `
      SELECT
        COALESCE(fpt.event_type_code::text, 'UNKNOWN') AS decision,
        COUNT(DISTINCT fpt.policy_key) AS count,
        COALESCE(SUM(fpt.direct_written_premium), 0) AS premium
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
      WHERE 1=1 ${f.where}
      GROUP BY fpt.event_type_code
      ORDER BY count DESC;
    `;
    const { rows } = await this.queryEnt(sql, f.params);
    return rows;
  }
}
