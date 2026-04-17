# Mix Multi-Produits

## La difficulté

Les formules CVP supposent un produit unique avec une MCV unique. La plupart des entreprises vendent plusieurs produits, à marges différentes. Comment calculer le seuil de rentabilité global ?

## Marge sur coût variable pondérée

On ramène le portefeuille à un seul produit « synthétique » en utilisant le **mix** comme pondération :

$$\text{MCV pondérée} = \sum_i (\text{MCV}_i \times \text{Mix}_i)$$

où $\text{Mix}_i$ est la part en unités du produit $i$ (total 100%).

$$\text{SR total (unités)} = \frac{\text{Charges fixes}}{\text{MCV pondérée}}$$

Le SR individuel de chaque produit est alors sa **part du mix** dans le SR total :

$$\text{SR}_i = \text{SR total} \times \text{Mix}_i$$

## Exemple

| Produit | Prix | CV unitaire | MCV | Mix % |
|---------|------|------------|-----|-------|
| Basic | 40 € | 15 € | 25 € | 60% |
| Premium | 80 € | 40 € | 40 € | 40% |

- MCV pondérée = 0,60 × 25 + 0,40 × 40 = **31 €**
- Charges fixes 62 000 € → SR total = 62 000 / 31 = **2 000 unités**
- SR Basic = 2 000 × 60% = **1 200 unités**
- SR Premium = 2 000 × 40% = **800 unités**

## L'hypothèse de mix — et sa fragilité

Toute l'analyse repose sur la stabilité du mix. Si en réalité les ventes basculent vers les produits à plus faible marge, la MCV pondérée baisse et le SR réel monte — parfois brutalement.

**Pratique défensive** : toujours coupler un SR par mix avec un tableau de sensibilité montrant le SR à ±10% de variation du mix. On découvre souvent qu'un « seuil de rentabilité » n'est qu'une estimation optimiste lorsque les clients glissent vers le bas de gamme.

## Quand le mix ne totalise pas 100%

Le playground signale tout mix qui ne totalise pas 100% exactement. Un mix à 3 produits de 40/40/40 est mathématiquement non défini — d'où viennent les 20 points restants ? Il faut résoudre cette incohérence avant d'agir sur les chiffres.
