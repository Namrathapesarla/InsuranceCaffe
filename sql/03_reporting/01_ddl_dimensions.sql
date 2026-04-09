/*******************************************************************************
 * Reporting Layer - Dimension Tables DDL
 * Schema: reporting
 * Source: TableVScolumn.docx
 * Database: PostgreSQL 15+
 ******************************************************************************/

CREATE SCHEMA IF NOT EXISTS reporting;

-- ============================================================================
-- 1. DIM_ACCOUNT
-- ============================================================================
DROP TABLE IF EXISTS reporting.dim_account CASCADE;
CREATE TABLE reporting.dim_account (
    account_key                     SERIAL PRIMARY KEY,
    account_number                  VARCHAR(50),
    account_status_description      VARCHAR(100),
    account_status_code             VARCHAR(20),
    account_type_description        VARCHAR(100),
    account_type_code               VARCHAR(20),
    account_type_subcode            VARCHAR(20),
    -- SCD2 columns
    effective_date                  DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date                 DATE NOT NULL DEFAULT '9999-12-31',
    current_flag                    CHAR(1) NOT NULL DEFAULT 'Y',
    load_date                       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. DIM_ADJUSTER
-- ============================================================================
DROP TABLE IF EXISTS reporting.dim_adjuster CASCADE;
CREATE TABLE reporting.dim_adjuster (
    adjuster_key                    SERIAL PRIMARY KEY,
    full_legal_name                 VARCHAR(200),
    party_code                      VARCHAR(20),
    party_description               VARCHAR(200),
    email_address                   VARCHAR(200),
    adjuster_id_code                VARCHAR(50),
    telephone_number                VARCHAR(30),
    -- SCD2
    effective_date                  DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date                 DATE NOT NULL DEFAULT '9999-12-31',
    current_flag                    CHAR(1) NOT NULL DEFAULT 'Y',
    load_date                       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. DIM_AGENCY
-- ============================================================================
DROP TABLE IF EXISTS reporting.dim_agency CASCADE;
CREATE TABLE reporting.dim_agency (
    agency_key                      SERIAL PRIMARY KEY,
    birth_or_founding_date          DATE,
    franchised_indicator            CHAR(1),
    member_count                    INTEGER,
    number_of_employees             INTEGER,
    tax_exempt_indicator            CHAR(1),
    annual_revenue_or_compensation  NUMERIC(18,2),
    -- SCD2
    effective_date                  DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date                 DATE NOT NULL DEFAULT '9999-12-31',
    current_flag                    CHAR(1) NOT NULL DEFAULT 'Y',
    load_date                       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. DIM_AGENT
-- ============================================================================
DROP TABLE IF EXISTS reporting.dim_agent CASCADE;
CREATE TABLE reporting.dim_agent (
    agent_key                       SERIAL PRIMARY KEY,
    full_legal_name                 VARCHAR(200),
    birth_or_founding_date          DATE,
    branch_office_subcode           VARCHAR(20),
    party_code                      VARCHAR(20),
    date_of_death                   DATE,
    party_description               VARCHAR(200),
    agent_first_name                VARCHAR(100),
    franchised_indicator            CHAR(1),
    gender_description              VARCHAR(50),
    agent_id_code                   VARCHAR(50),
    industry_type_subcode           VARCHAR(20),
    member_count                    INTEGER,
    naics_description               VARCHAR(200),
    number_of_employees             INTEGER,
    regional_office_subcode         VARCHAR(20),
    sic_description                 VARCHAR(200),
    party_status_description        VARCHAR(100),
    party_status_code               VARCHAR(20),
    party_subcode                   VARCHAR(20),
    tax_exempt_indicator            CHAR(1),
    telephone_number                VARCHAR(30),
    territory_subcode               VARCHAR(20),
    party_type_description          VARCHAR(100),
    party_type_code                 VARCHAR(20),
    party_type_subcode              VARCHAR(20),
    annual_revenue_or_compensation  NUMERIC(18,2),
    -- SCD2
    effective_date                  DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date                 DATE NOT NULL DEFAULT '9999-12-31',
    current_flag                    CHAR(1) NOT NULL DEFAULT 'Y',
    load_date                       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 5. DIM_AGENT_EXTENSION
-- ============================================================================
DROP TABLE IF EXISTS reporting.dim_agent_extension CASCADE;
CREATE TABLE reporting.dim_agent_extension (
    agent_extension_key                     SERIAL PRIMARY KEY,
    ext_addr3                               VARCHAR(200),
    ext_addr2                               VARCHAR(200),
    ext_addr1                               VARCHAR(200),
    ext_city                                VARCHAR(100),
    ext_commerciallinedownloademail         VARCHAR(200),
    ext_commerciallinesdownloadind          CHAR(1),
    ext_commissionstatementemailaddr        VARCHAR(200),
    ext_commissionstatementind              CHAR(1),
    ext_county                              VARCHAR(100),
    ext_edocsind                            CHAR(1),
    ext_ivansmachaddress                    VARCHAR(200),
    ext_ivans_uid                           VARCHAR(100),
    ext_ivansvendor                         VARCHAR(100),
    ext_ivansyacct                          VARCHAR(100),
    ext_postalcode                          VARCHAR(20),
    ext_regionisocd                         VARCHAR(10),
    ext_stateprovcd                         VARCHAR(10),
    load_date                               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. DIM_CLAIM
-- ============================================================================
DROP TABLE IF EXISTS reporting.dim_claim CASCADE;
CREATE TABLE reporting.dim_claim (
    claim_key                       SERIAL PRIMARY KEY,
    claim_closed_date               DATE,
    claim_opened_date               DATE,
    claim_reopened_date             DATE,
    claim_reported_date             DATE,
    claim_date_of_loss              DATE,
    at_fault_indicator              CHAR(1),
    claim_description               VARCHAR(500),
    claim_number                    VARCHAR(50),
    -- SCD2
    effective_date                  DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date                 DATE NOT NULL DEFAULT '9999-12-31',
    current_flag                    CHAR(1) NOT NULL DEFAULT 'Y',
    load_date                       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 7. DIM_CLAIM_COMPONENT
-- ============================================================================
DROP TABLE IF EXISTS reporting.dim_claim_component CASCADE;
CREATE TABLE reporting.dim_claim_component (
    claim_component_key             SERIAL PRIMARY KEY,
    claim_component_closed_date     DATE,
    claim_component_date_of_loss    DATE,
    claim_component_open_date       DATE,
    claim_component_reopened_date   DATE,
    claim_component_reported_date   DATE,
    claim_component_number          VARCHAR(50),
    -- SCD2
    effective_date                  DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date                 DATE NOT NULL DEFAULT '9999-12-31',
    current_flag                    CHAR(1) NOT NULL DEFAULT 'Y',
    load_date                       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 8. DIM_CLAIM_STATUS
-- ============================================================================
DROP TABLE IF EXISTS reporting.dim_claim_status CASCADE;
CREATE TABLE reporting.dim_claim_status (
    claim_status_key                SERIAL PRIMARY KEY,
    claim_status_description        VARCHAR(100),
    claim_status_code               VARCHAR(20),
    claim_status_subcode            VARCHAR(20),
    -- SCD2
    effective_date                  DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date                 DATE NOT NULL DEFAULT '9999-12-31',
    current_flag                    CHAR(1) NOT NULL DEFAULT 'Y',
    load_date                       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 9. DIM_CLAIMANT
-- ============================================================================
DROP TABLE IF EXISTS reporting.dim_claimant CASCADE;
CREATE TABLE reporting.dim_claimant (
    claimant_key                    SERIAL PRIMARY KEY,
    birth_or_founding_date          DATE,
    claimant_first_name             VARCHAR(100),
    claimant_id_code                VARCHAR(50),
    full_legal_name                 VARCHAR(200),
    claimant_second_name            VARCHAR(100),
    claimant_third_name             VARCHAR(100),
    email_address                   VARCHAR(200),
    gender_description              VARCHAR(50),
    gender_code                     VARCHAR(10),
    telephone_number                VARCHAR(30),
    -- SCD2
    effective_date                  DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date                 DATE NOT NULL DEFAULT '9999-12-31',
    current_flag                    CHAR(1) NOT NULL DEFAULT 'Y',
    load_date                       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 10. DIM_COMPANY
-- ============================================================================
DROP TABLE IF EXISTS reporting.dim_company CASCADE;
CREATE TABLE reporting.dim_company (
    company_key                     SERIAL PRIMARY KEY,
    full_legal_name                 VARCHAR(200),
    annual_revenue_or_compensation  NUMERIC(18,2),
    email_address                   VARCHAR(200),
    birth_or_founding_date          DATE,
    franchised_indicator            CHAR(1),
    company_id_code                 VARCHAR(50),
    member_count                    INTEGER,
    nickname_or_acronym             VARCHAR(100),
    number_of_employees             INTEGER,
    party_status_code               VARCHAR(20),
    party_status_description        VARCHAR(100),
    tax_exempt_indicator            CHAR(1),
    telephone_number                VARCHAR(30),
    -- SCD2
    effective_date                  DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date                 DATE NOT NULL DEFAULT '9999-12-31',
    current_flag                    CHAR(1) NOT NULL DEFAULT 'Y',
    load_date                       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 11. DIM_COVERAGE
-- ============================================================================
DROP TABLE IF EXISTS reporting.dim_coverage CASCADE;
CREATE TABLE reporting.dim_coverage (
    coverage_key                        SERIAL PRIMARY KEY,
    coverage_effective_date             DATE,
    coverage_expiration_date            DATE,
    annual_statement_line_description   VARCHAR(200),
    annual_statement_line_code          VARCHAR(20),
    coverage_description                VARCHAR(200),
    coverage_code                       VARCHAR(20),
    coverage_group_description          VARCHAR(200),
    coverage_group_code                 VARCHAR(20),
    coverage_subcode_description        VARCHAR(200),
    -- SCD2
    effective_date                      DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date                     DATE NOT NULL DEFAULT '9999-12-31',
    current_flag                        CHAR(1) NOT NULL DEFAULT 'Y',
    load_date                           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 12. DIM_DEDUCTIBLE
-- ============================================================================
DROP TABLE IF EXISTS reporting.dim_deductible CASCADE;
CREATE TABLE reporting.dim_deductible (
    deductible_key                  SERIAL PRIMARY KEY,
    deductible_1_rate               NUMERIC(10,6),
    deductible_1_type_code          VARCHAR(20),
    deductible_1_value              NUMERIC(18,2),
    deductible_2_rate               NUMERIC(10,6),
    deductible_2_type_code          VARCHAR(20),
    deductible_2_value              NUMERIC(18,2),
    deductible_3_rate               NUMERIC(10,6),
    deductible_3_value              NUMERIC(18,2),
    deductible_4_rate               NUMERIC(10,6),
    deductible_4_value              NUMERIC(18,2),
    deductible_5_rate               NUMERIC(10,6),
    deductible_5_value              NUMERIC(18,2),
    -- SCD2
    effective_date                  DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date                 DATE NOT NULL DEFAULT '9999-12-31',
    current_flag                    CHAR(1) NOT NULL DEFAULT 'Y',
    load_date                       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 13. DIM_DWELLING_FIRE
-- ============================================================================
DROP TABLE IF EXISTS reporting.dim_dwelling_fire CASCADE;
CREATE TABLE reporting.dim_dwelling_fire (
    dwelling_fire_key               SERIAL PRIMARY KEY,
    purchase_price                  NUMERIC(18,2),
    -- SCD2
    effective_date                  DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date                 DATE NOT NULL DEFAULT '9999-12-31',
    current_flag                    CHAR(1) NOT NULL DEFAULT 'Y',
    load_date                       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 14. DIM_BOOK_MONTH
-- ============================================================================
DROP TABLE IF EXISTS reporting.dim_book_month CASCADE;
CREATE TABLE reporting.dim_book_month (
    book_month_key                  SERIAL PRIMARY KEY,
    book_month                      INTEGER,
    book_month_year                 INTEGER,
    book_end_date                   DATE,
    book_month_name                 VARCHAR(20),
    book_start_date                 DATE,
    book_quarter                    INTEGER,
    book_quarter_name               VARCHAR(20),
    book_year                       INTEGER,
    load_date                       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 15. DIM_FORM
-- ============================================================================
DROP TABLE IF EXISTS reporting.dim_form CASCADE;
CREATE TABLE reporting.dim_form (
    form_key                        SERIAL PRIMARY KEY,
    policy_form_description         VARCHAR(200),
    policy_form_number              VARCHAR(50),
    -- SCD2
    effective_date                  DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date                 DATE NOT NULL DEFAULT '9999-12-31',
    current_flag                    CHAR(1) NOT NULL DEFAULT 'Y',
    load_date                       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 16. DIM_INSURABLE_OBJECT
-- ============================================================================
DROP TABLE IF EXISTS reporting.dim_insurable_object CASCADE;
CREATE TABLE reporting.dim_insurable_object (
    insurable_object_key                        SERIAL PRIMARY KEY,
    insurable_object_number                     VARCHAR(50),
    insurable_object_type_description           VARCHAR(200),
    insurable_object_type_subcode_description   VARCHAR(200),
    -- SCD2
    effective_date                              DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date                             DATE NOT NULL DEFAULT '9999-12-31',
    current_flag                                CHAR(1) NOT NULL DEFAULT 'Y',
    load_date                                   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 17. DIM_INSURABLE_OBJECT_EXTENSION
-- ============================================================================
DROP TABLE IF EXISTS reporting.dim_insurable_object_extension CASCADE;
CREATE TABLE reporting.dim_insurable_object_extension (
    insurable_object_extension_key  SERIAL PRIMARY KEY,
    ext_buildingformtype            VARCHAR(50),
    ext_bldgnumber                  VARCHAR(20),
    ext_buildingperils              VARCHAR(100),
    ext_covllimit                   NUMERIC(18,2),
    ext_covmlimit                   NUMERIC(18,2),
    ext_dmiclocationnumber          VARCHAR(20),
    ext_dmicbldgnumber              VARCHAR(20),
    ext_gloccagglimit               NUMERIC(18,2),
    ext_locationaddress1            VARCHAR(200),
    ext_locationcity                VARCHAR(100),
    ext_locationcounty              VARCHAR(100),
    ext_locationstate               VARCHAR(50),
    ext_locationzip                 VARCHAR(20),
    ext_occupancycd                 VARCHAR(20),
    ext_productlinetype             VARCHAR(50),
    ext_protectionclass             VARCHAR(20),
    ext_riskclasscode               VARCHAR(20),
    ext_sqft                        NUMERIC(12,2),
    ext_status                      VARCHAR(20),
    ext_units                       INTEGER,
    ext_yearbuilt                   INTEGER,
    load_date                       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 18. DIM_INSURED
-- ============================================================================
DROP TABLE IF EXISTS reporting.dim_insured CASCADE;
CREATE TABLE reporting.dim_insured (
    insured_key                     SERIAL PRIMARY KEY,
    full_legal_name                 VARCHAR(200),
    birth_or_founding_date          DATE,
    party_code                      VARCHAR(20),
    party_description               VARCHAR(200),
    email_address                   VARCHAR(200),
    insured_first_name              VARCHAR(100),
    gender_code                     VARCHAR(10),
    gender_description              VARCHAR(50),
    insured_id_code                 VARCHAR(50),
    insured_second_name             VARCHAR(100),
    party_subcode                   VARCHAR(20),
    telephone_number                VARCHAR(30),
    insured_third_name              VARCHAR(100),
    -- SCD2
    effective_date                  DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date                 DATE NOT NULL DEFAULT '9999-12-31',
    current_flag                    CHAR(1) NOT NULL DEFAULT 'Y',
    load_date                       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 19. DIM_LEGAL_JURISDICTION
-- ============================================================================
DROP TABLE IF EXISTS reporting.dim_legal_jurisdiction CASCADE;
CREATE TABLE reporting.dim_legal_jurisdiction (
    legal_jurisdiction_key          SERIAL PRIMARY KEY,
    legal_jurisdiction_description  VARCHAR(200),
    -- SCD2
    effective_date                  DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date                 DATE NOT NULL DEFAULT '9999-12-31',
    current_flag                    CHAR(1) NOT NULL DEFAULT 'Y',
    load_date                       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 20. DIM_LIMIT
-- ============================================================================
DROP TABLE IF EXISTS reporting.dim_limit CASCADE;
CREATE TABLE reporting.dim_limit (
    limit_key                       SERIAL PRIMARY KEY,
    limit_1_basis_code              VARCHAR(20),
    limit_1_type_code               VARCHAR(20),
    limit_1_value                   NUMERIC(18,2),
    limit_2_value                   NUMERIC(18,2),
    limit_3_value                   NUMERIC(18,2),
    limit_4_value                   NUMERIC(18,2),
    limit_5_value                   NUMERIC(18,2),
    -- SCD2
    effective_date                  DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date                 DATE NOT NULL DEFAULT '9999-12-31',
    current_flag                    CHAR(1) NOT NULL DEFAULT 'Y',
    load_date                       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 21. DIM_LINE_OF_BUSINESS
-- ============================================================================
DROP TABLE IF EXISTS reporting.dim_line_of_business CASCADE;
CREATE TABLE reporting.dim_line_of_business (
    line_of_business_key                SERIAL PRIMARY KEY,
    line_of_business_description        VARCHAR(200),
    line_of_business_code               VARCHAR(20),
    line_of_business_group_code         VARCHAR(20),
    line_of_business_subcode            VARCHAR(20),
    line_of_business_subcode_description VARCHAR(200),
    -- SCD2
    effective_date                      DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date                     DATE NOT NULL DEFAULT '9999-12-31',
    current_flag                        CHAR(1) NOT NULL DEFAULT 'Y',
    load_date                           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 22. DIM_LOSS_EVENT
-- ============================================================================
DROP TABLE IF EXISTS reporting.dim_loss_event CASCADE;
CREATE TABLE reporting.dim_loss_event (
    loss_event_key                          SERIAL PRIMARY KEY,
    catastrophe_indicator                   CHAR(1),
    company_catastrophe_description         VARCHAR(500),
    estimated_period_end_date_time          TIMESTAMP,
    estimated_period_start_date_time        TIMESTAMP,
    description                             VARCHAR(500),
    effective_period_end_date_time          TIMESTAMP,
    effective_period_start_date_time        TIMESTAMP,
    name                                    VARCHAR(200),
    -- SCD2
    effective_date                          DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date                         DATE NOT NULL DEFAULT '9999-12-31',
    current_flag                            CHAR(1) NOT NULL DEFAULT 'Y',
    load_date                               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 23. DIM_OCCURRENCE
-- ============================================================================
DROP TABLE IF EXISTS reporting.dim_occurrence CASCADE;
CREATE TABLE reporting.dim_occurrence (
    occurrence_key                  SERIAL PRIMARY KEY,
    occurrence_description          VARCHAR(500),
    -- SCD2
    effective_date                  DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date                 DATE NOT NULL DEFAULT '9999-12-31',
    current_flag                    CHAR(1) NOT NULL DEFAULT 'Y',
    load_date                       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 24. DIM_POLICY
-- ============================================================================
DROP TABLE IF EXISTS reporting.dim_policy CASCADE;
CREATE TABLE reporting.dim_policy (
    policy_key                          SERIAL PRIMARY KEY,
    policy_effective_date               DATE,
    policy_expiration_date              DATE,
    checksum_dynamic_columns            VARCHAR(100),
    claims_made_date                    DATE,
    claims_made_entry_date              DATE,
    clue_order_date                     DATE,
    facultative_reinsurance_indicator   CHAR(1),
    full_policy_number                  VARCHAR(50),
    isbound                             CHAR(1),
    multistate_policy_indicator         CHAR(1),
    original_inception_date             DATE,
    package_discount                    NUMERIC(10,4),
    pay_frequency_description           VARCHAR(50),
    pay_frequency_subcode               VARCHAR(20),
    policy_number                       VARCHAR(50),
    policy_prefix                       VARCHAR(20),
    policy_source_identifier            VARCHAR(100),
    policy_suffix                       VARCHAR(20),
    renewal_of_policy_number            VARCHAR(50),
    renewal_review_indicator            CHAR(1),
    -- SCD2
    effective_date                      DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date                     DATE NOT NULL DEFAULT '9999-12-31',
    current_flag                        CHAR(1) NOT NULL DEFAULT 'Y',
    load_date                           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 25. DIM_UNDERWRITER
-- ============================================================================
DROP TABLE IF EXISTS reporting.dim_underwriter CASCADE;
CREATE TABLE reporting.dim_underwriter (
    underwriter_key                 SERIAL PRIMARY KEY,
    annual_revenue_or_compensation  NUMERIC(18,2),
    birth_or_founding_date          DATE,
    date_of_death                   DATE,
    franchised_indicator            CHAR(1),
    member_count                    INTEGER,
    number_of_employees             INTEGER,
    tax_exempt_indicator            CHAR(1),
    -- SCD2
    effective_date                  DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date                 DATE NOT NULL DEFAULT '9999-12-31',
    current_flag                    CHAR(1) NOT NULL DEFAULT 'Y',
    load_date                       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 26. DIM_RATING_TERRITORY
-- ============================================================================
DROP TABLE IF EXISTS reporting.dim_rating_territory CASCADE;
CREATE TABLE reporting.dim_rating_territory (
    rating_territory_key            SERIAL PRIMARY KEY,
    rating_territory_code           VARCHAR(20),
    -- SCD2
    effective_date                  DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date                 DATE NOT NULL DEFAULT '9999-12-31',
    current_flag                    CHAR(1) NOT NULL DEFAULT 'Y',
    load_date                       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 27. DIM_PRODUCT
-- ============================================================================
DROP TABLE IF EXISTS reporting.dim_product CASCADE;
CREATE TABLE reporting.dim_product (
    product_key                     SERIAL PRIMARY KEY,
    licensed_product_name           VARCHAR(200),
    product_line_description        VARCHAR(200),
    product_type_code               VARCHAR(20),
    -- SCD2
    effective_date                  DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date                 DATE NOT NULL DEFAULT '9999-12-31',
    current_flag                    CHAR(1) NOT NULL DEFAULT 'Y',
    load_date                       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 28. DIM_POLICY_STATUS
-- ============================================================================
DROP TABLE IF EXISTS reporting.dim_policy_status CASCADE;
CREATE TABLE reporting.dim_policy_status (
    policy_status_key                   SERIAL PRIMARY KEY,
    policy_status_description           VARCHAR(100),
    policy_status_code                  VARCHAR(20),
    policy_status_subcode               VARCHAR(20),
    policy_status_subcode_description   VARCHAR(200),
    -- SCD2
    effective_date                      DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date                     DATE NOT NULL DEFAULT '9999-12-31',
    current_flag                        CHAR(1) NOT NULL DEFAULT 'Y',
    load_date                           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 29. DIM_POLICY_EXTENSION
-- ============================================================================
DROP TABLE IF EXISTS reporting.dim_policy_extension CASCADE;
CREATE TABLE reporting.dim_policy_extension (
    policy_extension_key                    SERIAL PRIMARY KEY,
    ext_agenttrustind                       CHAR(1),
    ext_categorycd                          VARCHAR(20),
    ext_correctionind                       CHAR(1),
    ext_coveredperilscd                     VARCHAR(50),
    ext_description                         VARCHAR(500),
    ext_displaydesc                         VARCHAR(200),
    ext_dmccd                               VARCHAR(20),
    ext_quote_number                        VARCHAR(50),
    ext_form_displaydesc_sec                VARCHAR(200),
    ext_formnum                             VARCHAR(50),
    ext_form_status                         VARCHAR(20),
    ext_irnumber                            VARCHAR(50),
    ext_itemnumber                          VARCHAR(50),
    ext_locationcounty                      VARCHAR(100),
    ext_losssettlement                      VARCHAR(100),
    ext_mastertransactionnumber             VARCHAR(50),
    ext_memo                                VARCHAR(500),
    ext_modelname                           VARCHAR(100),
    ext_name                                VARCHAR(200),
    ext_paymenttransactiontypecd            VARCHAR(20),
    ext_policycounty                        VARCHAR(100),
    ext_policy_county_code                  VARCHAR(20),
    ext_policygroupcode                     VARCHAR(20),
    policy_test                             VARCHAR(20),
    ext_policytypecd                        VARCHAR(20),
    ext_priority                            VARCHAR(20),
    ext_productlinetype                     VARCHAR(50),
    ext_rateareaname                        VARCHAR(100),
    ext_sectioncd                           VARCHAR(20),
    ext_sourcemodelname                     VARCHAR(100),
    ext_sourcenumber                        VARCHAR(50),
    ext_sourcetransactionnumber             VARCHAR(50),
    ext_sourceversion                       VARCHAR(50),
    ext_specialeventspolicyind              CHAR(1),
    ext_templateid                          VARCHAR(50),
    ext_transactionshortdescription         VARCHAR(200),
    ext_type                                VARCHAR(50),
    load_date                               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 30. DIM_GEOGRAPHY
-- ============================================================================
DROP TABLE IF EXISTS reporting.dim_geography CASCADE;
CREATE TABLE reporting.dim_geography (
    geography_key                               SERIAL PRIMARY KEY,
    geography_dimension_identifier              VARCHAR(50),
    geographic_location_source_identifier       VARCHAR(100),
    start_date                                  DATE,
    end_date                                    DATE,
    current_flag                                CHAR(1) DEFAULT 'Y',
    geographic_location_type_code               VARCHAR(20),
    geographic_location_type_description        VARCHAR(200),
    geographic_location_type_subcode            VARCHAR(20),
    geographic_location_type_subcode_description VARCHAR(200),
    location_code                               VARCHAR(20),
    location_description                        VARCHAR(200),
    location_subcode                            VARCHAR(20),
    location_subcode_description                VARCHAR(200),
    location_name                               VARCHAR(200),
    location_number                             VARCHAR(50),
    region_code                                 VARCHAR(20),
    region_description                          VARCHAR(200),
    region_subcode                              VARCHAR(20),
    region_subcode_description                  VARCHAR(200),
    region_name                                 VARCHAR(200),
    country_code                                VARCHAR(10),
    country_name                                VARCHAR(100),
    state_code                                  VARCHAR(10),
    state_name                                  VARCHAR(100),
    county_code                                 VARCHAR(20),
    county_name                                 VARCHAR(100),
    municipality_name                           VARCHAR(100),
    postal_code                                 VARCHAR(20),
    three_digit_postal_code                     VARCHAR(3),
    latitude_value                              NUMERIC(12,8),
    longitude_value                             NUMERIC(12,8),
    altitude_value                              NUMERIC(12,4),
    altitude_mean_sea_level_value               NUMERIC(12,4),
    horizontal_accuracy_value                   NUMERIC(12,4),
    vertical_accuracy_value                     NUMERIC(12,4),
    address_line_1                              VARCHAR(200),
    address_line_2                              VARCHAR(200),
    travel_direction_description                VARCHAR(100),
    source_system_name                          VARCHAR(100),
    load_date                                   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
