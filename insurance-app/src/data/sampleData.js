// ============================================================
// Insurance B2B Application — Sample Data (Indian Market)
// Based on InsuranceCaffe source documents
// ============================================================

// ---------- PARTIES (B2B — Insurance Company Participants) ----------
export const parties = [
  { id: 1, partyType: 'Individual', role: 'Agent', name: 'Arun Mathur', empId: 'EMP-001', designation: 'Senior Agent', department: 'Distribution', city: 'Mumbai', state: 'Maharashtra', phone: '9876543210', email: 'arun.mathur@insurancecaffe.com', licenseNo: 'LIC-MH-2020-0451', licenseExpiry: '2025-12-31', status: 'Active', createdAt: '2020-06-15' },
  { id: 2, partyType: 'Individual', role: 'Underwriter', name: 'Aman Verma', empId: 'EMP-002', designation: 'Chief Underwriter', department: 'Underwriting', city: 'Mumbai', state: 'Maharashtra', phone: '9876543211', email: 'aman.verma@insurancecaffe.com', licenseNo: '-', licenseExpiry: '-', status: 'Active', createdAt: '2019-03-10' },
  { id: 3, partyType: 'Individual', role: 'Claims Adjuster', name: 'Vikram Mehta', empId: 'EMP-003', designation: 'Senior Claims Adjuster', department: 'Claims', city: 'Pune', state: 'Maharashtra', phone: '9876543212', email: 'vikram.mehta@insurancecaffe.com', licenseNo: '-', licenseExpiry: '-', status: 'Active', createdAt: '2021-01-20' },
  { id: 4, partyType: 'Individual', role: 'Claims Adjuster', name: 'Neha Gupta', empId: 'EMP-004', designation: 'Claims Manager', department: 'Claims', city: 'New Delhi', state: 'Delhi', phone: '9876543213', email: 'neha.gupta@insurancecaffe.com', licenseNo: '-', licenseExpiry: '-', status: 'Active', createdAt: '2018-09-05' },
  { id: 5, partyType: 'Organization', role: 'Broker', name: 'Corporate Insurance Brokers Pvt Ltd', empId: 'BRK-001', designation: 'Composite Broker', department: 'Distribution', city: 'Mumbai', state: 'Maharashtra', phone: '9876543214', email: 'ops@corpbrokers.com', licenseNo: 'LIC-MH-2019-0122', licenseExpiry: '2025-06-30', status: 'Active', createdAt: '2019-04-01' },
  { id: 6, partyType: 'Individual', role: 'Agent', name: 'Lakshmi Menon', empId: 'EMP-005', designation: 'Agent', department: 'Distribution', city: 'Kochi', state: 'Kerala', phone: '9876543215', email: 'lakshmi.menon@insurancecaffe.com', licenseNo: 'LIC-KL-2021-0789', licenseExpiry: '2026-03-31', status: 'Active', createdAt: '2021-07-15' },
  { id: 7, partyType: 'Individual', role: 'Surveyor', name: 'Suresh Iyer', empId: 'SRV-001', designation: 'Licensed Surveyor', department: 'Claims', city: 'Chennai', state: 'Tamil Nadu', phone: '9876543216', email: 'suresh.iyer@insurancecaffe.com', licenseNo: 'IRDAI/SRV/2020/0456', licenseExpiry: '2025-09-30', status: 'Active', createdAt: '2020-02-10' },
  { id: 8, partyType: 'Individual', role: 'Agent', name: 'Pooja Agarwal', empId: 'EMP-006', designation: 'POSP Agent', department: 'Distribution', city: 'Jaipur', state: 'Rajasthan', phone: '9876543217', email: 'pooja.agarwal@insurancecaffe.com', licenseNo: 'LIC-RJ-2023-0567', licenseExpiry: '2026-06-30', status: 'Active', createdAt: '2023-01-12' },
  { id: 9, partyType: 'Organization', role: 'TPA', name: 'HealthFirst TPA Services', empId: 'TPA-001', designation: 'Third Party Administrator', department: 'Claims', city: 'New Delhi', state: 'Delhi', phone: '9876543218', email: 'ops@healthfirsttpa.com', licenseNo: 'IRDAI/TPA/2019/0089', licenseExpiry: '2025-12-31', status: 'Active', createdAt: '2019-08-20' },
  { id: 10, partyType: 'Individual', role: 'Underwriter', name: 'Farhan Sheikh', empId: 'EMP-007', designation: 'Underwriter', department: 'Underwriting', city: 'Hyderabad', state: 'Telangana', phone: '9876543219', email: 'farhan.sheikh@insurancecaffe.com', licenseNo: '-', licenseExpiry: '-', status: 'Active', createdAt: '2022-05-18' },
  { id: 11, partyType: 'Individual', role: 'Broker', name: 'Rohit Kapoor', empId: 'BRK-002', designation: 'Insurance Broker', department: 'Distribution', city: 'New Delhi', state: 'Delhi', phone: '9876543220', email: 'rohit.kapoor@kapoorbrokers.com', licenseNo: 'LIC-DL-2019-0678', licenseExpiry: '2025-08-31', status: 'Active', createdAt: '2019-11-01' },
  { id: 12, partyType: 'Individual', role: 'Actuary', name: 'Dr. Meera Krishnan', empId: 'EMP-008', designation: 'Appointed Actuary', department: 'Finance', city: 'Bengaluru', state: 'Karnataka', phone: '9876543221', email: 'meera.krishnan@insurancecaffe.com', licenseNo: 'IAI/FIAI/2018/0234', licenseExpiry: '-', status: 'Active', createdAt: '2018-04-01' },
  { id: 13, partyType: 'Individual', role: 'Compliance Officer', name: 'Ravi Desai', empId: 'EMP-009', designation: 'Chief Compliance Officer', department: 'Compliance', city: 'Mumbai', state: 'Maharashtra', phone: '9876543222', email: 'ravi.desai@insurancecaffe.com', licenseNo: '-', licenseExpiry: '-', status: 'Active', createdAt: '2019-01-15' },
  { id: 14, partyType: 'Organization', role: 'Reinsurer', name: 'GIC Re (General Insurance Corp)', empId: 'RE-001', designation: 'National Reinsurer', department: 'Reinsurance', city: 'Mumbai', state: 'Maharashtra', phone: '9876543223', email: 'cessions@gicre.in', licenseNo: 'IRDAI/RE/001', licenseExpiry: '-', status: 'Active', createdAt: '2018-01-01' },
  { id: 15, partyType: 'Individual', role: 'Agent', name: 'Meena Krishnan', empId: 'EMP-010', designation: 'Agent', department: 'Distribution', city: 'Bengaluru', state: 'Karnataka', phone: '9876543224', email: 'meena.k@insurancecaffe.com', licenseNo: 'LIC-KA-2021-0345', licenseExpiry: '2024-12-31', status: 'Expiring', createdAt: '2021-06-01' },
];

