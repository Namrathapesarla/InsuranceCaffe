import { Controller, Get, Query, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Controller('agent')
export class AgentUsecasesController {
  constructor(private db: DatabaseService) {}

  // =====================================================================
  //  1. AGENCY SNAPSHOT
  // =====================================================================
  @Get('snapshot/kpis')
  async snapshotKpis(@Query('from') from: string, @Query('to') to: string) {
    const f1 = this.db.bmFilter(from, to, 'bm', 1);
    const f2 = this.db.bmFilter(from, to, 'bm', f1.nextIdx);
    try {
      const sql = `
        WITH pol AS (
          SELECT COUNT(DISTINCT CASE WHEN a.full_legal_name IS NOT NULL THEN a.full_legal_name END) AS agents, COUNT(DISTINCT fpt.policy_key) AS policies,
            COALESCE(SUM(fpt.direct_written_premium),0) AS written,
            COALESCE(SUM(fpt.direct_earned_premium),0) AS earned,
            COALESCE(SUM(fpt.direct_producer_commission),0) AS commission,
            COUNT(DISTINCT CASE WHEN fpt.new_or_renewal_code='NEW' THEN fpt.policy_key END) AS new_biz,
            COUNT(DISTINCT CASE WHEN fpt.new_or_renewal_code='RNW' THEN fpt.policy_key END) AS renewals
          FROM reporting.fact_policy_transaction fpt
          JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key
          LEFT JOIN reporting.dim_agent a ON a.agent_key=fpt.agent_key
          WHERE 1=1 ${f1.where}
        ), clm AS (
          SELECT COALESCE(SUM(fcc.direct_loss_paid+fcc.direct_ao_paid+fcc.direct_dcc_paid),0) AS incurred
          FROM reporting.fact_claim_component fcc
          JOIN reporting.dim_book_month bm ON bm.book_month_key=fcc.book_month_key WHERE 1=1 ${f2.where}
        )
        SELECT p.*, c.incurred,
          CASE WHEN p.earned>0 THEN ROUND(c.incurred*100.0/p.earned,1) ELSE 0 END AS loss_ratio,
          CASE WHEN p.policies>0 THEN ROUND(p.renewals*100.0/p.policies,1) ELSE 0 END AS retention_rate
        FROM pol p, clm c`;
      const { rows } = await this.db.queryWithEnterprise(sql, [...f1.params, ...f2.params]);
      return rows[0] || {};
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('snapshot/by-agent')
  async snapshotByAgent(@Query('from') from: string, @Query('to') to: string) {
    const f = this.db.bmFilter(from, to);
    try {
      const sql = `
        SELECT COALESCE(a.full_legal_name,'Agent '||fpt.agent_key) AS agent,
          COUNT(DISTINCT fpt.policy_key) AS policies,
          COALESCE(SUM(fpt.direct_written_premium),0) AS written,
          COALESCE(SUM(fpt.direct_producer_commission),0) AS commission,
          COUNT(DISTINCT CASE WHEN fpt.new_or_renewal_code='RNW' THEN fpt.policy_key END) AS renewals,
          CASE WHEN COUNT(DISTINCT fpt.policy_key)>0
               THEN ROUND(COUNT(DISTINCT CASE WHEN fpt.new_or_renewal_code='RNW' THEN fpt.policy_key END)*100.0/COUNT(DISTINCT fpt.policy_key),1) ELSE 0 END AS retention
        FROM reporting.fact_policy_transaction fpt
        JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key
        LEFT JOIN reporting.dim_agent a ON a.agent_key=fpt.agent_key
        WHERE 1=1 ${f.where} GROUP BY agent ORDER BY written DESC LIMIT 10`;
      const { rows } = await this.db.queryWithEnterprise(sql, f.params);
      return rows;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  // =====================================================================
  //  2. PRODUCER PRODUCTION REPORT
  // =====================================================================
  @Get('production/by-agent')
  async productionByAgent(@Query('from') from: string, @Query('to') to: string) {
    const f = this.db.bmFilter(from, to);
    try {
      const sql = `
        SELECT COALESCE(a.full_legal_name,'Agent '||fpt.agent_key) AS agent,
          COUNT(DISTINCT fpt.policy_key) AS policies,
          COALESCE(SUM(fpt.direct_written_premium),0) AS written,
          COALESCE(SUM(fpt.direct_earned_premium),0) AS earned,
          COALESCE(SUM(fpt.written_exposures),0) AS exposures,
          COUNT(DISTINCT CASE WHEN fpt.new_or_renewal_code='NEW' THEN fpt.policy_key END) AS new_biz,
          COUNT(DISTINCT CASE WHEN fpt.new_or_renewal_code='RNW' THEN fpt.policy_key END) AS renewals
        FROM reporting.fact_policy_transaction fpt
        JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key
        LEFT JOIN reporting.dim_agent a ON a.agent_key=fpt.agent_key
        WHERE 1=1 ${f.where} GROUP BY agent ORDER BY written DESC LIMIT 10`;
      const { rows } = await this.db.queryWithEnterprise(sql, f.params);
      return rows;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('production/by-lob')
  async productionByLob(@Query('from') from: string, @Query('to') to: string) {
    const f = this.db.bmFilter(from, to);
    try {
      const sql = `
        SELECT COALESCE(lob.line_of_business_description,'Unknown') AS lob,
          COUNT(DISTINCT fpt.agent_key) AS agents,
          COALESCE(SUM(fpt.direct_written_premium),0) AS written,
          COUNT(DISTINCT fpt.policy_key) AS policies
        FROM reporting.fact_policy_transaction fpt
        JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key
        LEFT JOIN reporting.dim_line_of_business lob ON lob.line_of_business_key=fpt.line_of_business_key
        WHERE 1=1 ${f.where} GROUP BY lob.line_of_business_description ORDER BY written DESC`;
      const { rows } = await this.db.queryWithEnterprise(sql, f.params);
      return rows;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  // =====================================================================
  //  3. COMMISSION CALCULATION
  // =====================================================================
  @Get('commission/kpis')
  async commissionKpis(@Query('from') from: string, @Query('to') to: string) {
    const f = this.db.bmFilter(from, to);
    try {
      const sql = `
        SELECT COALESCE(SUM(fpt.direct_written_premium),0) AS written,
          COALESCE(SUM(fpt.direct_company_commission),0) AS co_comm,
          COALESCE(SUM(fpt.direct_producer_commission),0) AS pr_comm,
          COALESCE(SUM(fpt.direct_producer_contingent_commission),0) AS contingent,
          COALESCE(SUM(fpt.direct_company_commission+fpt.direct_producer_commission),0) AS total_comm,
          CASE WHEN SUM(fpt.direct_written_premium)>0
               THEN ROUND(SUM(fpt.direct_producer_commission)*100.0/SUM(fpt.direct_written_premium),1) ELSE 0 END AS avg_rate,
          COUNT(DISTINCT CASE WHEN a.full_legal_name IS NOT NULL THEN a.full_legal_name END) AS agents
        FROM reporting.fact_policy_transaction fpt
        JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key
        LEFT JOIN reporting.dim_agent a ON a.agent_key=fpt.agent_key
        WHERE 1=1 ${f.where}`;
      const { rows } = await this.db.queryWithEnterprise(sql, f.params);
      return rows[0] || {};
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('commission/by-agent')
  async commissionByAgent(@Query('from') from: string, @Query('to') to: string) {
    const f = this.db.bmFilter(from, to);
    try {
      const sql = `
        SELECT COALESCE(a.full_legal_name,'Agent '||fpt.agent_key) AS agent,
          COUNT(DISTINCT fpt.policy_key) AS policies,
          COALESCE(SUM(fpt.direct_written_premium),0) AS written,
          COALESCE(SUM(fpt.net_written_premium),0) AS net_written,
          COALESCE(SUM(fpt.direct_company_commission),0) AS co_comm,
          COALESCE(SUM(fpt.direct_producer_commission),0) AS pr_comm,
          COALESCE(SUM(fpt.direct_company_commission+fpt.direct_producer_commission),0) AS total_comm,
          CASE WHEN SUM(fpt.direct_written_premium)>0
               THEN ROUND(SUM(fpt.direct_company_commission+fpt.direct_producer_commission)*100.0/SUM(fpt.direct_written_premium),1) ELSE 0 END AS rate,
          COALESCE(SUM(fpt.direct_surcharges+fpt.direct_taxes+fpt.direct_fees),0) AS cost_load,
          CASE WHEN SUM(fpt.direct_written_premium)>0
               THEN ROUND(SUM(fpt.net_written_premium)*100.0/SUM(fpt.direct_written_premium),1) ELSE 0 END AS retention_pct
        FROM reporting.fact_policy_transaction fpt
        JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key
        LEFT JOIN reporting.dim_agent a ON a.agent_key=fpt.agent_key
        WHERE 1=1 ${f.where} GROUP BY agent ORDER BY total_comm DESC LIMIT 10`;
      const { rows } = await this.db.queryWithEnterprise(sql, f.params);
      return rows;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  // =====================================================================
  //  4. AGENT LICENSE TRACKING
  // =====================================================================
  @Get('license/kpis')
  async licenseKpis(@Query('from') from: string, @Query('to') to: string) {
    const f = this.db.bmFilter(from, to);
    try {
      const sql = `
        SELECT COUNT(DISTINCT CASE WHEN a.full_legal_name IS NOT NULL THEN a.full_legal_name END) AS total_agents,
          COUNT(DISTINCT CASE WHEN a.current_flag='Y' AND a.full_legal_name IS NOT NULL THEN a.full_legal_name END) AS active_agents,
          COUNT(DISTINCT fpt.policy_key) AS total_policies,
          COALESCE(SUM(fpt.direct_written_premium),0) AS total_written,
          COALESCE(SUM(fpt.direct_producer_commission),0) AS total_commission
        FROM reporting.fact_policy_transaction fpt
        JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key
        LEFT JOIN reporting.dim_agent a ON a.agent_key=fpt.agent_key
        WHERE 1=1 ${f.where}`;
      const { rows } = await this.db.queryWithEnterprise(sql, f.params);
      return rows[0] || {};
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('license/by-agent')
  async licenseByAgent(@Query('from') from: string, @Query('to') to: string) {
    const f = this.db.bmFilter(from, to);
    try {
      const sql = `
        SELECT COALESCE(a.full_legal_name,'Agent '||fpt.agent_key) AS agent,
          a.agent_id_code AS license,
          a.party_status_description AS status,
          COALESCE(g.region_name, g.state_name, rt.rating_territory_code, 'N/A') AS territory,
          COUNT(DISTINCT fpt.policy_key) AS policies,
          COALESCE(SUM(fpt.direct_written_premium),0) AS written,
          COALESCE(SUM(fpt.direct_producer_commission),0) AS commission
        FROM reporting.fact_policy_transaction fpt
        JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key
        LEFT JOIN reporting.dim_agent a ON a.agent_key=fpt.agent_key
        LEFT JOIN reporting.dim_geography g ON g.geography_key=fpt.geography_key
        LEFT JOIN reporting.dim_rating_territory rt ON rt.rating_territory_key=fpt.rating_territory_key
        WHERE 1=1 ${f.where} GROUP BY agent, a.agent_id_code, a.party_status_description, territory
        ORDER BY written DESC LIMIT 15`;
      const { rows } = await this.db.queryWithEnterprise(sql, f.params);
      return rows;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  // =====================================================================
  //  5. TOP 10 PRODUCERS BY PREMIUM
  // =====================================================================
  @Get('top-producers')
  async topProducers(@Query('from') from: string, @Query('to') to: string) {
    const f1 = this.db.bmFilter(from, to, 'bm', 1);
    const f2 = this.db.bmFilter(from, to, 'bm', f1.nextIdx);
    try {
      const sql = `
        WITH pol AS (
          SELECT fpt.agent_key,
            COALESCE(SUM(fpt.direct_written_premium),0) AS written,
            COALESCE(SUM(fpt.direct_earned_premium),0) AS earned,
            COALESCE(SUM(fpt.direct_producer_commission),0) AS commission,
            COUNT(DISTINCT fpt.policy_key) AS policies
          FROM reporting.fact_policy_transaction fpt
          JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key WHERE 1=1 ${f1.where}
          GROUP BY fpt.agent_key
        ), clm AS (
          SELECT fcc.adjuster_key AS agent_key,
            COALESCE(SUM(fcc.direct_loss_paid+fcc.direct_ao_paid+fcc.direct_dcc_paid),0) AS incurred
          FROM reporting.fact_claim_component fcc
          JOIN reporting.dim_book_month bm ON bm.book_month_key=fcc.book_month_key WHERE 1=1 ${f2.where}
          GROUP BY fcc.adjuster_key
        )
        SELECT COALESCE(a.full_legal_name,'Agent '||p.agent_key) AS agent,
          p.policies, p.written, p.earned, p.commission,
          COALESCE(c.incurred,0) AS incurred,
          CASE WHEN p.earned>0 THEN ROUND(COALESCE(c.incurred,0)*100.0/p.earned,1) ELSE 0 END AS loss_ratio
        FROM pol p LEFT JOIN clm c ON c.agent_key=p.agent_key
        LEFT JOIN reporting.dim_agent a ON a.agent_key=p.agent_key
        ORDER BY p.written DESC LIMIT 10`;
      const { rows } = await this.db.queryWithEnterprise(sql, [...f1.params, ...f2.params]);
      return rows;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  // =====================================================================
  //  6. RETENTION & PERSISTENCY
  // =====================================================================
  @Get('retention/kpis')
  async retentionKpis(@Query('from') from: string, @Query('to') to: string) {
    const f = this.db.bmFilter(from, to);
    try {
      const sql = `
        SELECT COUNT(DISTINCT fpt.policy_key) AS total_policies,
          COUNT(DISTINCT CASE WHEN fpt.new_or_renewal_code='RNW' THEN fpt.policy_key END) AS renewed,
          COUNT(DISTINCT CASE WHEN fpt.new_or_renewal_code='NEW' THEN fpt.policy_key END) AS new_biz,
          COUNT(DISTINCT CASE WHEN fpt.cancelled_in_month_indicator='Y' THEN fpt.policy_key END) AS lapsed,
          CASE WHEN COUNT(DISTINCT fpt.policy_key)>0
               THEN ROUND(COUNT(DISTINCT CASE WHEN fpt.new_or_renewal_code='RNW' THEN fpt.policy_key END)*100.0/COUNT(DISTINCT fpt.policy_key),1) ELSE 0 END AS retention_rate,
          COALESCE(SUM(CASE WHEN fpt.new_or_renewal_code='RNW' THEN fpt.direct_written_premium ELSE 0 END),0) AS renewal_premium,
          COALESCE(SUM(fpt.direct_written_premium),0) AS total_written
        FROM reporting.fact_policy_transaction fpt
        JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key WHERE 1=1 ${f.where}`;
      const { rows } = await this.db.queryWithEnterprise(sql, f.params);
      return rows[0] || {};
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('retention/by-agent')
  async retentionByAgent(@Query('from') from: string, @Query('to') to: string) {
    const f = this.db.bmFilter(from, to);
    try {
      const sql = `
        SELECT COALESCE(a.full_legal_name,'Agent '||fpt.agent_key) AS agent,
          COUNT(DISTINCT fpt.policy_key) AS policies,
          COUNT(DISTINCT CASE WHEN fpt.new_or_renewal_code='RNW' THEN fpt.policy_key END) AS renewed,
          COUNT(DISTINCT CASE WHEN fpt.cancelled_in_month_indicator='Y' THEN fpt.policy_key END) AS lapsed,
          CASE WHEN COUNT(DISTINCT fpt.policy_key)>0
               THEN ROUND(COUNT(DISTINCT CASE WHEN fpt.new_or_renewal_code='RNW' THEN fpt.policy_key END)*100.0/COUNT(DISTINCT fpt.policy_key),1) ELSE 0 END AS retention,
          COALESCE(SUM(fpt.direct_written_premium),0) AS written
        FROM reporting.fact_policy_transaction fpt
        JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key
        LEFT JOIN reporting.dim_agent a ON a.agent_key=fpt.agent_key
        WHERE 1=1 ${f.where} GROUP BY agent ORDER BY retention DESC LIMIT 10`;
      const { rows } = await this.db.queryWithEnterprise(sql, f.params);
      return rows;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('retention/by-lob')
  async retentionByLob(@Query('from') from: string, @Query('to') to: string) {
    const f = this.db.bmFilter(from, to);
    try {
      const sql = `
        SELECT COALESCE(lob.line_of_business_description,'Unknown') AS lob,
          COUNT(DISTINCT fpt.policy_key) AS policies,
          COUNT(DISTINCT CASE WHEN fpt.new_or_renewal_code='RNW' THEN fpt.policy_key END) AS renewed,
          CASE WHEN COUNT(DISTINCT fpt.policy_key)>0
               THEN ROUND(COUNT(DISTINCT CASE WHEN fpt.new_or_renewal_code='RNW' THEN fpt.policy_key END)*100.0/COUNT(DISTINCT fpt.policy_key),1) ELSE 0 END AS retention
        FROM reporting.fact_policy_transaction fpt
        JOIN reporting.dim_book_month bm ON bm.book_month_key=fpt.book_month_key
        LEFT JOIN reporting.dim_line_of_business lob ON lob.line_of_business_key=fpt.line_of_business_key
        WHERE 1=1 ${f.where} GROUP BY lob.line_of_business_description ORDER BY retention DESC`;
      const { rows } = await this.db.queryWithEnterprise(sql, f.params);
      return rows;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
