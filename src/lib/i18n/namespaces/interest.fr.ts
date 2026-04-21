import type { TranslationMap } from '../types';

export const interestFr: TranslationMap = {
	// Tabs / shell
	'int.tab.playground': 'Laboratoire d\u2019intérêts',
	'int.tab.learn': 'Apprendre',
	'int.tab.scenarios': 'Scénarios',

	// Modes
	'int.mode.simple.label': 'Intérêts simples',
	'int.mode.simple.tabShort': 'Simples',
	'int.mode.compound.label': 'Intérêts composés',
	'int.mode.compound.tabShort': 'Composés',
	'int.mode.effective.label': 'Taux effectif vs nominal',
	'int.mode.effective.tabShort': 'Effectif',

	// Inputs
	'int.inputs.title': 'Paramètres',
	'int.inputs.principal': 'Capital',
	'int.inputs.nominalRate': 'Taux nominal annuel',
	'int.inputs.startDate': 'Date de début',
	'int.inputs.endDate': 'Date de fin',
	'int.inputs.frequency': 'Fréquence de capitalisation',
	'int.inputs.dayCount': 'Convention de décompte des jours',
	'int.inputs.continuousToggle': 'Afficher aussi la capitalisation continue',

	// Frequency option labels
	'int.freq.annual': 'Annuelle',
	'int.freq.semi': 'Semestrielle',
	'int.freq.quarterly': 'Trimestrielle',
	'int.freq.monthly': 'Mensuelle',
	'int.freq.daily': 'Journalière',
	'int.freq.continuous': 'Continue',

	// Day-count option labels
	'int.dayCount.30_360': '30/360',
	'int.dayCount.actual_365': 'Exact/365',
	'int.dayCount.actual_360': 'Exact/360',
	'int.dayCount.actual_actual': 'Exact/Exact',

	// Bond inputs (Mode 3)
	'int.bond.title': 'Paramètres de l\u2019obligation',
	'int.bond.faceValue': 'Valeur nominale',
	'int.bond.couponRate': 'Taux de coupon',
	'int.bond.marketRate': 'Taux du marché à l\u2019émission',
	'int.bond.termYears': 'Durée (années)',
	'int.bond.paymentFrequency': 'Fréquence de paiement du coupon',
	'int.bond.issuePrice': 'Prix d\u2019émission',
	'int.bond.parNote': 'Émission au pair — coupon égal au taux du marché',
	'int.bond.discountNote': 'Émission en-dessous du pair — taux du marché supérieur au coupon',
	'int.bond.premiumNote': 'Émission au-dessus du pair — taux du marché inférieur au coupon',

	// Formulas
	'int.formula.simple.title': 'I = C × i × n',
	'int.formula.simple.P': 'Capital',
	'int.formula.simple.r': 'Taux annuel',
	'int.formula.simple.t': 'Durée en années (ajustée par la convention)',
	'int.formula.compound.title': 'VF = C × (1 + i/m)^(m·n)',
	'int.formula.compound.P': 'Capital',
	'int.formula.compound.r': 'Taux nominal annuel',
	'int.formula.compound.m': 'Périodes de capitalisation par an',
	'int.formula.compound.t': 'Durée en années',
	'int.formula.continuous.title': 'VF = C × e^(i·n)',
	'int.formula.continuous.note': 'La capitalisation continue est la limite quand m → ∞',
	'int.formula.eirConversion.title': 'TIE = (1 + i/m)^m − 1',
	'int.formula.eirConversion.r': 'Taux nominal annuel',
	'int.formula.eirConversion.m': 'Périodes de capitalisation par an',
	'int.formula.eirConversion.continuous': 'TIE = e^i − 1 (cas continu)',

	// Chart titles / axes
	'int.chart.simple.title': 'Croissance linéaire — les intérêts s\u2019accumulent à taux constant',
	'int.chart.simple.xAxis': 'Temps',
	'int.chart.simple.yAxis': 'Solde',
	'int.chart.compound.title': 'Croissance exponentielle — les intérêts produisent des intérêts',
	'int.chart.compound.xAxis': 'Temps',
	'int.chart.compound.yAxis': 'Solde',
	'int.chart.compound.legendSimple': 'Référence simple',
	'int.chart.compound.legendCompound': 'Composé',
	'int.chart.compound.legendContinuous': 'Continu',
	'int.chart.compound.stackInterestOnPrincipal': 'Intérêts sur capital',
	'int.chart.compound.stackInterestOnInterest': 'Intérêts sur intérêts',
	'int.chart.divergence.title': 'Valeur comptable : Linéaire vs TIE',
	'int.chart.divergence.xAxis': 'Période',
	'int.chart.divergence.yAxis': 'Valeur comptable',
	'int.chart.divergence.legendSl': 'Linéaire',
	'int.chart.divergence.legendEir': 'TIE (IFRS 9 / SYSCOHADA Révisé)',
	'int.chart.divergence.legendGap': 'Écart',

	// Rate summary
	'int.rate.nominal.label': 'Nominal',
	'int.rate.nominal.tooltip': 'Le taux annuel affiché, avant ajustement pour la capitalisation.',
	'int.rate.effective.label': 'Taux d\u2019intérêt effectif (TIE)',
	'int.rate.effective.tooltip': 'Le véritable rendement annuel une fois la capitalisation prise en compte.',
	'int.rate.continuous.label': 'Équivalent continu',
	'int.rate.continuous.tooltip': 'Le taux capitalisé en continu qui produit le même TIE.',

	// Comparison drawer
	'int.drawer.title': 'Comparaison',
	'int.drawer.empty': 'Épinglez un résultat pour comparer entre les modes.',
	'int.drawer.pin': 'Épingler un instantané',
	'int.drawer.compare': 'Comparer',
	'int.drawer.clear': 'Tout effacer',
	'int.drawer.labelFor': 'Libellé',
	'int.drawer.remove': 'Retirer',

	// KPIs
	'int.kpi.totalAmount': 'Total (capital + intérêts)',
	'int.kpi.futureValue': 'Valeur future',
	'int.kpi.effectiveAnnualRate': 'Taux d\u2019intérêt effectif',
	'int.kpi.continuousEquivalent': 'Équivalent continu',
	'int.kpi.principalRatio': 'Multiple de croissance',
	'int.kpi.periodCount': 'Périodes',
	'int.kpi.issuePrice': 'Prix d\u2019émission',
	'int.kpi.totalInterestExpense': 'Total des charges d\u2019intérêts',

	// Amortisation schedule headers
	'int.schedule.period': 'Période',
	'int.schedule.periodEnd': 'Date',
	'int.schedule.opening': 'Valeur comptable (début)',
	'int.schedule.cashInterest': 'Coupon encaissé',
	'int.schedule.interestExpense': 'Charge d\u2019intérêts',
	'int.schedule.discountAmortisation': 'Amortissement de la décote / prime',
	'int.schedule.closing': 'Valeur comptable (fin)',
	'int.schedule.methodSl': 'Linéaire',
	'int.schedule.methodEir': 'TIE',

	// Exercises
	'int.exercise.simple-interest-total.prompt':
		'Calculez le montant total (capital + intérêts) pour {{principal}} à {{rate}}% d\u2019intérêts simples du {{start}} au {{end}} selon {{dayCount}}.',
	'int.exercise.simple-interest-total.correct':
		'Correct. Selon {{dayCount}}, la fraction d\u2019année est {{years}}, donc I = C·i·n = {{interest}} et le total = {{total}}.',
	'int.exercise.simple-interest-total.incorrect': 'Pas tout à fait. Recalculez la fraction d\u2019année selon {{dayCount}}.',
	'int.exercise.simple-interest-total.hint': 'Les intérêts simples sont linéaires : le taux s\u2019applique uniquement au capital, pas aux intérêts accumulés.',

	'int.exercise.simple-interest-days.prompt':
		'Un prêt commercial de {{principal}} court sur {{days}} jours au taux simple de {{rate}}% selon {{dayCount}}. Combien d\u2019intérêts s\u2019accumulent ?',
	'int.exercise.simple-interest-days.correct': 'Correct : {{interest}}.',
	'int.exercise.simple-interest-days.incorrect': 'Vérifiez si vous avez divisé par 360 ou par 365.',
	'int.exercise.simple-interest-days.hint': 'Exact/360 produit un peu plus d\u2019intérêts que Exact/365 pour le même taux nominal.',

	'int.exercise.compound-fv.prompt':
		'{{principal}} est placé au taux de {{rate}}% capitalisé {{frequency}} pendant {{years}} années. Quelle est la valeur future ?',
	'int.exercise.compound-fv.correct': 'Correct : {{futureValue}}.',
	'int.exercise.compound-fv.incorrect': 'Avez-vous utilisé le bon nombre de périodes par an ?',
	'int.exercise.compound-fv.hint': 'VF = C × (1 + i/m)^(m·n) — m est la fréquence de capitalisation (et non le taux nominal).',

	'int.exercise.compound-frequency-effect.prompt':
		'Calculez la valeur future de {{principal}} à {{rate}}% sur {{years}} années capitalisé (a) annuellement, (b) mensuellement, (c) en continu.',
	'int.exercise.compound-frequency-effect.correct': 'Toutes les trois : annuelle {{fvAnnual}}, mensuelle {{fvMonthly}}, continue {{fvContinuous}}.',
	'int.exercise.compound-frequency-effect.incorrect': 'Revoyez chaque calcul — la fréquence compte.',
	'int.exercise.compound-frequency-effect.hint': 'La capitalisation continue est la limite mathématique quand m → ∞.',

	'int.exercise.solve-compound-rate.prompt':
		'À quel taux annuel capitalisé {{frequency}} le capital {{principal}} croît-il jusqu\u2019à {{futureValue}} en {{years}} années ?',
	'int.exercise.solve-compound-rate.correct': 'Correct : {{rate}}.',
	'int.exercise.solve-compound-rate.incorrect': 'Isolez i dans l\u2019équation de la valeur future.',
	'int.exercise.solve-compound-rate.hint': 'Réarrangez : i = m × ((VF/C)^(1/(m·n)) − 1).',

	'int.exercise.nominal-to-eir.prompt':
		'Convertissez un taux nominal annuel de {{rate}}% capitalisé {{frequency}} en son taux d\u2019intérêt effectif.',
	'int.exercise.nominal-to-eir.correct': 'Correct : {{eir}}.',
	'int.exercise.nominal-to-eir.incorrect': 'Appliquez TIE = (1 + i/m)^m − 1.',
	'int.exercise.nominal-to-eir.hint': 'Une fréquence de capitalisation plus élevée produit toujours un TIE plus élevé pour le même nominal.',

	'int.exercise.eir-to-nominal.prompt':
		'Quel taux nominal annuel capitalisé {{frequency}} produit un taux effectif annuel de {{eir}} ?',
	'int.exercise.eir-to-nominal.correct': 'Correct : {{nominal}}.',
	'int.exercise.eir-to-nominal.incorrect': 'Inversez la formule du TIE.',
	'int.exercise.eir-to-nominal.hint': 'Nominal = m × ((1 + TIE)^(1/m) − 1).',

	'int.exercise.bond-issue-price.prompt':
		'Une obligation de valeur nominale {{faceValue}}, coupon {{couponRate}}%, durée {{termYears}} ans est émise lorsque le taux du marché est {{marketRate}}%. Quel est le prix d\u2019émission ?',
	'int.exercise.bond-issue-price.correct': 'Correct : {{issuePrice}}.',
	'int.exercise.bond-issue-price.incorrect': 'Actualisez séparément le flux de coupons et la valeur nominale au taux du marché.',
	'int.exercise.bond-issue-price.hint': 'Lorsque le taux du marché dépasse le coupon, l\u2019obligation est émise en dessous du pair.',

	'int.exercise.eir-interest-period-n.prompt':
		'Avec la méthode du TIE appliquée à l\u2019obligation ci-dessus, quelle est la charge d\u2019intérêts comptabilisée en période {{periodIndex}} ?',
	'int.exercise.eir-interest-period-n.correct': 'Correct : {{eirInterest}}.',
	'int.exercise.eir-interest-period-n.incorrect': 'Valeur comptable au début × taux du marché par période.',
	'int.exercise.eir-interest-period-n.hint': 'Construisez le tableau ligne par ligne — chaque solde d\u2019ouverture dépend du précédent.',

	// Scenarios
	'int.scenario.01-bank-loan-comparison.title': 'Quel prêt est réellement le moins cher ?',
	'int.scenario.01-bank-loan-comparison.desc': 'Trois offres, trois fréquences de capitalisation, trois taux nominaux différents. Classez-les selon le coût réel.',
	'int.scenario.01-bank-loan-comparison.intro':
		'Une PME reçoit trois devis de prêt. Les taux nominaux varient de moins d\u2019un demi-point, mais les fréquences de capitalisation vont de l\u2019annuel au mensuel. Quelle offre coûtera réellement le moins ?',

	'int.scenario.02-savings-doubling-time.title': 'En combien de temps doubler son capital ?',
	'int.scenario.02-savings-doubling-time.desc': 'La règle des 72 est une approximation. Trouvez la vraie réponse pour différents taux et fréquences.',
	'int.scenario.02-savings-doubling-time.intro':
		'Vous souhaitez doubler un dépôt de 1 000 000 FCFA. Expérimentez avec différents taux et fréquences de capitalisation — y compris continue — pour trouver la durée minimale.',

	'int.scenario.03-ifrs9-transition.title': 'Transition SYSCOHADA Révisé / IFRS 9',
	'int.scenario.03-ifrs9-transition.desc': 'Retraitez une obligation évaluée en linéaire au coût amorti avec la méthode du TIE et calculez l\u2019ajustement des capitaux propres.',
	'int.scenario.03-ifrs9-transition.intro':
		'Une obligation à 5 ans était évaluée en linéaire sous l\u2019ancienne norme. La transition exige un retraitement au coût amorti selon SYSCOHADA Révisé / IFRS 9. Calculez l\u2019ajustement de transition à la fin de l\u2019année 2.',

	// Catalog
	'pg.interest.title': 'Laboratoire d\u2019intérêts',
	'pg.interest.desc': 'Intérêts simples, composés et effectifs — voyez pourquoi un taux nominal de 12% capitalisé mensuellement vaut en réalité 12,68%.',
};