// ---------- PRODUCTS (General Insurance Only) ----------
export const products = [
  { id: 1, code: 'MOTOR_COMP', name: 'Motor Comprehensive', lob: 'Motor', status: 'Active', version: '3.2', effectiveFrom: '2024-01-01', gst: 18 },
  { id: 2, code: 'MOTOR_TP', name: 'Motor Third Party', lob: 'Motor', status: 'Active', version: '2.1', effectiveFrom: '2024-01-01', gst: 18 },
  { id: 3, code: 'MOTOR_FLEET', name: 'Motor Fleet Policy', lob: 'Motor', status: 'Active', version: '2.0', effectiveFrom: '2024-01-01', gst: 18 },
  { id: 4, code: 'PROP_FIRE', name: 'Property Fire & Allied', lob: 'Property', status: 'Active', version: '2.0', effectiveFrom: '2024-01-01', gst: 18 },
  { id: 5, code: 'PROP_IAR', name: 'Industrial All Risk', lob: 'Property', status: 'Active', version: '1.5', effectiveFrom: '2024-01-01', gst: 18 },
  { id: 6, code: 'MARINE_CARGO', name: 'Marine Cargo', lob: 'Marine', status: 'Active', version: '1.8', effectiveFrom: '2024-01-01', gst: 18 },
  { id: 7, code: 'MARINE_HULL', name: 'Marine Hull', lob: 'Marine', status: 'Active', version: '1.3', effectiveFrom: '2024-01-01', gst: 18 },
  { id: 8, code: 'LIABILITY_PL', name: 'Public Liability', lob: 'Liability', status: 'Active', version: '1.5', effectiveFrom: '2024-01-01', gst: 18 },
  { id: 9, code: 'LIABILITY_PI', name: 'Professional Indemnity', lob: 'Liability', status: 'Active', version: '1.2', effectiveFrom: '2024-01-01', gst: 18 },
  { id: 10, code: 'PA_INDIV', name: 'Personal Accident', lob: 'Personal Accident', status: 'Active', version: '2.3', effectiveFrom: '2024-01-01', gst: 18 },
  { id: 11, code: 'ENGG_CAR', name: 'Contractors All Risk', lob: 'Engineering', status: 'Active', version: '1.1', effectiveFrom: '2024-01-01', gst: 18 },
  { id: 12, code: 'WC_POLICY', name: 'Workmen Compensation', lob: 'Liability', status: 'Active', version: '2.0', effectiveFrom: '2024-01-01', gst: 18 },
];

