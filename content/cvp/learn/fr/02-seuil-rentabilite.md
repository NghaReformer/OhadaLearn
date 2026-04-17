# Seuil de Rentabilité

## Définition

Le **seuil de rentabilité (SR)** est le volume de ventes auquel le chiffre d'affaires total égale les coûts totaux — ni bénéfice, ni perte.

$$\text{SR (unités)} = \frac{\text{Charges fixes}}{\text{MCV unitaire}}$$

$$\text{SR (ventes)} = \frac{\text{Charges fixes}}{\text{Taux de MCV}}$$

## Intuition

Chaque unité vendue apporte sa MCV à la couverture des charges fixes. Quand la MCV cumulée égale les charges fixes, l'obstacle est franchi — l'unité suivante génère du pur résultat opérationnel.

Le **graphique CVP classique** visualise cela comme l'intersection de la droite du chiffre d'affaires et de la droite du coût total. À gauche du croisement : pertes (zone rouge). À droite : bénéfices (zone verte).

## Règle d'arrondi

En pratique, **arrondir toujours à l'unité supérieure**. On ne vend pas une demi-unité, et vendre SR − 1 unités laisse encore une micro-perte.

Si le SR vaut 4 166,67, il faut pratiquement vendre **4 167 unités** pour entrer dans la zone de bénéfice.

## Ce qui fait varier le SR

- **Augmenter le prix** → MCV plus élevée → SR plus bas (moins d'unités)
- **Réduire le coût variable** → MCV plus élevée → SR plus bas
- **Réduire les charges fixes** → obstacle plus petit → SR plus bas
- **Le volume ne modifie pas le SR** — le volume dit *où l'on est*, pas *où se trouve le SR*

## Quand le SR n'existe pas

Si le coût variable ≥ prix, la MCV est nulle ou négative. Chaque vente soit équilibre juste cette unité (MCV = 0), soit aggrave la perte (MCV < 0). Dans les deux cas, aucun volume ne récupère les charges fixes — le modèle économique est cassé et le SR est indéfini (infini).

Le playground détecte cette situation et affiche un avertissement : **« Le coût variable dépasse le prix — chaque unité vendue creuse la perte. »**
