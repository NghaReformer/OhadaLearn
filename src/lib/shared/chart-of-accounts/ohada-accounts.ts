import type { AccountBase, AccountType, NormalBalance, SubType, CashFlowClass } from './types';

function a(
	key: string,
	code: string,
	nameFr: string,
	nameEn: string,
	type: AccountType,
	normalBalance: NormalBalance,
	subType: SubType,
	fsLine: string,
	cfClass: CashFlowClass,
	parentCode: string
): [string, AccountBase] {
	return [key, { key, code, nameFr, nameEn, type, normalBalance, subType, fsLine, cfClass, parentCode }];
}

export const ohadaAccounts: Map<string, AccountBase> = new Map([
	/* ── CLASS 1: Equity & Long-Term Liabilities ── */
	a('shareCapital', '101', 'Capital social', 'Share Capital', 'equity', 'credit', 'noncurrent', 'equity', null, '10'),
	a('legalReserve', '111', 'Réserve légale', 'Legal Reserve', 'equity', 'credit', 'noncurrent', 'equity', null, '11'),
	a('statutoryReserve', '112', 'Réserves statutaires', 'Statutory Reserve', 'equity', 'credit', 'noncurrent', 'equity', null, '11'),
	a('revaluationSurplus', '106', 'Écarts de réévaluation', 'Revaluation Surplus', 'equity', 'credit', 'noncurrent', 'equity', null, '10'),
	a('retainedEarnings', '12', 'Report à nouveau', 'Retained Earnings', 'equity', 'credit', 'noncurrent', 'equity', null, '1'),
	a('currentYearResult', '13', 'Résultat net de l\'exercice', 'Current Year Result', 'equity', 'credit', 'noncurrent', 'equity', null, '1'),
	a('incomeSummary', '139', 'Résultat en instance d\'affectation', 'Income Summary', 'equity', 'credit', 'noncurrent', 'equity', null, '13'),
	a('bankLoan', '162', 'Emprunts auprès des établissements de crédit', 'Bank Loan', 'liability', 'credit', 'noncurrent', 'ltDebt', 'financing', '16'),
	a('otherLtDebt', '165', 'Dépôts et cautionnements reçus', 'Other LT Debt', 'liability', 'credit', 'noncurrent', 'ltDebt', 'financing', '16'),
	a('leaseLiability', '17', 'Dettes de location-financement', 'Lease Liability', 'liability', 'credit', 'noncurrent', 'ltDebt', 'financing', '1'),
	a('provisionForRisks', '19', 'Provisions pour risques', 'Provision for Risks', 'liability', 'credit', 'noncurrent', 'provisions', null, '1'),
	a('provisionForCharges', '195', 'Provisions pour charges', 'Provision for Charges', 'liability', 'credit', 'noncurrent', 'provisions', null, '19'),

	/* ── CLASS 2: Fixed Assets ── */
	a('intangibleAssets', '21', 'Immobilisations incorporelles', 'Intangible Assets', 'asset', 'debit', 'noncurrent', 'intangibles', 'investing', '2'),
	a('land', '22', 'Terrains', 'Land', 'asset', 'debit', 'noncurrent', 'ppe', 'investing', '2'),
	a('buildings', '231', 'Bâtiments', 'Buildings', 'asset', 'debit', 'noncurrent', 'ppe', 'investing', '23'),
	a('constructionInProgress', '23', 'Bâtiments en cours', 'Construction in Progress', 'asset', 'debit', 'noncurrent', 'ppe', 'investing', '2'),
	a('equipment', '241', 'Matériel et outillage', 'Equipment', 'asset', 'debit', 'noncurrent', 'ppe', 'investing', '24'),
	a('furniture', '244', 'Matériel et mobilier de bureau', 'Office Furniture', 'asset', 'debit', 'noncurrent', 'ppe', 'investing', '24'),
	a('itEquipment', '2441', 'Matériel informatique', 'IT Equipment', 'asset', 'debit', 'noncurrent', 'ppe', 'investing', '244'),
	a('vehicles', '245', 'Matériel de transport', 'Vehicles', 'asset', 'debit', 'noncurrent', 'ppe', 'investing', '24'),
	a('rouAsset', '232', 'Droit d\'utilisation - location', 'Right-of-Use Asset', 'asset', 'debit', 'noncurrent', 'ppe', 'investing', '23'),
	a('accDeprBuildings', '2831', 'Amort. bâtiments', 'Accum. Depr. Buildings', 'asset', 'credit', 'noncurrent', 'ppe', null, '28'),
	a('accDeprEquipment', '2841', 'Amort. matériel', 'Accum. Depr. Equipment', 'asset', 'credit', 'noncurrent', 'ppe', null, '28'),
	a('accDeprFurniture', '2844', 'Amort. mobilier', 'Accum. Depr. Furniture', 'asset', 'credit', 'noncurrent', 'ppe', null, '28'),
	a('accDeprVehicles', '2845', 'Amort. matériel transport', 'Accum. Depr. Vehicles', 'asset', 'credit', 'noncurrent', 'ppe', null, '28'),

	/* ── CLASS 3: Inventory ── */
	a('rawMaterials', '31', 'Matières premières', 'Raw Materials', 'asset', 'debit', 'current', 'inventory', 'operating', '3'),
	a('workInProgress', '33', 'Encours de production', 'Work in Progress', 'asset', 'debit', 'current', 'inventory', 'operating', '3'),
	a('finishedGoods', '35', 'Produits finis', 'Finished Goods', 'asset', 'debit', 'current', 'inventory', 'operating', '3'),
	a('merchandise', '37', 'Marchandises', 'Merchandise', 'asset', 'debit', 'current', 'inventory', 'operating', '3'),
	a('inventoryProvision', '39', 'Dépréciations des stocks', 'Inventory Provision', 'asset', 'credit', 'current', 'inventory', null, '3'),

	/* ── CLASS 4: Third-Party Accounts ── */
	a('accountsPayable', '401', 'Fournisseurs', 'Accounts Payable', 'liability', 'credit', 'current', 'tradePayables', 'operating', '40'),
	a('accruedExpenses', '408', 'Fournisseurs, factures non parvenues', 'Accrued Expenses', 'liability', 'credit', 'current', 'tradePayables', 'operating', '40'),
	a('advancesToSuppliers', '409', 'Fournisseurs débiteurs', 'Advances to Suppliers', 'asset', 'debit', 'current', 'otherReceivables', 'operating', '40'),
	a('accountsReceivable', '411', 'Clients', 'Accounts Receivable', 'asset', 'debit', 'current', 'tradeReceivables', 'operating', '41'),
	a('allowanceDoubtful', '491', 'Dépréciations des comptes clients', 'Allowance for Doubtful Accounts', 'asset', 'credit', 'current', 'tradeReceivables', null, '49'),
	a('accruedRevenue', '418', 'Clients, produits non encore facturés', 'Accrued Revenue', 'asset', 'debit', 'current', 'tradeReceivables', 'operating', '41'),
	a('advancesFromCustomers', '419', 'Clients créditeurs', 'Advances from Customers', 'liability', 'credit', 'current', 'otherPayables', 'operating', '41'),
	a('employeesPayable', '421', 'Personnel - rémunérations dues', 'Employees Payable', 'liability', 'credit', 'current', 'otherPayables', 'operating', '42'),
	a('socialChargesPayable', '43', 'Organismes sociaux', 'Social Charges Payable', 'liability', 'credit', 'current', 'otherPayables', 'operating', '4'),
	a('deferredTaxAsset', '4496', 'Impôts différés actifs', 'Deferred Tax Asset', 'asset', 'debit', 'noncurrent', 'otherReceivables', null, '44'),
	a('deferredTaxLiability', '4497', 'Impôts différés passifs', 'Deferred Tax Liability', 'liability', 'credit', 'noncurrent', 'ltDebt', null, '44'),
	a('incomeTaxPayable', '441', 'État, impôt sur les bénéfices', 'Income Tax Payable', 'liability', 'credit', 'current', 'taxPayables', 'operating', '44'),
	a('vatCollected', '4431', 'TVA facturée sur ventes', 'VAT Collected', 'liability', 'credit', 'current', 'taxPayables', 'operating', '44'),
	a('vatPayable', '4441', 'État, TVA due', 'VAT Payable', 'liability', 'credit', 'current', 'taxPayables', 'operating', '44'),
	a('vatDeductible', '4451', 'TVA récupérable sur achats', 'VAT Deductible', 'asset', 'debit', 'current', 'otherReceivables', 'operating', '44'),
	a('otherReceivables', '46', 'Débiteurs divers', 'Other Receivables', 'asset', 'debit', 'current', 'otherReceivables', 'operating', '4'),
	a('otherPayables', '47', 'Créditeurs divers', 'Other Payables', 'liability', 'credit', 'current', 'otherPayables', 'operating', '4'),
	a('dividendsPayable', '465', 'Associés, dividendes à payer', 'Dividends Payable', 'liability', 'credit', 'current', 'otherPayables', 'financing', '46'),
	a('prepaidExpenses', '476', 'Charges constatées d\'avance', 'Prepaid Expenses', 'asset', 'debit', 'current', 'otherReceivables', 'operating', '47'),
	a('unearnedRevenue', '477', 'Produits constatés d\'avance', 'Unearned Revenue', 'liability', 'credit', 'current', 'otherPayables', 'operating', '47'),

	/* ── CLASS 5: Cash ── */
	a('bank', '521', 'Banque', 'Bank', 'asset', 'debit', 'current', 'cashEquiv', 'operating', '52'),
	a('bankOverdraft', '519', 'Concours bancaires courants', 'Bank Overdraft', 'liability', 'credit', 'current', 'cashEquiv', 'financing', '51'),
	a('pettyCash', '57', 'Caisse', 'Petty Cash', 'asset', 'debit', 'current', 'cashEquiv', 'operating', '5'),
	a('shortTermInvestments', '50', 'Titres de placement', 'Short-Term Investments', 'asset', 'debit', 'current', 'cashEquiv', 'investing', '5'),

	/* ── CLASS 6: Expenses ── */
	a('purchasesMerchandise', '601', 'Achats de marchandises', 'Purchases - Merchandise', 'expense', 'debit', 'operating', 'cogs', 'operating', '60'),
	a('purchasesRawMaterials', '602', 'Achats de matières premières', 'Purchases - Raw Materials', 'expense', 'debit', 'operating', 'cogs', 'operating', '60'),
	a('costOfGoodsSold', '603', 'Variations des stocks de biens achetés', 'COGS - Stock Variation', 'expense', 'debit', 'operating', 'cogs', 'operating', '60'),
	a('inventoryVariation', '6031', 'Variations des stocks de marchandises', 'Inventory Variation', 'expense', 'debit', 'operating', 'cogs', 'operating', '603'),
	a('freightIn', '611', 'Transport sur achats', 'Freight In', 'expense', 'debit', 'operating', 'otherOpex', 'operating', '61'),
	a('externalServices', '62', 'Services extérieurs', 'External Services', 'expense', 'debit', 'operating', 'otherOpex', 'operating', '6'),
	a('rentExpense', '622', 'Locations et charges locatives', 'Rent Expense', 'expense', 'debit', 'operating', 'otherOpex', 'operating', '62'),
	a('maintenanceExpense', '624', 'Entretien, réparations et maintenance', 'Maintenance Expense', 'expense', 'debit', 'operating', 'otherOpex', 'operating', '62'),
	a('insuranceExpense', '625', 'Primes d\'assurance', 'Insurance Expense', 'expense', 'debit', 'operating', 'otherOpex', 'operating', '62'),
	a('telecomExpense', '626', 'Frais de télécommunications', 'Telecom Expense', 'expense', 'debit', 'operating', 'otherOpex', 'operating', '62'),
	a('taxesAndDuties', '64', 'Impôts et taxes', 'Taxes & Duties', 'expense', 'debit', 'operating', 'otherOpex', 'operating', '6'),
	a('salaryExpense', '661', 'Rémunérations directes versées au personnel', 'Salary Expense', 'expense', 'debit', 'operating', 'staffCosts', 'operating', '66'),
	a('socialChargesExpense', '664', 'Charges sociales', 'Social Charges Expense', 'expense', 'debit', 'operating', 'staffCosts', 'operating', '66'),
	a('badDebtExpense', '6594', 'Charges provisionnées d\'exploitation', 'Bad Debt Expense', 'expense', 'debit', 'operating', 'otherOpex', 'operating', '65'),
	a('depreciationExpense', '681', 'Dotations aux amortissements', 'Depreciation Expense', 'expense', 'debit', 'operating', 'depreciation', null, '68'),
	a('provisionExpense', '691', 'Dotations aux provisions', 'Provision Expense', 'expense', 'debit', 'operating', 'provisions', null, '69'),
	a('interestExpense', '671', 'Intérêts des emprunts', 'Interest Expense', 'expense', 'debit', 'nonoperating', 'financeCosts', 'operating', '67'),
	a('exchangeLoss', '676', 'Pertes de change', 'Exchange Loss', 'expense', 'debit', 'nonoperating', 'financeCosts', 'operating', '67'),
	a('exceptionalExpense', '831', 'Charges HAO', 'Exceptional Expense (HAO)', 'expense', 'debit', 'nonoperating', 'exceptional', null, '83'),
	a('disposalLoss', '812', 'Valeur comptable des cessions', 'Loss on Disposal', 'expense', 'debit', 'nonoperating', 'exceptional', 'investing', '81'),
	a('incomeTaxExpense', '891', 'Impôt sur le bénéfice', 'Income Tax Expense', 'expense', 'debit', 'nonoperating', 'incomeTax', 'operating', '89'),

	/* ── CLASS 7: Revenue ── */
	a('salesMerchandise', '701', 'Ventes de marchandises', 'Sales - Merchandise', 'revenue', 'credit', 'operating', 'revenue', 'operating', '70'),
	a('salesFinishedGoods', '702', 'Ventes de produits finis', 'Sales - Finished Goods', 'revenue', 'credit', 'operating', 'revenue', 'operating', '70'),
	a('serviceRevenue', '706', 'Services vendus', 'Service Revenue', 'revenue', 'credit', 'operating', 'revenue', 'operating', '70'),
	a('inventoryProductionVar', '73', 'Variations de stocks de produits', 'Inventory Production Variation', 'revenue', 'credit', 'operating', 'prodStockVar', 'operating', '7'),
	a('otherOperatingRevenue', '71', 'Autres produits d\'exploitation', 'Other Operating Revenue', 'revenue', 'credit', 'operating', 'otherOpRev', 'operating', '7'),
	a('operatingSubsidies', '74', 'Subventions d\'exploitation', 'Operating Subsidies', 'revenue', 'credit', 'operating', 'subsidies', 'operating', '7'),
	a('interestIncome', '771', 'Intérêts reçus', 'Interest Income', 'revenue', 'credit', 'nonoperating', 'financeIncome', 'operating', '77'),
	a('exchangeGain', '776', 'Gains de change', 'Exchange Gain', 'revenue', 'credit', 'nonoperating', 'financeIncome', 'operating', '77'),
	a('exceptionalIncome', '841', 'Produits HAO', 'Exceptional Income (HAO)', 'revenue', 'credit', 'nonoperating', 'exceptional', null, '84'),
	a('disposalGain', '822', 'Produits de cessions d\'immobilisations', 'Gain on Disposal', 'revenue', 'credit', 'nonoperating', 'exceptional', 'investing', '82'),
	a('reversalOfProvisions', '791', 'Reprises de provisions', 'Reversal of Provisions', 'revenue', 'credit', 'operating', 'otherOpRev', null, '79'),
]);
