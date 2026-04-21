import type { TranslationMap } from '../types';

export const interestEn: TranslationMap = {
	// Tabs / shell
	'int.tab.playground': 'Interest Lab',
	'int.tab.learn': 'Learn',
	'int.tab.scenarios': 'Scenarios',

	// Modes
	'int.mode.simple.label': 'Simple Interest',
	'int.mode.simple.tabShort': 'Simple',
	'int.mode.compound.label': 'Compound Interest',
	'int.mode.compound.tabShort': 'Compound',
	'int.mode.effective.label': 'Effective vs Nominal',
	'int.mode.effective.tabShort': 'Effective',

	// Inputs
	'int.inputs.title': 'Parameters',
	'int.inputs.principal': 'Principal',
	'int.inputs.nominalRate': 'Nominal annual rate (%)',
	'int.inputs.startDate': 'Start date',
	'int.inputs.endDate': 'End date',
	'int.inputs.frequency': 'Compounding frequency',
	'int.inputs.dayCount': 'Day-count convention',
	'int.inputs.continuousToggle': 'Also show continuous compounding',

	// Frequency option labels
	'int.freq.annual': 'Annual',
	'int.freq.semi': 'Semi-annual',
	'int.freq.quarterly': 'Quarterly',
	'int.freq.monthly': 'Monthly',
	'int.freq.daily': 'Daily',
	'int.freq.continuous': 'Continuous',

	// Day-count option labels
	'int.dayCount.30_360': '30/360',
	'int.dayCount.actual_365': 'Actual/365',
	'int.dayCount.actual_360': 'Actual/360',
	'int.dayCount.actual_actual': 'Actual/Actual',

	// Bond inputs (Mode 3)
	'int.bond.title': 'Bond Parameters',
	'int.bond.faceValue': 'Face value',
	'int.bond.couponRate': 'Coupon rate (%)',
	'int.bond.couponRate.help': 'The rate the issuer promises — fixed for the life of the bond.',
	'int.bond.marketRate': 'Market rate at issuance (%)',
	'int.bond.marketRate.help': 'The rate investors demand. Used as the discount rate to compute the issue price.',
	'int.bond.termYears': 'Term (years)',
	'int.bond.paymentFrequency': 'Coupon payment frequency',
	'int.bond.issuePrice': 'Issue price',
	'int.bond.parNote': 'Par bond — coupon equals market rate; issues at face value.',
	'int.bond.discountNote': 'Discount bond — market rate exceeds coupon; issues below face value.',
	'int.bond.premiumNote': 'Premium bond — market rate below coupon; issues above face value.',

	// Formulas
	'int.formula.label': 'Formula',
	'int.formula.simple.caption': 'Interest accrues at a flat rate on the original principal only.',
	'int.formula.compound.caption': 'Interest earns interest. Higher frequency m \u2192 higher future value.',
	'int.formula.continuous.caption': 'The mathematical limit as m \u2192 \u221E. Euler\u2019s constant e \u2248 2.71828.',
	'int.formula.eirConversion.caption': 'The effective annual rate accounts for compounding inside the year.',

	// Chart titles / axes
	'int.chart.simple.title': 'Linear growth — interest accrues at a constant rate',
	'int.chart.simple.xAxis': 'Year',
	'int.chart.simple.yAxis': 'Balance',
	'int.chart.compound.title': 'Exponential growth — interest earns interest',
	'int.chart.compound.xAxis': 'Year',
	'int.chart.compound.yAxis': 'Balance',
	'int.chart.compound.legendSimple': 'Simple baseline',
	'int.chart.compound.legendCompound': 'Compound',
	'int.chart.compound.legendContinuous': 'Continuous',
	'int.chart.compound.stackInterestOnPrincipal': 'Interest on principal',
	'int.chart.compound.stackInterestOnInterest': 'Interest on interest',
	'int.chart.divergence.title': 'Carrying amount: Straight-line vs EIR',
	'int.chart.divergence.xAxis': 'Period',
	'int.chart.divergence.yAxis': 'Carrying amount',
	'int.chart.divergence.legendSl': 'Straight-line',
	'int.chart.divergence.legendEir': 'EIR (IFRS 9 / SYSCOHADA Revised)',
	'int.chart.divergence.legendGap': 'Gap',

	// Rate summary
	'int.rate.nominal.label': 'Nominal',
	'int.rate.nominal.tooltip': 'The quoted annual rate, before adjusting for compounding.',
	'int.rate.effective.label': 'Effective annual rate (EIR)',
	'int.rate.effective.tooltip': 'The true annual yield once compounding is accounted for.',
	'int.rate.continuous.label': 'Continuous equivalent',
	'int.rate.continuous.tooltip': 'The continuously-compounded rate that produces the same EIR.',

	// Computed summary card
	'int.summary.label': 'Results',
	'int.summary.principal': 'Principal',
	'int.summary.interest': 'Interest',
	'int.summary.total': 'Total',
	'int.summary.effectiveRate': 'EIR',

	// Comparison drawer
	'int.drawer.title': 'Comparison',
	'int.drawer.empty': 'Pin a result to start comparing across modes.',
	'int.drawer.pin': 'Pin snapshot',
	'int.drawer.compare': 'Compare',
	'int.drawer.clear': 'Clear all',
	'int.drawer.labelFor': 'Label',
	'int.drawer.remove': 'Remove',

	// KPIs
	'int.kpi.totalAmount': 'Total (principal + interest)',
	'int.kpi.futureValue': 'Future value',
	'int.kpi.effectiveAnnualRate': 'Effective annual rate',
	'int.kpi.continuousEquivalent': 'Continuous equivalent',
	'int.kpi.principalRatio': 'Growth multiple',
	'int.kpi.periodCount': 'Periods',
	'int.kpi.issuePrice': 'Issue price',
	'int.kpi.totalInterestExpense': 'Total interest expense',

	// Amortisation schedule headers
	'int.schedule.period': 'Period',
	'int.schedule.periodEnd': 'Date',
	'int.schedule.opening': 'Opening carrying amount',
	'int.schedule.cashInterest': 'Cash interest',
	'int.schedule.interestExpense': 'Interest expense',
	'int.schedule.discountAmortisation': 'Discount/premium amortisation',
	'int.schedule.closing': 'Closing carrying amount',
	'int.schedule.methodSl': 'Straight-line',
	'int.schedule.methodEir': 'EIR',

	// Simple / Compound schedule table columns
	'int.schedule.simpleTitle': 'Period-by-period interest',
	'int.schedule.simpleSub': 'Interest accrues linearly on the original principal.',
	'int.schedule.compoundTitle': 'Period-by-period balance',
	'int.schedule.compoundSub': 'Closing balance = opening + interest; interest splits into on-principal and on-interest.',
	'int.schedule.yearFraction': 'Year fraction',
	'int.schedule.interestThisPeriod': 'Interest (period)',
	'int.schedule.cumulativeInterest': 'Cumulative interest',
	'int.schedule.runningTotal': 'Running total',
	'int.schedule.openingBalance': 'Opening balance',
	'int.schedule.closingBalance': 'Closing balance',
	'int.schedule.interestOnPrincipal': 'On principal',
	'int.schedule.interestOnInterest': 'On interest',
	'int.schedule.interestTotal': 'Total interest',

	// What-if panel
	'int.whatif.title': 'What-if analysis',
	'int.whatif.simpleHint': 'Adjust the sliders to see how each variable changes total interest.',
	'int.whatif.compoundHint': 'Adjust the sliders to see how frequency, rate, and term interact.',
	'int.whatif.effectiveHint': 'Adjust bond parameters to see issue price and interest expense respond.',
	'int.whatif.impactTitle': 'Impact vs base',
	'int.whatif.reset': 'Reset',
	'int.whatif.principal': 'Principal',
	'int.whatif.rate': 'Rate',
	'int.whatif.term': 'Term',
	'int.whatif.faceValue': 'Face value',
	'int.whatif.couponRate': 'Coupon rate',
	'int.whatif.marketRate': 'Market rate',

	// Goal-seek panel
	'int.goalseek.title': 'Goal seek',
	'int.goalseek.solveFor': 'Solve for',
	'int.goalseek.targetLabel': 'Target',
	'int.goalseek.solve': 'Solve',
	'int.goalseek.apply': 'Apply to inputs',
	'int.goalseek.approximate': 'Converged to an approximate solution (within tolerance).',
	'int.goalseek.noSolution': 'No solution found in the search range.',
	'int.goalseek.invalid': 'Enter a numeric target value to solve.',
	'int.goalseek.varRate': 'Nominal rate',
	'int.goalseek.varYears': 'Term in years',
	'int.goalseek.varPrincipal': 'Principal',
	'int.goalseek.varMarketRate': 'Market rate',
	'int.goalseek.varCouponRate': 'Coupon rate',
	'int.goalseek.varFaceValue': 'Face value',

	// Exercises (parameter-free prompts — learner reads current values from
	// the Parameters panel. The shared ExercisePanel does not substitute
	// template variables; this matches the bank-reconciliation convention.)
	'int.exercise.simple-interest-total.prompt':
		'Compute the total amount (principal + interest) at simple interest for the current principal, rate, and term.',
	'int.exercise.simple-interest-total.correct':
		'Correct \u2014 you applied I = P\u00B7r\u00B7t with the active day-count convention.',
	'int.exercise.simple-interest-total.incorrect':
		'Not quite. Recompute the year fraction for the selected day-count.',
	'int.exercise.simple-interest-total.hint':
		'Simple interest is flat: the rate applies to principal only, not to accrued interest.',

	'int.exercise.simple-interest-days.prompt':
		'Compute the simple interest that accrues over the given number of days under the active day-count convention.',
	'int.exercise.simple-interest-days.correct': 'Correct \u2014 your day-count adjustment is right.',
	'int.exercise.simple-interest-days.incorrect': 'Check whether you divided by 360 or 365.',
	'int.exercise.simple-interest-days.hint':
		'Actual/360 produces slightly more interest than Actual/365 for the same nominal rate.',

	'int.exercise.compound-fv.prompt':
		'Compute the future value of the principal at the nominal rate, compounded at the selected frequency, for the given term.',
	'int.exercise.compound-fv.correct': 'Correct \u2014 your future value matches the engine.',
	'int.exercise.compound-fv.incorrect': 'Did you use the right number of periods per year?',
	'int.exercise.compound-fv.hint':
		'FV = P \u00D7 (1 + r/m)^(m\u00B7t) \u2014 m is the compounding frequency, not the nominal rate.',

	'int.exercise.compound-frequency-effect.prompt':
		'For the current principal, rate, and term, compare the future value under annual, monthly, and continuous compounding.',
	'int.exercise.compound-frequency-effect.correct':
		'Correct \u2014 you captured how frequency changes the yield.',
	'int.exercise.compound-frequency-effect.incorrect':
		'Review each calculation \u2014 frequency matters more than it appears.',
	'int.exercise.compound-frequency-effect.hint':
		'Continuous compounding is the mathematical limit as m \u2192 \u221E.',

	'int.exercise.solve-compound-rate.prompt':
		'Given the principal, future value, term, and frequency, solve for the nominal annual rate that reconciles them.',
	'int.exercise.solve-compound-rate.correct': 'Correct \u2014 you inverted the FV equation for r.',
	'int.exercise.solve-compound-rate.incorrect':
		'Isolate r algebraically before plugging in the numbers.',
	'int.exercise.solve-compound-rate.hint':
		'Rearrange: r = m \u00D7 ((FV/P)^(1/(m\u00B7t)) \u2212 1).',

	'int.exercise.nominal-to-eir.prompt':
		'Convert the current nominal annual rate compounded monthly into its effective annual rate (EIR).',
	'int.exercise.nominal-to-eir.correct': 'Correct \u2014 your EIR matches (1 + r/m)^m \u2212 1.',
	'int.exercise.nominal-to-eir.incorrect': 'Apply EIR = (1 + r/m)^m \u2212 1 with m = 12.',
	'int.exercise.nominal-to-eir.hint':
		'A higher compounding frequency always produces a higher effective rate for the same nominal.',

	'int.exercise.eir-to-nominal.prompt':
		'Given an effective annual rate, solve for the nominal annual rate compounded monthly that produces it.',
	'int.exercise.eir-to-nominal.correct': 'Correct \u2014 you inverted the EIR formula.',
	'int.exercise.eir-to-nominal.incorrect':
		'Invert the EIR formula: r = m \u00D7 ((1 + EIR)^(1/m) \u2212 1).',
	'int.exercise.eir-to-nominal.hint': 'Take the m-th root first, subtract 1, then multiply by m.',

	'int.exercise.bond-issue-price.prompt':
		'Using the current bond parameters (face, coupon, market rate, term), compute the issue price.',
	'int.exercise.bond-issue-price.correct':
		'Correct \u2014 your issue price matches the PV of coupons + PV of face at market rate.',
	'int.exercise.bond-issue-price.incorrect':
		'PV the coupon stream and the face separately, both at the market rate.',
	'int.exercise.bond-issue-price.hint':
		'When the market rate exceeds the coupon, the bond issues at a discount.',

	'int.exercise.eir-interest-period-n.prompt':
		'Using the EIR method on the current bond, compute the interest expense recognised in the target period.',
	'int.exercise.eir-interest-period-n.correct':
		'Correct \u2014 opening carrying amount \u00D7 market rate per period.',
	'int.exercise.eir-interest-period-n.incorrect':
		'Build the schedule row by row \u2014 each opening balance depends on the previous close.',
	'int.exercise.eir-interest-period-n.hint':
		'Interest expense (period n) = opening carrying amount \u00D7 market rate / m.',

	// Scenarios
	'int.scenario.frameBadge': 'What to look for',

	'int.scenario.01-bank-loan-comparison.title': 'Which loan is actually cheapest?',
	'int.scenario.01-bank-loan-comparison.desc':
		'Three offers, three different compounding frequencies, three different nominal rates. Rank by true cost.',
	'int.scenario.01-bank-loan-comparison.intro':
		'A small business receives three loan quotes. The nominal rates differ by less than half a percent, but the compounding frequencies range from annual to monthly. Which offer will actually cost the least?',
	'int.scenario.01-bank-loan-comparison.framing':
		'Compare the three pinned offers by EIR, not by the quoted nominal rate. The offer with the lowest EIR is the cheapest \u2014 even if its nominal rate is not the lowest.',

	'int.scenario.02-savings-doubling-time.title': 'How long to double your money?',
	'int.scenario.02-savings-doubling-time.desc':
		'The Rule of 72 is an approximation. Find the real answer for different rates and frequencies.',
	'int.scenario.02-savings-doubling-time.intro':
		'You want to double a deposit of 1,000,000 XOF. Experiment with different rates and compounding frequencies \u2014 including continuous \u2014 to find the minimum term.',
	'int.scenario.02-savings-doubling-time.framing':
		'Try 6% annual, then 6% monthly, then 6% continuous. Notice how much the doubling time shrinks as frequency increases \u2014 and how thin the gap becomes between daily and continuous.',

	'int.scenario.03-ifrs9-transition.title': 'SYSCOHADA Revised / IFRS 9 transition',
	'int.scenario.03-ifrs9-transition.desc':
		'Restate a legacy straight-line bond under amortised-cost EIR and compute the retained-earnings adjustment.',
	'int.scenario.03-ifrs9-transition.intro':
		'A 5-year bond was measured straight-line under the old standard. The transition requires restating it under SYSCOHADA Revised / IFRS 9 amortised cost. Compute the transition adjustment at the end of year 2.',
	'int.scenario.03-ifrs9-transition.framing':
		'Look at the divergence ribbon: the gap at period 2 IS the transition adjustment. Under IFRS 9 / SYSCOHADA Revised, the EIR carrying amount is lower than the straight-line carrying amount in the early years of a discount bond \u2014 a reduction to retained earnings on transition.',

	// Catalog
	'pg.interest.title': 'Interest Lab',
	'pg.interest.desc':
		'Simple, compound, and effective interest \u2014 see why a 12% nominal rate compounded monthly is actually 12.68%.',
};
