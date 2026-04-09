import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DateFilterProvider } from './context/DateFilterContext';
import { SchemaProvider } from './context/SchemaContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AppLayout from './layout/AppLayout';
import Login from './pages/Login';

// Dashboard
import Dashboard from './pages/dashboard/Dashboard';

// Master Data
import Parties from './pages/master/Parties';
import Products from './pages/master/Products';
import Locations from './pages/master/Locations';
import RiskCategories from './pages/master/RiskCategories';
import CoverageTypes from './pages/master/CoverageTypes';

// Underwriting
import Quotes from './pages/underwriting/Quotes';
import RiskAssessment from './pages/underwriting/RiskAssessment';
import UWRules from './pages/underwriting/UWRules';
import PremiumCalc from './pages/underwriting/PremiumCalc';
import RiskScoringDashboard from './pages/underwriting/RiskScoringDashboard';
import ProductionReport from './pages/underwriting/ProductionReport';
import RenewalPrioritization from './pages/underwriting/RenewalPrioritization';
import LOBProfitability from './pages/underwriting/LOBProfitability';
import CancellationPatterns from './pages/underwriting/CancellationPatterns';
import PremiumLeakage from './pages/underwriting/PremiumLeakage';

// Policy
import PolicyList from './pages/policy/PolicyList';
import Endorsements from './pages/policy/Endorsements';
import Renewals from './pages/policy/Renewals';
import PolicyHistory from './pages/policy/PolicyHistory';
import AmendmentTracker from './pages/policy/AmendmentTracker';
import ConcentrationMonitor from './pages/policy/ConcentrationMonitor';
import SpecialPolicyFlags from './pages/policy/SpecialPolicyFlags';
import VintageCohort from './pages/policy/VintageCohort';
import TermReconciliation from './pages/policy/TermReconciliation';
// Billing
import Invoices from './pages/billing/Invoices';
import Payments from './pages/billing/Payments';
import Installments from './pages/billing/Installments';
import Outstanding from './pages/billing/Outstanding';
import CollectionRate from './pages/billing/CollectionRate';
import RefundMonitor from './pages/billing/RefundMonitor';
import CommissionPayout from './pages/billing/CommissionPayout';
import SolvencyRatio from './pages/billing/SolvencyRatio';
import GLReconciliation from './pages/billing/GLReconciliation';

// Claims
import ClaimsList from './pages/claims/ClaimsList';
import Investigation from './pages/claims/Investigation';
import Assessment from './pages/claims/Assessment';
import Settlement from './pages/claims/Settlement';
import ClaimTAT from './pages/claims/ClaimTAT';
import FraudDetection from './pages/claims/FraudDetection';
import ReserveAdequacy from './pages/claims/ReserveAdequacy';

// Vendor
import VendorList from './pages/vendor/VendorList';
import Garages from './pages/vendor/Garages';
import Surveyors from './pages/vendor/Surveyors';
import Estimates from './pages/vendor/Estimates';

// Agent
import AgentList from './pages/agent/AgentList';
import Commissions from './pages/agent/Commissions';
import Performance from './pages/agent/Performance';
import AgencySnapshot from './pages/agent/AgencySnapshot';
import ProducerProduction from './pages/agent/ProducerProduction';
import AgentCommission from './pages/agent/AgentCommission';
import TopProducers from './pages/agent/TopProducers';

// CRM
import Requests from './pages/crm/Requests';
import Complaints from './pages/crm/Complaints';
import CommLogs from './pages/crm/CommLogs';

// Documents
import DocumentList from './pages/documents/DocumentList';

// Compliance
import AuditLogs from './pages/compliance/AuditLogs';
import RegulatoryReports from './pages/compliance/RegulatoryReports';
import RiskMonitoring from './pages/compliance/RiskMonitoring';

