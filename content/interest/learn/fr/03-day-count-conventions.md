# Conventions de décompte des jours

## Pourquoi elles existent

Les taux d'intérêt sont cotés « par an », mais la plupart des contrats ne durent pas une année entière. Une convention de décompte est la règle formelle qui convertit un nombre de jours calendaires en une fraction d'année.

Les marchés utilisent des conventions différentes. Appliquer la mauvaise convention à un instrument donné produit un mauvais montant d'intérêts — potentiellement 1 % à 2 % sur une grosse opération. Pour les trésoriers de la zone SYSCOHADA, ce n'est pas académique : c'est la différence entre une écriture comptable correcte et une écriture erronée.

## Les quatre conventions

| Convention | Numérateur (jours) | Dénominateur | Usage typique |
|---|---|---|---|
| **30/360** | Chaque mois compte 30 jours | 360 | Obligations SYSCOHADA long terme, banque européenne, PCG français |
| **Exact/365** | Jours calendaires réels | 365 | Marché obligataire britannique, nombreuses annexes IFRS |
| **Exact/360** | Jours calendaires réels | 360 | Marché monétaire BCEAO/BEAC, marché monétaire US, produits liés au LIBOR |
| **Exact/Exact** | Jours calendaires réels | Jours de l'année concernée (365 ou 366) | Obligations souveraines dans beaucoup de juridictions |

## La surprise du 30/360

En 30/360, les intérêts pour « 31 janvier au 28 février » sont calculés comme si la période durait exactement 28 jours — mais les intérêts du « 28 février au 31 mars » sont calculés comme si elle durait exactement 33 jours (la règle ramène le jour 31 au jour 30 en date de départ, mais mesure ensuite jusqu'à la date de fin réelle, plafonnée à 30). Ces cas de bord pèsent sur les coupons trimestriels d'obligations tombant en fin de mois.

## Quelle convention produit le plus d'intérêts ?

Pour un même taux et mêmes dates :

- **Exact/360** produit le *plus* d'intérêts car le dénominateur est le plus petit
- **Exact/365** et **30/360** se situent au milieu selon la période
- **Exact/Exact** se rapproche le plus d'une juste représentation calendaire sur longues durées

Cela explique pourquoi les instruments monétaires BCEAO paraissent offrir des rendements légèrement supérieurs à des obligations au même taux nominal — c'est le dénominateur, pas le taux.

## Action

Changez le sélecteur **Convention** du playground. Observez l'évolution du total d'intérêts sans modifier le taux ni les dates. L'ampleur du décalage révèle la convention applicable à votre instrument.