// ---------- POLICIES (General Insurance Only) ----------
export const policies = [
  { id: 1, policyNumber: 'POL-2024-000001', partyId: 1, partyName: 'Rajesh Kumar Sharma', productCode: 'MOTOR_COMP', productName: 'Motor Comprehensive', lob: 'Motor', status: 'Active', effectiveDate: '2024-06-01', expiryDate: '2025-05-31', sumInsured: 850000, grossPremium: 24500, netPremium: 20763, gst: 3737, agentCode: 'AGT-001', region: 'West' },
  { id: 2, policyNumber: 'POL-2024-000002', partyId: 2, partyName: 'Priya Nair', productCode: 'MOTOR_TP', productName: 'Motor Third Party', lob: 'Motor', status: 'Active', effectiveDate: '2024-04-15', expiryDate: '2025-04-14', sumInsured: 0, grossPremium: 2094, netPremium: 1775, gst: 319, agentCode: 'AGT-003', region: 'South' },
  { id: 3, policyNumber: 'POL-2024-000003', partyId: 3, partyName: 'Tata Motors Fleet Services', productCode: 'MOTOR_FLEET', productName: 'Motor Fleet Policy', lob: 'Motor', status: 'Active', effectiveDate: '2024-03-01', expiryDate: '2025-02-28', sumInsured: 45000000, grossPremium: 1250000, netPremium: 1059322, gst: 190678, agentCode: 'AGT-002', region: 'West' },
  { id: 4, policyNumber: 'POL-2024-000004', partyId: 4, partyName: 'Amit Patel', productCode: 'PROP_FIRE', productName: 'Property Fire & Allied', lob: 'Property', status: 'Pending', effectiveDate: '2024-07-01', expiryDate: '2025-06-30', sumInsured: 5000000, grossPremium: 35000, netPremium: 29661, gst: 5339, agentCode: 'AGT-004', region: 'West' },
  { id: 5, policyNumber: 'POL-2024-000005', partyId: 5, partyName: 'Sunita Devi', productCode: 'PA_INDIV', productName: 'Personal Accident', lob: 'Personal Accident', status: 'Active', effectiveDate: '2024-05-10', expiryDate: '2025-05-09', sumInsured: 2000000, grossPremium: 5500, netPremium: 4661, gst: 839, agentCode: 'AGT-005', region: 'North' },
  { id: 6, policyNumber: 'POL-2024-000006', partyId: 6, partyName: 'Reliance Retail Ltd', productCode: 'PROP_IAR', productName: 'Industrial All Risk', lob: 'Property', status: 'Active', effectiveDate: '2024-01-01', expiryDate: '2024-12-31', sumInsured: 100000000, grossPremium: 8500000, netPremium: 7203390, gst: 1296610, agentCode: 'AGT-002', region: 'West' },
  { id: 7, policyNumber: 'POL-2024-000007', partyId: 7, partyName: 'Mohammed Irfan', productCode: 'MARINE_CARGO', productName: 'Marine Cargo', lob: 'Marine', status: 'Active', effectiveDate: '2024-02-15', expiryDate: '2025-02-14', sumInsured: 10000000, grossPremium: 65000, netPremium: 55085, gst: 9915, agentCode: 'AGT-006', region: 'South' },
  { id: 8, policyNumber: 'POL-2024-000008', partyId: 8, partyName: 'Kavitha Reddy', productCode: 'MOTOR_COMP', productName: 'Motor Comprehensive', lob: 'Motor', status: 'Lapsed', effectiveDate: '2023-08-01', expiryDate: '2024-07-31', sumInsured: 650000, grossPremium: 19500, netPremium: 16525, gst: 2975, agentCode: 'AGT-007', region: 'South' },
  { id: 9, policyNumber: 'POL-2024-000009', partyId: 9, partyName: 'Deepak Singh', productCode: 'ENGG_CAR', productName: 'Contractors All Risk', lob: 'Engineering', status: 'Active', effectiveDate: '2024-06-15', expiryDate: '2025-06-14', sumInsured: 25000000, grossPremium: 175000, netPremium: 148305, gst: 26695, agentCode: 'AGT-008', region: 'North' },
  { id: 10, policyNumber: 'POL-2024-000010', partyId: 10, partyName: 'Infosys Technologies', productCode: 'LIABILITY_PL', productName: 'Public Liability', lob: 'Liability', status: 'Active', effectiveDate: '2024-04-01', expiryDate: '2025-03-31', sumInsured: 50000000, grossPremium: 450000, netPremium: 381356, gst: 68644, agentCode: 'AGT-002', region: 'South' },
  { id: 11, policyNumber: 'POL-2024-000011', partyId: 1, partyName: 'Rajesh Kumar Sharma', productCode: 'LIABILITY_PI', productName: 'Professional Indemnity', lob: 'Liability', status: 'Active', effectiveDate: '2024-03-01', expiryDate: '2025-02-28', sumInsured: 5000000, grossPremium: 32000, netPremium: 27119, gst: 4881, agentCode: 'AGT-001', region: 'West' },
  { id: 12, policyNumber: 'POL-2024-000012', partyId: 5, partyName: 'Sunita Devi', productCode: 'MOTOR_TP', productName: 'Motor Third Party', lob: 'Motor', status: 'Cancelled', effectiveDate: '2024-01-10', expiryDate: '2025-01-09', sumInsured: 0, grossPremium: 2094, netPremium: 1775, gst: 319, agentCode: 'AGT-005', region: 'North' },
];

