/*******************************************************************************
 * Reporting Layer - Fact Tables DDL
 * Schema: reporting
 * Source: TableVScolumn.docx
 * Database: PostgreSQL 15+
 ******************************************************************************/

-- ============================================================================
-- FACT 1: FACT_CLAIM_COMPONENT
-- Grain: One row per claim component snapshot / transaction
-- ============================================================================
DROP TABLE IF EXISTS reporting.fact_claim_component CASCADE;
CREATE TABLE reporting.fact_claim_component (
    fact_claim_component_id                     BIGSERIAL PRIMARY KEY,

    -- Foreign keys to dimensions
    claim_key                                   INTEGER REFERENCES reporting.dim_claim(claim_key),
    claim_component_key                         INTEGER REFERENCES reporting.dim_claim_component(claim_component_key),
    claim_status_key                            INTEGER REFERENCES reporting.dim_claim_status(claim_status_key),
    claimant_key                                INTEGER REFERENCES reporting.dim_claimant(claimant_key),
    policy_key                                  INTEGER REFERENCES reporting.dim_policy(policy_key),
    coverage_key                                INTEGER REFERENCES reporting.dim_coverage(coverage_key),
    line_of_business_key                        INTEGER REFERENCES reporting.dim_line_of_business(line_of_business_key),
    geography_key                               INTEGER REFERENCES reporting.dim_geography(geography_key),
    adjuster_key                                INTEGER REFERENCES reporting.dim_adjuster(adjuster_key),
    loss_event_key                              INTEGER REFERENCES reporting.dim_loss_event(loss_event_key),
    occurrence_key                              INTEGER REFERENCES reporting.dim_occurrence(occurrence_key),
    book_month_key                              INTEGER REFERENCES reporting.dim_book_month(book_month_key),
    insured_key                                 INTEGER REFERENCES reporting.dim_insured(insured_key),
    legal_jurisdiction_key                      INTEGER REFERENCES reporting.dim_legal_jurisdiction(legal_jurisdiction_key),

    -- ========== Monetary Measures ==========
    -- Allocated Loss Adjustment Expense (AO = Adjustment Other)
    direct_ao_paid                              NUMERIC(18,2) DEFAULT 0,
    direct_ao_paid_itd                          NUMERIC(18,2) DEFAULT 0,
    direct_ao_recovery                          NUMERIC(18,2) DEFAULT 0,
    direct_ao_reserve                           NUMERIC(18,2) DEFAULT 0,
    direct_ao_reserve_outstanding               NUMERIC(18,2) DEFAULT 0,
    ceded_ao_paid                               NUMERIC(18,2) DEFAULT 0,

    -- Defense & Cost Containment (DCC)
    ceded_dcc_paid                              NUMERIC(18,2) DEFAULT 0,
    direct_dcc_paid                             NUMERIC(18,2) DEFAULT 0,
    direct_dcc_paid_itd                         NUMERIC(18,2) DEFAULT 0,
    direct_dcc_recovery                         NUMERIC(18,2) DEFAULT 0,
    direct_dcc_reserve                          NUMERIC(18,2) DEFAULT 0,
    direct_dcc_reserve_outstanding              NUMERIC(18,2) DEFAULT 0,

    -- Deductible recovery
    direct_deductible_recovery_received         NUMERIC(18,2) DEFAULT 0,
    direct_deductible_recovery_reserve          NUMERIC(18,2) DEFAULT 0,

    -- IBNR reserves
    direct_ibnr_allocated_ao_reserve            NUMERIC(18,2) DEFAULT 0,
    direct_ibnr_allocated_dcc_reserve           NUMERIC(18,2) DEFAULT 0,
    direct_ibnr_loss_reserve                    NUMERIC(18,2) DEFAULT 0,
    direct_ibnr_unallocated_ao_reserve          NUMERIC(18,2) DEFAULT 0,

    -- Loss
    direct_initial_loss_reserve                 NUMERIC(18,2) DEFAULT 0,
    direct_loss_paid                            NUMERIC(18,2) DEFAULT 0,
    direct_loss_paid_itd                        NUMERIC(18,2) DEFAULT 0,
    direct_loss_reserve                         NUMERIC(18,2) DEFAULT 0,
    direct_loss_reserve_outstanding             NUMERIC(18,2) DEFAULT 0,

    -- Medical
    direct_medical_paid                         NUMERIC(18,2) DEFAULT 0,
    direct_medical_reserve                      NUMERIC(18,2) DEFAULT 0,

    -- Salvage
    direct_salvage_received                     NUMERIC(18,2) DEFAULT 0,
    direct_salvage_received_itd                 NUMERIC(18,2) DEFAULT 0,
    direct_salvage_reserve                      NUMERIC(18,2) DEFAULT 0,
    direct_salvage_reserve_outstanding          NUMERIC(18,2) DEFAULT 0,

    -- Subrogation
    direct_subrogation_received                 NUMERIC(18,2) DEFAULT 0,
    direct_subrogation_received_itd             NUMERIC(18,2) DEFAULT 0,
    direct_subrogation_reserve                  NUMERIC(18,2) DEFAULT 0,
    direct_subrogation_reserve_outstanding      NUMERIC(18,2) DEFAULT 0,

    -- ULAE (Unallocated Loss Adjustment Expense)
    direct_ulae_reserve                         NUMERIC(18,2) DEFAULT 0,
    direct_ulae_paid                            NUMERIC(18,2) DEFAULT 0,

    -- ========== Days Open ==========
    direct_claim_component_days_open            INTEGER,
    direct_claim_days_open                      INTEGER,

    -- ========== Degenerate Dimension Dates ==========
    claim_close_date                            DATE,
    claim_component_close_date                  DATE,
    claim_component_date_of_loss                DATE,
    claim_component_open_date                   DATE,
    claim_component_reopen_date                 DATE,
    claim_component_reported_date               DATE,
    claim_component_status_code                 VARCHAR(20),
    claim_date_of_loss                          DATE,
    claim_open_date                             DATE,
    claim_reopen_date                           DATE,
    claim_reported_date                         DATE,
    claim_status_code                           VARCHAR(20),
    direct_claim_paid_indicator                 CHAR(1),

    -- ========== Claim Count Measures ==========
    direct_closed_with_payment_claim_count                  INTEGER DEFAULT 0,
    direct_closed_without_payment_claim_count               INTEGER DEFAULT 0,
    direct_closed_claim_component_count                     INTEGER DEFAULT 0,
    direct_closed_claim_count                               INTEGER DEFAULT 0,
    direct_closed_no_claim_component_count                  INTEGER DEFAULT 0,
    direct_closed_no_claim_count                            INTEGER DEFAULT 0,
    direct_closed_with_payment_claim_component_count        INTEGER DEFAULT 0,
    direct_closed_without_payment_claim_component_count     INTEGER DEFAULT 0,
    direct_open_claim_component_count                       INTEGER DEFAULT 0,
    direct_open_claim_count                                 INTEGER DEFAULT 0,
    direct_opened_claim_component_count                     INTEGER DEFAULT 0,
    direct_opened_claim_count                               INTEGER DEFAULT 0,
    direct_reopened_claim_component_count                   INTEGER DEFAULT 0,
    direct_reopened_claim_count                             INTEGER DEFAULT 0,
    direct_reported_claim_component_count                   INTEGER DEFAULT 0,
    direct_reported_claim_count                             INTEGER DEFAULT 0,

    -- Audit
    load_date                                   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common query patterns
CREATE INDEX idx_fcc_claim_key      ON reporting.fact_claim_component(claim_key);
CREATE INDEX idx_fcc_policy_key     ON reporting.fact_claim_component(policy_key);
CREATE INDEX idx_fcc_book_month     ON reporting.fact_claim_component(book_month_key);
CREATE INDEX idx_fcc_lob_key        ON reporting.fact_claim_component(line_of_business_key);
CREATE INDEX idx_fcc_loss_date      ON reporting.fact_claim_component(claim_date_of_loss);


-- ============================================================================
-- FACT 2: FACT_CLAIM_TRANSACTION
-- Grain: One row per claim financial transaction
-- ============================================================================
DROP TABLE IF EXISTS reporting.fact_claim_transaction CASCADE;
CREATE TABLE reporting.fact_claim_transaction (
    fact_claim_transaction_id               BIGSERIAL PRIMARY KEY,

    -- Foreign keys to dimensions
    claim_key                               INTEGER REFERENCES reporting.dim_claim(claim_key),
    claim_component_key                     INTEGER REFERENCES reporting.dim_claim_component(claim_component_key),
    claim_status_key                        INTEGER REFERENCES reporting.dim_claim_status(claim_status_key),
    claimant_key                            INTEGER REFERENCES reporting.dim_claimant(claimant_key),
    policy_key                              INTEGER REFERENCES reporting.dim_policy(policy_key),
    coverage_key                            INTEGER REFERENCES reporting.dim_coverage(coverage_key),
    line_of_business_key                    INTEGER REFERENCES reporting.dim_line_of_business(line_of_business_key),
    geography_key                           INTEGER REFERENCES reporting.dim_geography(geography_key),
    book_month_key                          INTEGER REFERENCES reporting.dim_book_month(book_month_key),

    -- ========== Measures ==========
    claim_amount                            NUMERIC(18,2),
    direct_claim_paid_indicator             CHAR(1),

    -- ========== Degenerate Dimensions ==========
    amount_dca_code                         VARCHAR(20),
    amount_type_code                        VARCHAR(20),
    amount_type_subcode                     VARCHAR(20),
    claim_close_date                        DATE,
    claim_component_close_date              DATE,
    claim_component_date_of_loss            DATE,
    claim_component_open_date               DATE,
    claim_component_reopen_date             DATE,
    claim_component_reported_date           DATE,
    claim_component_status_code             VARCHAR(20),
    claim_date_of_loss                      DATE,
    claim_open_date                         DATE,
    claim_reopen_date                       DATE,
    claim_reported_date                     DATE,
    claim_status_code                       VARCHAR(20),
    ext_dmc_code                            VARCHAR(20),
    insurance_type_code                     VARCHAR(20),
    insurance_type_subcode                  VARCHAR(20),
    loss_paid_date                          DATE,
    record_created_date                     DATE,
    record_effective_date                   DATE,
    subrogation_close_date                  DATE,
    transaction_book_date                   DATE,
    transaction_book_end_date               DATE,
    transaction_process_date                DATE,
    transaction_sequence_number             INTEGER,
    transaction_status                      VARCHAR(20),

    -- Audit
    load_date                               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_fct_claim_key      ON reporting.fact_claim_transaction(claim_key);
CREATE INDEX idx_fct_policy_key     ON reporting.fact_claim_transaction(policy_key);
CREATE INDEX idx_fct_book_month     ON reporting.fact_claim_transaction(book_month_key);
CREATE INDEX idx_fct_book_date      ON reporting.fact_claim_transaction(transaction_book_date);


-- ============================================================================
-- FACT 3: FACT_POLICY_TRANSACTION
-- Grain: One row per policy coverage transaction
-- Contains both transaction-level details and premium/commission measures
-- ============================================================================
DROP TABLE IF EXISTS reporting.fact_policy_transaction CASCADE;
CREATE TABLE reporting.fact_policy_transaction (
    fact_policy_transaction_id              BIGSERIAL PRIMARY KEY,

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
    deductible_key                          INTEGER REFERENCES reporting.dim_deductible(deductible_key),
    limit_key                               INTEGER REFERENCES reporting.dim_limit(limit_key),
    form_key                                INTEGER REFERENCES reporting.dim_form(form_key),
    policy_status_key                       INTEGER REFERENCES reporting.dim_policy_status(policy_status_key),
    rating_territory_key                    INTEGER REFERENCES reporting.dim_rating_territory(rating_territory_key),
    insurable_object_key                    INTEGER REFERENCES reporting.dim_insurable_object(insurable_object_key),
    underwriter_key                         INTEGER REFERENCES reporting.dim_underwriter(underwriter_key),

    -- ========== Transaction Details ==========
    ext_covllimit                           NUMERIC(18,2),
    exposure_amount                         NUMERIC(18,4),
    ext_gloccagglimit                       NUMERIC(18,2),
    minimum_earned_premium_amount           NUMERIC(18,2),
    minimum_earned_premium_percent          NUMERIC(10,6),
    policy_amount                           NUMERIC(18,2),
    policy_source_identifier                VARCHAR(100),
    term_premium_amount                     NUMERIC(18,2),
    transaction_sequence_number             INTEGER,

    -- ========== Degenerate Dimensions ==========
    amount_dca_code                         VARCHAR(20),
    amount_type_code                        VARCHAR(20),
    amount_type_subcode                     VARCHAR(20),
    commission_rate                         NUMERIC(10,6),
    coverage_effective_date                 DATE,
    coverage_expiration_date                DATE,
    ext_covered_peril_code                  VARCHAR(50),
    ext_dmc_code                            VARCHAR(20),
    earning_begin_date                      DATE,
    earning_end_date                        DATE,
    effective_date                          DATE,
    ext_end_date                            DATE,
    event_date                              DATE,
    event_type_code                         VARCHAR(20),
    expiration_date                         DATE,
    exposure_basis_code                     VARCHAR(20),
    exposure_earnings_type_code             VARCHAR(20),
    ext_final_month_county                  VARCHAR(100),
    inforce_in_month_indicator              CHAR(1),
    inforce_indicator                       CHAR(1),
    issued_in_month_indicator               CHAR(1),
    ext_location_county                     VARCHAR(100),
    ext_master_transaction_number           VARCHAR(50),
    new_or_renewal_code                     VARCHAR(10),
    ext_policy_county                       VARCHAR(100),
    policy_event_number                     VARCHAR(50),
    policy_issued_date                      DATE,
    ext_policystats_book_date               DATE,
    premium_commission_code                 VARCHAR(20),
    quote_created_date                      DATE,
    ext_riskcd                              VARCHAR(20),
    ext_start_date                          DATE,
    ext_status                              VARCHAR(20),
    transaction_book_date                   DATE,
    transaction_book_end_date               DATE,
    ext_transaction_code                    VARCHAR(20),
    transaction_effective_date              DATE,
    transaction_process_date                DATE,
    ext_unit                                VARCHAR(50),

    -- ========== Policy Premium Measures ==========
    direct_audit_premium                    NUMERIC(18,2) DEFAULT 0,
    direct_cancelled_premium                NUMERIC(18,2) DEFAULT 0,
    direct_company_commission               NUMERIC(18,2) DEFAULT 0,
    direct_company_commission_earned        NUMERIC(18,2) DEFAULT 0,
    direct_company_commission_unearned      NUMERIC(18,2) DEFAULT 0,
    earned_exposures                        NUMERIC(18,4) DEFAULT 0,
    direct_earned_premium                   NUMERIC(18,2) DEFAULT 0,
    endorsement_count                       INTEGER DEFAULT 0,
    direct_endorsement_premium              NUMERIC(18,2) DEFAULT 0,
    direct_fees                             NUMERIC(18,2) DEFAULT 0,
    user_defined_field_5                    VARCHAR(200),
    full_policy_number                      VARCHAR(50),
    user_defined_field_4                    VARCHAR(200),
    direct_manual_premium                   NUMERIC(18,2) DEFAULT 0,
    net_written_premium                     NUMERIC(18,2) DEFAULT 0,
    direct_new_business_premium             NUMERIC(18,2) DEFAULT 0,
    direct_original_written_premium         NUMERIC(18,2) DEFAULT 0,
    policy_number                           VARCHAR(50),
    direct_producer_commission              NUMERIC(18,2) DEFAULT 0,
    direct_producer_commission_earned       NUMERIC(18,2) DEFAULT 0,
    direct_producer_commission_unearned     NUMERIC(18,2) DEFAULT 0,
    direct_producer_contingent_commission   NUMERIC(18,2) DEFAULT 0,
    direct_reinstatement_premium            NUMERIC(18,2) DEFAULT 0,
    direct_renewal_premium                  NUMERIC(18,2) DEFAULT 0,
    direct_surcharges                       NUMERIC(18,2) DEFAULT 0,
    direct_taxes                            NUMERIC(18,2) DEFAULT 0,
    direct_term_premium                     NUMERIC(18,2) DEFAULT 0,
    unearned_exposures                      NUMERIC(18,4) DEFAULT 0,
    direct_unearned_premium                 NUMERIC(18,2) DEFAULT 0,
    written_exposures                       NUMERIC(18,4) DEFAULT 0,
    direct_written_premium                  NUMERIC(18,2) DEFAULT 0,

    -- ========== Policy Indicator Flags ==========
    cancelled_in_month_indicator            CHAR(1),
    book_end_date                           DATE,
    reinstated_in_month_indicator           CHAR(1),

    -- Audit
    load_date                               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_fpt_policy_key     ON reporting.fact_policy_transaction(policy_key);
CREATE INDEX idx_fpt_product_key    ON reporting.fact_policy_transaction(product_key);
CREATE INDEX idx_fpt_agent_key      ON reporting.fact_policy_transaction(agent_key);
CREATE INDEX idx_fpt_book_month     ON reporting.fact_policy_transaction(book_month_key);
CREATE INDEX idx_fpt_lob_key        ON reporting.fact_policy_transaction(line_of_business_key);
CREATE INDEX idx_fpt_book_date      ON reporting.fact_policy_transaction(transaction_book_date);
CREATE INDEX idx_fpt_eff_date       ON reporting.fact_policy_transaction(transaction_effective_date);
