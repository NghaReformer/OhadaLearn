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
	'int.inputs.nominalRate': 'Nominal annual rate',
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
	'int.bond.couponRate': 'Coupon rate',
	'int.bond.marketRate': 'Market rate at issuance',
	'int.bond.termYears': 'Term (years)',
	'int.bond.paymentFrequency': 'Coupon payment frequency',
	'int.bond.issuePrice': 'Issue price',
	'int.bond.parNote': 'Par bond — coupon equals market rate',
	'int.bond.discountNote': 'Discount bond — market rate exceeds coupon',
	'int.bond.premiumNote': 'Premium bond — market rate below coupon',

	// Formulas
	'int.formula.simple.title': 'I = P × r × t',
	'int.formula.simple.P': 'Principal',
	'int.formula.simple.r': 'Annual rate',
	'int.formula.simple.t': 'Time in years (day-count adjusted)',
	'int.formula.compound.title': 'FV = P × (1 + r/m)^(m·t)',
	'int.formula.compound.P': 'Principal',
	'int.formula.compound.r': 'Nominal annual rate',
	'int.formula.compound.m': 'Compounding periods per year',
	'int.formula.compound.t': 'Time in years',
	'int.formula.continuous.title': 'FV = P × e^(r·t)',
	'int.formula.continuous.note': 'Continuous compounding is the limit as m → ∞',
	'int.formula.eirConversion.title': 'EIR = (1 + r/m)^m − 1',
	'int.formula.eirConversion.r': 'Nominal annual rate',
	'int.formula.eirConversion.m': 'Compounding periods per year',
	'int.formula.eirConversion.continuous': 'EIR = e^r − 1 (when continuous)',

	// Chart titles / axes
	'int.chart.simple.title': 'Linear growth — interest accrues at a constant rate',
	'int.chart.simple.xAxis': 'Time',
	'int.chart.simple.yAxis': 'Balance',
	'int.chart.compound.title': 'Exponential growth — interest earns interest',
	'int.chart.compound.xAxis': 'Time',
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

	// Exercises
	'int.exercise.simple-interest-total.prompt':
		'Compute the total amount (principal + interest) for {{principal}} at {{rate}}% simple interest from {{start}} to {{end}} using {{dayCount}}.',
	'int.exercise.simple-interest-total.correct':
		'Correct. Under {{dayCount}}, the year fraction is {{years}}, so I = P·r·t = {{interest}} and total = {{total}}.',
	'int.exercise.simple-interest-total.incorrect': 'Not quite. Recompute the year fraction for {{dayCount}}.',
	'int.exercise.simple-interest-total.hint': 'Simple interest is flat: the rate is applied to principal only, not to accrued interest.',

	'int.exercise.simple-interest-days.prompt':
		'A commercial loan of {{principal}} runs for {{days}} days at {{rate}}% simple interest under {{dayCount}}. How much interest accrues?',
	'int.exercise.simple-interest-days.correct': 'Correct: {{interest}}.',
	'int.exercise.simple-interest-days.incorrect': 'Check whether you divided by 360 or 365.',
	'int.exercise.simple-interest-days.hint': 'Actual/360 produces slightly more interest than Actual/365 for the same nominal rate.',

	'int.exercise.compound-fv.prompt':
		'{{principal}} is invested at {{rate}}% compounded {{frequency}} for {{years}} years. What is the future value?',
	'int.exercise.compound-fv.correct': 'Correct: {{futureValue}}.',
	'int.exercise.compound-fv.incorrect': 'Did you use the right number of periods per year?',
	'int.exercise.compound-fv.hint': 'FV = P × (1 + r/m)^(m·t) — m is the compounding frequency (not the nominal rate).',

	'int.exercise.compound-frequency-effect.prompt':
		'Compute the future value of {{principal}} at {{rate}}% for {{years}} years compounded (a) annually, (b) monthly, (c) continuously.',
	'int.exercise.compound-frequency-effect.correct': 'All three match: annual {{fvAnnual}}, monthly {{fvMonthly}}, continuous {{fvContinuous}}.',
	'int.exercise.compound-frequency-effect.incorrect': 'Review each calculation — frequency matters.',
	'int.exercise.compound-frequency-effect.hint': 'Continuous compounding is the mathematical limit as m → ∞.',

	'int.exercise.solve-compound-rate.prompt':
		'At what annual rate compounded {{frequency}} does {{principal}} grow to {{futureValue}} in {{years}} years?',
	'int.exercise.solve-compound-rate.correct': 'Correct: {{rate}}.',
	'int.exercise.solve-compound-rate.incorrect': 'Solve the FV equation for r.',
	'int.exercise.solve-compound-rate.hint': 'Rearrange: r = m × ((FV/P)^(1/(m·t)) − 1).',

	'int.exercise.nominal-to-eir.prompt':
		'Convert a {{rate}}% nominal annual rate compounded {{frequency}} to its effective annual rate.',
	'int.exercise.nominal-to-eir.correct': 'Correct: {{eir}}.',
	'int.exercise.nominal-to-eir.incorrect': 'Apply EIR = (1 + r/m)^m − 1.',
	'int.exercise.nominal-to-eir.hint': 'A higher compounding frequency always produces a higher effective rate for the same nominal.',

	'int.exercise.eir-to-nominal.prompt':
		'What nominal annual rate compounded {{frequency}} produces an effective annual rate of {{eir}}?',
	'int.exercise.eir-to-nominal.correct': 'Correct: {{nominal}}.',
	'int.exercise.eir-to-nominal.incorrect': 'Invert the EIR formula.',
	'int.exercise.eir-to-nominal.hint': 'Nominal = m × ((1 + EIR)^(1/m) − 1).',

	'int.exercise.bond-issue-price.prompt':
		'A bond with face {{faceValue}}, coupon {{couponRate}}%, and {{termYears}}-year term is issued when the market rate is {{marketRate}}%. What is the issue price?',
	'int.exercise.bond-issue-price.correct': 'Correct: {{issuePrice}}.',
	'int.exercise.bond-issue-price.incorrect': 'PV the coupon stream and the face separately, both at the market rate.',
	'int.exercise.bond-issue-price.hint': 'When the market rate exceeds the coupon, the bond issues at a discount.',

	'int.exercise.eir-interest-period-n.prompt':
		'Using the EIR method on the bond above, what is the interest expense recognised in period {{periodIndex}}?',
	'int.exercise.eir-interest-period-n.correct': 'Correct: {{eirInterest}}.',
	'int.exercise.eir-interest-period-n.incorrect': 'Opening carrying amount × market rate per period.',
	'int.exercise.eir-interest-period-n.hint': 'Build the schedule row by row — each opening balance depends on the previous close.',

	// Scenarios
	'int.scenario.01-bank-loan-comparison.title': 'Which loan is actually cheapest?',
	'int.scenario.01-bank-loan-comparison.desc': 'Three offers, three different compounding frequencies, three different nominal rates. Rank by true cost.',
	'int.scenario.01-bank-loan-comparison.intro':
		'A small business receives three loan quotes. The nominal rates differ by less than half a percent, but the compounding frequencies range from annual to monthly. Which offer will actually cost the least?',

	'int.scenario.02-savings-doubling-time.title': 'How long to double your money?',
	'int.scenario.02-savings-doubling-time.desc': 'The Rule of 72 is an approximation. Find the real answer for different rates and frequencies.',
	'int.scenario.02-savings-doubling-time.intro':
		'You want to double a deposit of 1,000,000 XOF. Experiment with different rates and compounding frequencies — including continuous — to find the minimum term.',

	'int.scenario.03-ifrs9-transition.title': 'SYSCOHADA Revised / IFRS 9 transition',
	'int.scenario.03-ifrs9-transition.desc': 'Restate a legacy straight-line bond under amortised-cost EIR and compute the retained-earnings adjustment.',
	'int.scenario.03-ifrs9-transition.intro':
		'A 5-year bond was measured straight-line under the old standard. The transition requires restating it under SYSCOHADA Revised / IFRS 9 amortised cost. Compute the transition adjustment at the end of year 2.',

	// Catalog
	'pg.interest.title': 'Interest Lab',
	'pg.interest.desc': 'Simple, compound, and effective interest — see why a 12% nominal rate compounded monthly is actually 12.68%.',
};