// ---------- CLAIMS (General Insurance Only) ----------
export const claims = [
  { id: 1, claimNumber: 'CLM-2024-0001', policyNumber: 'POL-2024-000001', partyName: 'Rajesh Kumar Sharma', lob: 'Motor', lossType: 'Collision', lossDate: '2024-08-15', fnolDate: '2024-08-16', status: 'Under Investigation', claimAmount: 125000, reserveAmount: 150000, paidAmount: 0, adjuster: 'Vikram Mehta', location: 'Mumbai' },
  { id: 2, claimNumber: 'CLM-2024-0002', policyNumber: 'POL-2024-000002', partyName: 'Priya Nair', lob: 'Motor', lossType: 'Third Party Property Damage', lossDate: '2024-09-02', fnolDate: '2024-09-02', status: 'Settled', claimAmount: 85000, reserveAmount: 85000, paidAmount: 85000, adjuster: 'Neha Gupta', location: 'Kochi' },
  { id: 3, claimNumber: 'CLM-2024-0003', policyNumber: 'POL-2024-000003', partyName: 'Tata Motors Fleet Services', lob: 'Motor', lossType: 'Theft', lossDate: '2024-07-20', fnolDate: '2024-07-21', status: 'Approved', claimAmount: 750000, reserveAmount: 800000, paidAmount: 750000, adjuster: 'Suresh Iyer', location: 'Pune' },
  { id: 4, claimNumber: 'CLM-2024-0004', policyNumber: 'POL-2024-000006', partyName: 'Reliance Retail Ltd', lob: 'Property', lossType: 'Fire Damage', lossDate: '2024-10-05', fnolDate: '2024-10-06', status: 'Documents Pending', claimAmount: 2500000, reserveAmount: 3000000, paidAmount: 0, adjuster: 'Neha Gupta', location: 'Mumbai' },
  { id: 5, claimNumber: 'CLM-2024-0005', policyNumber: 'POL-2024-000007', partyName: 'Mohammed Irfan', lob: 'Marine', lossType: 'Cargo Damage in Transit', lossDate: '2024-06-18', fnolDate: '2024-06-18', status: 'Settled', claimAmount: 350000, reserveAmount: 350000, paidAmount: 350000, adjuster: 'Aman Verma', location: 'Chennai' },
  { id: 6, claimNumber: 'CLM-2024-0006', policyNumber: 'POL-2024-000001', partyName: 'Rajesh Kumar Sharma', lob: 'Motor', lossType: 'Fire', lossDate: '2024-11-10', fnolDate: '2024-11-11', status: 'FNOL', claimAmount: 0, reserveAmount: 200000, paidAmount: 0, adjuster: 'Unassigned', location: 'Mumbai' },
  { id: 7, claimNumber: 'CLM-2024-0007', policyNumber: 'POL-2024-000004', partyName: 'Amit Patel', lob: 'Property', lossType: 'Water Damage', lossDate: '2024-09-15', fnolDate: '2024-09-16', status: 'Denied', claimAmount: 180000, reserveAmount: 0, paidAmount: 0, adjuster: 'Vikram Mehta', location: 'Ahmedabad' },
  { id: 8, claimNumber: 'CLM-2024-0008', policyNumber: 'POL-2024-000010', partyName: 'Infosys Technologies', lob: 'Liability', lossType: 'Third Party Injury', lossDate: '2024-10-20', fnolDate: '2024-10-21', status: 'Under Investigation', claimAmount: 500000, reserveAmount: 600000, paidAmount: 0, adjuster: 'Suresh Iyer', location: 'Bengaluru' },
];

// ---------- INVOICES ----------
export const invoices = [
  { id: 1, invoiceNumber: 'INV-2024-0001', policyNumber: 'POL-2024-000001', partyName: 'Rajesh Kumar Sharma', billDate: '2024-06-01', dueDate: '2024-06-30', amount: 24500, paidAmount: 24500, status: 'Paid', paymentMode: 'UPI' },
  { id: 2, invoiceNumber: 'INV-2024-0002', policyNumber: 'POL-2024-000002', partyName: 'Priya Nair', billDate: '2024-04-15', dueDate: '2024-05-15', amount: 18500, paidAmount: 18500, status: 'Paid', paymentMode: 'Net Banking' },
  { id: 3, invoiceNumber: 'INV-2024-0003', policyNumber: 'POL-2024-000003', partyName: 'Tata Motors Fleet Services', billDate: '2024-03-01', dueDate: '2024-03-31', amount: 1250000, paidAmount: 1250000, status: 'Paid', paymentMode: 'NEFT' },
  { id: 4, invoiceNumber: 'INV-2024-0004', policyNumber: 'POL-2024-000004', partyName: 'Amit Patel', billDate: '2024-07-01', dueDate: '2024-07-31', amount: 35000, paidAmount: 0, status: 'Overdue', paymentMode: '-' },
  { id: 5, invoiceNumber: 'INV-2024-0005', policyNumber: 'POL-2024-000005', partyName: 'Sunita Devi', billDate: '2024-05-10', dueDate: '2024-06-10', amount: 12000, paidAmount: 6000, status: 'Partial', paymentMode: 'UPI' },
  { id: 6, invoiceNumber: 'INV-2024-0006', policyNumber: 'POL-2024-000006', partyName: 'Reliance Retail Ltd', billDate: '2024-01-01', dueDate: '2024-01-31', amount: 8500000, paidAmount: 8500000, status: 'Paid', paymentMode: 'RTGS' },
  { id: 7, invoiceNumber: 'INV-2024-0007', policyNumber: 'POL-2024-000007', partyName: 'Mohammed Irfan', billDate: '2024-02-15', dueDate: '2024-03-15', amount: 15000, paidAmount: 15000, status: 'Paid', paymentMode: 'Credit Card' },
  { id: 8, invoiceNumber: 'INV-2024-0008', policyNumber: 'POL-2024-000009', partyName: 'Deepak Singh', billDate: '2024-06-15', dueDate: '2024-07-15', amount: 5500, paidAmount: 5500, status: 'Paid', paymentMode: 'Debit Card' },
];

