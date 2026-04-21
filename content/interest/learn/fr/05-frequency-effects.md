# Effets de la fréquence

## Changer m change tout

À taux nominal `i` et durée `n` constants, augmenter la fréquence de capitalisation `m` produit une valeur future plus élevée. Intuitivement : plus *vite* les intérêts accumulés rejoignent la base du capital, plus *vite* ils produisent à leur tour des intérêts.

Pour 1 000 000 FCFA à 10 % nominal sur 5 ans :

| Fréquence | m | VF | TIE |
|---|---|---|---|
| Annuelle | 1 | 1 610 510 | 10,00 % |
| Semestrielle | 2 | 1 628 895 | 10,25 % |
| Trimestrielle | 4 | 1 638 616 | 10,38 % |
| Mensuelle | 12 | 1 645 309 | 10,47 % |
| Journalière | 365 | 1 648 608 | 10,52 % |
| Continue | ∞ | 1 648 721 | 10,52 % |

## Le motif

Chaque augmentation de `m` produit un gain marginal *plus petit* que le précédent. Passer de l'annuel au semestriel ajoute 18 385 FCFA. Passer du mensuel au journalier n'ajoute que 3 299 FCFA. Du journalier au continu, 113 FCFA.

Les gains sont bornés supérieurement. La limite quand `m → ∞` est :

$$VF_\infty = C \cdot e^{i \cdot n}$$

C'est la **capitalisation continue**, le cas le plus propre de tous — aucune périodicité, juste un taux de croissance instantané `i` appliqué pendant une durée `n`.

## Pourquoi c'est important en pratique

La plupart des produits financiers grand public affichent un **taux nominal** plus une **fréquence de capitalisation**. Un compte d'épargne « à 6 % capitalisé journalièrement » et un compte « à 6,09 % capitalisé annuellement » rapportent le *même montant* — le second n'est que la version en taux effectif du premier.

Comprendre cela permet de :

- Comparer sur un pied d'égalité des offres cotées à des fréquences différentes
- Repérer les produits dont le « taux d'appel » est trompeur
- Retraiter un prêt d'une convention à une autre en cas de changement de référentiel comptable

Le Mode 3 de ce playground formalise la conversion.
