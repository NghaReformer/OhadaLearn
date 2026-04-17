import type { TranslationMap } from '../types';

export const tvmFr: TranslationMap = {
	/* ── Sélecteur de mode ── */
	'tvm.mode.pv': 'Valeur actuelle',
	'tvm.mode.fv': 'Valeur future',
	'tvm.mode.pmt': 'Paiement',
	'tvm.mode.rate': 'Taux',
	'tvm.mode.periods': 'P\u00e9riodes',
	'tvm.mode.solveFor': 'Inconnue \u00e0 r\u00e9soudre',

	/* ── Entr\u00e9es globales ── */
	'tvm.global.pv': 'Valeur actuelle (VA)',
	'tvm.global.fv': 'Valeur future (VF)',
	'tvm.global.pmt': 'Paiement (PMT)',
	'tvm.global.rate': 'Taux nominal annuel',
	'tvm.global.periods': 'P\u00e9riodes',
	'tvm.global.periodsUnit': 'Unit\u00e9 des p\u00e9riodes',
	'tvm.global.compounding': 'Capitalisation',
	'tvm.global.payFreq': 'Fr\u00e9quence des paiements',
	'tvm.global.timing': 'Positionnement des paiements',
	'tvm.global.currency': 'Devise',

	/* ── Options de fr\u00e9quence ── */
	'tvm.freq.annual': 'Annuelle',
	'tvm.freq.semi': 'Semestrielle',
	'tvm.freq.quarterly': 'Trimestrielle',
	'tvm.freq.monthly': 'Mensuelle',
	'tvm.freq.daily': 'Quotidienne',
	'tvm.freq.continuous': 'Continue',

	/* ── Positionnement / unit\u00e9 ── */
	'tvm.timing.end': 'Fin de p\u00e9riode',
	'tvm.timing.begin': 'D\u00e9but de p\u00e9riode',
	'tvm.timing.endShort': 'Fin',
	'tvm.timing.beginShort': 'D\u00e9but',
	'tvm.unit.years': 'Ann\u00e9es',
	'tvm.unit.months': 'Mois',

	/* ── Carte r\u00e9sultat ── */
	'tvm.result.headline': 'Valeur r\u00e9solue',
	'tvm.result.copy': 'Copier le r\u00e9sultat',
	'tvm.result.copied': 'Copi\u00e9',
	'tvm.result.pending': 'Compl\u00e9tez les entr\u00e9es pour r\u00e9soudre.',
	'tvm.result.noSolution': 'Aucune solution r\u00e9elle n\u2019existe pour ces entr\u00e9es.',
	'tvm.result.interpretation.pv': 'D\u00e9posez ce montant aujourd\u2019hui pour atteindre la valeur future.',
	'tvm.result.interpretation.fv': 'C\u2019est la valeur accumul\u00e9e au terme de l\u2019horizon.',
	'tvm.result.interpretation.pmt': 'Paiement r\u00e9current qui concilie VA et VF.',
	'tvm.result.interpretation.rate': 'Taux nominal annuel implicite des flux de tr\u00e9sorerie.',
	'tvm.result.interpretation.periods': 'Horizon n\u00e9cessaire pour relier VA et VF \u00e0 ce taux.',

	/* ── Convention de signe ── */
	'tvm.signConvention.banner': 'Convention de signe',
	'tvm.signConvention.outflow': 'Sortie',
	'tvm.signConvention.inflow': 'Entr\u00e9e',
	'tvm.signConvention.neutral': 'Sans flux',
	'tvm.signConvention.explain': 'L\u2019argent vers\u00e9 est n\u00e9gatif, l\u2019argent re\u00e7u est positif (convention HP-12C).',

	/* ── D\u00e9tail des calculs ── */
	'tvm.advanced.toggle': 'Afficher le d\u00e9tail',
	'tvm.advanced.hide': 'Masquer le d\u00e9tail',
	'tvm.advanced.title': 'Calcul pas \u00e0 pas',
	'tvm.workings.effectiveRate': 'Taux p\u00e9riodique effectif',
	'tvm.workings.totalPeriods': 'Nombre total de p\u00e9riodes',
	'tvm.workings.solve.pv': 'Formule VA',
	'tvm.workings.solve.fv': 'Formule VF',
	'tvm.workings.solve.pmt': 'Formule PMT',
	'tvm.workings.solve.rate': 'Solveur de taux',
	'tvm.workings.solve.periods': 'Formule des p\u00e9riodes',

	/* ── Formules symboliques ── */
	'tvm.formula.pv': 'VA = \u2212[VF \u00b7 (1+r)^\u2212N + PMT \u00b7 D \u00b7 (1 \u2212 (1+r)^\u2212N) / r]',
	'tvm.formula.fv': 'VF = \u2212[VA \u00b7 (1+r)^N + PMT \u00b7 D \u00b7 ((1+r)^N \u2212 1) / r]',
	'tvm.formula.pmt': 'PMT = \u2212[VA \u00b7 r \u00b7 (1+r)^N + VF \u00b7 r] / [(1+r)^N \u2212 1]',
	'tvm.formula.rate': 'Newton\u2013Raphson sur VA + PMT\u00b7D\u00b7annuit\u00e9 + VF\u00b7(1+r)^\u2212N = 0',
	'tvm.formula.periods': 'N = ln((PMT_eff \u2212 VF\u00b7r) / (PMT_eff + VA\u00b7r)) / ln(1+r)',

	/* ── Validation ── */
	'tvm.validation.requiredField': 'Renseignez {field} pour r\u00e9soudre.',
	'tvm.validation.continuousPmtUndefined': 'La capitalisation continue avec un paiement p\u00e9riodique est math\u00e9matiquement ind\u00e9finie. Mettez PMT \u00e0 z\u00e9ro ou choisissez une fr\u00e9quence discr\u00e8te.',
	'tvm.validation.zeroRateNoPmt': '\u00c0 0 % sans paiement, VA et VF doivent diff\u00e9rer pour qu\u2019une solution existe.',
	'tvm.validation.rateTooNegative': 'Un taux inf\u00e9rieur ou \u00e9gal \u00e0 \u2212100 % par p\u00e9riode n\u2019a pas de sens.',
	'tvm.validation.noConvergence': 'Le solveur de taux n\u2019a pas converg\u00e9. Essayez d\u2019autres valeurs.',
	'tvm.validation.noSolution': 'Aucune solution r\u00e9elle n\u2019existe pour ces entr\u00e9es.',
	'tvm.validation.negativePeriods': 'Les p\u00e9riodes doivent \u00eatre strictement positives.',
	'tvm.validation.invalidNumber': 'Saisissez un nombre valide.',
	'tvm.validation.sameSignPvFv': 'VA et VF ont le m\u00eame signe \u2014 sans paiement, il n\u2019existe pas de taux r\u00e9el.',

	/* ── Exercices ── */
	'tvm.exercise.f01.title': 'D\u00e9p\u00f4t aujourd\u2019hui',
	'tvm.exercise.f01.prompt': 'Vous avez besoin de {fv} dans {years} ans. \u00c0 {rate}\u202f% annuel capitalis\u00e9 mensuellement, combien devez-vous d\u00e9poser aujourd\u2019hui ?',
	'tvm.exercise.f01.correct': 'Correct. Actualisez la valeur future au taux mensuel effectif sur toute la dur\u00e9e.',
	'tvm.exercise.f01.incorrect': 'Presque. R\u00e9solvez la VA avec la formule d\u2019actualisation \u00e0 capitalisation mensuelle.',
	'tvm.exercise.f02.title': '\u00c9pargne retraite',
	'tvm.exercise.f02.prompt': 'Vous versez {pmt} en fin de chaque mois pendant {years} ans. \u00c0 {rate}\u202f% annuel capitalis\u00e9 mensuellement, quelle est la valeur finale\u202f?',
	'tvm.exercise.f02.correct': 'Correct. Capitalisez l\u2019annuit\u00e9 mensuelle au taux mensuel effectif.',
	'tvm.exercise.f02.incorrect': 'Revoyez le calcul : VF d\u2019une annuit\u00e9 ordinaire mensuelle = PMT \u00b7 ((1+r)^N \u2212 1) / r.',
	'tvm.exercise.f03.title': 'Mensualit\u00e9 d\u2019un pr\u00eat auto',
	'tvm.exercise.f03.prompt': 'Un pr\u00eat de {pv} au taux nominal {rate}\u202f%, capitalis\u00e9 mensuellement, amorti sur {years} ans avec paiements en fin de mois. Quelle est la mensualit\u00e9\u202f?',
	'tvm.exercise.f03.correct': 'Correct. Formule standard de mensualit\u00e9 de pr\u00eat sur le taux mensuel effectif.',
	'tvm.exercise.f03.incorrect': 'Utilisez PMT = \u2212[VA \u00b7 r \u00b7 (1+r)^N] / [(1+r)^N \u2212 1] avec le taux mensuel et le nombre total de mois.',
	'tvm.exercise.f04.title': 'Taux implicite',
	'tvm.exercise.f04.prompt': 'Vous avez d\u00e9pos\u00e9 {pv} et {years} ans plus tard le compte vaut {fv}. Aucun autre flux. Quel taux annuel nominal avez-vous obtenu (capitalisation annuelle)\u202f?',
	'tvm.exercise.f04.correct': 'Correct. Sans paiement, le taux vaut (VF/VA)^(1/N) \u2212 1.',
	'tvm.exercise.f04.incorrect': 'Sans PMT il existe une formule ferm\u00e9e : r = (|VF/VA|)^(1/N) \u2212 1. Rappelez-vous que VA et VF ont des signes oppos\u00e9s.',

	/* ── Sc\u00e9narios ── */
	'tvm.scenario.autoLoan.title': 'Mensualit\u00e9 d\u2019un pr\u00eat auto',
	'tvm.scenario.autoLoan.desc': 'Pr\u00eat auto de 3\u202f500\u202f000 XOF sur 5 ans \u00e0 9\u202f% nominal, capitalisation et paiements mensuels, fin de mois.',
	'tvm.scenario.retirement.title': '\u00c9pargne retraite',
	'tvm.scenario.retirement.desc': '\u00c9pargne mensuelle de 50\u202f000 XAF pendant 25 ans \u00e0 7\u202f% annuel capitalis\u00e9 mensuellement, versements en fin de mois.',
	'tvm.scenario.savingsGoal.title': 'D\u00e9p\u00f4t initial pour un objectif',
	'tvm.scenario.savingsGoal.desc': 'Montant \u00e0 d\u00e9poser aujourd\u2019hui pour d\u00e9tenir 10\u202f000\u202f000 XOF dans 4 ans \u00e0 6,5\u202f% annuel capitalis\u00e9 mensuellement.',

	/* ── Divers ── */
	'tvm.panel.inputs': 'Entr\u00e9es',
	'tvm.panel.result': 'R\u00e9sultat',
	'tvm.panel.global': 'Global',
	'tvm.panel.cashflow': 'Flux de tr\u00e9sorerie',
	'tvm.badge.advanced': 'Avanc\u00e9'
};
