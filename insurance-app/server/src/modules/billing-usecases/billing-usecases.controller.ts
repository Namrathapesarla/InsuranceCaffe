import { Controller, Get, Query } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Controller('billing')
export class BillingUsecasesController {
  constructor(private readonly db: DatabaseService) {}

  // =====================================================================
  //  1. COLLECTION RATE TRACKING
  // =====================================================================

  @Get('collection/kpis')
  async collectionKpis(@Query('from') from?: string, @Query('to') to?: string) {
    const f = this.db.bmFilter(from, to);
    const sql = `
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
      WHERE 1=1 ${f.where};
    `;
    const { rows } = await this.db.queryWithEnterprise(sql, f.params);
    return rows[0] || {};
  }

  @Get('collection/by-lob')
  async collectionByLob(@Query('from') from?: string, @Query('to') to?: string) {
    const f = this.db.bmFilter(from, to);
    const sql = `
      SELECT COALESCE(lob.line_of_business_description,'Unknown') AS lob,
        COALESCE(SUM(fpt.direct_written_premium),0) AS billed,
        COALESCE(SUM(fpt.direct_earned_premium),0) AS collected,
        CASE WHEN SUM(fpt.direct_written_premium)>0
             THEN ROUND(SUM(fpt.direct_earned_premium)*100.0/SUM(fpt.direct_written_premium),1) ELSE 0 END AS rate
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key
      LEFT JOIN reporting.dim_line_of_business lob ON lob.line_of_business_key=fpt.line_of_business_key
      WHERE 1=1 ${f.where} GROUP BY lob.line_of_business_description ORDER BY billed DESC;
    `;
    const { rows } = await this.db.queryWithEnterprise(sql, f.params);
    return rows;
  }

  @Get('collection/yearly')
  async collectionYearly(@Query('from') from?: string, @Query('to') to?: string) {
    const f = this.db.bmFilter(from, to);
    const sql = `
      SELECT bm.book_year::text AS year,
        COALESCE(SUM(fpt.direct_written_premium),0) AS billed,
        COALESCE(SUM(fpt.direct_earned_premium),0) AS collected,
        COALESCE(SUM(fpt.direct_unearned_premium),0) AS outstanding
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key
      WHERE 1=1 ${f.where} GROUP BY bm.book_year ORDER BY bm.book_year;
    `;
    const { rows } = await this.db.queryWithEnterprise(sql, f.params);
    return rows;
  }

  // =====================================================================
  //  2. REFUND TAT MONITORING (using cancelled premium as proxy)
  // =====================================================================

  @Get('refund/kpis')
  async refundKpis(@Query('from') from?: string, @Query('to') to?: string) {
    const f = this.db.bmFilter(from, to);
    const sql = `
      SELECT
        COUNT(DISTINCT fpt.policy_key) AS total_policies,
        COUNT(DISTINCT CASE WHEN fpt.cancelled_in_month_indicator='Y' THEN fpt.policy_key END) AS cancelled_policies,
        COALESCE(SUM(fpt.direct_cancelled_premium),0) AS cancelled_premium,
        COALESCE(SUM(CASE WHEN fpt.cancelled_in_month_indicator='Y' THEN fpt.direct_written_premium ELSE 0 END),0) AS refund_eligible_premium,
        COALESCE(SUM(fpt.direct_reinstatement_premium),0) AS reinstatement_premium,
        COUNT(DISTINCT CASE WHEN fpt.reinstated_in_month_indicator='Y' THEN fpt.policy_key END) AS reinstated_count
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key
      WHERE 1=1 ${f.where};
    `;
    const { rows } = await this.db.queryWithEnterprise(sql, f.params);
    return rows[0] || {};
  }

  @Get('refund/by-lob')
  async refundByLob(@Query('from') from?: string, @Query('to') to?: string) {
    const f = this.db.bmFilter(from, to);
    const sql = `
      SELECT COALESCE(lob.line_of_business_description,'Unknown') AS lob,
        COUNT(DISTINCT CASE WHEN fpt.cancelled_in_month_indicator='Y' THEN fpt.policy_key END) AS cancelled,
        COALESCE(SUM(CASE WHEN fpt.cancelled_in_month_indicator='Y' THEN fpt.direct_written_premium ELSE 0 END),0) AS refund_premium,
        COUNT(DISTINCT fpt.policy_key) AS total
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key
      LEFT JOIN reporting.dim_line_of_business lob ON lob.line_of_business_key=fpt.line_of_business_key
      WHERE 1=1 ${f.where} GROUP BY lob.line_of_business_description ORDER BY refund_premium DESC;
    `;
    const { rows } = await this.db.queryWithEnterprise(sql, f.params);
    return rows;
  }

  // =====================================================================
  //  3. COMMISSION PAYOUT
  // =====================================================================

