# Résultat Cible

## Résultat cible avant impôt

Souvent la question n'est pas « combien d'unités pour le seuil », mais « combien d'unités pour atteindre un résultat cible ».

$$Q = \frac{\text{Charges fixes} + \text{Résultat cible}}{\text{MCV unitaire}}$$

La logique est identique au seuil de rentabilité, sauf que le numérateur inclut désormais le résultat souhaité *en plus* de la couverture des charges fixes. Chaque unité de MCV remplit d'abord le seau des charges fixes, puis celui du résultat cible.

## Résultat net visé — « grossir » d'abord

Si la cible est un *résultat net* (après impôt), il faut d'abord « grossir » pour obtenir le résultat avant impôt nécessaire :

$$\text{Cible avant impôt} = \frac{\text{Cible après impôt}}{1 - t}$$

où $t$ est le taux effectif d'impôt (décimal). Ensuite on utilise la formule standard :

$$Q = \frac{\text{CF} + \text{Cible avant impôt}}{\text{MCV}}$$

## Exemple

Charges fixes 200 000 €. Prix 75 €, coût variable 30 € — donc MCV = 45 €. Résultat net cible 100 000 € à 30% d'impôt.

1. Grossissement : 100 000 / (1 − 0,30) = **142 857 €**
2. Volume requis : (200 000 + 142 857) / 45 = **7 619 unités**

## Pièges

- **Confondre résultat opérationnel et résultat net.** Toujours préciser si la cible est avant impôt (résultat opérationnel) ou après impôt (résultat net) — les formules divergent par le facteur fiscal.
- **Taux d'impôt proche de 100%.** Quand $t$ tend vers 1, la cible grossie explose. Le playground limite le taux effectif à 99,99% pour éviter la division par zéro.
- **Supposer l'impôt en situation de perte.** La plupart des régimes fiscaux ne remboursent pas les pertes — donc lorsque le résultat opérationnel est négatif, l'impôt effectif est zéro, pas négatif. Le playground gère cela automatiquement.
