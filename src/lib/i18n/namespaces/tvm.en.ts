import type { TranslationMap } from '../types';

export const tvmEn: TranslationMap = {
	/* ── Mode picker ── */
	'tvm.mode.pv': 'Present Value',
	'tvm.mode.fv': 'Future Value',
	'tvm.mode.pmt': 'Payment',
	'tvm.mode.rate': 'Rate',
	'tvm.mode.periods': 'Periods',
	'tvm.mode.solveFor': 'Solve for',

	/* ── Global / shared inputs ── */
	'tvm.global.pv': 'Present Value (PV)',
	'tvm.global.fv': 'Future Value (FV)',
	'tvm.global.pmt': 'Payment (PMT)',
	'tvm.global.rate': 'Annual rate',
	'tvm.global.periods': 'Periods',
	'tvm.global.periodsUnit': 'Periods unit',
	'tvm.global.compounding': 'Compounding',
	'tvm.global.payFreq': 'Payment frequency',
	'tvm.global.timing': 'Payment timing',
	'tvm.global.currency': 'Currency',

	/* ── Frequency options ── */
	'tvm.freq.annual': 'Annual',
	'tvm.freq.semi': 'Semi-annual',
	'tvm.freq.quarterly': 'Quarterly',
	'tvm.freq.monthly': 'Monthly',
	'tvm.freq.daily': 'Daily',
	'tvm.freq.continuous': 'Continuous',

	/* ── Timing / unit ── */
	'tvm.timing.end': 'End of period',
	'tvm.timing.begin': 'Beginning of period',
	'tvm.timing.endShort': 'End',
	'tvm.timing.beginShort': 'Begin',
	'tvm.unit.years': 'Years',
	'tvm.unit.months': 'Months',
	'tvm.unit.year': 'year',
	'tvm.unit.month': 'month',
	'tvm.unit.yearsLower': 'years',
	'tvm.unit.monthsLower': 'months',

	/* ── Result card ── */
	'tvm.result.headline': 'Solved value',
	'tvm.result.copy': 'Copy result',
	'tvm.result.copied': 'Copied',
	'tvm.result.pending': 'Fill in the inputs to solve.',
	'tvm.result.noSolution': 'No real solution exists for these inputs.',
	'tvm.result.interpretation.pv': 'Deposit this amount today to reach the future value.',
	'tvm.result.interpretation.fv': 'This is the accumulated value at the end of the horizon.',
	'tvm.result.interpretation.pmt': 'Recurring payment that reconciles PV and FV.',
	'tvm.result.interpretation.rate': 'Annual nominal rate implied by the cash flows.',
	'tvm.result.interpretation.periods': 'Horizon needed to bridge PV and FV at this rate.',

	/* ── Sign convention ── */
	'tvm.signConvention.banner': 'Sign convention',
	'tvm.signConvention.outflow': 'Outflow',
	'tvm.signConvention.inflow': 'Inflow',
	'tvm.signConvention.neutral': 'No cash direction',
	'tvm.signConvention.explain': 'Money you pay out is negative. Money you receive is positive (HP-12C cash-flow convention).',

	/* ── Workings / Advanced ── */
	'tvm.advanced.toggle': 'Show workings',
	'tvm.advanced.hide': 'Hide workings',
	'tvm.advanced.title': 'Step-by-step',
	'tvm.workings.effectiveRate': 'Effective periodic rate',
	'tvm.workings.totalPeriods': 'Total payment periods',
	'tvm.workings.solve.pv': 'PV formula',
	'tvm.workings.solve.fv': 'FV formula',
	'tvm.workings.solve.pmt': 'PMT formula',
	'tvm.workings.solve.rate': 'Rate solver',
	'tvm.workings.solve.periods': 'Periods formula',

	/* ── Symbolic formulas (shown in Advanced mode) ── */
	'tvm.formula.pv': 'PV = −[FV · (1+r)^−N + PMT · D · (1 − (1+r)^−N) / r]',
	'tvm.formula.fv': 'FV = −[PV · (1+r)^N + PMT · D · ((1+r)^N − 1) / r]',
	'tvm.formula.pmt': 'PMT = −[PV · r · (1+r)^N + FV · r] / [(1+r)^N − 1]',
	'tvm.formula.rate': 'Newton–Raphson on PV + PMT·D·annuity + FV·(1+r)^−N = 0',
	'tvm.formula.periods': 'N = ln((PMT_eff − FV·r) / (PMT_eff + PV·r)) / ln(1+r)',

	/* ── Validation ── */
	'tvm.validation.requiredField': 'Fill in {field} to solve.',
	'tvm.validation.continuousPmtUndefined': 'Continuous compounding with a periodic payment is mathematically undefined. Set PMT to zero or pick a discrete frequency.',
	'tvm.validation.zeroRateNoPmt': 'At 0% with no payment, PV and FV must differ for a solution to exist.',
	'tvm.validation.rateTooNegative': 'A rate at or below −100% per period is not meaningful.',
	'tvm.validation.noConvergence': 'The rate solver did not converge. Try different starting inputs.',
	'tvm.validation.noSolution': 'No real solution exists for these inputs.',
	'tvm.validation.negativePeriods': 'Periods must be greater than zero.',
	'tvm.validation.invalidNumber': 'Enter a valid number.',
	'tvm.validation.sameSignPvFv': 'PV and FV have the same sign — with no payment there is no real rate.',

	/* ── Exercises ── */
	'tvm.exercise.f01.title': 'Deposit today',
	'tvm.exercise.f01.prompt': 'You need {fv} in {years} years. At {rate}% annual compounded monthly, how much must you deposit today?',
	'tvm.exercise.f01.correct': 'Correct. Discount the future value at the effective monthly rate over the full horizon.',
	'tvm.exercise.f01.incorrect': 'Not quite. Solve for PV using the lump-sum discount formula with monthly compounding.',
	'tvm.exercise.f02.title': 'Retirement nest egg',
	'tvm.exercise.f02.prompt': 'You contribute {pmt} at the end of every month for {years} years. At {rate}% annual compounded monthly, what is the future balance?',
	'tvm.exercise.f02.correct': 'Correct. Accumulate the monthly annuity at the effective monthly rate.',
	'tvm.exercise.f02.incorrect': 'Check your setup: FV of an ordinary annuity with monthly compounding equals PMT · ((1+r)^N − 1) / r.',
	'tvm.exercise.f03.title': 'Car loan payment',
	'tvm.exercise.f03.prompt': 'A {pv} loan at {rate}% nominal, compounded monthly, amortised over {years} years with end-of-month payments. What is the monthly payment?',
	'tvm.exercise.f03.correct': 'Correct. Standard loan-payment formula on the effective monthly rate.',
	'tvm.exercise.f03.incorrect': 'Use PMT = −[PV · r · (1+r)^N] / [(1+r)^N − 1] with the monthly rate and total number of months.',
	'tvm.exercise.f04.title': 'Implicit rate',
	'tvm.exercise.f04.prompt': 'You deposited {pv} and {years} years later the account holds {fv}. No other cash flows. What annual nominal rate did you earn (annual compounding)?',
	'tvm.exercise.f04.correct': 'Correct. Since there is no payment, the rate is (FV/PV)^(1/N) − 1.',
	'tvm.exercise.f04.incorrect': 'Without PMT there is a closed form: r = (|FV/PV|)^(1/N) − 1. Remember PV and FV have opposite signs.',

	/* ── Scenarios ── */
	'tvm.scenario.autoLoan.title': 'Auto loan payment',
	'tvm.scenario.autoLoan.desc': 'Five-year auto loan of 3,500,000 XOF at 9% nominal, monthly compounding and payments, end-of-month.',
	'tvm.scenario.retirement.title': 'Retirement nest egg',
	'tvm.scenario.retirement.desc': 'Monthly savings of 50,000 XAF for 25 years at 7% annual compounded monthly. End-of-month contributions.',
	'tvm.scenario.savingsGoal.title': 'Lump-sum to reach a goal',
	'tvm.scenario.savingsGoal.desc': 'How much to deposit today to have 10,000,000 XOF in four years at 6.5% annual compounded monthly.',

	/* ── Misc ── */
	'tvm.panel.inputs': 'Inputs',
	'tvm.panel.result': 'Result',
	'tvm.panel.global': 'Global',
	'tvm.panel.cashflow': 'Cash flow',
	'tvm.badge.advanced': 'Advanced',

	/* ── Groups ── */
	'tvm.group.core': 'Core',
	'tvm.group.annuity': 'Annuity & Perpetuity',
	'tvm.group.investment': 'Investment Analysis',
	'tvm.group.selector': 'Group',

	/* ── Annuity modes ── */
	'tvm.ann.mode.annuityPv': 'Annuity PV',
	'tvm.ann.mode.annuityFv': 'Annuity FV',
	'tvm.ann.mode.growingAnnuityPv': 'Growing annuity PV',
	'tvm.ann.mode.growingAnnuityFv': 'Growing annuity FV',
	'tvm.ann.mode.perpetuityPv': 'Perpetuity PV',
	'tvm.ann.mode.growingPerpetuityPv': 'Growing perpetuity PV',
	'tvm.ann.mode.ear': 'Effective annual rate',

	/* ── Annuity inputs ── */
	'tvm.ann.input.pmt': 'Payment per period (PMT)',
	'tvm.ann.input.rate': 'Annual rate (r)',
	'tvm.ann.input.growth': 'Annual growth rate (g)',
	'tvm.ann.input.periods': 'Number of periods (N)',

	/* ── Annuity workings ── */
	'tvm.ann.workings.nominal': 'Nominal rate',
	'tvm.ann.workings.compoundingPerYear': 'Compounding periods / year',
	'tvm.ann.workings.ear': 'Effective annual rate',
	'tvm.ann.workings.effectiveGrowth': 'Effective periodic growth',
	'tvm.ann.workings.solve.annuityPv': 'PV of the annuity',
	'tvm.ann.workings.solve.annuityFv': 'FV of the annuity',
	'tvm.ann.workings.solve.growingAnnuityPv': 'PV of the growing annuity',
	'tvm.ann.workings.solve.growingAnnuityFv': 'FV of the growing annuity',
	'tvm.ann.workings.solve.perpetuityPv': 'PV of the perpetuity',
	'tvm.ann.workings.solve.growingPerpetuityPv': 'PV of the growing perpetuity',

	/* ── Annuity formulas ── */
	'tvm.ann.formula.annuityPv': 'PV = PMT · (1 − (1+r)^−N) / r  · D',
	'tvm.ann.formula.annuityFv': 'FV = PMT · ((1+r)^N − 1) / r  · D',
	'tvm.ann.formula.growingAnnuityPv': 'PV = PMT · (1 − ((1+g)/(1+r))^N) / (r − g)  · D',
	'tvm.ann.formula.growingAnnuityFv': 'FV = PMT · ((1+r)^N − (1+g)^N) / (r − g)  · D',
	'tvm.ann.formula.perpetuityPv': 'PV = PMT / r',
	'tvm.ann.formula.growingPerpetuityPv': 'PV = PMT / (r − g),  r > g',
	'tvm.ann.formula.ear': 'EAR = (1 + r/m)^m − 1   (e^r − 1 for continuous)',

	/* ── Annuity validation ── */
	'tvm.ann.validation.growthGeRate': 'Growth rate must be strictly below the discount rate for a growing perpetuity to converge.',

	/* ── Annuity interpretation ── */
	'tvm.ann.interpretation.annuityPv': 'Lump-sum value today of the whole payment stream.',
	'tvm.ann.interpretation.annuityFv': 'Accumulated balance after the final payment.',
	'tvm.ann.interpretation.growingAnnuityPv': 'Value today of a stream whose payment grows at g each period.',
	'tvm.ann.interpretation.growingAnnuityFv': 'Accumulated balance at horizon end with payments growing at g.',
	'tvm.ann.interpretation.perpetuityPv': 'Value today of a constant payment that never ends.',
	'tvm.ann.interpretation.growingPerpetuityPv': 'Value today of a payment that grows at g forever; requires r > g.',
	'tvm.ann.interpretation.ear': 'Effective annual rate — the rate you would earn on a one-year deposit.',

	/* ── Investment analysis ── */
	'tvm.inv.panel.flows': 'Cash flows',
	'tvm.inv.panel.rates': 'Rates',
	'tvm.inv.panel.metrics': 'Metrics',
	'tvm.inv.flows.period': 'Period',
	'tvm.inv.flows.amount': 'Amount',
	'tvm.inv.flows.add': 'Add period',
	'tvm.inv.flows.remove': 'Remove',
	'tvm.inv.rate.discount': 'Discount rate',
	'tvm.inv.rate.finance': 'Finance rate',
	'tvm.inv.rate.reinvest': 'Reinvestment rate',
	'tvm.inv.rate.financeHint': 'Used to discount negative flows when computing MIRR.',
	'tvm.inv.rate.reinvestHint': 'Used to compound positive flows forward when computing MIRR.',
	'tvm.inv.metric.npv': 'Net Present Value',
	'tvm.inv.metric.irr': 'Internal Rate of Return',
	'tvm.inv.metric.mirr': 'Modified IRR',
	'tvm.inv.metric.payback': 'Payback period',
	'tvm.inv.metric.discountedPayback': 'Discounted payback',
	'tvm.inv.metric.pi': 'Profitability Index',
	'tvm.inv.metric.totalInflow': 'Total inflows',
	'tvm.inv.metric.totalOutflow': 'Total outflows',
	'tvm.inv.metric.noIrr': 'No IRR (flows must include both signs)',
	'tvm.inv.metric.noMirr': 'No MIRR',
	'tvm.inv.metric.noPayback': 'Never pays back',
	'tvm.inv.metric.piDecision': 'Accept when PI ≥ 1.',
	'tvm.inv.metric.npvDecision': 'Accept when NPV > 0.',
	'tvm.inv.metric.irrDecision': 'Accept when IRR exceeds the hurdle rate.',
	'tvm.inv.validation.minFlows': 'At least two cash flows are required.',
	'tvm.inv.validation.noSignChange': 'Cash flows are all the same sign — IRR and payback are undefined.',
	'tvm.inv.preset.simple': 'Simple project (−100 000, 5 × 30 000)',
	'tvm.inv.preset.unequal': 'Unequal inflows',
	'tvm.inv.preset.lease': 'Operating lease',
	'tvm.inv.workings.periods': 'Periods span',
	'tvm.inv.workings.pvNeg': 'PV of outflows (at finance rate)',
	'tvm.inv.workings.fvPos': 'FV of inflows (at reinvest rate)'
};