  @Get('commission/kpis')
  async commissionKpis(@Query('from') from?: string, @Query('to') to?: string) {
    const f = this.db.bmFilter(from, to);
    const sql = `
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
      WHERE 1=1 ${f.where};
    `;
    const { rows } = await this.db.queryWithEnterprise(sql, f.params);
    return rows[0] || {};
  }

  @Get('commission/by-agent')
  async commissionByAgent(@Query('from') from?: string, @Query('to') to?: string) {
    const f = this.db.bmFilter(from, to);
    const sql = `
      SELECT COALESCE(a.full_legal_name,'Agent '||fpt.agent_key) AS agent,
        COUNT(DISTINCT fpt.policy_key) AS policies,
        COALESCE(SUM(fpt.direct_written_premium),0) AS written,
        COALESCE(SUM(fpt.direct_producer_commission),0) AS commission,
        CASE WHEN SUM(fpt.direct_written_premium)>0
             THEN ROUND(SUM(fpt.direct_producer_commission)*100.0/SUM(fpt.direct_written_premium),1) ELSE 0 END AS comm_rate
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key
      LEFT JOIN reporting.dim_agent a ON a.agent_key=fpt.agent_key
      WHERE 1=1 ${f.where} GROUP BY agent ORDER BY commission DESC LIMIT 10;
    `;
    const { rows } = await this.db.queryWithEnterprise(sql, f.params);
    return rows;
  }

  @Get('commission/by-lob')
  async commissionByLob(@Query('from') from?: string, @Query('to') to?: string) {
    const f = this.db.bmFilter(from, to);
    const sql = `
      SELECT COALESCE(lob.line_of_business_description,'Unknown') AS lob,
        COALESCE(SUM(fpt.direct_company_commission),0) AS co_comm,
        COALESCE(SUM(fpt.direct_producer_commission),0) AS pr_comm,
        COALESCE(SUM(fpt.direct_written_premium),0) AS written,
        CASE WHEN SUM(fpt.direct_written_premium)>0
             THEN ROUND(SUM(fpt.direct_company_commission+fpt.direct_producer_commission)*100.0/SUM(fpt.direct_written_premium),1) ELSE 0 END AS ratio
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key
      LEFT JOIN reporting.dim_line_of_business lob ON lob.line_of_business_key=fpt.line_of_business_key
      WHERE 1=1 ${f.where} GROUP BY lob.line_of_business_description ORDER BY pr_comm DESC;
    `;
    const { rows } = await this.db.queryWithEnterprise(sql, f.params);
    return rows;
  }

  // =====================================================================
  //  4. SOLVENCY RATIO (earned vs incurred proxy)
  // =====================================================================

  @Get('solvency/kpis')
  async solvencyKpis(@Query('from') from?: string, @Query('to') to?: string) {
    const f1 = this.db.bmFilter(from, to, 'bm', 1);
    const f2 = this.db.bmFilter(from, to, 'bm', f1.nextIdx);
    const sql = `
      WITH prem AS (
        SELECT COALESCE(SUM(fpt.direct_earned_premium),0) AS earned,
               COALESCE(SUM(fpt.direct_written_premium),0) AS written,
               COALESCE(SUM(fpt.direct_company_commission+fpt.direct_producer_commission),0) AS commission,
               COALESCE(SUM(fpt.direct_surcharges+fpt.direct_taxes+fpt.direct_fees),0) AS expenses
        FROM reporting.fact_policy_transaction fpt
        JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key WHERE 1=1 ${f1.where}
      ), loss AS (
        SELECT COALESCE(SUM(fcc.direct_loss_paid+fcc.direct_ao_paid+fcc.direct_dcc_paid),0) AS incurred,
               COALESCE(SUM(fcc.direct_loss_reserve_outstanding),0) AS reserves
        FROM reporting.fact_claim_component fcc
        JOIN reporting.dim_book_month bm ON bm.book_month_key=fcc.book_month_key WHERE 1=1 ${f2.where}
      )
      SELECT p.earned, p.written, p.commission, p.expenses, l.incurred, l.reserves,
        CASE WHEN l.incurred>0 THEN ROUND(p.earned*100.0/l.incurred,1) ELSE 0 END AS solvency_proxy,
        CASE WHEN p.earned>0 THEN ROUND(l.incurred*100.0/p.earned,1) ELSE 0 END AS loss_ratio,
        CASE WHEN p.earned>0 THEN ROUND((l.incurred+p.commission)*100.0/p.earned,1) ELSE 0 END AS combined_ratio
      FROM prem p, loss l;
    `;
    const { rows } = await this.db.queryWithEnterprise(sql, [...f1.params, ...f2.params]);
    return rows[0] || {};
  }