// ---------- AGENTS ----------
export const agents = [
  { id: 1, agentCode: 'AGT-001', name: 'Arun Mathur', type: 'Individual', licenseNumber: 'LIC-MH-2020-0451', licenseExpiry: '2025-12-31', status: 'Active', region: 'West', city: 'Mumbai', policiesSold: 156, totalPremium: 4250000, commissionEarned: 382500, persistency: 92 },
  { id: 2, agentCode: 'AGT-002', name: 'Corporate Insurance Brokers Pvt Ltd', type: 'Corporate', licenseNumber: 'LIC-MH-2019-0122', licenseExpiry: '2025-06-30', status: 'Active', region: 'West', city: 'Mumbai', policiesSold: 423, totalPremium: 85000000, commissionEarned: 5950000, persistency: 95 },
  { id: 3, agentCode: 'AGT-003', name: 'Lakshmi Menon', type: 'Individual', licenseNumber: 'LIC-KL-2021-0789', licenseExpiry: '2026-03-31', status: 'Active', region: 'South', city: 'Kochi', policiesSold: 98, totalPremium: 2100000, commissionEarned: 189000, persistency: 88 },
  { id: 4, agentCode: 'AGT-004', name: 'Ravi Desai', type: 'Individual', licenseNumber: 'LIC-GJ-2022-0234', licenseExpiry: '2025-09-30', status: 'Active', region: 'West', city: 'Ahmedabad', policiesSold: 72, totalPremium: 1800000, commissionEarned: 162000, persistency: 85 },
  { id: 5, agentCode: 'AGT-005', name: 'Pooja Agarwal', type: 'POSP', licenseNumber: 'LIC-RJ-2023-0567', licenseExpiry: '2026-06-30', status: 'Active', region: 'North', city: 'Jaipur', policiesSold: 45, totalPremium: 950000, commissionEarned: 76000, persistency: 78 },
  { id: 6, agentCode: 'AGT-006', name: 'Farhan Sheikh', type: 'Individual', licenseNumber: 'LIC-TS-2020-0890', licenseExpiry: '2025-03-31', status: 'Active', region: 'South', city: 'Hyderabad', policiesSold: 110, totalPremium: 3200000, commissionEarned: 256000, persistency: 91 },
  { id: 7, agentCode: 'AGT-007', name: 'Meena Krishnan', type: 'Individual', licenseNumber: 'LIC-KA-2021-0345', licenseExpiry: '2024-12-31', status: 'Expiring', region: 'South', city: 'Bengaluru', policiesSold: 88, totalPremium: 1950000, commissionEarned: 156000, persistency: 82 },
  { id: 8, agentCode: 'AGT-008', name: 'Rohit Kapoor', type: 'Broker', licenseNumber: 'LIC-DL-2019-0678', licenseExpiry: '2025-08-31', status: 'Active', region: 'North', city: 'New Delhi', policiesSold: 210, totalPremium: 12000000, commissionEarned: 840000, persistency: 90 },
];

// ---------- VENDORS ----------
export const vendors = [
  { id: 1, name: 'AutoFix Garage', type: 'Garage', city: 'Mumbai', state: 'Maharashtra', empanelmentStatus: 'Active', rating: 4.2, claimsHandled: 145, avgTAT: 4.5, slaCompliance: 92 },
  { id: 2, name: 'HealthFirst TPA', type: 'TPA', city: 'New Delhi', state: 'Delhi', empanelmentStatus: 'Active', rating: 4.5, claimsHandled: 890, avgTAT: 2.1, slaCompliance: 96 },
  { id: 3, name: 'RK Surveyors & Associates', type: 'Surveyor', city: 'Pune', state: 'Maharashtra', empanelmentStatus: 'Active', rating: 4.0, claimsHandled: 220, avgTAT: 3.2, slaCompliance: 88 },
  { id: 4, name: 'MedAssist Hospital Network', type: 'TPA', city: 'Bengaluru', state: 'Karnataka', empanelmentStatus: 'Active', rating: 4.3, claimsHandled: 650, avgTAT: 1.8, slaCompliance: 94 },
  { id: 5, name: 'SpeedWheels Motors', type: 'Garage', city: 'Ahmedabad', state: 'Gujarat', empanelmentStatus: 'Active', rating: 3.8, claimsHandled: 95, avgTAT: 5.2, slaCompliance: 82 },
  { id: 6, name: 'National Loss Assessors', type: 'Surveyor', city: 'Chennai', state: 'Tamil Nadu', empanelmentStatus: 'Inactive', rating: 3.5, claimsHandled: 180, avgTAT: 4.0, slaCompliance: 78 },
  { id: 7, name: 'CareCure TPA Services', type: 'TPA', city: 'Hyderabad', state: 'Telangana', empanelmentStatus: 'Active', rating: 4.1, claimsHandled: 420, avgTAT: 2.5, slaCompliance: 91 },
  { id: 8, name: 'Premier Auto Works', type: 'Garage', city: 'Jaipur', state: 'Rajasthan', empanelmentStatus: 'Active', rating: 4.4, claimsHandled: 110, avgTAT: 3.8, slaCompliance: 90 },
];