// Admin
import Users from './pages/admin/Users';
import Roles from './pages/admin/Roles';
import SystemSettings from './pages/admin/SystemSettings';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SchemaProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/select-schema" element={<Navigate to="/" replace />} />
            <Route element={<ProtectedRoute><DateFilterProvider><AppLayout /></DateFilterProvider></ProtectedRoute>}>
            {/* Dashboard */}
            <Route path="/" element={<Dashboard />} />

          {/* Master Data */}
          <Route path="/master/parties" element={<Parties />} />
          <Route path="/master/products" element={<Products />} />
          <Route path="/master/locations" element={<Locations />} />
          <Route path="/master/risk-categories" element={<RiskCategories />} />
          <Route path="/master/coverage-types" element={<CoverageTypes />} />

          {/* Underwriting */}
          <Route path="/underwriting/quotes" element={<Quotes />} />
          <Route path="/underwriting/risk" element={<RiskAssessment />} />
          <Route path="/underwriting/rules" element={<UWRules />} />
          <Route path="/underwriting/premium" element={<PremiumCalc />} />
          <Route path="/underwriting/risk-scoring" element={<RiskScoringDashboard />} />
          <Route path="/underwriting/production-report" element={<ProductionReport />} />
          <Route path="/underwriting/renewal-prioritization" element={<RenewalPrioritization />} />
          <Route path="/underwriting/lob-profitability" element={<LOBProfitability />} />
          <Route path="/underwriting/cancellation-patterns" element={<CancellationPatterns />} />
          <Route path="/underwriting/premium-leakage" element={<PremiumLeakage />} />

          {/* Policy */}
          <Route path="/policy/list" element={<PolicyList />} />
          <Route path="/policy/endorsements" element={<Endorsements />} />
          <Route path="/policy/renewals" element={<Renewals />} />
          <Route path="/policy/history" element={<PolicyHistory />} />
          <Route path="/policy/amendment-tracker" element={<AmendmentTracker />} />
          <Route path="/policy/concentration-monitor" element={<ConcentrationMonitor />} />
          <Route path="/policy/special-flags" element={<SpecialPolicyFlags />} />
          <Route path="/policy/vintage-cohort" element={<VintageCohort />} />
          <Route path="/policy/term-reconciliation" element={<TermReconciliation />} />

          {/* Billing */}
          <Route path="/billing/invoices" element={<Invoices />} />
          <Route path="/billing/payments" element={<Payments />} />
          <Route path="/billing/installments" element={<Installments />} />
          <Route path="/billing/outstanding" element={<Outstanding />} />
          <Route path="/billing/collection-rate" element={<CollectionRate />} />
          <Route path="/billing/refund-monitor" element={<RefundMonitor />} />
          <Route path="/billing/commission-payout" element={<CommissionPayout />} />
          <Route path="/billing/solvency" element={<SolvencyRatio />} />
          <Route path="/billing/gl-reconciliation" element={<GLReconciliation />} />

          {/* Claims */}
          <Route path="/claims/list" element={<ClaimsList />} />
          <Route path="/claims/investigation" element={<Investigation />} />
          <Route path="/claims/assessment" element={<Assessment />} />
          <Route path="/claims/settlement" element={<Settlement />} />
          <Route path="/claims/tat-tracker" element={<ClaimTAT />} />
          <Route path="/claims/fraud-detection" element={<FraudDetection />} />
          <Route path="/claims/reserve-adequacy" element={<ReserveAdequacy />} />

          {/* Vendor */}
          <Route path="/vendor/list" element={<VendorList />} />
          <Route path="/vendor/garages" element={<Garages />} />
          <Route path="/vendor/surveyors" element={<Surveyors />} />
          <Route path="/vendor/estimates" element={<Estimates />} />

          {/* Agent */}
          <Route path="/agent/list" element={<AgentList />} />
          <Route path="/agent/commissions" element={<Commissions />} />
          <Route path="/agent/performance" element={<Performance />} />
          <Route path="/agent/snapshot" element={<AgencySnapshot />} />
          <Route path="/agent/production-report" element={<ProducerProduction />} />
          <Route path="/agent/commission-calc" element={<AgentCommission />} />
          <Route path="/agent/top-producers" element={<TopProducers />} />

          {/* CRM */}
          <Route path="/crm/requests" element={<Requests />} />
          <Route path="/crm/complaints" element={<Complaints />} />
          <Route path="/crm/logs" element={<CommLogs />} />

          {/* Documents */}
          <Route path="/documents/list" element={<DocumentList />} />

          {/* Compliance */}
          <Route path="/compliance/audit" element={<AuditLogs />} />
          <Route path="/compliance/reports" element={<RegulatoryReports />} />
          <Route path="/compliance/risk" element={<RiskMonitoring />} />

          {/* Admin — restricted to Admin role */}
          <Route path="/admin/users" element={<AdminRoute><Users /></AdminRoute>} />
          <Route path="/admin/roles" element={<AdminRoute><Roles /></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><SystemSettings /></AdminRoute>} />
          </Route>
          </Routes>
        </SchemaProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
