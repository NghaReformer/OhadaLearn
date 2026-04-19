# Taux nominal, TAEG et taux effectif

Trois taux différents décrivent le même prêt et répondent à trois questions différentes.

## Taux nominal (la vitrine)

Le taux imprimé au contrat. Répond : **« Quel taux me propose-t-on ? »**

- Ne tient **pas** compte de la capitalisation infra-annuelle.
- Ne tient **pas** compte des frais, de l'assurance ou d'autres coûts.
- Divisé par la fréquence annuelle pour donner le taux périodique utilisé dans les formules.

Exemple : 12 % nominal, capitalisation mensuelle → 1,0 % par mois.

## Taux annuel effectif — TAE (le vrai coût de la capitalisation)

Le rendement qu'obtiendrait un investisseur si le taux périodique du prêt se capitalisait sur une année :

$$\text{TAE} = \left(1 + \frac{r_{nominal}}{m}\right)^m - 1$$

Répond : **« Si je roulais ce taux sur une année, je paierais combien réellement ? »**

Exemple : 12 % nominal mensuel → TAE = $(1 + 0{,}01)^{12} - 1 = 12{,}68\,\%$. Le TAE est toujours ≥ au taux nominal dès que la capitalisation est plus fréquente qu'annuelle.

## TAEG — Taux Annuel Effectif Global (outil réglementaire de comparaison)

Le TAEG est calculé en résolvant le taux qui égalise le **net perçu** et les **sorties totales** (échéances + assurance + frais) sur la durée du prêt :

$$P - F = \sum_{k=1}^{n} \frac{\text{Flux}_k}{(1 + r_{periodic})^k}, \quad \text{TAEG} = r_{periodic} \cdot m$$

Répond : **« Comment comparer ce prêt aux autres, tout compris ? »**

- Réglementé dans de nombreuses juridictions (TEG en France, Truth-in-Lending aux États-Unis, Acte uniforme OHADA sur le crédit).
- Inclut l'assurance obligatoire, les frais de dossier et les pénalités *certaines*.
- Exclut les pénalités de retard et les coûts optionnels.

Exemple : sur un prêt de 10 M FCFA, 60 mois, taux nominal 8 %, frais de dossier 1 % et assurance mensuelle 0,3 %, le TAEG peut ressortir autour de 10,5 % — bien au-dessus du TAE de 8,30 % du taux seul.

## Lequel utiliser ?

| Question | Taux à utiliser |
|----------|----------------|
| Calcul d'échéance mensuelle | Nominal / périodique |
| Comparaison à un rendement de dépôt | TAE |
| Comparaison de deux offres de crédit | TAEG |
| Comptabilisation IFRS 9 d'un prêt | Taux d'intérêt effectif (proche du TAEG) |
| Affichage commercial au client | Nominal (le TAEG doit aussi être affiché) |
