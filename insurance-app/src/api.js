/** Base URL for Nest `/api` (set `VITE_API_BASE` at build time for production). */
export const API_BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:3001/api').replace(
  /\/$/,
  '',
);

// ── Schema-aware fetch wrapper ─────────────────────────────────────────
// All API calls automatically include X-Schema header based on the
// region the user selected on the SchemaSelector page.
function apiFetch(url, options = {}) {
  const schema = sessionStorage.getItem('ic_schema') || 'local';
  return fetch(url, {
    ...options,
    headers: {
      'X-Schema': schema,
      ...options.headers,
    },
  });
}

function dateParams(from, to) {
  const p = new URLSearchParams();
  if (from) p.set('from', from);
  if (to) p.set('to', to);
  return p.toString() ? `?${p}` : '';
}

export async function fetchDashboardKPIs(from, to) {
  const res = await apiFetch(`${API_BASE}/dashboard/kpis${dateParams(from, to)}`);
  if (!res.ok) throw new Error(await nestErrorMessage(res, 'Failed to fetch KPIs'));
  return res.json();
}

export async function fetchLobDistribution(from, to) {
  const res = await apiFetch(`${API_BASE}/dashboard/lob-distribution${dateParams(from, to)}`);
  if (!res.ok) throw new Error(await nestErrorMessage(res, 'Failed to fetch LOB distribution'));
  return res.json();
}

export async function fetchClaimsByStatus(from, to) {
  const res = await apiFetch(`${API_BASE}/dashboard/claims-by-status${dateParams(from, to)}`);
  if (!res.ok) throw new Error(await nestErrorMessage(res, 'Failed to fetch claims by status'));
  return res.json();
}

export async function fetchRecentPolicies(from, to) {
  const res = await apiFetch(`${API_BASE}/dashboard/recent-policies${dateParams(from, to)}`);
  if (!res.ok) throw new Error(await nestErrorMessage(res, 'Failed to fetch recent policies'));
  return res.json();
}

export async function fetchRecentClaims(from, to) {
  const res = await apiFetch(`${API_BASE}/dashboard/recent-claims${dateParams(from, to)}`);
  if (!res.ok) throw new Error(await nestErrorMessage(res, 'Failed to fetch recent claims'));
  return res.json();
}

export async function fetchPremiumTrend(year) {
  const res = await apiFetch(`${API_BASE}/dashboard/premium-trend?year=${year || 2024}`);
  if (!res.ok) throw new Error(await nestErrorMessage(res, 'Failed to fetch premium trend'));
  return res.json();
}

export async function fetchAvailableYears() {
  const res = await apiFetch(`${API_BASE}/dashboard/years`);
  if (!res.ok) throw new Error(await nestErrorMessage(res, 'Failed to fetch years'));
  return res.json();
}

export async function fetchPremiumByProduct() {
  const res = await apiFetch(`${API_BASE}/dashboard/premium-by-product`);
  if (!res.ok) throw new Error(await nestErrorMessage(res, 'Failed to fetch premium by product'));
  return res.json();
}

