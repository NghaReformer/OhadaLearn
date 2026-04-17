import type { TranslationMap } from '../types';

export const cvpEn: TranslationMap = {
	/* Playground catalog */
	'pg.cvp.title': 'Cost-Volume-Profit',
	'pg.cvp.desc': 'Analyze break-even, target profit, operating leverage, and multi-product mix.',

	/* Nav */
	'cvp.nav.simple': 'Simple',
	'cvp.nav.advanced': 'Advanced',

	/* Input labels */
	'cvp.input.price': 'Selling Price',
	'cvp.input.priceHint': 'Price per unit sold',
	'cvp.input.vc': 'Variable Cost',
	'cvp.input.vcHint': 'Variable cost per unit (production + selling)',
	'cvp.input.fc': 'Fixed Costs',
	'cvp.input.fcHint': 'Total fixed costs for the period',
	'cvp.input.volume': 'Volume',
	'cvp.input.volumeHint': 'Number of units sold',
	'cvp.input.targetProfit': 'Target Profit',
	'cvp.input.targetProfitHint': 'Pre-tax operating income target',
	'cvp.input.taxRate': 'Tax Rate',
	'cvp.input.taxRateHint': 'Income tax rate (%)',
	'cvp.input.pretax': 'Pre-tax',

	/* Sections */
	'cvp.section.revenue': 'Revenue & Activity',
	'cvp.section.costStructure': 'Cost Structure',
	'cvp.section.targets': 'Targets',
	'cvp.section.products': 'Products',
	'cvp.section.advanced': 'Advanced',

	/* Products */
	'cvp.product.single': 'Single Product',
	'cvp.product.multi': 'Multi-Product',
	'cvp.product.add': 'Add Product',
	'cvp.product.name': 'Name',
	'cvp.product.price': 'Price',
	'cvp.product.vc': 'VC',
	'cvp.product.mix': 'Mix %',
	'cvp.product.remove': 'Remove',
	'cvp.product.mixTotal': 'Mix Total',
	'cvp.product.mixError': 'Mix must sum to 100%',
	'cvp.product.weightedCM': 'Weighted Avg CM',
	'cvp.product.weightedCMR': 'Weighted CM Ratio',
	'cvp.product.bepTotal': 'Total Break-Even',
	'cvp.product.perProduct': 'Per-Product Breakdown',
	'cvp.product.allocation': 'BEP Allocation',

	/* Chart */
	'cvp.chart.classic': 'Classic',
	'cvp.chart.pv': 'Profit-Volume',
	'cvp.chart.stack': 'Stacked',
	'cvp.chart.revenue': 'Revenue',
	'cvp.chart.totalCost': 'Total Cost',
	'cvp.chart.fixedCost': 'Fixed Cost',
	'cvp.chart.variableCost': 'Variable',
	'cvp.chart.loss': 'Loss',
	'cvp.chart.profit': 'Profit',
	'cvp.chart.unitsSold': 'Units Sold',
	'cvp.chart.amount': 'Amount',
	'cvp.chart.noBEP': 'No break-even — contribution margin is non-positive.',

	/* Overlays */
	'cvp.overlay.bep': 'Break-Even',
	'cvp.overlay.target': 'Target Profit',
	'cvp.overlay.mos': 'Margin of Safety',
	'cvp.overlay.dol': 'Op. Leverage',

	/* Table */
	'cvp.table.results': 'Results',
	'cvp.table.sensitivity': 'Sensitivity',
	'cvp.table.goalseekHint': 'Right-click any result to goal-seek',

	/* Results */
	'cvp.res.metric': 'Metric',
	'cvp.res.perUnit': 'Per Unit',
	'cvp.res.total': 'Total',
	'cvp.res.ratio': 'Ratio',
	'cvp.res.revenue': 'Revenue',
	'cvp.res.vc': 'Variable Costs',
	'cvp.res.cm': 'Contribution Margin',
	'cvp.res.fc': 'Fixed Costs',
	'cvp.res.oi': 'Operating Income',
	'cvp.res.bep': 'Break-Even (units)',
	'cvp.res.bepSales': 'Break-Even (sales)',
	'cvp.res.targetVol': 'Target Volume',
	'cvp.res.afterTax': 'After-Tax Target Volume',
	'cvp.res.mos': 'Margin of Safety',
	'cvp.res.mosPct': 'Margin of Safety %',
	'cvp.res.dol': 'Operating Leverage',
	'cvp.res.tableTitle': 'Contribution Margin Income Statement',
	'cvp.res.targetVolPretax': 'Target Vol. (as Operating Income)',
	'cvp.res.targetVolAftertax': 'Target Vol. (as Net Income)',
	'cvp.res.bepNote': 'Round up to next whole unit in practice',

	/* Warnings */
	'cvp.warn.negativeCM':
		'Variable cost exceeds price — every unit sold increases the loss. No break-even exists.',

	/* Sensitivity */
	'cvp.sens.target': 'Target Metric',
	'cvp.sens.row': 'Row Variable',
	'cvp.sens.col': 'Column Variable',
	'cvp.sens.range': 'Range ±%',
	'cvp.sens.steps': 'Steps',
	'cvp.sens.operatingIncome': 'Operating Income',
	'cvp.sens.totalCM': 'Total CM',
	'cvp.sens.bepUnits': 'Break-Even (units)',
	'cvp.sens.mosPct': 'Margin of Safety %',
	'cvp.sens.dol': 'Operating Leverage',
	'cvp.sens.price': 'Price',
	'cvp.sens.volume': 'Volume',
	'cvp.sens.variableCost': 'Variable Cost',
	'cvp.sens.fixedCosts': 'Fixed Costs',
	'cvp.sens.current': 'Current',
	'cvp.sens.clickHint': 'Click a cell to apply that scenario',

	/* Right panel */
	'cvp.right.whatif': 'What-If',
	'cvp.right.compare': 'Compare',
	'cvp.right.sliders': 'Adjust the sliders to see impact',
	'cvp.right.impact': 'Impact',
	'cvp.right.reset': 'Reset',

	/* Sliders */
	'cvp.slider.price': 'Price Change',
	'cvp.slider.volume': 'Volume Change',
	'cvp.slider.vc': 'Variable Cost',
	'cvp.slider.fc': 'Fixed Costs',

	/* Impact */
	'cvp.impact.title': 'Scenario Impact',
	'cvp.impact.newBep': 'New Break-Even',
	'cvp.impact.newMos': 'New MoS %',
	'cvp.impact.newProfit': 'New Profit',
	'cvp.impact.newDol': 'New DOL',
	'cvp.impact.delta': 'Δ',

	/* Compare */
	'cvp.compare.structA': 'Structure A',
	'cvp.compare.structB': 'Structure B',
	'cvp.compare.fc': 'Fixed Costs',
	'cvp.compare.vc': 'Variable Cost/Unit',
	'cvp.compare.indifference': 'Indifference Point',
	'cvp.compare.cheaperBelow': 'is cheaper below',
	'cvp.compare.cheaperAbove': 'is cheaper above',
	'cvp.compare.units': 'units',
	'cvp.compare.parallel': 'Cost lines are parallel',
	'cvp.compare.dominated': 'dominates across all feasible volumes',

	/* Goal Seek */
	'cvp.goalseek.header': 'Goal Seek',
	'cvp.goalseek.solveFor': 'Solve for',
	'cvp.goalseek.editTarget': 'Edit Target',
	'cvp.goalseek.apply': 'Apply',
	'cvp.goalseek.cancel': 'Cancel',
	'cvp.goalseek.price': 'Price',
	'cvp.goalseek.vc': 'Variable Cost',
	'cvp.goalseek.fc': 'Fixed Costs',
	'cvp.goalseek.volume': 'Volume',
	'cvp.goalseek.noSolution': 'No solution in feasible range',
	'cvp.goalseek.approximate': 'Approximate solution',

	/* Learn page */
	'cvp.learn.heroTitle': 'Cost-Volume-Profit Analysis',
	'cvp.learn.heroSub':
		'Understand how costs, volume, and profit interact. Learn the formulas, master the concepts, and build intuition for break-even analysis.',
	'cvp.learn.flowTitle': 'Which CVP Analysis Answers Your Question?',
	'cvp.learn.conceptsTitle': 'Core Concepts',
	'cvp.learn.formulasTitle': 'Formula Reference',
	'cvp.learn.tipsTitle': 'Key Concepts & Practical Tips',
	'cvp.learn.compareTitle': 'CVP Metrics at a Glance',

	/* Concepts */
	'cvp.learn.cContribMargin': 'Contribution Margin',
	'cvp.learn.cBreakEven': 'Break-Even Point',
	'cvp.learn.cTargetProfit': 'Target Profit',
	'cvp.learn.cMarginSafety': 'Margin of Safety',
	'cvp.learn.cOpLeverage': 'Operating Leverage',
	'cvp.learn.cIndifference': 'Indifference Point',
	'cvp.learn.cSalesMix': 'Sales Mix',
	'cvp.learn.cAfterTax': 'After-Tax Target',
	'cvp.learn.cContribMarginF': 'CM = Price − Variable Cost',
	'cvp.learn.cBreakEvenF': 'BEP = Fixed Costs / CM per unit',
	'cvp.learn.cTargetProfitF': 'Q = (FC + Target) / CM',
	'cvp.learn.cMarginSafetyF': 'MoS % = (Sales − BEP) / Sales × 100',
	'cvp.learn.cOpLeverageF': 'DOL = Total CM / Operating Income',
	'cvp.learn.cIndifferenceF': 'Q = (FC_A − FC_B) / (VC_B − VC_A)',
	'cvp.learn.cSalesMixF': 'Wtd CM = Σ(CM_i × Mix_i)',
	'cvp.learn.cAfterTaxF': 'Q = (FC + Target/(1−t)) / CM',
	'cvp.learn.cContribMarginD':
		'How much each unit sold contributes to covering fixed costs and generating profit.',
	'cvp.learn.cBreakEvenD':
		'The sales volume where total revenue equals total costs — zero profit, zero loss.',
	'cvp.learn.cTargetProfitD': 'The volume needed to achieve a specific pre-tax profit target.',
	'cvp.learn.cMarginSafetyD': 'How far sales can drop before the company reaches break-even.',
	'cvp.learn.cOpLeverageD':
		'Measures how sensitive operating income is to a change in sales volume.',
	'cvp.learn.cIndifferenceD':
		'The volume at which two different cost structures produce equal profit.',
	'cvp.learn.cSalesMixD': 'Combines multiple products into one weighted break-even analysis.',
	'cvp.learn.cAfterTaxD': 'Adjusts the target profit formula to account for income tax.',

	/* Scenarios */
	'cvp.scenario.coffee.title': 'Coffee Shop Startup',
	'cvp.scenario.coffee.desc':
		'Maria is opening a small coffee shop. Her average latte costs $1.80 in ingredients and she sells it for $5.50. Monthly rent, utilities, and staff cost $8,500. How many lattes must she sell per month to break even?',
	'cvp.scenario.factory.title': 'Factory Expansion Decision',
	'cvp.scenario.factory.desc':
		'A manufacturing plant produces widgets at $35 variable cost and sells them for $120 each. Fixed overhead is $425,000 per year. Management wants to know how many units are needed to earn $100,000 after 25% tax.',
	'cvp.scenario.pricing.title': 'Pricing Strategy Analysis',
	'cvp.scenario.pricing.desc':
		'A retailer sells a product at $50 with $20 variable cost and $150,000 fixed costs. At what volume does the current price generate $80,000 profit after 20% tax?',
	'cvp.scenario.lease.title': 'Lease vs Buy Equipment',
	'cvp.scenario.lease.desc':
		'A company can lease equipment for $80,000/year (fixed) or buy and incur $120,000 fixed costs. Variable cost is $45/unit and selling price is $80. At 5,000 units, which option earns more after 25% tax?',
	'cvp.scenario.restaurant.title': 'Restaurant Break-Even',
	'cvp.scenario.restaurant.desc':
		'A casual restaurant averages $25 per meal with $10 in food and variable labor costs. Monthly fixed costs (rent, insurance, salaried staff) are $45,000. The owner wants $30,000 monthly profit after 20% tax.',
	'cvp.scenario.saas.title': 'SaaS Subscription Model',
	'cvp.scenario.saas.desc':
		'A SaaS company charges $29/month per user with only $1.20 in variable server costs per user. Fixed costs total $180,000/month. They target $50,000 after-tax profit at 25% tax rate.',
	'cvp.scenario.icecream.title': 'Seasonal Ice Cream Stand',
	'cvp.scenario.icecream.desc':
		'An ice cream stand operates 5 months per year. Each cone sells for $6 with $2.50 in variable costs. Seasonal fixed costs (permits, equipment, labor) are $36,000. The owner wants $20,000 profit after 15% tax.',
	'cvp.scenario.aftertax.title': 'After-Tax Profit Target',
	'cvp.scenario.aftertax.desc':
		'A distributor sells goods at $75 with $30 variable cost and $200,000 in fixed costs. The board demands $100,000 net income after 30% corporate tax. How many units must be sold, and what is the degree of operating leverage?',
	'cvp.scenario.bakery.title': 'Neighborhood Bakery',
	'cvp.scenario.bakery.desc':
		'A bakery sells artisan bread loaves at $12 each with $4 in ingredients and variable costs. Monthly fixed costs are $25,000. The baker aims for $15,000 profit after 20% tax. Is the current volume of 5,000 loaves enough?',
	'cvp.scenario.ohada.title': 'OHADA Zone Manufacturer',
	'cvp.scenario.ohada.desc':
		'A SYSCOHADA-compliant manufacturer in the CEMAC zone sells units at 2,500 FCFA with 1,500 FCFA of charges variables. Charges fixes total 5,000,000 FCFA. The target is a résultat net of 3,000,000 FCFA after 30% impôt sur les sociétés.',

	/* Exercises */
	'cvp.ex.title': 'Exercises',
	'cvp.ex.select': 'Select an exercise',
	'cvp.ex.randomize': 'New numbers',
	'cvp.ex.check': 'Check',
	'cvp.ex.correct': 'Correct!',
	'cvp.ex.incorrect': 'Not quite — review your inputs and try again.',
	'cvp.ex.partial': 'Partially correct — some values are off.',
	'cvp.ex.empty': 'Enter your answer before checking.',

	'cvp.ex.bep.title': 'Solve for break-even',
	'cvp.ex.bep.desc': 'Given price, variable cost, and fixed costs — find the break-even volume.',
	'cvp.ex.bep.prompt':
		'A company sells at {price} per unit with variable cost of {variableCost} per unit and fixed costs of {fixedCosts}. Find the break-even volume (in units, rounded up).',
	'cvp.ex.bep.answerLabel': 'Break-Even (units)',

	'cvp.ex.target.title': 'Solve for target volume (pre-tax)',
	'cvp.ex.target.desc': 'Find the volume needed to achieve a pre-tax profit target.',
	'cvp.ex.target.prompt':
		'Price {price}, variable cost {variableCost}, fixed costs {fixedCosts}. How many units must be sold to achieve an operating income of {targetProfit}?',
	'cvp.ex.target.answerLabel': 'Target Volume',

	'cvp.ex.aftertax.title': 'Solve for after-tax target volume',
	'cvp.ex.aftertax.desc': 'Gross up a net-income target, then solve for volume.',
	'cvp.ex.aftertax.prompt':
		'Price {price}, variable cost {variableCost}, fixed costs {fixedCosts}. How many units must be sold for a net income of {targetProfit} with a tax rate of {taxRate}%?',
	'cvp.ex.aftertax.answerLabel': 'After-Tax Target Volume',

	'cvp.ex.mos.title': 'Margin of safety %',
	'cvp.ex.mos.desc': 'Compute the margin of safety at current volume.',
	'cvp.ex.mos.prompt':
		'Price {price}, variable cost {variableCost}, fixed costs {fixedCosts}, current volume {volume}. What is the margin of safety (%)?',
	'cvp.ex.mos.answerLabel': 'Margin of Safety %',

	'cvp.ex.dol.title': 'Degree of operating leverage',
	'cvp.ex.dol.desc': 'Compute DOL at the current operating point.',
	'cvp.ex.dol.prompt':
		'Price {price}, variable cost {variableCost}, fixed costs {fixedCosts}, current volume {volume}. What is the degree of operating leverage?',
	'cvp.ex.dol.answerLabel': 'DOL',

	/* General */
	'cvp.general.units': 'units',
	'cvp.general.currency': 'currency',
	'cvp.general.infinity': '∞',

	/* Worked solution */
	'cvp.worked.title': 'Worked Solution',
	'cvp.worked.stepCM': 'Step 1 — Compute Contribution Margin',
	'cvp.worked.stepBEP': 'Step 2 — Break-Even',
	'cvp.worked.stepTarget': 'Step 3 — Target Volume',
	'cvp.worked.stepMoS': 'Step 4 — Margin of Safety',
	'cvp.worked.stepDOL': 'Step 5 — Operating Leverage',
};
