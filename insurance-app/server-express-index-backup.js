import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool, { testConnection } from './db.js';
import dashboardRoutes from './routes/dashboard.js';
import productionReportRoutes from './routes/production-report.js';
import riskScoringRoutes from './routes/risk-scoring.js';
import uwUsecasesRoutes from './routes/uw-usecases.js';
import policyUsecasesRoutes from './routes/policy-usecases.js';
import billingUsecasesRoutes from './routes/billing-usecases.js';
import claimsUsecasesRoutes from './routes/claims-usecases.js';
import agentUsecasesRoutes from './routes/agent-usecases.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', async (req, res) => {
  const connected = await testConnection();
  res.json({ status: connected ? 'ok' : 'error', database: connected ? 'connected' : 'disconnected' });
});

// Dashboard API routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/production-report', productionReportRoutes);
app.use('/api/risk-scoring', riskScoringRoutes);
app.use('/api/uw', uwUsecasesRoutes);
app.use('/api/policy', policyUsecasesRoutes);
app.use('/api/billing', billingUsecasesRoutes);
app.use('/api/claims', claimsUsecasesRoutes);
app.use('/api/agent', agentUsecasesRoutes);

// Generic query endpoint for any reporting table
app.get('/api/reporting/:table', async (req, res) => {
  const allowedTables = [
    'dim_product', 'dim_agent', 'dim_geography', 'dim_policy', 'dim_coverage',
    'dim_claim_status', 'dim_policy_status', 'dim_line_of_business', 'dim_insured',
    'dim_book_month', 'dim_account', 'dim_adjuster', 'dim_agency',
    'fact_policy_transaction', 'fact_policy_measure', 'fact_claim_transaction', 'fact_claim_component',
  ];

  const table = req.params.table;
  if (!allowedTables.includes(table)) {
    return res.status(400).json({ error: 'Invalid table name' });
  }

  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    const result = await pool.query(`SELECT * FROM reporting.${table} LIMIT $1 OFFSET $2`, [limit, offset]);
    res.json({ data: result.rows, count: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  testConnection();
});