// ---------- CUSTOMER INTERACTIONS ----------
export const interactions = [
  { id: 1, partyName: 'Rajesh Kumar Sharma', type: 'Complaint', channel: 'Phone', subject: 'Claim settlement delay', status: 'Open', priority: 'High', createdAt: '2024-11-01', assignedTo: 'Neha Gupta' },
  { id: 2, partyName: 'Priya Nair', type: 'Query', channel: 'Email', subject: 'Policy renewal premium increase', status: 'Resolved', priority: 'Medium', createdAt: '2024-10-15', assignedTo: 'Lakshmi Menon' },
  { id: 3, partyName: 'Amit Patel', type: 'Service Request', channel: 'Portal', subject: 'Address change on policy', status: 'In Progress', priority: 'Low', createdAt: '2024-10-28', assignedTo: 'Ravi Desai' },
  { id: 4, partyName: 'Sunita Devi', type: 'Grievance', channel: 'IGMS', subject: 'Claim partially denied without explanation', status: 'Escalated', priority: 'Critical', createdAt: '2024-10-20', assignedTo: 'Vikram Mehta' },
  { id: 5, partyName: 'Infosys Technologies', type: 'Query', channel: 'Email', subject: 'Group policy endorsement for new employees', status: 'Resolved', priority: 'Medium', createdAt: '2024-09-10', assignedTo: 'Aman Verma' },
  { id: 6, partyName: 'Mohammed Irfan', type: 'Service Request', channel: 'App', subject: 'Nominee change request', status: 'Resolved', priority: 'Low', createdAt: '2024-08-25', assignedTo: 'Farhan Sheikh' },
];

// ---------- DOCUMENTS ----------
export const documents = [
  { id: 1, name: 'Motor Policy Schedule - Rajesh', type: 'Policy Document', module: 'Policy', relatedId: 'POL-2024-000001', uploadedBy: 'System', uploadedAt: '2024-06-01', size: '245 KB' },
  { id: 2, name: 'KYC - Priya Nair - Aadhaar', type: 'KYC Document', module: 'Customer', relatedId: 'PARTY-002', uploadedBy: 'Agent', uploadedAt: '2024-02-03', size: '1.2 MB' },
  { id: 3, name: 'Claim Photos - CLM-2024-0001', type: 'Claim Document', module: 'Claims', relatedId: 'CLM-2024-0001', uploadedBy: 'Adjuster', uploadedAt: '2024-08-17', size: '3.5 MB' },
  { id: 4, name: 'Fleet Policy Certificate - Tata Motors', type: 'Policy Document', module: 'Policy', relatedId: 'POL-2024-000003', uploadedBy: 'System', uploadedAt: '2024-03-01', size: '890 KB' },
  { id: 5, name: 'FIR Copy - Theft Claim', type: 'Claim Document', module: 'Claims', relatedId: 'CLM-2024-0003', uploadedBy: 'Claimant', uploadedAt: '2024-07-22', size: '520 KB' },
  { id: 6, name: 'Medical Report - Sunita Devi', type: 'Claim Document', module: 'Claims', relatedId: 'CLM-2024-0004', uploadedBy: 'Hospital', uploadedAt: '2024-10-08', size: '1.8 MB' },
  { id: 7, name: 'Group Health Master Policy - Reliance', type: 'Policy Document', module: 'Policy', relatedId: 'POL-2024-000006', uploadedBy: 'System', uploadedAt: '2024-01-01', size: '2.1 MB' },
  { id: 8, name: 'PAN Card - Amit Patel', type: 'KYC Document', module: 'Customer', relatedId: 'PARTY-004', uploadedBy: 'Agent', uploadedAt: '2024-03-10', size: '350 KB' },
];

// ---------- AUDIT LOGS ----------
export const auditLogs = [
  { id: 1, action: 'Policy Created', module: 'Policy', user: 'admin@insurancecaffe.com', details: 'POL-2024-000001 issued for Motor Comprehensive', timestamp: '2024-06-01 09:15:22', ip: '192.168.1.101' },
  { id: 2, action: 'Claim Filed', module: 'Claims', user: 'neha.gupta@insurancecaffe.com', details: 'CLM-2024-0002 FNOL registered - Health Hospitalization', timestamp: '2024-09-02 14:30:45', ip: '192.168.1.105' },
  { id: 3, action: 'KYC Verified', module: 'Compliance', user: 'compliance@insurancecaffe.com', details: 'Party ID 5 - Sunita Devi KYC verified via CKYC', timestamp: '2024-01-28 11:20:00', ip: '192.168.1.102' },
  { id: 4, action: 'Payment Received', module: 'Billing', user: 'billing@insurancecaffe.com', details: 'INV-2024-0006 - Rs.85,00,000 received via RTGS', timestamp: '2024-01-15 16:45:30', ip: '192.168.1.110' },
  { id: 5, action: 'Claim Denied', module: 'Claims', user: 'vikram.mehta@insurancecaffe.com', details: 'CLM-2024-0007 denied - Policy not active on date of loss', timestamp: '2024-09-25 10:05:12', ip: '192.168.1.107' },
  { id: 6, action: 'Agent License Updated', module: 'Agent', user: 'admin@insurancecaffe.com', details: 'AGT-006 license renewed till 2025-03-31', timestamp: '2024-03-15 09:00:00', ip: '192.168.1.101' },
  { id: 7, action: 'User Role Changed', module: 'Admin', user: 'superadmin@insurancecaffe.com', details: 'User neha.gupta promoted to Senior Claims Adjuster', timestamp: '2024-08-01 08:30:00', ip: '192.168.1.100' },
  { id: 8, action: 'Endorsement Processed', module: 'Policy', user: 'operations@insurancecaffe.com', details: 'POL-2024-000006 - 50 employees added to group policy', timestamp: '2024-06-20 15:20:10', ip: '192.168.1.103' },
];

