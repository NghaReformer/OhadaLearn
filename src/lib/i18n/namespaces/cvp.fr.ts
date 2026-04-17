import type { TranslationMap } from '../types';

export const cvpFr: TranslationMap = {
	/* Playground catalog */
	'pg.cvp.title': 'Coût-Volume-Profit',
	'pg.cvp.desc':
		'Analyser le seuil de rentabilité, le profit cible, le levier opérationnel et le mix multi-produits.',

	/* Nav */
	'cvp.nav.simple': 'Simple',
	'cvp.nav.advanced': 'Avancé',

	/* Input labels */
	'cvp.input.price': 'Prix de vente',
	'cvp.input.priceHint': 'Prix unitaire de vente',
	'cvp.input.vc': 'Coût variable',
	'cvp.input.vcHint': 'Coût variable unitaire (production + vente)',
	'cvp.input.fc': 'Charges fixes',
	'cvp.input.fcHint': 'Total des charges fixes de la période',
	'cvp.input.volume': 'Volume',
	'cvp.input.volumeHint': "Nombre d'unités vendues",
	'cvp.input.targetProfit': 'Profit cible',
	'cvp.input.targetProfitHint': "Résultat d'exploitation cible (avant impôt)",
	'cvp.input.taxRate': "Taux d'imposition",
	'cvp.input.taxRateHint': "Taux d'impôt sur le résultat (%)",
	'cvp.input.pretax': 'Avant impôt',

	/* Sections */
	'cvp.section.revenue': "Chiffre d'affaires & Activité",
	'cvp.section.costStructure': 'Structure des coûts',
	'cvp.section.targets': 'Objectifs',
	'cvp.section.products': 'Produits',
	'cvp.section.advanced': 'Avancé',

	/* Products */
	'cvp.product.single': 'Produit unique',
	'cvp.product.multi': 'Multi-produits',
	'cvp.product.add': 'Ajouter un produit',
	'cvp.product.name': 'Nom',
	'cvp.product.price': 'Prix',
	'cvp.product.vc': 'CV',
	'cvp.product.mix': 'Mix %',
	'cvp.product.remove': 'Supprimer',
	'cvp.product.mixTotal': 'Total mix',
	'cvp.product.mixError': 'Le mix doit totaliser 100%',
	'cvp.product.weightedCM': 'MCV moy. pond.',
	'cvp.product.weightedCMR': 'Ratio MCV pond.',
	'cvp.product.bepTotal': 'Seuil total',
	'cvp.product.perProduct': 'Ventilation par produit',
	'cvp.product.allocation': 'Allocation seuil',

	/* Chart */
	'cvp.chart.classic': 'Classique',
	'cvp.chart.pv': 'Profit-Volume',
	'cvp.chart.stack': 'Empilé',
	'cvp.chart.revenue': "Chiffre d'affaires",
	'cvp.chart.totalCost': 'Coût total',
	'cvp.chart.fixedCost': 'Charges fixes',
	'cvp.chart.variableCost': 'Variable',
	'cvp.chart.loss': 'Perte',
	'cvp.chart.profit': 'Bénéfice',
	'cvp.chart.unitsSold': 'Unités vendues',
	'cvp.chart.amount': 'Montant',
	'cvp.chart.noBEP': 'Aucun seuil — la marge sur coût variable est non positive.',

	/* Overlays */
	'cvp.overlay.bep': 'Seuil de rentabilité',
	'cvp.overlay.target': 'Profit cible',
	'cvp.overlay.mos': 'Marge de sécurité',
	'cvp.overlay.dol': 'Levier opérationnel',

	/* Table */
	'cvp.table.results': 'Résultats',
	'cvp.table.sensitivity': 'Sensibilité',
	'cvp.table.goalseekHint': "Clic droit sur un résultat pour la recherche d'objectif",

	/* Results */
	'cvp.res.metric': 'Indicateur',
	'cvp.res.perUnit': 'Unitaire',
	'cvp.res.total': 'Total',
	'cvp.res.ratio': 'Ratio',
	'cvp.res.revenue': "Chiffre d'affaires",
	'cvp.res.vc': 'Charges variables',
	'cvp.res.cm': 'Marge sur coût variable',
	'cvp.res.fc': 'Charges fixes',
	'cvp.res.oi': "Résultat d'exploitation",
	'cvp.res.bep': 'Seuil de rentabilité (unités)',
	'cvp.res.bepSales': 'Seuil de rentabilité (CA)',
	'cvp.res.targetVol': 'Volume cible',
	'cvp.res.afterTax': 'Volume cible après impôt',
	'cvp.res.mos': 'Marge de sécurité',
	'cvp.res.mosPct': 'Marge de sécurité %',
	'cvp.res.dol': 'Levier opérationnel',
	'cvp.res.tableTitle': 'Compte de résultat par variabilité',
	'cvp.res.targetVolPretax': "Vol. cible (résultat d'exploitation)",
	'cvp.res.targetVolAftertax': 'Vol. cible (résultat net)',
	'cvp.res.bepNote': "Arrondir à l'unité supérieure en pratique",

	/* Warnings */
	'cvp.warn.negativeCM':
		'Le coût variable dépasse le prix — chaque unité vendue augmente la perte. Aucun seuil de rentabilité.',

	/* Sensitivity */
	'cvp.sens.target': 'Indicateur cible',
	'cvp.sens.row': 'Variable en ligne',
	'cvp.sens.col': 'Variable en colonne',
	'cvp.sens.range': 'Plage ±%',
	'cvp.sens.steps': 'Pas',
	'cvp.sens.operatingIncome': "Résultat d'exploitation",
	'cvp.sens.totalCM': 'MCV totale',
	'cvp.sens.bepUnits': 'Seuil de rentabilité (unités)',
	'cvp.sens.mosPct': 'Marge de sécurité %',
	'cvp.sens.dol': 'Levier opérationnel',
	'cvp.sens.price': 'Prix',
	'cvp.sens.volume': 'Volume',
	'cvp.sens.variableCost': 'Coût variable',
	'cvp.sens.fixedCosts': 'Charges fixes',
	'cvp.sens.current': 'Actuel',
	'cvp.sens.clickHint': 'Cliquez sur une cellule pour appliquer ce scénario',

	/* Right panel */
	'cvp.right.whatif': 'Simulation',
	'cvp.right.compare': 'Comparer',
	'cvp.right.sliders': "Ajustez les curseurs pour voir l'impact",
	'cvp.right.impact': 'Impact',
	'cvp.right.reset': 'Réinitialiser',

	/* Sliders */
	'cvp.slider.price': 'Variation du prix',
	'cvp.slider.volume': 'Variation du volume',
	'cvp.slider.vc': 'Coût variable',
	'cvp.slider.fc': 'Charges fixes',

	/* Impact */
	'cvp.impact.title': 'Impact du scénario',
	'cvp.impact.newBep': 'Nouveau seuil',
	'cvp.impact.newMos': 'Nouvelle MdS %',
	'cvp.impact.newProfit': 'Nouveau profit',
	'cvp.impact.newDol': 'Nouveau LOE',
	'cvp.impact.delta': 'Δ',

	/* Compare */
	'cvp.compare.structA': 'Structure A',
	'cvp.compare.structB': 'Structure B',
	'cvp.compare.fc': 'Charges fixes',
	'cvp.compare.vc': 'Coût variable unitaire',
	'cvp.compare.indifference': "Point d'indifférence",
	'cvp.compare.cheaperBelow': 'est moins cher en dessous de',
	'cvp.compare.cheaperAbove': 'est moins cher au-dessus de',
	'cvp.compare.units': 'unités',
	'cvp.compare.parallel': 'Les lignes de coût sont parallèles',
	'cvp.compare.dominated': 'domine sur toute la plage utile',

	/* Goal Seek */
	'cvp.goalseek.header': "Recherche d'objectif",
	'cvp.goalseek.solveFor': 'Résoudre pour',
	'cvp.goalseek.editTarget': 'Modifier la cible',
	'cvp.goalseek.apply': 'Appliquer',
	'cvp.goalseek.cancel': 'Annuler',
	'cvp.goalseek.price': 'Prix',
	'cvp.goalseek.vc': 'Coût variable',
	'cvp.goalseek.fc': 'Charges fixes',
	'cvp.goalseek.volume': 'Volume',
	'cvp.goalseek.noSolution': 'Aucune solution dans la plage',
	'cvp.goalseek.approximate': 'Solution approximative',

	/* Learn page */
	'cvp.learn.heroTitle': 'Analyse Coût-Volume-Profit',
	'cvp.learn.heroSub':
		"Comprendre l'interaction entre coûts, volume et profit. Apprenez les formules, maîtrisez les concepts et développez votre intuition pour l'analyse du seuil de rentabilité.",
	'cvp.learn.flowTitle': 'Quelle analyse CVP répond à votre question ?',
	'cvp.learn.conceptsTitle': 'Concepts fondamentaux',
	'cvp.learn.formulasTitle': 'Référence des formules',
	'cvp.learn.tipsTitle': 'Concepts clés et conseils pratiques',
	'cvp.learn.compareTitle': "Indicateurs CVP en un coup d'œil",

	/* Concepts */
	'cvp.learn.cContribMargin': 'Marge sur coût variable',
	'cvp.learn.cBreakEven': 'Seuil de rentabilité',
	'cvp.learn.cTargetProfit': 'Profit cible',
	'cvp.learn.cMarginSafety': 'Marge de sécurité',
	'cvp.learn.cOpLeverage': 'Levier opérationnel',
	'cvp.learn.cIndifference': "Point d'indifférence",
	'cvp.learn.cSalesMix': 'Mix de ventes',
	'cvp.learn.cAfterTax': 'Cible après impôt',
	'cvp.learn.cContribMarginF': 'MCV = Prix − Coût variable',
	'cvp.learn.cBreakEvenF': 'SR = Charges fixes / MCV unitaire',
	'cvp.learn.cTargetProfitF': 'Q = (CF + Cible) / MCV',
	'cvp.learn.cMarginSafetyF': 'MdS % = (CA − SR) / CA × 100',
	'cvp.learn.cOpLeverageF': 'LOE = MCV / Résultat',
	'cvp.learn.cIndifferenceF': 'Q = (CF_A − CF_B) / (CV_B − CV_A)',
	'cvp.learn.cSalesMixF': 'MCV pond. = Σ(MCV_i × Mix_i)',
	'cvp.learn.cAfterTaxF': 'Q = (CF + Cible/(1−t)) / MCV',
	'cvp.learn.cContribMarginD':
		'Combien chaque unité vendue contribue à couvrir les charges fixes et générer du profit.',
	'cvp.learn.cBreakEvenD':
		"Le volume de vente où le chiffre d'affaires total égale les coûts totaux.",
	'cvp.learn.cTargetProfitD':
		'Le volume nécessaire pour atteindre un objectif de profit avant impôt.',
	'cvp.learn.cMarginSafetyD':
		"De combien les ventes peuvent baisser avant d'atteindre le seuil de rentabilité.",
	'cvp.learn.cOpLeverageD':
		"Mesure la sensibilité du résultat d'exploitation aux variations du volume.",
	'cvp.learn.cIndifferenceD':
		'Le volume auquel deux structures de coûts produisent un profit identique.',
	'cvp.learn.cSalesMixD':
		'Combine plusieurs produits en une analyse pondérée du seuil de rentabilité.',
	'cvp.learn.cAfterTaxD':
		"Ajuste la formule du profit cible pour tenir compte de l'impôt sur le résultat.",

	/* Scenarios */
	'cvp.scenario.coffee.title': "Lancement d'un café",
	'cvp.scenario.coffee.desc':
		'Maria ouvre un petit café. Un latte lui coûte 1,80 $ en ingrédients et se vend 5,50 $. Le loyer, les charges et le personnel coûtent 8 500 $ par mois. Combien de lattes doit-elle vendre par mois pour atteindre le seuil de rentabilité ?',
	'cvp.scenario.factory.title': "Décision d'expansion industrielle",
	'cvp.scenario.factory.desc':
		"Une usine produit des pièces à 35 $ de coût variable et les vend à 120 $ l'unité. Les charges fixes s'élèvent à 425 000 $ par an. Combien d'unités sont nécessaires pour gagner 100 000 $ après 25 % d'impôt ?",
	'cvp.scenario.pricing.title': 'Analyse de la stratégie de prix',
	'cvp.scenario.pricing.desc':
		'Un détaillant vend un produit à 50 $ avec 20 $ de coût variable et 150 000 $ de charges fixes. À quel volume le prix actuel génère-t-il 80 000 $ de résultat net après 20 % ?',
	'cvp.scenario.lease.title': "Location vs achat d'équipement",
	'cvp.scenario.lease.desc':
		"Une entreprise peut louer un équipement pour 80 000 $/an (charges fixes) ou l'acheter avec 120 000 $ de charges fixes. Le coût variable est de 45 $/unité et le prix de vente de 80 $. À 5 000 unités, quelle option est plus rentable après 25 % d'impôt ?",
	'cvp.scenario.restaurant.title': "Seuil de rentabilité d'un restaurant",
	'cvp.scenario.restaurant.desc':
		"Un restaurant propose des repas à 25 $ en moyenne avec 10 $ de coûts variables (nourriture et main-d'oeuvre). Les charges fixes mensuelles sont de 45 000 $. Le propriétaire vise 30 000 $ de résultat net après 20 % d'impôt.",
	'cvp.scenario.saas.title': "Modèle d'abonnement SaaS",
	'cvp.scenario.saas.desc':
		"Une entreprise SaaS facture 29 $/mois par utilisateur avec 1,20 $ de coûts serveur variables. Les charges fixes totalisent 180 000 $/mois. L'objectif est 50 000 $ de résultat net à 25 % d'impôt.",
	'cvp.scenario.icecream.title': 'Stand de glaces saisonnier',
	'cvp.scenario.icecream.desc':
		'Un stand de glaces fonctionne 5 mois par an. Chaque cornet se vend 6 $ avec 2,50 $ de coûts variables. Les charges fixes saisonnières sont de 36 000 $. Le propriétaire vise 20 000 $ après 15 % d\'impôt.',
	'cvp.scenario.aftertax.title': 'Objectif de résultat net',
	'cvp.scenario.aftertax.desc':
		"Un distributeur vend des marchandises à 75 $ avec 30 $ de coût variable et 200 000 $ de charges fixes. Le conseil exige 100 000 $ de résultat net après 30 % d'impôt.",
	'cvp.scenario.bakery.title': 'Boulangerie de quartier',
	'cvp.scenario.bakery.desc':
		"Une boulangerie vend des pains artisanaux à 12 $ pièce avec 4 $ de coûts variables. Les charges fixes mensuelles sont de 25 000 $. L'objectif : 15 000 $ de résultat net après 20 % d'impôt.",
	'cvp.scenario.ohada.title': 'Fabricant zone OHADA',
	'cvp.scenario.ohada.desc':
		"Un fabricant SYSCOHADA en zone CEMAC vend des unités à 2 500 FCFA avec 1 500 FCFA de charges variables. Les charges fixes totalisent 5 000 000 FCFA. L'objectif est un résultat net de 3 000 000 FCFA après 30 % d'impôt.",

	/* Exercises */
	'cvp.ex.title': 'Exercices',
	'cvp.ex.select': 'Sélectionner un exercice',
	'cvp.ex.randomize': 'Nouveaux chiffres',
	'cvp.ex.check': 'Vérifier',
	'cvp.ex.correct': 'Correct !',
	'cvp.ex.incorrect': 'Pas tout à fait — revoyez vos saisies et réessayez.',
	'cvp.ex.partial': 'Partiellement correct — certaines valeurs sont fausses.',
	'cvp.ex.empty': 'Saisissez votre réponse avant de vérifier.',

	'cvp.ex.bep.title': 'Trouver le seuil de rentabilité',
	'cvp.ex.bep.desc':
		'Prix, coût variable et charges fixes donnés — trouver le volume au seuil de rentabilité.',
	'cvp.ex.bep.prompt':
		'Une entreprise vend à {price} par unité avec un coût variable de {variableCost} par unité et des charges fixes de {fixedCosts}. Trouvez le seuil de rentabilité (unités, arrondi supérieur).',
	'cvp.ex.bep.answerLabel': 'Seuil (unités)',

	'cvp.ex.target.title': 'Volume cible (avant impôt)',
	'cvp.ex.target.desc': 'Trouver le volume nécessaire pour atteindre un profit cible avant impôt.',
	'cvp.ex.target.prompt':
		"Prix {price}, coût variable {variableCost}, charges fixes {fixedCosts}. Combien d'unités pour atteindre un résultat de {targetProfit} ?",
	'cvp.ex.target.answerLabel': 'Volume cible',

	'cvp.ex.aftertax.title': 'Volume cible après impôt',
	'cvp.ex.aftertax.desc':
		'Convertir un objectif de résultat net en équivalent avant impôt, puis résoudre.',
	'cvp.ex.aftertax.prompt':
		"Prix {price}, coût variable {variableCost}, charges fixes {fixedCosts}. Combien d'unités pour un résultat net de {targetProfit} avec un taux d'imposition de {taxRate}% ?",
	'cvp.ex.aftertax.answerLabel': 'Volume cible après impôt',

	'cvp.ex.mos.title': 'Marge de sécurité %',
	'cvp.ex.mos.desc': 'Calculer la marge de sécurité au volume actuel.',
	'cvp.ex.mos.prompt':
		'Prix {price}, coût variable {variableCost}, charges fixes {fixedCosts}, volume actuel {volume}. Quelle est la marge de sécurité (%) ?',
	'cvp.ex.mos.answerLabel': 'Marge de sécurité %',

	'cvp.ex.dol.title': "Levier d'exploitation",
	'cvp.ex.dol.desc': "Calculer le levier d'exploitation au point actuel.",
	'cvp.ex.dol.prompt':
		"Prix {price}, coût variable {variableCost}, charges fixes {fixedCosts}, volume actuel {volume}. Quel est le levier d'exploitation ?",
	'cvp.ex.dol.answerLabel': 'LOE',

	/* General */
	'cvp.general.units': 'unités',
	'cvp.general.currency': 'devise',
	'cvp.general.infinity': '∞',

	/* Worked solution */
	'cvp.worked.title': 'Solution détaillée',
	'cvp.worked.stepCM': 'Étape 1 — Calcul de la MCV',
	'cvp.worked.stepBEP': 'Étape 2 — Seuil de rentabilité',
	'cvp.worked.stepTarget': 'Étape 3 — Volume cible',
	'cvp.worked.stepMoS': 'Étape 4 — Marge de sécurité',
	'cvp.worked.stepDOL': 'Étape 5 — Levier opérationnel',
};