export async function fetchReportingTable(table, { limit = 100, offset = 0 } = {}) {
  const res = await apiFetch(`${API_BASE}/reporting/${table}?limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error(`Failed to fetch ${table}`);
  return res.json();
}

// ── Production Report APIs ──────────────────────────────────────────
export async function fetchProductionKPIs(from, to) {
  const res = await apiFetch(`${API_BASE}/production-report/kpis${dateParams(from, to)}`);
  if (!res.ok) throw new Error(await nestErrorMessage(res, 'Failed to fetch production KPIs'));
  return res.json();
}

export async function fetchWrittenPremiumByLob(from, to) {
  const res = await apiFetch(`${API_BASE}/production-report/written-premium-by-lob${dateParams(from, to)}`);
  if (!res.ok) throw new Error(await nestErrorMessage(res, 'Failed to fetch written premium by LOB'));
  return res.json();
}

export async function fetchInforceDistribution(from, to) {
  const res = await apiFetch(`${API_BASE}/production-report/inforce-distribution${dateParams(from, to)}`);
  if (!res.ok) throw new Error(await nestErrorMessage(res, 'Failed to fetch inforce distribution'));
  return res.json();
}

export async function fetchNbVsRenewalTrend(from, to) {
  const res = await apiFetch(`${API_BASE}/production-report/nb-vs-renewal-trend${dateParams(from, to)}`);
  if (!res.ok) throw new Error(await nestErrorMessage(res, 'Failed to fetch NB vs renewal trend'));
  return res.json();
}

export async function fetchRetentionByLob(from, to) {
  const res = await apiFetch(`${API_BASE}/production-report/retention-by-lob${dateParams(from, to)}`);
  if (!res.ok) throw new Error(await nestErrorMessage(res, 'Failed to fetch retention by LOB'));
  return res.json();
}

export async function fetchLossRatioByLob(from, to) {
  const res = await apiFetch(`${API_BASE}/production-report/loss-ratio-by-lob${dateParams(from, to)}`);
  if (!res.ok) throw new Error(await nestErrorMessage(res, 'Failed to fetch loss ratio by LOB'));
  return res.json();
}

export async function fetchPolicyMovement(from, to) {
  const res = await apiFetch(`${API_BASE}/production-report/policy-movement${dateParams(from, to)}`);
  if (!res.ok) throw new Error(await nestErrorMessage(res, 'Failed to fetch policy movement'));
  return res.json();
}

// ── Risk Scoring APIs ───────────────────────────────────────────────
export async function fetchRiskScoringKPIs(from, to) {
  const res = await apiFetch(`${API_BASE}/risk-scoring/kpis${dateParams(from, to)}`);
  if (!res.ok) throw new Error(await nestErrorMessage(res, 'Failed to fetch risk scoring KPIs'));
  return res.json();
}

export async function fetchRiskByLob(from, to) {
  const res = await apiFetch(`${API_BASE}/risk-scoring/risk-by-lob${dateParams(from, to)}`);
  if (!res.ok) throw new Error(await nestErrorMessage(res, 'Failed to fetch risk by LOB'));
  return res.json();
}

export async function fetchRiskByRegion(from, to) {
  const res = await apiFetch(`${API_BASE}/risk-scoring/risk-by-region${dateParams(from, to)}`);
  if (!res.ok) throw new Error(await nestErrorMessage(res, 'Failed to fetch risk by region'));
  return res.json();
}

export async function fetchRiskMonthlyTrend(from, to) {
  const res = await apiFetch(`${API_BASE}/risk-scoring/monthly-trend${dateParams(from, to)}`);
  if (!res.ok) throw new Error(await nestErrorMessage(res, 'Failed to fetch risk monthly trend'));
  return res.json();
}

export async function fetchUwDecisions(from, to) {
  const res = await apiFetch(`${API_BASE}/risk-scoring/uw-decisions${dateParams(from, to)}`);
  if (!res.ok) throw new Error(await nestErrorMessage(res, 'Failed to fetch UW decisions'));
  return res.json();
}

// ── Renewal Prioritization APIs ─────────────────────────────────────
export const fetchRenewalKPIs = (f, t) => apiFetch(`${API_BASE}/uw/renewal/kpis${dateParams(f,t)}`).then(r => { if(!r.ok) throw new Error('Failed'); return r.json(); });
export const fetchRenewalByLob = (f, t) => apiFetch(`${API_BASE}/uw/renewal/by-lob${dateParams(f,t)}`).then(r => { if(!r.ok) throw new Error('Failed'); return r.json(); });
export const fetchRenewalMonthly = (f, t) => apiFetch(`${API_BASE}/uw/renewal/monthly${dateParams(f,t)}`).then(r => { if(!r.ok) throw new Error('Failed'); return r.json(); });

// ── LOB Profitability APIs ──────────────────────────────────────────
export const fetchProfitabilityKPIs = (f, t) => apiFetch(`${API_BASE}/uw/profitability/kpis${dateParams(f,t)}`).then(r => { if(!r.ok) throw new Error('Failed'); return r.json(); });
export const fetchProfitabilityByLob = (f, t) => apiFetch(`${API_BASE}/uw/profitability/by-lob${dateParams(f,t)}`).then(r => { if(!r.ok) throw new Error('Failed'); return r.json(); });
export const fetchProfitabilityMonthly = (f, t) => apiFetch(`${API_BASE}/uw/profitability/monthly${dateParams(f,t)}`).then(r => { if(!r.ok) throw new Error('Failed'); return r.json(); });

// ── Cancellation Pattern APIs ───────────────────────────────────────
export const fetchCancellationKPIs = (f, t) =>
  apiFetch(`${API_BASE}/uw/cancellation/kpis${dateParams(f, t)}`).then(async (r) => {
    if (!r.ok) throw new Error(await nestErrorMessage(r, 'Failed to load cancellation KPIs'));
    return r.json();
  });
export const fetchCancellationByLob = (f, t) =>
  apiFetch(`${API_BASE}/uw/cancellation/by-lob${dateParams(f, t)}`).then(async (r) => {
    if (!r.ok) throw new Error(await nestErrorMessage(r, 'Failed to load cancellation by LOB'));
    return r.json();
  });
export const fetchCancellationByRegion = (f, t) =>
  apiFetch(`${API_BASE}/uw/cancellation/by-region${dateParams(f, t)}`).then(async (r) => {
    if (!r.ok) throw new Error(await nestErrorMessage(r, 'Failed to load cancellation by region'));
    return r.json();
  });
export const fetchCancellationMonthly = (f, t) =>
  apiFetch(`${API_BASE}/uw/cancellation/monthly${dateParams(f, t)}`).then(async (r) => {
    if (!r.ok) throw new Error(await nestErrorMessage(r, 'Failed to load cancellation monthly'));
    return r.json();
  });
export const fetchCancellationByAgent = (f, t) =>
  apiFetch(`${API_BASE}/uw/cancellation/by-agent${dateParams(f, t)}`).then(async (r) => {
    if (!r.ok) throw new Error(await nestErrorMessage(r, 'Failed to load cancellation by agent'));
    return r.json();
  });

// ── Premium Leakage APIs ────────────────────────────────────────────
export const fetchLeakageKPIs = (f, t) => apiFetch(`${API_BASE}/uw/leakage/kpis${dateParams(f,t)}`).then(r => { if(!r.ok) throw new Error('Failed'); return r.json(); });
export const fetchLeakageByLob = (f, t) => apiFetch(`${API_BASE}/uw/leakage/by-lob${dateParams(f,t)}`).then(r => { if(!r.ok) throw new Error('Failed'); return r.json(); });
export const fetchLeakageByProduct = (f, t) => apiFetch(`${API_BASE}/uw/leakage/by-product${dateParams(f,t)}`).then(r => { if(!r.ok) throw new Error('Failed'); return r.json(); });
export const fetchLeakageMonthly = (f, t) => apiFetch(`${API_BASE}/uw/leakage/monthly${dateParams(f,t)}`).then(r => { if(!r.ok) throw new Error('Failed'); return r.json(); });
export const fetchLeakageByUnderwriter = (f, t) => apiFetch(`${API_BASE}/uw/leakage/by-underwriter${dateParams(f,t)}`).then(r => { if(!r.ok) throw new Error('Failed'); return r.json(); });

// ── Policy Amendment Tracker APIs ───────────────────────────────────
export const fetchAmendmentKPIs = (f, t) => apiFetch(`${API_BASE}/policy/amendments/kpis${dateParams(f,t)}`).then(r => { if(!r.ok) throw new Error('Failed'); return r.json(); });
export const fetchAmendmentsByType = (f, t) => apiFetch(`${API_BASE}/policy/amendments/by-event-type${dateParams(f,t)}`).then(r => { if(!r.ok) throw new Error('Failed'); return r.json(); });
export const fetchAmendmentsMonthly = (f, t) => apiFetch(`${API_BASE}/policy/amendments/monthly${dateParams(f,t)}`).then(r => { if(!r.ok) throw new Error('Failed'); return r.json(); });
export const fetchAmendmentsByLob = (f, t) => apiFetch(`${API_BASE}/policy/amendments/by-lob${dateParams(f,t)}`).then(r => { if(!r.ok) throw new Error('Failed'); return r.json(); });

// ── Concentration Monitor APIs ──────────────────────────────────────
export const fetchConcentrationKPIs = (f, t) =>
  apiFetch(`${API_BASE}/policy/concentration/kpis${dateParams(f, t)}`).then(async (r) => {
    if (!r.ok) throw new Error(await nestErrorMessage(r, 'Failed to load concentration KPIs'));
    return r.json();
  });
export const fetchConcentrationByRegion = (f, t) =>
  apiFetch(`${API_BASE}/policy/concentration/by-region${dateParams(f, t)}`).then(async (r) => {
    if (!r.ok) throw new Error(await nestErrorMessage(r, 'Failed to load concentration by region'));
    return r.json();
  });
export const fetchConcentrationByLob = (f, t) =>
  apiFetch(`${API_BASE}/policy/concentration/by-lob${dateParams(f, t)}`).then(async (r) => {
    if (!r.ok) throw new Error(await nestErrorMessage(r, 'Failed to load concentration by LOB'));
    return r.json();
  });
export const fetchConcentrationByTerritory = (f, t) =>
  apiFetch(`${API_BASE}/policy/concentration/by-territory${dateParams(f, t)}`).then(async (r) => {
    if (!r.ok) throw new Error(await nestErrorMessage(r, 'Failed to load concentration by territory'));
    return r.json();
  });

// ── Special Policy Flags APIs ───────────────────────────────────────
export const fetchSpecialFlagsKPIs = (f, t) => apiFetch(`${API_BASE}/policy/special-flags/kpis${dateParams(f,t)}`).then(r => { if(!r.ok) throw new Error('Failed'); return r.json(); });
export const fetchSpecialFlagsByFlag = (f, t) => apiFetch(`${API_BASE}/policy/special-flags/by-flag${dateParams(f,t)}`).then(r => { if(!r.ok) throw new Error('Failed'); return r.json(); });
export const fetchSpecialFlagsByLob = (f, t) => apiFetch(`${API_BASE}/policy/special-flags/by-lob${dateParams(f,t)}`).then(r => { if(!r.ok) throw new Error('Failed'); return r.json(); });

// ── Vintage & Cohort APIs ───────────────────────────────────────────
export const fetchVintageKPIs = (f, t) =>
  apiFetch(`${API_BASE}/policy/vintage/kpis${dateParams(f, t)}`).then(async (r) => {
    if (!r.ok) throw new Error(await nestErrorMessage(r, 'Failed to load vintage KPIs'));
    return r.json();
  });
export const fetchVintageByCohort = (f, t) =>
  apiFetch(`${API_BASE}/policy/vintage/by-cohort${dateParams(f, t)}`).then(async (r) => {
    if (!r.ok) throw new Error(await nestErrorMessage(r, 'Failed to load vintage by cohort'));
    return r.json();
  });
export const fetchVintageNbVsRenewal = (f, t) =>
  apiFetch(`${API_BASE}/policy/vintage/nb-vs-renewal${dateParams(f, t)}`).then(async (r) => {
    if (!r.ok) throw new Error(await nestErrorMessage(r, 'Failed to load vintage NB vs renewal'));
    return r.json();
  });

// ── Term Premium Reconciliation APIs ────────────────────────────────
export const fetchTermReconKPIs = (f, t) => apiFetch(`${API_BASE}/policy/term-recon/kpis${dateParams(f,t)}`).then(r => { if(!r.ok) throw new Error('Failed'); return r.json(); });
export const fetchTermReconByLob = (f, t) => apiFetch(`${API_BASE}/policy/term-recon/by-lob${dateParams(f,t)}`).then(r => { if(!r.ok) throw new Error('Failed'); return r.json(); });
export const fetchTermReconByProduct = (f, t) => apiFetch(`${API_BASE}/policy/term-recon/by-product${dateParams(f,t)}`).then(r => { if(!r.ok) throw new Error('Failed'); return r.json(); });
export const fetchTermReconYearly = (f, t) => apiFetch(`${API_BASE}/policy/term-recon/yearly${dateParams(f,t)}`).then(r => { if(!r.ok) throw new Error('Failed'); return r.json(); });

// ── Peril Completeness Audit APIs ───────────────────────────────────
export const fetchPerilAuditKPIs = (f, t) => apiFetch(`${API_BASE}/policy/peril-audit/kpis${dateParams(f,t)}`).then(r => { if(!r.ok) throw new Error('Failed'); return r.json(); });
export const fetchPerilAuditByLob = (f, t) => apiFetch(`${API_BASE}/policy/peril-audit/by-lob${dateParams(f,t)}`).then(r => { if(!r.ok) throw new Error('Failed'); return r.json(); });
export const fetchPerilAuditByCoverage = (f, t) => apiFetch(`${API_BASE}/policy/peril-audit/by-coverage${dateParams(f,t)}`).then(r => { if(!r.ok) throw new Error('Failed'); return r.json(); });
export const fetchPerilAuditFormDetail = (f, t) => apiFetch(`${API_BASE}/policy/peril-audit/form-detail${dateParams(f,t)}`).then(r => { if(!r.ok) throw new Error('Failed'); return r.json(); });

// ── Billing: Collection Rate ────────────────────────────────────────
export const fetchCollectionKPIs = (f, t) => apiFetch(`${API_BASE}/billing/collection/kpis${dateParams(f,t)}`).then(r=>{if(!r.ok)throw new Error('Failed');return r.json();});
export const fetchCollectionByLob = (f, t) => apiFetch(`${API_BASE}/billing/collection/by-lob${dateParams(f,t)}`).then(r=>{if(!r.ok)throw new Error('Failed');return r.json();});
export const fetchCollectionYearly = (f, t) => apiFetch(`${API_BASE}/billing/collection/yearly${dateParams(f,t)}`).then(r=>{if(!r.ok)throw new Error('Failed');return r.json();});
// ── Billing: Refund TAT ─────────────────────────────────────────────
export const fetchRefundKPIs = (f, t) => apiFetch(`${API_BASE}/billing/refund/kpis${dateParams(f,t)}`).then(r=>{if(!r.ok)throw new Error('Failed');return r.json();});
export const fetchRefundByLob = (f, t) => apiFetch(`${API_BASE}/billing/refund/by-lob${dateParams(f,t)}`).then(r=>{if(!r.ok)throw new Error('Failed');return r.json();});
// ── Billing: Commission Payout ──────────────────────────────────────
export const fetchCommissionKPIs = (f, t) => apiFetch(`${API_BASE}/billing/commission/kpis${dateParams(f,t)}`).then(r=>{if(!r.ok)throw new Error('Failed');return r.json();});
export const fetchCommissionByAgent = (f, t) => apiFetch(`${API_BASE}/billing/commission/by-agent${dateParams(f,t)}`).then(r=>{if(!r.ok)throw new Error('Failed');return r.json();});
export const fetchCommissionByLob = (f, t) => apiFetch(`${API_BASE}/billing/commission/by-lob${dateParams(f,t)}`).then(r=>{if(!r.ok)throw new Error('Failed');return r.json();});
// ── Billing: Solvency Ratio ─────────────────────────────────────────
export const fetchSolvencyKPIs = (f, t) => apiFetch(`${API_BASE}/billing/solvency/kpis${dateParams(f,t)}`).then(r=>{if(!r.ok)throw new Error('Failed');return r.json();});
export const fetchSolvencyYearly = (f, t) => apiFetch(`${API_BASE}/billing/solvency/yearly${dateParams(f,t)}`).then(r=>{if(!r.ok)throw new Error('Failed');return r.json();});
// ── Billing: GL Reconciliation ──────────────────────────────────────
export const fetchGLReconKPIs = (f, t) => apiFetch(`${API_BASE}/billing/gl-recon/kpis${dateParams(f,t)}`).then(r=>{if(!r.ok)throw new Error('Failed');return r.json();});
export const fetchGLReconByLob = (f, t) => apiFetch(`${API_BASE}/billing/gl-recon/by-lob${dateParams(f,t)}`).then(r=>{if(!r.ok)throw new Error('Failed');return r.json();});
// ── Billing: GST Compliance ─────────────────────────────────────────
export const fetchGSTKPIs = (f, t) => apiFetch(`${API_BASE}/billing/gst/kpis${dateParams(f,t)}`).then(r=>{if(!r.ok)throw new Error('Failed');return r.json();});
export const fetchGSTByLob = (f, t) => apiFetch(`${API_BASE}/billing/gst/by-lob${dateParams(f,t)}`).then(r=>{if(!r.ok)throw new Error('Failed');return r.json();});
export const fetchGSTYearly = (f, t) => apiFetch(`${API_BASE}/billing/gst/yearly${dateParams(f,t)}`).then(r=>{if(!r.ok)throw new Error('Failed');return r.json();});

// ── Claims: List ────────────────────────────────────────────────────
export const fetchClaimsList = (f, t) =>
  apiFetch(`${API_BASE}/claims/list${dateParams(f, t)}`).then((r) => {
    if (!r.ok) throw new Error('Failed to fetch claims list');
    return r.json();
  });
// ── Claims: TAT Tracker ─────────────────────────────────────────────
export const fetchTatKPIs = (f, t) => apiFetch(`${API_BASE}/claims/tat/kpis${dateParams(f,t)}`).then(r=>{if(!r.ok)throw new Error('Failed');return r.json();});
export const fetchTatByLob = (f, t) => apiFetch(`${API_BASE}/claims/tat/by-lob${dateParams(f,t)}`).then(r=>{if(!r.ok)throw new Error('Failed');return r.json();});
export const fetchTatByAdjuster = (f, t) => apiFetch(`${API_BASE}/claims/tat/by-adjuster${dateParams(f,t)}`).then(r=>{if(!r.ok)throw new Error('Failed');return r.json();});
// ── Claims: Fraud Detection ─────────────────────────────────────────
export const fetchFraudKPIs = (f, t) => apiFetch(`${API_BASE}/claims/fraud/kpis${dateParams(f,t)}`).then(r=>{if(!r.ok)throw new Error('Failed');return r.json();});
export const fetchFraudByLob = (f, t) => apiFetch(`${API_BASE}/claims/fraud/by-lob${dateParams(f,t)}`).then(r=>{if(!r.ok)throw new Error('Failed');return r.json();});
// ── Claims: Reserve Adequacy ────────────────────────────────────────
export const fetchReserveKPIs = (f, t) => apiFetch(`${API_BASE}/claims/reserves/kpis${dateParams(f,t)}`).then(r=>{if(!r.ok)throw new Error('Failed');return r.json();});
export const fetchReserveByLob = (f, t) => apiFetch(`${API_BASE}/claims/reserves/by-lob${dateParams(f,t)}`).then(r=>{if(!r.ok)throw new Error('Failed');return r.json();});
export const fetchReserveByAdjuster = (f, t) => apiFetch(`${API_BASE}/claims/reserves/by-adjuster${dateParams(f,t)}`).then(r=>{if(!r.ok)throw new Error('Failed');return r.json();});
// ── Claims: Repudiation Audit ───────────────────────────────────────
export const fetchRepudiationKPIs = (f, t) => apiFetch(`${API_BASE}/claims/repudiation/kpis${dateParams(f,t)}`).then(r=>{if(!r.ok)throw new Error('Failed');return r.json();});
export const fetchRepudiationByLob = (f, t) => apiFetch(`${API_BASE}/claims/repudiation/by-lob${dateParams(f,t)}`).then(r=>{if(!r.ok)throw new Error('Failed');return r.json();});
// ── Claims: Analytics Suite ─────────────────────────────────────────
export const fetchClaimAnalyticsKPIs = (f, t) => apiFetch(`${API_BASE}/claims/analytics/kpis${dateParams(f,t)}`).then(r=>{if(!r.ok)throw new Error('Failed');return r.json();});
export const fetchClaimAnalyticsByLob = (f, t) => apiFetch(`${API_BASE}/claims/analytics/by-lob${dateParams(f,t)}`).then(r=>{if(!r.ok)throw new Error('Failed');return r.json();});
// ── Claims: IRDAI Compliance ────────────────────────────────────────
export const fetchClaimComplianceKPIs = (f, t) => apiFetch(`${API_BASE}/claims/compliance/kpis${dateParams(f,t)}`).then(r=>{if(!r.ok)throw new Error('Failed');return r.json();});
export const fetchClaimComplianceByLob = (f, t) => apiFetch(`${API_BASE}/claims/compliance/by-lob${dateParams(f,t)}`).then(r=>{if(!r.ok)throw new Error('Failed');return r.json();});

// ── Agent: Snapshot ─────────────────────────────────────────────────
export const fetchAgentSnapshotKPIs = (f, t) =>
  apiFetch(`${API_BASE}/agent/snapshot/kpis${dateParams(f, t)}`).then(async (r) => {
    if (!r.ok) throw new Error(await nestErrorMessage(r, 'Failed to load agency snapshot KPIs'));
    return r.json();
  });
export const fetchAgentSnapshotByAgent = (f, t) =>
  apiFetch(`${API_BASE}/agent/snapshot/by-agent${dateParams(f, t)}`).then(async (r) => {
    if (!r.ok) throw new Error(await nestErrorMessage(r, 'Failed to load agency snapshot by agent'));
    return r.json();
  });
// ── Agent: Production ───────────────────────────────────────────────
export const fetchAgentProductionByAgent = (f, t) =>
  apiFetch(`${API_BASE}/agent/production/by-agent${dateParams(f, t)}`).then(async (r) => {
    if (!r.ok) throw new Error(await nestErrorMessage(r, 'Failed to load producer production (by agent)'));
    return r.json();
  });
export const fetchAgentProductionByLob = (f, t) =>
  apiFetch(`${API_BASE}/agent/production/by-lob${dateParams(f, t)}`).then(async (r) => {
    if (!r.ok) throw new Error(await nestErrorMessage(r, 'Failed to load producer production (by LOB)'));
    return r.json();
  });
// ── Agent: Commission ───────────────────────────────────────────────
export const fetchAgentCommKPIs = (f, t) => apiFetch(`${API_BASE}/agent/commission/kpis${dateParams(f,t)}`).then(r=>{if(!r.ok)throw new Error('Failed');return r.json();});
export const fetchAgentCommByAgent = (f, t) => apiFetch(`${API_BASE}/agent/commission/by-agent${dateParams(f,t)}`).then(r=>{if(!r.ok)throw new Error('Failed');return r.json();});
// ── Agent: License ──────────────────────────────────────────────────
export const fetchAgentLicenseKPIs = (f, t) => apiFetch(`${API_BASE}/agent/license/kpis${dateParams(f,t)}`).then(r=>{if(!r.ok)throw new Error('Failed');return r.json();});
export const fetchAgentLicenseByAgent = (f, t) => apiFetch(`${API_BASE}/agent/license/by-agent${dateParams(f,t)}`).then(r=>{if(!r.ok)throw new Error('Failed');return r.json();});
// ── Agent: Top Producers ────────────────────────────────────────────
export const fetchTopProducers = (f, t) => apiFetch(`${API_BASE}/agent/top-producers${dateParams(f,t)}`).then(r=>{if(!r.ok)throw new Error('Failed');return r.json();});
// ── Agent: Retention ────────────────────────────────────────────────
export const fetchAgentRetentionKPIs = (f, t) => apiFetch(`${API_BASE}/agent/retention/kpis${dateParams(f,t)}`).then(r=>{if(!r.ok)throw new Error('Failed');return r.json();});
export const fetchAgentRetentionByAgent = (f, t) => apiFetch(`${API_BASE}/agent/retention/by-agent${dateParams(f,t)}`).then(r=>{if(!r.ok)throw new Error('Failed');return r.json();});
export const fetchAgentRetentionByLob = (f, t) => apiFetch(`${API_BASE}/agent/retention/by-lob${dateParams(f,t)}`).then(r=>{if(!r.ok)throw new Error('Failed');return r.json();});

// ── Master Data APIs ───────────────────────────────────────────────
async function nestErrorMessage(res, fallback) {
  try {
    const j = await res.json();
    if (j.message != null) {
      return Array.isArray(j.message) ? j.message.join('; ') : String(j.message);
    }
  } catch (_) {
    /* ignore */
  }
  return fallback;
}

export const fetchParties = () =>
  apiFetch(`${API_BASE}/master/parties`).then(async (r) => {
    if (!r.ok) throw new Error(await nestErrorMessage(r, 'Failed to fetch parties'));
    return r.json();
  });
export const fetchMasterProducts = () => apiFetch(`${API_BASE}/master/products`).then(r => { if (!r.ok) throw new Error('Failed to fetch products'); return r.json(); });
export const fetchMasterPolicies = (limit = 100, offset = 0) => apiFetch(`${API_BASE}/master/policies?limit=${limit}&offset=${offset}`).then(r => { if (!r.ok) throw new Error('Failed to fetch policies'); return r.json(); });
export const fetchMasterLocations = () => apiFetch(`${API_BASE}/master/locations`).then(r => { if (!r.ok) throw new Error('Failed to fetch locations'); return r.json(); });
export const fetchMasterQuotes = () => apiFetch(`${API_BASE}/master/quotes`).then(r => { if (!r.ok) throw new Error('Failed to fetch quotes'); return r.json(); });

export async function checkHealth() {
  const res = await apiFetch(`${API_BASE}/health`);
  return res.json();
}