// ---------- USERS ----------
export const users = [
  { id: 1, username: 'admin', displayName: 'System Administrator', email: 'admin@insurancecaffe.com', role: 'Super Admin', department: 'IT', status: 'Active', lastLogin: '2024-11-15 09:00:00' },
  { id: 2, username: 'neha.gupta', displayName: 'Neha Gupta', email: 'neha.gupta@insurancecaffe.com', role: 'Claims Manager', department: 'Claims', status: 'Active', lastLogin: '2024-11-15 08:45:00' },
  { id: 3, username: 'vikram.mehta', displayName: 'Vikram Mehta', email: 'vikram.mehta@insurancecaffe.com', role: 'Claims Adjuster', department: 'Claims', status: 'Active', lastLogin: '2024-11-14 17:30:00' },
  { id: 4, username: 'aman.verma', displayName: 'Aman Verma', email: 'aman.verma@insurancecaffe.com', role: 'Underwriter', department: 'Underwriting', status: 'Active', lastLogin: '2024-11-15 09:15:00' },
  { id: 5, username: 'priya.ops', displayName: 'Priya Operations', email: 'operations@insurancecaffe.com', role: 'Operations Manager', department: 'Operations', status: 'Active', lastLogin: '2024-11-13 16:00:00' },
  { id: 6, username: 'billing.team', displayName: 'Billing Team', email: 'billing@insurancecaffe.com', role: 'Billing Officer', department: 'Finance', status: 'Active', lastLogin: '2024-11-15 07:30:00' },
];

// ---------- LOCATIONS ----------
export const locations = [
  { id: 1, name: 'Mumbai Head Office', type: 'Head Office', address: 'BKC, Bandra East', city: 'Mumbai', state: 'Maharashtra', pincode: '400051', riskZone: 'Flood Zone B' },
  { id: 2, name: 'Delhi Regional Office', type: 'Regional Office', address: 'Connaught Place', city: 'New Delhi', state: 'Delhi', pincode: '110001', riskZone: 'Earthquake Zone IV' },
  { id: 3, name: 'Bengaluru Tech Park', type: 'Branch', address: 'Whitefield', city: 'Bengaluru', state: 'Karnataka', pincode: '560066', riskZone: 'Low Risk' },
  { id: 4, name: 'Chennai Warehouse', type: 'Risk Location', address: 'Ambattur Industrial Estate', city: 'Chennai', state: 'Tamil Nadu', pincode: '600058', riskZone: 'Cyclone Zone' },
  { id: 5, name: 'Ahmedabad Factory', type: 'Risk Location', address: 'Naroda GIDC', city: 'Ahmedabad', state: 'Gujarat', pincode: '382330', riskZone: 'Earthquake Zone III' },
  { id: 6, name: 'Kochi Branch', type: 'Branch', address: 'MG Road', city: 'Kochi', state: 'Kerala', pincode: '682011', riskZone: 'Flood Zone A' },
];

// ---------- COVERAGE TYPES (General Insurance Only) ----------
export const coverageTypes = [
  { id: 1, code: 'OD', name: 'Own Damage', lob: 'Motor', description: 'Covers damage to own vehicle from accidents, fire, theft' },
  { id: 2, code: 'TP', name: 'Third Party Liability', lob: 'Motor', description: 'Mandatory cover for third party injury/property damage' },
  { id: 3, code: 'FIRE', name: 'Fire & Allied Perils', lob: 'Property', description: 'Fire, lightning, explosion, and allied perils' },
  { id: 4, code: 'BURGLARY', name: 'Burglary & Housebreaking', lob: 'Property', description: 'Loss due to burglary and housebreaking' },
  { id: 5, code: 'CARGO', name: 'Marine Cargo', lob: 'Marine', description: 'Loss or damage to goods in transit' },
  { id: 6, code: 'HULL', name: 'Marine Hull', lob: 'Marine', description: 'Damage to vessel/ship and machinery' },
  { id: 7, code: 'PL', name: 'Public Liability', lob: 'Liability', description: 'Liability to third parties for bodily injury or property damage' },
  { id: 8, code: 'WC', name: 'Workmen Compensation', lob: 'Liability', description: 'Employer liability for employee injury/death during employment' },
  { id: 9, code: 'PTD', name: 'Permanent Total Disability', lob: 'Personal Accident', description: 'Benefit on permanent total disablement from accident' },
  { id: 10, code: 'CAR', name: 'Contractors All Risk', lob: 'Engineering', description: 'Covers construction projects against physical loss or damage' },
  { id: 11, code: 'EAR', name: 'Erection All Risk', lob: 'Engineering', description: 'Covers erection/installation of plant and machinery' },
  { id: 12, code: 'PI', name: 'Professional Indemnity', lob: 'Liability', description: 'Covers professionals against negligence claims' },
];

