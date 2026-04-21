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
	'int.inputs.nominalRate': 'Taux nominal annuel (%)',
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
	'int.bond.couponRate': 'Taux de coupon (%)',
	'int.bond.couponRate.help': 'Le taux promis par l\u2019émetteur \u2014 fixe sur toute la durée.',
	'int.bond.marketRate': 'Taux du marché à l\u2019émission (%)',
	'int.bond.marketRate.help': 'Le taux exigé par les investisseurs. Sert de taux d\u2019actualisation pour le prix d\u2019émission.',
	'int.bond.termYears': 'Durée (années)',
	'int.bond.paymentFrequency': 'Fréquence de paiement du coupon',
	'int.bond.issuePrice': 'Prix d\u2019émission',
	'int.bond.parNote': 'Émission au pair \u2014 coupon égal au taux du marché ; émission à la valeur nominale.',
	'int.bond.discountNote': 'Émission en-dessous du pair \u2014 taux du marché supérieur au coupon ; émission en-dessous de la valeur nominale.',
	'int.bond.premiumNote': 'Émission au-dessus du pair \u2014 taux du marché inférieur au coupon ; émission au-dessus de la valeur nominale.',

	// Formulas
	'int.formula.label': 'Formule',
	'int.formula.simple.caption': 'Les intérêts s\u2019accumulent à taux fixe sur le capital initial uniquement.',
	'int.formula.compound.caption': 'Les intérêts produisent des intérêts. Fréquence m plus élevée \u2192 valeur future plus élevée.',
	'int.formula.continuous.caption': 'La limite mathématique quand m \u2192 \u221E. Constante d\u2019Euler e \u2248 2,71828.',
	'int.formula.eirConversion.caption': 'Le taux effectif annuel tient compte de la capitalisation à l\u2019intérieur de l\u2019année.',

	// Chart titles / axes
	'int.chart.simple.title': 'Croissance linéaire \u2014 les intérêts s\u2019accumulent à taux constant',
	'int.chart.simple.xAxis': 'Année',
	'int.chart.simple.yAxis': 'Solde',
	'int.chart.compound.title': 'Croissance exponentielle \u2014 les intérêts produisent des intérêts',
	'int.chart.compound.xAxis': 'Année',
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

	// Computed summary card
	'int.summary.label': 'Résultats',
	'int.summary.principal': 'Capital',
	'int.summary.interest': 'Intérêts',
	'int.summary.total': 'Total',
	'int.summary.effectiveRate': 'TIE',

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

	// Exercises (parameter-free — les apprenants lisent les valeurs actives
	// depuis le panneau Paramètres. ExercisePanel partagé ne substitue pas
	// les variables de template.)
	'int.exercise.simple-interest-total.prompt':
		'Calculez le montant total (capital + intérêts) en intérêts simples pour le capital, le taux et la durée actifs.',
	'int.exercise.simple-interest-total.correct':
		'Correct \u2014 vous avez appliqué I = C\u00B7i\u00B7n avec la convention active.',
	'int.exercise.simple-interest-total.incorrect':
		'Pas tout à fait. Recalculez la fraction d\u2019année selon la convention sélectionnée.',
	'int.exercise.simple-interest-total.hint':
		'Les intérêts simples sont linéaires : le taux s\u2019applique au capital uniquement, pas aux intérêts accumulés.',

	'int.exercise.simple-interest-days.prompt':
		'Calculez les intérêts simples accumulés sur le nombre de jours indiqué selon la convention active.',
	'int.exercise.simple-interest-days.correct': 'Correct \u2014 votre ajustement de décompte est juste.',
	'int.exercise.simple-interest-days.incorrect': 'Vérifiez si vous avez divisé par 360 ou par 365.',
	'int.exercise.simple-interest-days.hint':
		'Exact/360 produit un peu plus d\u2019intérêts que Exact/365 pour le même taux nominal.',

	'int.exercise.compound-fv.prompt':
		'Calculez la valeur future du capital au taux nominal, capitalisé à la fréquence sélectionnée, sur la durée indiquée.',
	'int.exercise.compound-fv.correct': 'Correct \u2014 votre valeur future correspond au moteur.',
	'int.exercise.compound-fv.incorrect': 'Avez-vous utilisé le bon nombre de périodes par an ?',
	'int.exercise.compound-fv.hint':
		'VF = C \u00D7 (1 + i/m)^(m\u00B7n) \u2014 m est la fréquence de capitalisation (pas le taux nominal).',

	'int.exercise.compound-frequency-effect.prompt':
		'Pour le capital, le taux et la durée actifs, comparez la valeur future en capitalisation annuelle, mensuelle et continue.',
	'int.exercise.compound-frequency-effect.correct':
		'Correct \u2014 vous avez saisi comment la fréquence modifie le rendement.',
	'int.exercise.compound-frequency-effect.incorrect':
		'Revoyez chaque calcul \u2014 la fréquence compte plus qu\u2019il n\u2019y paraît.',
	'int.exercise.compound-frequency-effect.hint':
		'La capitalisation continue est la limite mathématique quand m \u2192 \u221E.',

	'int.exercise.solve-compound-rate.prompt':
		'Étant donnés le capital, la valeur future, la durée et la fréquence, trouvez le taux nominal annuel qui les concilie.',
	'int.exercise.solve-compound-rate.correct': 'Correct \u2014 vous avez inversé l\u2019équation de VF pour i.',
	'int.exercise.solve-compound-rate.incorrect':
		'Isolez i algébriquement avant de substituer les valeurs.',
	'int.exercise.solve-compound-rate.hint':
		'Réarrangez : i = m \u00D7 ((VF/C)^(1/(m\u00B7n)) \u2212 1).',

	'int.exercise.nominal-to-eir.prompt':
		'Convertissez le taux nominal annuel actif capitalisé mensuellement en son taux d\u2019intérêt effectif (TIE).',
	'int.exercise.nominal-to-eir.correct': 'Correct \u2014 votre TIE correspond à (1 + i/m)^m \u2212 1.',
	'int.exercise.nominal-to-eir.incorrect': 'Appliquez TIE = (1 + i/m)^m \u2212 1 avec m = 12.',
	'int.exercise.nominal-to-eir.hint':
		'Une fréquence de capitalisation plus élevée produit toujours un TIE plus élevé pour le même nominal.',

	'int.exercise.eir-to-nominal.prompt':
		'Étant donné un taux effectif annuel, trouvez le taux nominal annuel capitalisé mensuellement qui le produit.',
	'int.exercise.eir-to-nominal.correct': 'Correct \u2014 vous avez inversé la formule du TIE.',
	'int.exercise.eir-to-nominal.incorrect':
		'Inversez la formule du TIE : i = m \u00D7 ((1 + TIE)^(1/m) \u2212 1).',
	'int.exercise.eir-to-nominal.hint':
		'Prenez d\u2019abord la racine m-ième, soustrayez 1, puis multipliez par m.',

	'int.exercise.bond-issue-price.prompt':
		'Avec les paramètres actifs de l\u2019obligation (nominale, coupon, taux du marché, durée), calculez le prix d\u2019émission.',
	'int.exercise.bond-issue-price.correct':
		'Correct \u2014 votre prix correspond à la VA des coupons + VA de la nominale au taux du marché.',
	'int.exercise.bond-issue-price.incorrect':
		'Actualisez séparément le flux de coupons et la valeur nominale au taux du marché.',
	'int.exercise.bond-issue-price.hint':
		'Lorsque le taux du marché dépasse le coupon, l\u2019obligation est émise en dessous du pair.',

	'int.exercise.eir-interest-period-n.prompt':
		'Avec la méthode du TIE appliquée à l\u2019obligation active, calculez la charge d\u2019intérêts de la période cible.',
	'int.exercise.eir-interest-period-n.correct':
		'Correct \u2014 valeur comptable au début \u00D7 taux du marché par période.',
	'int.exercise.eir-interest-period-n.incorrect':
		'Construisez le tableau ligne par ligne \u2014 chaque solde d\u2019ouverture dépend du précédent.',
	'int.exercise.eir-interest-period-n.hint':
		'Charge d\u2019intérêts (période n) = valeur comptable d\u2019ouverture \u00D7 taux du marché / m.',

	// Scenarios
	'int.scenario.frameBadge': 'Ce qu\u2019il faut observer',

	'int.scenario.01-bank-loan-comparison.title': 'Quel prêt est réellement le moins cher ?',
	'int.scenario.01-bank-loan-comparison.desc':
		'Trois offres, trois fréquences de capitalisation, trois taux nominaux différents. Classez-les selon le coût réel.',
	'int.scenario.01-bank-loan-comparison.intro':
		'Une PME reçoit trois devis de prêt. Les taux nominaux varient de moins d\u2019un demi-point, mais les fréquences de capitalisation vont de l\u2019annuel au mensuel. Quelle offre coûtera réellement le moins ?',
	'int.scenario.01-bank-loan-comparison.framing':
		'Comparez les trois offres épinglées par le TIE, pas par le taux nominal affiché. L\u2019offre au TIE le plus bas est la moins chère \u2014 même si son taux nominal n\u2019est pas le plus bas.',

	'int.scenario.02-savings-doubling-time.title': 'En combien de temps doubler son capital ?',
	'int.scenario.02-savings-doubling-time.desc':
		'La règle des 72 est une approximation. Trouvez la vraie réponse pour différents taux et fréquences.',
	'int.scenario.02-savings-doubling-time.intro':
		'Vous souhaitez doubler un dépôt de 1 000 000 FCFA. Expérimentez avec différents taux et fréquences de capitalisation \u2014 y compris continue \u2014 pour trouver la durée minimale.',
	'int.scenario.02-savings-doubling-time.framing':
		'Essayez 6 % annuel, puis 6 % mensuel, puis 6 % continu. Remarquez combien la durée de doublement se raccourcit quand la fréquence augmente \u2014 et combien l\u2019écart devient mince entre journalier et continu.',

	'int.scenario.03-ifrs9-transition.title': 'Transition SYSCOHADA Révisé / IFRS 9',
	'int.scenario.03-ifrs9-transition.desc':
		'Retraitez une obligation évaluée en linéaire au coût amorti avec la méthode du TIE et calculez l\u2019ajustement des capitaux propres.',
	'int.scenario.03-ifrs9-transition.intro':
		'Une obligation à 5 ans était évaluée en linéaire sous l\u2019ancienne norme. La transition exige un retraitement au coût amorti selon SYSCOHADA Révisé / IFRS 9. Calculez l\u2019ajustement de transition à la fin de l\u2019année 2.',
	'int.scenario.03-ifrs9-transition.framing':
		'Regardez le ruban de divergence : l\u2019écart à la période 2 EST l\u2019ajustement de transition. Sous IFRS 9 / SYSCOHADA Révisé, la valeur comptable TIE est inférieure à la valeur linéaire dans les premières années d\u2019une obligation à décote \u2014 une réduction des capitaux propres à la transition.',

	// Catalog
	'pg.interest.title': 'Laboratoire d\u2019intérêts',
	'pg.interest.desc':
		'Intérêts simples, composés et effectifs \u2014 voyez pourquoi un taux nominal de 12% capitalisé mensuellement vaut en réalité 12,68%.',
};
