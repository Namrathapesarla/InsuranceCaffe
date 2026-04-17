import { Controller, Get, Query, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Controller('master')
export class MasterController {
  constructor(private db: DatabaseService) {}

  @Get('parties')
  async parties() {
    /** Kimball-style keys (`agent_key`, `*_key` on facts). */
    const plain = `SELECT * FROM reporting.dim_agent ORDER BY agent_key NULLS LAST LIMIT 500`;
    /** Enterprise / India warehouse (`agent_sk`, `*_sk` on facts) — no `agent_key` column. */
    const plainSk = `SELECT * FROM reporting.dim_agent ORDER BY agent_sk NULLS LAST LIMIT 500`;
    const withRefs = `
      SELECT a.*,
        COALESCE(ag.agency_legal_name, ag.agency_trade_name, ag.legal_entity_name, ag.company_name, ag.agency_name) AS _ic_ref_agency,
        g.city_name AS _ic_ref_geo_city,
        COALESCE(g.state_name, g.state_province_name) AS _ic_ref_geo_state,
        g.region_name AS _ic_ref_geo_region,
        g.postal_code AS _ic_ref_geo_postal
      FROM reporting.dim_agent a
      LEFT JOIN reporting.dim_agency ag ON ag.agency_key = a.agency_key
      LEFT JOIN reporting.dim_geography g ON g.geography_key = a.geography_key
      ORDER BY a.agent_key NULLS LAST
      LIMIT 500`;
    /** Geography is usually on policy facts, not on dim_agent — mirror agent license SQL. */
    const withFactGeo = `
      WITH agent_fact AS (
        SELECT DISTINCT ON (fpt.agent_key)
          fpt.agent_key,
          fpt.geography_key,
          fpt.rating_territory_key
        FROM reporting.fact_policy_transaction fpt
        WHERE fpt.agent_key IS NOT NULL
        ORDER BY fpt.agent_key, fpt.direct_written_premium DESC NULLS LAST
      )
      SELECT
        a.*,
        COALESCE(
          ag.agency_legal_name,
          ag.agency_trade_name,
          ag.legal_entity_name,
          ag.company_name,
          ag.agency_name
        ) AS _ic_ref_agency,
        COALESCE(g2.city_name, g1.city_name) AS _ic_ref_geo_city,
        COALESCE(
          g2.state_name,
          g2.state_province_name,
          g1.state_name,
          g1.state_province_name,
          rt.rating_territory_code::text
        ) AS _ic_ref_geo_state,
        COALESCE(g2.region_name, g1.region_name) AS _ic_ref_geo_region
      FROM reporting.dim_agent a
      LEFT JOIN agent_fact af ON af.agent_key = a.agent_key
      LEFT JOIN reporting.dim_geography g1 ON g1.geography_key = a.geography_key
      LEFT JOIN reporting.dim_geography g2 ON g2.geography_key = af.geography_key
      LEFT JOIN reporting.dim_rating_territory rt ON rt.rating_territory_key = af.rating_territory_key
      LEFT JOIN reporting.dim_agency ag ON ag.agency_key = a.agency_key
      ORDER BY a.agent_key NULLS LAST
      LIMIT 500`;
    const attempts = [withFactGeo, withRefs, plain, plainSk];
    let lastErr: unknown;
    for (const sql of attempts) {
      try {
        const { rows } = await this.db.queryWithEnterprise(sql, []);
        return rows.map((r) => this.mapParty(r as Record<string, unknown>));
      } catch (e) {
        lastErr = e;
      }
    }
    throw new InternalServerErrorException(
      lastErr instanceof Error ? lastErr.message : 'parties query failed',
    );
  }

  @Get('locations')
  async locations() {
    try {
      const kimball = `
        WITH geo_rt AS (
          SELECT DISTINCT ON (fpt.geography_key)
            fpt.geography_key,
            fpt.rating_territory_key,
            fpt.ext_riskcd
          FROM reporting.fact_policy_transaction fpt
          WHERE fpt.geography_key IS NOT NULL
          ORDER BY fpt.geography_key, fpt.direct_written_premium DESC NULLS LAST
        )
        SELECT
          g.*,
          COALESCE(rt.rating_territory_code, geo_rt.ext_riskcd) AS _ic_ref_risk_zone
        FROM reporting.dim_geography g
        LEFT JOIN geo_rt ON geo_rt.geography_key = g.geography_key
        LEFT JOIN reporting.dim_rating_territory rt ON rt.rating_territory_key = geo_rt.rating_territory_key
        ORDER BY g.geography_key NULLS LAST
        LIMIT 500`;
      const enterprise = `
        WITH geo_rt AS (
          SELECT DISTINCT ON (fpt.geography_sk)
            fpt.geography_sk,
            fpt.rating_territory_key,
            fpt.ext_riskcd
          FROM reporting.fact_policy_transaction fpt
          WHERE fpt.geography_sk IS NOT NULL
          ORDER BY fpt.geography_sk, fpt.term_premium_amount DESC NULLS LAST
        )
        SELECT
          g.*,
          COALESCE(rt.rating_territory_code, geo_rt.ext_riskcd) AS _ic_ref_risk_zone
        FROM reporting.dim_geography g
        LEFT JOIN geo_rt ON geo_rt.geography_sk = g.geography_sk
        LEFT JOIN reporting.dim_rating_territory rt ON rt.rating_territory_key = geo_rt.rating_territory_key
        ORDER BY g.geography_sk NULLS LAST
        LIMIT 500`;
      const { rows } = await this.db.queryWarehouse(kimball, enterprise, []);
      return rows.map((r) => this.mapLocation(r as Record<string, unknown>));
    } catch (e) {
      throw new InternalServerErrorException((e as Error).message);
    }
  }

  @Get('quotes')
  async quotes() {
    try {
      const kimball = `
        SELECT
          fpt.policy_key,
          dp.full_policy_number AS quote_number,
          pr.licensed_product_name AS product,
          lob.line_of_business_description AS lob,
          COALESCE(fpt.exposure_amount, fpt.written_exposures, 0) AS sum_insured,
          COALESCE(fpt.direct_written_premium, 0) AS premium,
          CASE WHEN dp.isbound = 'Y' THEN 'Approved' ELSE 'Pending' END AS status,
          COALESCE(dp.policy_effective_date, bm.book_start_date) AS created_at
        FROM reporting.fact_policy_transaction fpt
        JOIN reporting.dim_book_month bm ON bm.book_month_key = fpt.book_month_key
        JOIN reporting.dim_policy dp ON dp.policy_key = fpt.policy_key
        LEFT JOIN reporting.dim_product pr ON pr.product_key = fpt.product_key
        LEFT JOIN reporting.dim_line_of_business lob ON lob.line_of_business_key = fpt.line_of_business_key
        ORDER BY bm.book_start_date DESC NULLS LAST, fpt.policy_key
        LIMIT 100`;
      const enterprise = `
        SELECT
          fpt.policy_sk AS policy_key,
          dp.full_policy_number AS quote_number,
          pr.licensed_product_name AS product,
          lob.line_of_business_description AS lob,
          COALESCE(fpt.exposure_amount, 0) AS sum_insured,
          COALESCE(fpt.term_premium_amount, 0) AS premium,
          CASE WHEN dp.isbound = 'Y' THEN 'Approved' ELSE 'Pending' END AS status,
          COALESCE(dp.policy_effective_date, bm.book_start_date) AS created_at
        FROM reporting.fact_policy_transaction fpt
        JOIN reporting.dim_book_month bm ON bm.book_month_sk = fpt.book_month_sk
        JOIN reporting.dim_policy dp ON dp.policy_sk = fpt.policy_sk
        LEFT JOIN reporting.dim_product pr ON pr.product_sk = fpt.product_sk
        LEFT JOIN reporting.dim_line_of_business lob ON lob.lob_sk = fpt.lob_sk
        ORDER BY bm.book_start_date DESC NULLS LAST, fpt.policy_sk
        LIMIT 100`;
      const { rows } = await this.db.queryWarehouse(kimball, enterprise, []);
      return rows.map((r) => ({
        quoteNumber: r.quote_number || `Q-${r.policy_key}`,
        product: r.product || '—',
        lob: r.lob || null,
        sumInsured: Number(r.sum_insured) || 0,
        premium: Number(r.premium) || 0,
        riskScore: 15 + (Number(r.policy_key) % 55),
        uwDecision: 'Pending',
        status: r.status || 'Pending',
        createdAt: r.created_at,
      }));
    } catch (e) {
      throw new InternalServerErrorException((e as Error).message);
    }
  }

  @Get('products')
  async products() {
    try {
      const kimball = `SELECT * FROM reporting.dim_product ORDER BY product_key NULLS LAST LIMIT 500`;
      const enterprise = `SELECT * FROM reporting.dim_product ORDER BY product_sk NULLS LAST LIMIT 500`;
      const { rows } = await this.db.queryWarehouse(kimball, enterprise, []);
      return rows.map((r) => this.mapProductRow(r as Record<string, unknown>));
    } catch (e) {
      throw new InternalServerErrorException((e as Error).message);
    }
  }

  @Get('policies')
  async policies(@Query('limit') limit?: string, @Query('offset') offset?: string) {
    const l = Math.min(Math.max(parseInt(limit || '100', 10) || 100, 1), 500);
    const o = Math.max(parseInt(offset || '0', 10) || 0, 0);
    try {
      const kimball = `
        SELECT policy_key AS id, full_policy_number AS policy_number,
               policy_effective_date AS effective_date, policy_expiration_date AS expiry_date
        FROM reporting.dim_policy
        ORDER BY policy_effective_date DESC NULLS LAST, policy_key
        LIMIT $1 OFFSET $2`;
      const enterprise = `
        SELECT policy_sk AS id, full_policy_number AS policy_number,
               policy_effective_date AS effective_date, policy_expiration_date AS expiry_date
        FROM reporting.dim_policy
        ORDER BY policy_effective_date DESC NULLS LAST, policy_sk
        LIMIT $1 OFFSET $2`;
      const { rows } = await this.db.queryWarehouse(kimball, enterprise, [l, o]);
      return rows.map((r) => ({
        id: r.id,
        policyNumber: r.policy_number,
        partyName: '—',
        productCode: null,
        productName: '—',
        lob: '—',
        status: '—',
        effectiveDate: r.effective_date,
        expiryDate: r.expiry_date,
      }));
    } catch (e) {
      throw new InternalServerErrorException((e as Error).message);
    }
  }

  private pick(row: Record<string, unknown>, ...keys: string[]) {
    for (const k of keys) {
      const v = row[k] ?? row[k.toLowerCase()];
      if (v != null && v !== '') return v;
    }
    return null;
  }

  private mapParty(row: Record<string, unknown>) {
    const str = (v: unknown) => (v == null ? '' : String(v));
    const key = this.pick(row, 'agent_key', 'agent_sk') ?? '—';
    const license = this.pick(
      row,
      'agent_id_code',
      'irdai_license_number',
      'agent_code',
      'producer_code',
      'license_number',
      'agent_license_number',
      'registration_number',
      'national_producer_number',
    );
    const expiry = this.pick(
      row,
      'license_expiry_date',
      'irdai_license_expiry_dt',
      'appointment_expiry_date',
      'license_expiration_date',
      'appointment_end_date',
      'registration_expiration_date',
      'license_end_date',
      'expiration_date',
    );
    return {
      empId:
        str(
          this.pick(
            row,
            'agent_id_code',
            'agent_code',
            'agent_employee_id',
            'employee_id',
            'producer_code',
            'national_producer_number',
          ),
        ) || `AGT-${key}`,
      name:
        str(
          this.pick(
            row,
            'full_legal_name',
            'agent_name',
            'legal_name',
            'preferred_name',
            'display_name',
            'first_name',
          ),
        ) || `Agent ${key}`,
      company: str(
        this.pick(
          row,
          '_ic_ref_agency',
          'agency_name',
          'agency_legal_name',
          'producer_firm_name',
          'parent_agency_name',
          'broker_dealer_name',
          'channel_partner_name',
          'organization_name',
          'employer_name',
          'firm_name',
          'writing_company_name',
          'agency_group_name',
        ),
      ) || str(this.pick(row, '_ic_ref_geo_region')),
      gender: str(
        this.pick(
          row,
          'gender_description',
          'gender',
          'sex',
          'insured_gender_description',
        ),
      ),
      city: str(
        this.pick(
          row,
          '_ic_ref_geo_city',
          'city_name',
          'mailing_city',
          'office_city',
          'residence_city',
          'agent_city',
          'home_city',
          'city',
          'municipality',
        ),
      ),
      state: str(
        this.pick(
          row,
          '_ic_ref_geo_state',
          'state_province_name',
          'state_name',
          'irdai_license_state_cd',
          'mailing_state',
          'office_state',
          'state_code',
          'state',
          'province',
        ),
      ),
      phone: str(
        this.pick(
          row,
          'primary_phone_number',
          'phone_number',
          'mobile_phone',
          'cell_phone',
          'work_phone',
          'home_phone',
          'contact_phone',
          'telephone_number',
          'phone',
          'day_phone',
          'evening_phone',
        ),
      ),
      licenseNo: license ? str(license) : null,
      licenseExpiry: expiry ?? null,
    };
  }

  private mapLocation(row: Record<string, unknown>) {
    const str = (v: unknown) => (v == null ? '' : String(v));
    const key = this.pick(row, 'geography_key', 'geography_sk');
    return {
      name:
        str(this.pick(row, 'geography_name', 'location_name', 'territory_name', 'city_name')) ||
        `Location ${key ?? '?'}`,
      type: str(this.pick(row, 'geography_type', 'location_type', 'geo_type')) || 'Location',
      city: str(this.pick(row, 'city', 'city_name', 'municipality_name', 'municipality')) || '',
      state: str(this.pick(row, 'state_name', 'state_province_name')) || '',
      region: str(this.pick(row, 'region_name')) || '',
      country: str(this.pick(row, 'country_name', 'country')) || '',
      pincode: str(this.pick(row, 'postal_code', 'zip_code', 'pincode')) || '',
      riskZone: str(this.pick(row, '_ic_ref_risk_zone', 'risk_zone_description', 'risk_zone_cd', 'territory', 'catastrophe_zone', 'flood_zone', 'flood_zone_cd', 'earthquake_zone_cd', 'irdai_zone_cd', 'rating_territory_code')) || '—',
    };
  }

  private mapProductRow(row: Record<string, unknown>) {
    const str = (v: unknown) => (v == null ? '' : String(v));
    const key = this.pick(row, 'product_key', 'product_sk');
    const statusRaw = this.pick(row, 'product_status_description', 'status', 'record_status');
    const statusStr = statusRaw != null ? str(statusRaw) : '';
    return {
      id: key,
      code: str(this.pick(row, 'internal_product_code', 'product_code', 'product_number')) || `PRD-${key}`,
      name: str(this.pick(row, 'licensed_product_name', 'product_name')) || 'Product',
      lob: str(this.pick(row, 'line_of_business_description', 'lob')) || '—',
      version: str(this.pick(row, 'product_version', 'version')) || '1.0',
      effectiveFrom: this.pick(row, 'effective_date', 'product_effective_date'),
      gst: 18,
      status: !statusStr || /active/i.test(statusStr) ? 'Active' : statusStr,
    };
  }
}