// ---------- RISK CATEGORIES ----------
export const riskCategories = [
  { id: 1, code: 'LOW', name: 'Low Risk', description: 'Standard risk — no adverse indicators', color: '#22c55e' },
  { id: 2, code: 'MED', name: 'Medium Risk', description: 'Moderate risk — some factors require monitoring', color: '#f59e0b' },
  { id: 3, code: 'HIGH', name: 'High Risk', description: 'Elevated risk — enhanced due diligence required', color: '#ef4444' },
  { id: 4, code: 'CAT', name: 'Catastrophe Risk', description: 'Located in catastrophe-prone zone', color: '#7c3aed' },
  { id: 5, code: 'FRAUD', name: 'Fraud Suspected', description: 'Flagged for potential fraud investigation', color: '#dc2626' },
];

// ---------- KPI DASHBOARD DATA ----------
export const dashboardKPIs = {
  gwp: { value: 9825500, change: 12.5, label: 'Gross Written Premium' },
  activePolicies: { value: 1247, change: 8.3, label: 'Active Policies' },
  openClaims: { value: 42, change: -5.2, label: 'Open Claims' },
  claimRatio: { value: 62.4, change: -3.1, label: 'Claims Ratio %' },
  renewalRate: { value: 87.2, change: 2.1, label: 'Renewal Rate %' },
  avgClaimTAT: { value: 18.5, change: -12.0, label: 'Avg Claim TAT (days)' },
  premiumCollection: { value: 94.1, change: 1.8, label: 'Collection Rate %' },
  nps: { value: 72, change: 5.0, label: 'NPS Score' },
};

export const monthlyPremium = [
  { month: 'Jan', written: 750000, earned: 680000, claims: 420000 },
  { month: 'Feb', written: 820000, earned: 740000, claims: 380000 },
  { month: 'Mar', written: 950000, earned: 830000, claims: 510000 },
  { month: 'Apr', written: 880000, earned: 810000, claims: 440000 },
  { month: 'May', written: 920000, earned: 860000, claims: 490000 },
  { month: 'Jun', written: 1050000, earned: 920000, claims: 580000 },
  { month: 'Jul', written: 870000, earned: 840000, claims: 520000 },
  { month: 'Aug', written: 910000, earned: 870000, claims: 460000 },
  { month: 'Sep', written: 980000, earned: 910000, claims: 550000 },
  { month: 'Oct', written: 1020000, earned: 940000, claims: 510000 },
  { month: 'Nov', written: 890000, earned: 850000, claims: 430000 },
  { month: 'Dec', written: 785500, earned: 750000, claims: 400000 },
];

export const lobDistribution = [
  { name: 'Motor', value: 40, premium: 3930200, color: '#3b82f6' },
  { name: 'Property', value: 22, premium: 2161610, color: '#f59e0b' },
  { name: 'Liability', value: 14, premium: 1375570, color: '#ec4899' },
  { name: 'Marine', value: 10, premium: 982550, color: '#06b6d4' },
  { name: 'Engineering', value: 8, premium: 786040, color: '#8b5cf6' },
  { name: 'Personal Accident', value: 6, premium: 589530, color: '#64748b' },
];

export const claimsByStatus = [
  { status: 'Settled', count: 28, color: '#22c55e' },
  { status: 'Under Investigation', count: 8, color: '#3b82f6' },
  { status: 'Documents Pending', count: 6, color: '#f59e0b' },
  { status: 'Approved', count: 5, color: '#8b5cf6' },
  { status: 'FNOL', count: 4, color: '#06b6d4' },
  { status: 'Denied', count: 3, color: '#ef4444' },
];

// ---------- UNDERWRITING QUOTES (General Insurance Only) ----------
export const quotes = [
  { id: 1, quoteNumber: 'QT-2024-0051', partyName: 'Deepak Singh', product: 'Motor Comprehensive', sumInsured: 1200000, premium: 32000, riskScore: 25, status: 'Approved', uwDecision: 'Auto-Approved', createdAt: '2024-11-01' },
  { id: 2, quoteNumber: 'QT-2024-0052', partyName: 'Kavitha Reddy', product: 'Motor Comprehensive', sumInsured: 750000, premium: 21500, riskScore: 55, status: 'Referred', uwDecision: 'Manual Review', createdAt: '2024-11-03' },
  { id: 3, quoteNumber: 'QT-2024-0053', partyName: 'Tata Motors Fleet Services', product: 'Motor Fleet Policy', sumInsured: 50000000, premium: 1400000, riskScore: 35, status: 'Pending', uwDecision: 'Pending', createdAt: '2024-11-05' },
  { id: 4, quoteNumber: 'QT-2024-0054', partyName: 'Amit Patel', product: 'Property Fire & Allied', sumInsured: 8000000, premium: 52000, riskScore: 42, status: 'Approved', uwDecision: 'Approved with Loading', createdAt: '2024-11-07' },
  { id: 5, quoteNumber: 'QT-2024-0055', partyName: 'Mohammed Irfan', product: 'Marine Cargo', sumInsured: 20000000, premium: 130000, riskScore: 18, status: 'Approved', uwDecision: 'Auto-Approved', createdAt: '2024-11-08' },
  { id: 6, quoteNumber: 'QT-2024-0056', partyName: 'Reliance Retail Ltd', product: 'Industrial All Risk', sumInsured: 150000000, premium: 12500000, riskScore: 30, status: 'Pending', uwDecision: 'Pending', createdAt: '2024-11-10' },
];
