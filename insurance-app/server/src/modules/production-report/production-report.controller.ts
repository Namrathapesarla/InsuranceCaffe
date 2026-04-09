import {
  Controller,
  Get,
  InternalServerErrorException,
  Query,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Controller('production-report')
export class ProductionReportController {
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
      WITH policy_base AS (
        SELECT
          fpt.policy_key,
          fpt.direct_written_premium,
          fpt.direct_earned_premium,
          fpt.direct_new_business_premium,
          fpt.direct_renewal_premium,
          fpt.direct_cancelled_premium,
          fpt.inforce_indicator,
          fpt.new_or_renewal_code,
          fpt.policy_number
        FROM reporting.fact_policy_transaction fpt
        JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
        WHERE 1=1 ${f1.where}
      ),
      claim_base AS (
        SELECT
          fcc.policy_key,
          fcc.direct_loss_paid,
          fcc.direct_ao_paid,
          fcc.direct_dcc_paid
        FROM reporting.fact_claim_component fcc
        JOIN reporting.dim_book_month bm ON bm.book_month_key = fcc.book_month_key
        WHERE 1=1 ${f2.where}
      ),
      agg AS (
        SELECT
          COUNT(DISTINCT CASE WHEN pb.inforce_indicator = 'Y' THEN pb.policy_key END) AS inforce_policies,
          COALESCE(SUM(pb.direct_written_premium), 0)       AS written_premium,
          COUNT(DISTINCT CASE WHEN pb.new_or_renewal_code = 'NEW' THEN pb.policy_key END) AS new_business_count,
          COUNT(DISTINCT CASE WHEN pb.new_or_renewal_code = 'RNW' THEN pb.policy_key END) AS renewal_count,
          COUNT(DISTINCT pb.policy_key)                       AS total_policies,
          COALESCE(SUM(pb.direct_new_business_premium), 0)   AS new_biz_premium,
          COALESCE(SUM(pb.direct_renewal_premium), 0)        AS renewal_premium,
          COALESCE(SUM(pb.direct_earned_premium), 0)         AS earned_premium
        FROM policy_base pb
      ),
      loss AS (
        SELECT COALESCE(SUM(cb.direct_loss_paid + cb.direct_ao_paid + cb.direct_dcc_paid), 0) AS incurred
        FROM claim_base cb
      )
      SELECT
        a.inforce_policies,
        a.written_premium,
        a.new_business_count,
        CASE WHEN (a.new_business_count + a.renewal_count) > 0
             THEN ROUND(a.renewal_count * 100.0 / (a.new_business_count + a.renewal_count), 1)
             ELSE 0 END AS renewal_rate,
        CASE WHEN (a.new_biz_premium + a.renewal_premium) > 0
             THEN ROUND(a.renewal_premium * 100.0 / (a.new_biz_premium + a.renewal_premium), 1)
             ELSE 0 END AS retention_by_premium,
        CASE WHEN a.total_policies > 0
             THEN ROUND(a.renewal_count * 100.0 / a.total_policies, 1)
             ELSE 0 END AS retention_by_count,
        CASE WHEN a.earned_premium > 0
             THEN ROUND(l.incurred * 100.0 / a.earned_premium, 1)
             ELSE 0 END AS loss_ratio,
        CASE WHEN a.inforce_policies > 0
             THEN ROUND(a.written_premium / a.inforce_policies, 0)
             ELSE 0 END AS avg_premium_per_policy
      FROM agg a, loss l;
    `;
    const { rows } = await this.queryEnt(sql, [...f1.params, ...f2.params]);
    return rows[0] || {};
  }

  /* ================================================================== */
  /*  2. Written Premium by LOB                                         */
  /* ================================================================== */
  @Get('written-premium-by-lob')
  async writtenPremiumByLob(@Query('from') from: string, @Query('to') to: string) {
    const f = this.db.bmFilter(from, to);
    const sql = `
      SELECT
        COALESCE(lob.line_of_business_description, 'Unknown') AS lob,
        COALESCE(SUM(fpt.direct_written_premium), 0) AS written_premium
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
      LEFT JOIN reporting.dim_line_of_business lob ON lob.line_of_business_key = fpt.line_of_business_key
      WHERE 1=1 ${f.where}
      GROUP BY lob.line_of_business_description
      ORDER BY written_premium DESC;
    `;
    const { rows } = await this.queryEnt(sql, f.params);
    return rows;
  }

  /* ================================================================== */
  /*  3. Inforce Policy Count Distribution (by LOB)                     */
  /* ================================================================== */
  @Get('inforce-distribution')
  async inforceDistribution(@Query('from') from: string, @Query('to') to: string) {
    const f = this.db.bmFilter(from, to);
    const sql = `
      SELECT
        COALESCE(lob.line_of_business_description, 'Unknown') AS lob,
        COUNT(DISTINCT fpt.policy_key) AS policy_count
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
      LEFT JOIN reporting.dim_line_of_business lob ON lob.line_of_business_key = fpt.line_of_business_key
      WHERE fpt.inforce_indicator = 'Y' ${f.where}
      GROUP BY lob.line_of_business_description
      ORDER BY policy_count DESC;
    `;
    const { rows } = await this.queryEnt(sql, f.params);
    return rows;
  }

  /* ================================================================== */
  /*  4. New Business vs Renewal Premium — monthly trend (YTD)          */
  /* ================================================================== */
  @Get('nb-vs-renewal-trend')
  async nbVsRenewalTrend(@Query('from') from: string, @Query('to') to: string) {
    const f = this.db.bmFilter(from, to);
    const sql = `
      SELECT
        bm.book_year || '-' || LPAD(bm.book_month::text, 2, '0') AS month,
        bm.book_year * 100 + bm.book_month AS month_num,
        COALESCE(SUM(fpt.direct_new_business_premium), 0) AS new_business,
        COALESCE(SUM(fpt.direct_renewal_premium), 0)      AS renewal
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
      WHERE 1=1 ${f.where}
      GROUP BY bm.book_year, bm.book_month
      ORDER BY bm.book_year, bm.book_month;
    `;
    const { rows } = await this.queryEnt(sql, f.params);
    return rows;
  }

  /* ================================================================== */
  /*  5. Retention Rate by Count — by LOB                               */
  /* ================================================================== */
  @Get('retention-by-lob')
  async retentionByLob(@Query('from') from: string, @Query('to') to: string) {
    const f = this.db.bmFilter(from, to);
    const sql = `
      SELECT
        COALESCE(lob.line_of_business_description, 'Unknown') AS lob,
        COALESCE(SUM(fpt.direct_written_premium), 0)  AS written_premium,
        COALESCE(SUM(CASE WHEN fpt.new_or_renewal_code = 'RNW' THEN fpt.direct_written_premium ELSE 0 END), 0) AS renewal_premium,
        COALESCE(SUM(CASE WHEN fpt.new_or_renewal_code = 'NEW' THEN fpt.direct_written_premium ELSE 0 END), 0) AS new_biz_premium,
        CASE WHEN COALESCE(SUM(fpt.direct_written_premium), 0) > 0
             THEN ROUND(
               COALESCE(SUM(CASE WHEN fpt.new_or_renewal_code = 'RNW' THEN fpt.direct_written_premium ELSE 0 END), 0) * 100.0
               / SUM(fpt.direct_written_premium), 1)
             ELSE 0 END AS retention_rate
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
      LEFT JOIN reporting.dim_line_of_business lob ON lob.line_of_business_key = fpt.line_of_business_key
      WHERE 1=1 ${f.where}
      GROUP BY lob.line_of_business_description
      ORDER BY retention_rate DESC;
    `;
    const { rows } = await this.queryEnt(sql, f.params);
    return rows;
  }

  /* ================================================================== */
  /*  6. Profitability — Loss Ratio by LOB                              */
  /* ================================================================== */
  @Get('loss-ratio-by-lob')
  async lossRatioByLob(@Query('from') from: string, @Query('to') to: string) {
    const f1 = this.db.bmFilter(from, to, 'bm', 1);
    const f2 = this.db.bmFilter(from, to, 'bm', f1.nextIdx);
    const sql = `
      WITH premium AS (
        SELECT
          fpt.line_of_business_key,
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
        COALESCE(p.earned, 0) AS earned_premium,
        COALESCE(l.incurred, 0) AS incurred_loss,
        CASE WHEN COALESCE(p.earned, 0) > 0
             THEN ROUND(COALESCE(l.incurred, 0) * 100.0 / p.earned, 1)
             ELSE 0 END AS loss_ratio
      FROM premium p
      FULL OUTER JOIN losses l ON l.line_of_business_key = p.line_of_business_key
      LEFT JOIN reporting.dim_line_of_business lob
        ON lob.line_of_business_key = COALESCE(p.line_of_business_key, l.line_of_business_key)
      ORDER BY loss_ratio DESC;
    `;
    const { rows } = await this.queryEnt(sql, [...f1.params, ...f2.params]);
    return rows;
  }

  /* ================================================================== */
  /*  7. Policy Movement — NB vs Lapse vs Renewal — monthly             */
  /* ================================================================== */
  @Get('policy-movement')
  async policyMovement(@Query('from') from: string, @Query('to') to: string) {
    const f = this.db.bmFilter(from, to);
    const sql = `
      SELECT
        bm.book_year || '-' || LPAD(bm.book_month::text, 2, '0') AS month,
        bm.book_year * 100 + bm.book_month AS month_num,
        COUNT(DISTINCT CASE WHEN fpt.new_or_renewal_code = 'NEW' THEN fpt.policy_key END) AS new_business,
        COUNT(DISTINCT CASE WHEN fpt.new_or_renewal_code = 'RNW' THEN fpt.policy_key END) AS renewal,
        COUNT(DISTINCT CASE WHEN fpt.cancelled_in_month_indicator = 'Y' THEN fpt.policy_key END) AS lapse
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
      WHERE 1=1 ${f.where}
      GROUP BY bm.book_year, bm.book_month
      ORDER BY bm.book_year, bm.book_month;
    `;
    const { rows } = await this.queryEnt(sql, f.params);
    return rows;
  }
}
