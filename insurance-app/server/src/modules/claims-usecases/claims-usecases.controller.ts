import { Controller, Get, Query, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Controller('claims')
export class ClaimsUsecasesController {
  constructor(private db: DatabaseService) {}

  @Get('list')
  async claimsList(@Query('from') from: string, @Query('to') to: string) {
    const f = this.db.bmFilter(from, to);
    try {
      const kimball = `
        SELECT
          fcc.claim_key,
          ('CLM-' || fcc.claim_key::text) AS claim_number,
          p.full_policy_number AS policy_number,
          COALESCE(ins.full_legal_name, 'Unknown') AS party_name,
          COALESCE(lob.line_of_business_description, 'N/A') AS lob,
          fcc.claim_date_of_loss AS loss_date,
          COALESCE(fcc.direct_loss_reserve, 0) + COALESCE(fcc.direct_loss_paid, 0) AS claim_amount,
          COALESCE(fcc.direct_loss_reserve_outstanding, 0) AS reserve_amount,
          COALESCE(fcc.direct_loss_paid, 0) AS paid_amount,
          COALESCE(cs.claim_status_description, 'Open') AS status
        FROM reporting.fact_claim_component fcc
        JOIN reporting.dim_book_month bm ON bm.book_month_key = fcc.book_month_key
        LEFT JOIN reporting.dim_claim_status cs ON cs.claim_status_key = fcc.claim_status_key
        LEFT JOIN reporting.dim_line_of_business lob ON lob.line_of_business_key = fcc.line_of_business_key
        LEFT JOIN reporting.dim_policy p ON p.policy_key = fcc.policy_key
        LEFT JOIN reporting.dim_insured ins ON ins.insured_key = fcc.insured_key
        WHERE 1=1 ${f.where}
        ORDER BY fcc.claim_date_of_loss DESC NULLS LAST
        LIMIT 500`;
      const enterprise = `
        SELECT
          fcc.claim_sk AS claim_key,
          ('CLM-' || fcc.claim_sk::text) AS claim_number,
          p.full_policy_number AS policy_number,
          COALESCE(cmt.full_legal_name, 'Unknown') AS party_name,
          COALESCE(lob.line_of_business_description, 'N/A') AS lob,
          COALESCE(fcc.claim_date_of_loss, cl.claim_date_of_loss) AS loss_date,
          COALESCE(fcc.direct_loss_reserve, 0) + COALESCE(fcc.direct_loss_paid, 0) AS claim_amount,
          COALESCE(fcc.direct_loss_reserve_outstanding, 0) AS reserve_amount,
          COALESCE(fcc.direct_loss_paid, 0) AS paid_amount,
          COALESCE(cs.claim_status_description, 'Open') AS status
        FROM reporting.fact_claim_component fcc
        JOIN reporting.dim_book_month bm ON bm.book_month_sk = fcc.book_month_sk
        JOIN reporting.dim_claim cl ON cl.claim_sk = fcc.claim_sk
        LEFT JOIN reporting.dim_claim_status cs ON cs.claim_status_sk = cl.claim_status_sk
        LEFT JOIN reporting.dim_policy p ON p.policy_sk = cl.policy_sk
        LEFT JOIN reporting.dim_line_of_business lob ON lob.lob_sk = p.lob_sk
        LEFT JOIN reporting.dim_claimant cmt ON cl.claimant_sk = cmt.claimant_sk
        WHERE 1=1 ${f.where}
        ORDER BY COALESCE(fcc.claim_date_of_loss, cl.claim_date_of_loss) DESC NULLS LAST
        LIMIT 500`;
      const { rows } = await this.db.queryWarehouse(kimball, enterprise, f.params);
      return rows.map((r) => ({
        claimNumber: r.claim_number,
        policyNumber: r.policy_number || 'N/A',
        partyName: r.party_name,
        lob: r.lob,
        lossDate: r.loss_date,
        claimAmount: parseFloat(r.claim_amount) || 0,
        reserveAmount: parseFloat(r.reserve_amount) || 0,
        paidAmount: parseFloat(r.paid_amount) || 0,
        status: r.status,
      }));
    } catch (e) {
      throw new InternalServerErrorException((e as Error).message);
    }
  }

  @Get('tat/kpis')
  async tatKpis(@Query('from') from: string, @Query('to') to: string) {
    const f = this.db.bmFilter(from, to);
    try {
      const kimball = `
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
        WHERE 1=1 ${f.where}`;
      const enterprise = `
        SELECT
          COUNT(DISTINCT fcc.claim_sk) AS total_claims,
          ROUND(AVG(fcc.direct_claim_days_open),1) AS avg_tat_days,
          MAX(fcc.direct_claim_days_open) AS max_tat_days,
          MIN(CASE WHEN fcc.direct_claim_days_open>0 THEN fcc.direct_claim_days_open END) AS min_tat_days,
          COUNT(DISTINCT CASE WHEN fcc.direct_claim_days_open>30 THEN fcc.claim_sk END) AS breach_30day,
          COUNT(DISTINCT CASE WHEN fcc.claim_close_date IS NOT NULL THEN fcc.claim_sk END) AS closed_claims,
          COUNT(DISTINCT CASE WHEN fcc.claim_close_date IS NULL THEN fcc.claim_sk END) AS open_claims,
          COALESCE(SUM(fcc.direct_loss_paid),0) AS total_paid
        FROM reporting.fact_claim_component fcc
        JOIN reporting.dim_book_month bm ON bm.book_month_sk=fcc.book_month_sk
        WHERE 1=1 ${f.where}`;
      const { rows } = await this.db.queryWarehouse(kimball, enterprise, f.params);
      return rows[0] || {};
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('tat/by-lob')
  async tatByLob(@Query('from') from: string, @Query('to') to: string) {
    const f = this.db.bmFilter(from, to);
    try {
      const kimball = `
        SELECT COALESCE(lob.line_of_business_description,'Unknown') AS lob,
          COUNT(DISTINCT fcc.claim_key) AS claims,
          ROUND(AVG(fcc.direct_claim_days_open),1) AS avg_tat,
          COUNT(DISTINCT CASE WHEN fcc.direct_claim_days_open>30 THEN fcc.claim_key END) AS breaches,
          COALESCE(SUM(fcc.direct_loss_paid),0) AS paid
        FROM reporting.fact_claim_component fcc
        JOIN reporting.dim_book_month bm ON bm.book_month_key=fcc.book_month_key
        LEFT JOIN reporting.dim_line_of_business lob ON lob.line_of_business_key=fcc.line_of_business_key
        WHERE 1=1 ${f.where} GROUP BY lob.line_of_business_description ORDER BY avg_tat DESC`;
      const enterprise = `
        SELECT COALESCE(lob.line_of_business_description,'Unknown') AS lob,
          COUNT(DISTINCT fcc.claim_sk) AS claims,
          ROUND(AVG(fcc.direct_claim_days_open),1) AS avg_tat,
          COUNT(DISTINCT CASE WHEN fcc.direct_claim_days_open>30 THEN fcc.claim_sk END) AS breaches,
          COALESCE(SUM(fcc.direct_loss_paid),0) AS paid
        FROM reporting.fact_claim_component fcc
        JOIN reporting.dim_book_month bm ON bm.book_month_sk=fcc.book_month_sk
        JOIN reporting.dim_claim cl ON cl.claim_sk = fcc.claim_sk
        LEFT JOIN reporting.dim_policy p ON p.policy_sk = cl.policy_sk
        LEFT JOIN reporting.dim_line_of_business lob ON lob.lob_sk = p.lob_sk
        WHERE 1=1 ${f.where} GROUP BY lob.line_of_business_description ORDER BY avg_tat DESC`;
      const { rows } = await this.db.queryWarehouse(kimball, enterprise, f.params);
      return rows;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('tat/by-adjuster')
  async tatByAdjuster(@Query('from') from: string, @Query('to') to: string) {
    const f = this.db.bmFilter(from, to);
    try {
      const kimball = `
        SELECT COALESCE(adj.full_legal_name,'Adjuster '||fcc.adjuster_key) AS adjuster,
          COUNT(DISTINCT fcc.claim_key) AS claims,
          ROUND(AVG(fcc.direct_claim_days_open),1) AS avg_tat,
          COUNT(DISTINCT CASE WHEN fcc.direct_claim_days_open>30 THEN fcc.claim_key END) AS breaches,
          COALESCE(SUM(fcc.direct_loss_paid),0) AS paid
        FROM reporting.fact_claim_component fcc
        JOIN reporting.dim_book_month bm ON bm.book_month_key=fcc.book_month_key
        LEFT JOIN reporting.dim_adjuster adj ON adj.adjuster_key=fcc.adjuster_key
        WHERE 1=1 ${f.where} GROUP BY adjuster ORDER BY avg_tat DESC LIMIT 10`;
      const enterprise = `
        SELECT COALESCE(adj.full_legal_name,'Adjuster '||fcc.adjuster_sk::text) AS adjuster,
          COUNT(DISTINCT fcc.claim_sk) AS claims,
          ROUND(AVG(fcc.direct_claim_days_open),1) AS avg_tat,
          COUNT(DISTINCT CASE WHEN fcc.direct_claim_days_open>30 THEN fcc.claim_sk END) AS breaches,
          COALESCE(SUM(fcc.direct_loss_paid),0) AS paid
        FROM reporting.fact_claim_component fcc
        JOIN reporting.dim_book_month bm ON bm.book_month_sk=fcc.book_month_sk
        LEFT JOIN reporting.dim_adjuster adj ON adj.adjuster_sk=fcc.adjuster_sk
        WHERE 1=1 ${f.where} GROUP BY adjuster ORDER BY avg_tat DESC LIMIT 10`;
      const { rows } = await this.db.queryWarehouse(kimball, enterprise, f.params);
      return rows;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('fraud/kpis')
  async fraudKpis(@Query('from') from: string, @Query('to') to: string) {
    const f = this.db.bmFilter(from, to);
    try {
      const kimball = `
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
        WHERE 1=1 ${f.where}`;
      const enterprise = kimball
        .replace(/fcc\.claim_key/g, 'fcc.claim_sk')
        .replace(/bm\.book_month_key=fcc\.book_month_key/g, 'bm.book_month_sk=fcc.book_month_sk');
      const { rows } = await this.db.queryWarehouse(kimball, enterprise, f.params);
      return rows[0] || {};
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('fraud/by-lob')
  async fraudByLob(@Query('from') from: string, @Query('to') to: string) {
    const f = this.db.bmFilter(from, to);
    try {
      const kimball = `
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
        WHERE 1=1 ${f.where} GROUP BY lob.line_of_business_description ORDER BY paid DESC`;
      const enterprise = `
        SELECT COALESCE(lob.line_of_business_description,'Unknown') AS lob,
          COUNT(DISTINCT fcc.claim_sk) AS claims,
          COALESCE(SUM(fcc.direct_loss_paid),0) AS paid,
          COALESCE(SUM(fcc.direct_salvage_received),0) AS salvage,
          COALESCE(SUM(fcc.direct_subrogation_received),0) AS subrogation,
          COALESCE(SUM(fcc.direct_medical_paid),0) AS medical,
          COALESCE(SUM(fcc.direct_ao_paid+fcc.direct_dcc_paid),0) AS alae,
          ROUND(AVG(fcc.direct_claim_days_open),1) AS avg_tat
        FROM reporting.fact_claim_component fcc
        JOIN reporting.dim_book_month bm ON bm.book_month_sk=fcc.book_month_sk
        JOIN reporting.dim_claim cl ON cl.claim_sk = fcc.claim_sk
        LEFT JOIN reporting.dim_policy p ON p.policy_sk = cl.policy_sk
        LEFT JOIN reporting.dim_line_of_business lob ON lob.lob_sk = p.lob_sk
        WHERE 1=1 ${f.where} GROUP BY lob.line_of_business_description ORDER BY paid DESC`;
      const { rows } = await this.db.queryWarehouse(kimball, enterprise, f.params);
      return rows;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('reserves/kpis')
  async reservesKpis(@Query('from') from: string, @Query('to') to: string) {
    const f = this.db.bmFilter(from, to);
    try {
      const kimball = `
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
        WHERE 1=1 ${f.where}`;
      const enterprise = kimball
        .replace(/fcc\.claim_key/g, 'fcc.claim_sk')
        .replace(/bm\.book_month_key=fcc\.book_month_key/g, 'bm.book_month_sk=fcc.book_month_sk');
      const { rows } = await this.db.queryWarehouse(kimball, enterprise, f.params);
      return rows[0] || {};
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('reserves/by-lob')
  async reservesByLob(@Query('from') from: string, @Query('to') to: string) {
    const f = this.db.bmFilter(from, to);
    try {
      const kimball = `
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
        WHERE 1=1 ${f.where} GROUP BY lob.line_of_business_description ORDER BY reserve DESC`;
      const enterprise = `
        SELECT COALESCE(lob.line_of_business_description,'Unknown') AS lob,
          COUNT(DISTINCT fcc.claim_sk) AS claims,
          COALESCE(SUM(fcc.direct_loss_paid),0) AS paid,
          COALESCE(SUM(fcc.direct_loss_reserve),0) AS reserve,
          COALESCE(SUM(fcc.direct_ibnr_loss_reserve),0) AS ibnr,
          CASE WHEN SUM(fcc.direct_loss_reserve)>0
               THEN ROUND(SUM(fcc.direct_loss_paid)*100.0/SUM(fcc.direct_loss_reserve),1) ELSE 0 END AS paid_reserve_ratio
        FROM reporting.fact_claim_component fcc
        JOIN reporting.dim_book_month bm ON bm.book_month_sk=fcc.book_month_sk
        JOIN reporting.dim_claim cl ON cl.claim_sk = fcc.claim_sk
        LEFT JOIN reporting.dim_policy p ON p.policy_sk = cl.policy_sk
        LEFT JOIN reporting.dim_line_of_business lob ON lob.lob_sk = p.lob_sk
        WHERE 1=1 ${f.where} GROUP BY lob.line_of_business_description ORDER BY reserve DESC`;
      const { rows } = await this.db.queryWarehouse(kimball, enterprise, f.params);
      return rows;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('reserves/by-adjuster')
  async reservesByAdjuster(@Query('from') from: string, @Query('to') to: string) {
    const f = this.db.bmFilter(from, to);
    try {
      const kimball = `
        SELECT COALESCE(adj.full_legal_name,'Adjuster '||fcc.adjuster_key) AS adjuster,
          COUNT(DISTINCT fcc.claim_key) AS claims,
          COALESCE(SUM(fcc.direct_loss_paid),0) AS paid,
          COALESCE(SUM(fcc.direct_loss_reserve),0) AS reserve,
          CASE WHEN SUM(fcc.direct_loss_reserve)>0
               THEN ROUND(SUM(fcc.direct_loss_paid)*100.0/SUM(fcc.direct_loss_reserve),1) ELSE 0 END AS ratio
        FROM reporting.fact_claim_component fcc
        JOIN reporting.dim_book_month bm ON bm.book_month_key=fcc.book_month_key
        LEFT JOIN reporting.dim_adjuster adj ON adj.adjuster_key=fcc.adjuster_key
        WHERE 1=1 ${f.where} GROUP BY adjuster ORDER BY reserve DESC LIMIT 10`;
      const enterprise = `
        SELECT COALESCE(adj.full_legal_name,'Adjuster '||fcc.adjuster_sk::text) AS adjuster,
          COUNT(DISTINCT fcc.claim_sk) AS claims,
          COALESCE(SUM(fcc.direct_loss_paid),0) AS paid,
          COALESCE(SUM(fcc.direct_loss_reserve),0) AS reserve,
          CASE WHEN SUM(fcc.direct_loss_reserve)>0
               THEN ROUND(SUM(fcc.direct_loss_paid)*100.0/SUM(fcc.direct_loss_reserve),1) ELSE 0 END AS ratio
        FROM reporting.fact_claim_component fcc
        JOIN reporting.dim_book_month bm ON bm.book_month_sk=fcc.book_month_sk
        LEFT JOIN reporting.dim_adjuster adj ON adj.adjuster_sk=fcc.adjuster_sk
        WHERE 1=1 ${f.where} GROUP BY adjuster ORDER BY reserve DESC LIMIT 10`;
      const { rows } = await this.db.queryWarehouse(kimball, enterprise, f.params);
      return rows;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('repudiation/kpis')
  async repudiationKpis(@Query('from') from: string, @Query('to') to: string) {
    const f = this.db.bmFilter(from, to);
    try {
      const kimball = `
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
        WHERE 1=1 ${f.where}`;
      const enterprise = kimball
        .replace(/fcc\.claim_key/g, 'fcc.claim_sk')
        .replace(/bm\.book_month_key=fcc\.book_month_key/g, 'bm.book_month_sk=fcc.book_month_sk');
      const { rows } = await this.db.queryWarehouse(kimball, enterprise, f.params);
      return rows[0] || {};
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('repudiation/by-lob')
  async repudiationByLob(@Query('from') from: string, @Query('to') to: string) {
    const f = this.db.bmFilter(from, to);
    try {
      const kimball = `
        SELECT COALESCE(lob.line_of_business_description,'Unknown') AS lob,
          SUM(fcc.direct_closed_with_payment_claim_count) AS with_payment,
          SUM(fcc.direct_closed_without_payment_claim_count) AS without_payment,
          SUM(fcc.direct_closed_claim_count) AS total_closed,
          CASE WHEN SUM(fcc.direct_closed_claim_count)>0
               THEN ROUND(SUM(fcc.direct_closed_without_payment_claim_count)*100.0/SUM(fcc.direct_closed_claim_count),1) ELSE 0 END AS denial_rate
        FROM reporting.fact_claim_component fcc
        JOIN reporting.dim_book_month bm ON bm.book_month_key=fcc.book_month_key
        LEFT JOIN reporting.dim_line_of_business lob ON lob.line_of_business_key=fcc.line_of_business_key
        WHERE 1=1 ${f.where} GROUP BY lob.line_of_business_description ORDER BY denial_rate DESC`;
      const enterprise = `
        SELECT COALESCE(lob.line_of_business_description,'Unknown') AS lob,
          SUM(fcc.direct_closed_with_payment_claim_count) AS with_payment,
          SUM(fcc.direct_closed_without_payment_claim_count) AS without_payment,
          SUM(fcc.direct_closed_claim_count) AS total_closed,
          CASE WHEN SUM(fcc.direct_closed_claim_count)>0
               THEN ROUND(SUM(fcc.direct_closed_without_payment_claim_count)*100.0/SUM(fcc.direct_closed_claim_count),1) ELSE 0 END AS denial_rate
        FROM reporting.fact_claim_component fcc
        JOIN reporting.dim_book_month bm ON bm.book_month_sk=fcc.book_month_sk
        JOIN reporting.dim_claim cl ON cl.claim_sk = fcc.claim_sk
        LEFT JOIN reporting.dim_policy p ON p.policy_sk = cl.policy_sk
        LEFT JOIN reporting.dim_line_of_business lob ON lob.lob_sk = p.lob_sk
        WHERE 1=1 ${f.where} GROUP BY lob.line_of_business_description ORDER BY denial_rate DESC`;
      const { rows } = await this.db.queryWarehouse(kimball, enterprise, f.params);
      return rows;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('analytics/kpis')
  async analyticsKpis(@Query('from') from: string, @Query('to') to: string) {
    const f1 = this.db.bmFilter(from, to, 'bm', 1);
    const f2 = this.db.bmFilter(from, to, 'bm', f1.nextIdx);
    try {
      const kimball = `
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
          WHERE 1=1 ${f1.where}
        ), prem AS (
          SELECT COALESCE(SUM(fpt.direct_earned_premium),0) AS earned
          FROM reporting.fact_policy_transaction fpt
          JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key
          WHERE 1=1 ${f2.where}
        )
        SELECT c.*, p.earned,
          CASE WHEN p.earned>0 THEN ROUND(c.paid*100.0/p.earned,1) ELSE 0 END AS loss_ratio
        FROM clm c, prem p`;
      const enterprise = `
        WITH clm AS (
          SELECT COUNT(DISTINCT fcc.claim_sk) AS total_claims,
            COALESCE(SUM(fcc.direct_loss_paid),0) AS paid,
            COALESCE(SUM(fcc.direct_loss_reserve),0) AS reserve,
            COALESCE(SUM(fcc.direct_salvage_received),0) AS salvage,
            COALESCE(SUM(fcc.direct_subrogation_received),0) AS subrogation,
            COALESCE(SUM(fcc.direct_ao_paid+fcc.direct_dcc_paid),0) AS alae,
            ROUND(AVG(fcc.direct_claim_days_open),1) AS avg_tat,
            SUM(fcc.direct_open_claim_count) AS open_ct
          FROM reporting.fact_claim_component fcc
          JOIN reporting.dim_book_month bm ON bm.book_month_sk=fcc.book_month_sk
          WHERE 1=1 ${f1.where}
        ), prem AS (
          SELECT COALESCE(SUM(fpt.minimum_earned_premium_amount),0) AS earned
          FROM reporting.fact_policy_transaction fpt
          JOIN reporting.dim_book_month bm ON bm.book_month_sk=fpt.book_month_sk
          WHERE 1=1 ${f2.where}
        )
        SELECT c.*, p.earned,
          CASE WHEN p.earned>0 THEN ROUND(c.paid*100.0/p.earned,1) ELSE 0 END AS loss_ratio
        FROM clm c, prem p`;
      const { rows } = await this.db.queryWarehouse(kimball, enterprise, [...f1.params, ...f2.params]);
      return rows[0] || {};
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('analytics/by-lob')
  async analyticsByLob(@Query('from') from: string, @Query('to') to: string) {
    const f1 = this.db.bmFilter(from, to, 'bm', 1);
    const f2 = this.db.bmFilter(from, to, 'bm', f1.nextIdx);
    try {
      const kimball = `
        WITH clm AS (
          SELECT fcc.line_of_business_key,
            COUNT(DISTINCT fcc.claim_key) AS claims,
            COALESCE(SUM(fcc.direct_loss_paid),0) AS paid,
            COALESCE(SUM(fcc.direct_salvage_received),0) AS salvage,
            COALESCE(SUM(fcc.direct_subrogation_received),0) AS subro,
            ROUND(AVG(fcc.direct_claim_days_open),1) AS avg_tat
          FROM reporting.fact_claim_component fcc
          JOIN reporting.dim_book_month bm ON bm.book_month_key=fcc.book_month_key
          WHERE 1=1 ${f1.where} GROUP BY fcc.line_of_business_key
        ), prem AS (
          SELECT fpt.line_of_business_key, COALESCE(SUM(fpt.direct_earned_premium),0) AS earned
          FROM reporting.fact_policy_transaction fpt
          JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key
          WHERE 1=1 ${f2.where} GROUP BY fpt.line_of_business_key
        )
        SELECT COALESCE(lob.line_of_business_description,'Unknown') AS lob,
          c.claims, c.paid, c.salvage, c.subro, c.avg_tat,
          COALESCE(p.earned,0) AS earned,
          CASE WHEN COALESCE(p.earned,0)>0 THEN ROUND(c.paid*100.0/p.earned,1) ELSE 0 END AS loss_ratio
        FROM clm c LEFT JOIN prem p ON p.line_of_business_key=c.line_of_business_key
        LEFT JOIN reporting.dim_line_of_business lob ON lob.line_of_business_key=c.line_of_business_key
        ORDER BY c.paid DESC`;
      const enterprise = `
        WITH clm AS (
          SELECT p.lob_sk AS lob_sk,
            COUNT(DISTINCT fcc.claim_sk) AS claims,
            COALESCE(SUM(fcc.direct_loss_paid),0) AS paid,
            COALESCE(SUM(fcc.direct_salvage_received),0) AS salvage,
            COALESCE(SUM(fcc.direct_subrogation_received),0) AS subro,
            ROUND(AVG(fcc.direct_claim_days_open),1) AS avg_tat
          FROM reporting.fact_claim_component fcc
          JOIN reporting.dim_book_month bm ON bm.book_month_sk=fcc.book_month_sk
          JOIN reporting.dim_claim cl ON cl.claim_sk = fcc.claim_sk
          LEFT JOIN reporting.dim_policy p ON p.policy_sk = cl.policy_sk
          WHERE 1=1 ${f1.where} GROUP BY p.lob_sk
        ), prem AS (
          SELECT fpt.lob_sk, COALESCE(SUM(fpt.minimum_earned_premium_amount),0) AS earned
          FROM reporting.fact_policy_transaction fpt
          JOIN reporting.dim_book_month bm ON bm.book_month_sk=fpt.book_month_sk
          WHERE 1=1 ${f2.where} GROUP BY fpt.lob_sk
        )
        SELECT COALESCE(lob.line_of_business_description,'Unknown') AS lob,
          c.claims, c.paid, c.salvage, c.subro, c.avg_tat,
          COALESCE(p.earned,0) AS earned,
          CASE WHEN COALESCE(p.earned,0)>0 THEN ROUND(c.paid*100.0/p.earned,1) ELSE 0 END AS loss_ratio
        FROM clm c LEFT JOIN prem p ON p.lob_sk=c.lob_sk
        LEFT JOIN reporting.dim_line_of_business lob ON lob.lob_sk=c.lob_sk
        ORDER BY c.paid DESC`;
      const { rows } = await this.db.queryWarehouse(kimball, enterprise, [...f1.params, ...f2.params]);
      return rows;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('compliance/kpis')
  async complianceKpis(@Query('from') from: string, @Query('to') to: string) {
    const f = this.db.bmFilter(from, to);
    try {
      const kimball = `
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
        WHERE 1=1 ${f.where}`;
      const enterprise = kimball
        .replace(/fcc\.claim_key/g, 'fcc.claim_sk')
        .replace(/bm\.book_month_key=fcc\.book_month_key/g, 'bm.book_month_sk=fcc.book_month_sk');
      const { rows } = await this.db.queryWarehouse(kimball, enterprise, f.params);
      return rows[0] || {};
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('compliance/by-lob')
  async complianceByLob(@Query('from') from: string, @Query('to') to: string) {
    const f = this.db.bmFilter(from, to);
    try {
      const kimball = `
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
        WHERE 1=1 ${f.where} GROUP BY lob.line_of_business_description ORDER BY breach_rate DESC`;
      const enterprise = `
        SELECT COALESCE(lob.line_of_business_description,'Unknown') AS lob,
          COUNT(DISTINCT fcc.claim_sk) AS claims,
          COUNT(DISTINCT CASE WHEN fcc.direct_claim_days_open>30 THEN fcc.claim_sk END) AS breaches,
          CASE WHEN COUNT(DISTINCT fcc.claim_sk)>0
               THEN ROUND(COUNT(DISTINCT CASE WHEN fcc.direct_claim_days_open>30 THEN fcc.claim_sk END)*100.0
                          / COUNT(DISTINCT fcc.claim_sk),1) ELSE 0 END AS breach_rate,
          ROUND(AVG(fcc.direct_claim_days_open),1) AS avg_tat
        FROM reporting.fact_claim_component fcc
        JOIN reporting.dim_book_month bm ON bm.book_month_sk=fcc.book_month_sk
        JOIN reporting.dim_claim cl ON cl.claim_sk = fcc.claim_sk
        LEFT JOIN reporting.dim_policy p ON p.policy_sk = cl.policy_sk
        LEFT JOIN reporting.dim_line_of_business lob ON lob.lob_sk = p.lob_sk
        WHERE 1=1 ${f.where} GROUP BY lob.line_of_business_description ORDER BY breach_rate DESC`;
      const { rows } = await this.db.queryWarehouse(kimball, enterprise, f.params);
      return rows;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
