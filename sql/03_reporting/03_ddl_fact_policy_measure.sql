/*******************************************************************************
 * Reporting Layer - Fact Policy Measure DDL
 * Schema: reporting
 * Source: TableVScolumn.docx (POLICY MEASURES section)
 * Database: PostgreSQL 15+
 ******************************************************************************/

DROP TABLE IF EXISTS reporting.fact_policy_measure CASCADE;
CREATE TABLE reporting.fact_policy_measure (
    fact_policy_measure_id                  BIGSERIAL PRIMARY KEY,

    -- Foreign keys to dimensions
    policy_key                              INTEGER REFERENCES reporting.dim_policy(policy_key),
    coverage_key                            INTEGER REFERENCES reporting.dim_coverage(coverage_key),
    product_key                             INTEGER REFERENCES reporting.dim_product(product_key),
    agent_key                               INTEGER REFERENCES reporting.dim_agent(agent_key),
    insured_key                             INTEGER REFERENCES reporting.dim_insured(insured_key),
    account_key                             INTEGER REFERENCES reporting.dim_account(account_key),
    line_of_business_key                    INTEGER REFERENCES reporting.dim_line_of_business(line_of_business_key),
    geography_key                           INTEGER REFERENCES reporting.dim_geography(geography_key),
    book_month_key                          INTEGER REFERENCES reporting.dim_book_month(book_month_key),
    policy_status_key                       INTEGER REFERENCES reporting.dim_policy_status(policy_status_key),

    -- ========== Premium Measures ==========
    direct_audit_premium                    NUMERIC(18,2) DEFAULT 0,
    direct_cancelled_premium                NUMERIC(18,2) DEFAULT 0,
    direct_earned_premium                   NUMERIC(18,2) DEFAULT 0,
    direct_endorsement_premium              NUMERIC(18,2) DEFAULT 0,
    direct_manual_premium                   NUMERIC(18,2) DEFAULT 0,
    direct_new_business_premium             NUMERIC(18,2) DEFAULT 0,
    direct_original_written_premium         NUMERIC(18,2) DEFAULT 0,
    direct_reinstatement_premium            NUMERIC(18,2) DEFAULT 0,
    direct_renewal_premium                  NUMERIC(18,2) DEFAULT 0,
    direct_term_premium                     NUMERIC(18,2) DEFAULT 0,
    direct_unearned_premium                 NUMERIC(18,2) DEFAULT 0,
    direct_written_premium                  NUMERIC(18,2) DEFAULT 0,
    net_written_premium                     NUMERIC(18,2) DEFAULT 0,

    -- ========== Commission Measures ==========
    direct_company_commission               NUMERIC(18,2) DEFAULT 0,
    direct_company_commission_earned        NUMERIC(18,2) DEFAULT 0,
    direct_company_commission_unearned      NUMERIC(18,2) DEFAULT 0,
    direct_producer_commission              NUMERIC(18,2) DEFAULT 0,
    direct_producer_commission_earned       NUMERIC(18,2) DEFAULT 0,
    direct_producer_commission_unearned     NUMERIC(18,2) DEFAULT 0,
    direct_producer_contingent_commission   NUMERIC(18,2) DEFAULT 0,

    -- ========== Fees, Surcharges & Taxes ==========
    direct_fees                             NUMERIC(18,2) DEFAULT 0,
    direct_surcharges                       NUMERIC(18,2) DEFAULT 0,
    direct_taxes                            NUMERIC(18,2) DEFAULT 0,

    -- ========== Exposure Measures ==========
    earned_exposures                        NUMERIC(18,4) DEFAULT 0,
    unearned_exposures                      NUMERIC(18,4) DEFAULT 0,
    written_exposures                       NUMERIC(18,4) DEFAULT 0,

    -- ========== Count Measures ==========
    endorsement_count                       INTEGER DEFAULT 0,

    -- ========== Policy Identifiers ==========
    full_policy_number                      VARCHAR(50),
    policy_number                           VARCHAR(50),
    user_defined_field_4                    VARCHAR(200),
    user_defined_field_5                    VARCHAR(200),

    -- ========== Indicator Flags ==========
    cancelled_in_month_indicator            CHAR(1),
    inforce_in_month_indicator              CHAR(1),
    inforce_indicator                       CHAR(1),
    issued_in_month_indicator               CHAR(1),
    new_or_renewal_code                     VARCHAR(10),
    reinstated_in_month_indicator           CHAR(1),
    book_end_date                           DATE,

    -- Audit
    load_date                               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_fpm_policy_key     ON reporting.fact_policy_measure(policy_key);
CREATE INDEX idx_fpm_product_key    ON reporting.fact_policy_measure(product_key);
CREATE INDEX idx_fpm_agent_key      ON reporting.fact_policy_measure(agent_key);
CREATE INDEX idx_fpm_book_month     ON reporting.fact_policy_measure(book_month_key);
CREATE INDEX idx_fpm_lob_key        ON reporting.fact_policy_measure(line_of_business_key);
CREATE INDEX idx_fpm_policy_status  ON reporting.fact_policy_measure(policy_status_key);
