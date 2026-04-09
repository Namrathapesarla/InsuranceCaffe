/*******************************************************************************
 * Reporting Layer - Master Run Script
 * Executes DDL in correct dependency order:
 *   1. Dimensions first (referenced by fact FKs)
 *   2. Fact tables second
 *
 * Usage:  psql -d insurance_db -f 00_run_reporting.sql
 ******************************************************************************/

\echo '=== Creating Reporting Schema ==='
\echo ''

\echo '--- Step 1: Dimension Tables ---'
\i 01_ddl_dimensions.sql
\echo 'Dimensions created.'
\echo ''

\echo '--- Step 2: Fact Tables ---'
\i 02_ddl_facts.sql
\echo 'Facts created.'
\echo ''

\echo '=== Reporting Layer Complete ==='
\echo 'Tables created:'
SELECT table_name, table_type
  FROM information_schema.tables
 WHERE table_schema = 'reporting'
   AND table_name LIKE 'dim_%' OR table_name LIKE 'fact_%'
 ORDER BY table_name;