  @Get('solvency/yearly')
  async solvencyYearly(@Query('from') from?: string, @Query('to') to?: string) {
    const f1 = this.db.bmFilter(from, to, 'bm', 1);
    const f2 = this.db.bmFilter(from, to, 'bm', f1.nextIdx);
    const sql = `
      WITH prem AS (
        SELECT bm.book_year AS yr, COALESCE(SUM(fpt.direct_earned_premium),0) AS earned,
               COALESCE(SUM(fpt.direct_company_commission+fpt.direct_producer_commission),0) AS commission
        FROM reporting.fact_policy_transaction fpt
        JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key WHERE 1=1 ${f1.where}
        GROUP BY bm.book_year
      ), loss AS (
        SELECT bm.book_year AS yr, COALESCE(SUM(fcc.direct_loss_paid+fcc.direct_ao_paid+fcc.direct_dcc_paid),0) AS incurred
        FROM reporting.fact_claim_component fcc
        JOIN reporting.dim_book_month bm ON bm.book_month_key=fcc.book_month_key WHERE 1=1 ${f2.where}
        GROUP BY bm.book_year
      )
      SELECT p.yr::text AS year, p.earned, COALESCE(l.incurred,0) AS incurred, p.commission,
        CASE WHEN p.earned>0 THEN ROUND(COALESCE(l.incurred,0)*100.0/p.earned,1) ELSE 0 END AS loss_ratio,
        CASE WHEN p.earned>0 THEN ROUND((COALESCE(l.incurred,0)+p.commission)*100.0/p.earned,1) ELSE 0 END AS combined_ratio
      FROM prem p LEFT JOIN loss l ON l.yr=p.yr ORDER BY p.yr;
    `;
    const { rows } = await this.db.queryWithEnterprise(sql, [...f1.params, ...f2.params]);
    return rows;
  }

  // =====================================================================
  //  5. GL RECONCILIATION (written vs net vs earned vs commission)
  // =====================================================================

  @Get('gl-recon/kpis')
  async glReconKpis(@Query('from') from?: string, @Query('to') to?: string) {
    const f = this.db.bmFilter(from, to);
    const sql = `
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
      WHERE 1=1 ${f.where};
    `;
    const { rows } = await this.db.queryWithEnterprise(sql, f.params);
    return rows[0] || {};
  }

  @Get('gl-recon/by-lob')
  async glReconByLob(@Query('from') from?: string, @Query('to') to?: string) {
    const f = this.db.bmFilter(from, to);
    const sql = `
      SELECT COALESCE(lob.line_of_business_description,'Unknown') AS lob,
        COALESCE(SUM(fpt.direct_written_premium),0) AS written,
        COALESCE(SUM(fpt.net_written_premium),0) AS net_written,
        COALESCE(SUM(fpt.direct_earned_premium),0) AS earned,
        COALESCE(SUM(fpt.direct_company_commission+fpt.direct_producer_commission),0) AS commission,
        COALESCE(SUM(fpt.direct_surcharges+fpt.direct_taxes+fpt.direct_fees),0) AS cost_load
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key
      LEFT JOIN reporting.dim_line_of_business lob ON lob.line_of_business_key=fpt.line_of_business_key
      WHERE 1=1 ${f.where} GROUP BY lob.line_of_business_description ORDER BY written DESC;
    `;
    const { rows } = await this.db.queryWithEnterprise(sql, f.params);
    return rows;
  }

  // =====================================================================
  //  6. GST COMPLIANCE
  // =====================================================================

  @Get('gst/kpis')
  async gstKpis(@Query('from') from?: string, @Query('to') to?: string) {
    const f = this.db.bmFilter(from, to);
    const sql = `
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
      WHERE 1=1 ${f.where};
    `;
    const { rows } = await this.db.queryWithEnterprise(sql, f.params);
    return rows[0] || {};
  }

  @Get('gst/by-lob')
  async gstByLob(@Query('from') from?: string, @Query('to') to?: string) {
    const f = this.db.bmFilter(from, to);
    const sql = `
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
      WHERE 1=1 ${f.where} GROUP BY lob.line_of_business_description ORDER BY gst DESC;
    `;
    const { rows } = await this.db.queryWithEnterprise(sql, f.params);
    return rows;
  }

  @Get('gst/yearly')
  async gstYearly(@Query('from') from?: string, @Query('to') to?: string) {
    const f = this.db.bmFilter(from, to);
    const sql = `
      SELECT bm.book_year::text AS year,
        COALESCE(SUM(fpt.direct_taxes),0) AS gst,
        COALESCE(SUM(fpt.direct_surcharges),0) AS surcharges,
        COALESCE(SUM(fpt.direct_fees),0) AS fees,
        COALESCE(SUM(fpt.direct_written_premium),0) AS written
      FROM reporting.fact_policy_transaction fpt
      JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key
      WHERE 1=1 ${f.where} GROUP BY bm.book_year ORDER BY bm.book_year;
    `;
    const { rows } = await this.db.queryWithEnterprise(sql, f.params);
    return rows;
  }
}
