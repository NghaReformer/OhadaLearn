# Point d'Indifférence

## Définition

Le **point d'indifférence** est le volume de ventes auquel deux structures de coûts — par exemple « louer vs. acheter » ou « automatiser vs. sous-traiter » — produisent le même résultat opérationnel.

$$Q^* = \frac{CF_A - CF_B}{CV_B - CV_A}$$

Au-dessus de $Q^*$, la structure avec **charges fixes plus élevées mais coût variable plus bas** gagne (le volume amplifie son avantage). En dessous de $Q^*$, la structure avec **charges fixes plus faibles** gagne (inutile d'avoir le volume pour justifier l'overhead).

## Une décision type

Un industriel compare deux options :

- **Option A — Sous-traitance** : 80 000 € de charges fixes, 45 € de coût variable unitaire
- **Option B — Internalisation** : 120 000 € de charges fixes, 35 € de coût variable unitaire

Point d'indifférence : (120 000 − 80 000) / (45 − 35) = **4 000 unités**

- Volume attendu **< 4 000** → sous-traiter (Option A).
- Volume attendu **> 4 000** → internaliser (Option B).
- Exactement 4 000 → les deux options se valent.

## Cas particuliers

**Droites parallèles** — Si les deux options ont le même coût variable unitaire, les droites de coût ne se croisent jamais. L'option à charges fixes les plus faibles *domine* à tout volume. Le playground signale cela par « Droites de coût parallèles ».

**Alternative dominée** — Lorsque le calcul renvoie un volume négatif ou nul, cela signifie qu'une option est pire à tout volume raisonnable (CF *et* CV plus élevés). Ne jamais retenir une alternative dominée ; le playground affiche « X domine sur toute la plage de volumes ».

## Les hypothèses de la formule

L'analyse d'indifférence suppose :

1. **Les charges fixes sont vraiment fixes** dans la fourchette de planification. Si les volumes font basculer vers un nouveau palier de capacité, les charges fixes augmentent par marches.
2. **Les prix de vente sont identiques.** Si la version sous-traitée se vend à un prix réduit (qualité moindre), il faut comparer les résultats CVP complets, pas seulement les coûts.
3. **Pas de facteurs qualitatifs.** Contrôle, qualité, positionnement stratégique, risque fournisseur priment souvent sur le seul point de croisement.
