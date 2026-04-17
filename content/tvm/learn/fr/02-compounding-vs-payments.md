# Capitalisation vs fréquence des paiements

La plupart des calculateurs réunissent « capitalisation » et « paiement » dans un seul sélecteur de fréquence. C'est un raccourci qui s'effondre dès qu'un produit réel décrit l'intérêt d'une façon et les échéances d'une autre — une obligation accumule des intérêts semestriellement mais paie trimestriellement ; un prêt capitalise quotidiennement mais facture mensuellement.

## Deux taux distincts

- **Fréquence de capitalisation** — la cadence à laquelle la banque convertit une fraction de l'intérêt annuel en principal.
- **Fréquence de paiement** — la cadence à laquelle l'argent change effectivement de mains.

Lorsque les deux coïncident, le calculateur utilise simplement le taux périodique `r/m`. Lorsqu'elles diffèrent, le calculateur construit d'abord le **Taux Effectif Annuel (TEA)** puis le convertit vers le taux par paiement :

$$\text{TEA} = \left(1 + \frac{r}{m_{\text{cap}}}\right)^{m_{\text{cap}}} - 1, \qquad r_{\text{pay}} = (1 + \text{TEA})^{1/m_{\text{pay}}} - 1$$

Sans cette étape, chaque facteur d'annuité est faux de quelques points de base — peu par période, beaucoup sur un horizon de 25 ans.

## Capitalisation continue

Choisir « Continue » désactive l'entrée de paiement : $$e^{rt}$$ décrit une accumulation sans frottement, pas des flux discrets. À utiliser pour le prix des obligations, les modèles d'options et les exercices académiques ; pour les prêts et l'épargne réels, ce sont les fréquences discrètes que les banques pratiquent.

## En cas de doute

Réglez les deux fréquences à la même valeur. Le résultat est la formule d'annuité classique. Ne vous en écartez que lorsque le produit se comporte réellement ainsi — et documentez le choix à côté du résultat.
