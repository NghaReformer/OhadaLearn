# Remboursements anticipés et versements supplémentaires

## Deux stratégies

Les emprunteurs remboursent par anticipation pour des raisons variées, et la *manière* de le faire change sensiblement le résultat.

### Raccourcir la durée (échéance inchangée)

L'emprunteur maintient l'échéance contractuelle et affecte le versement supplémentaire au capital. Les intérêts courent sur un solde plus faible, donc le prêt est soldé plus vite et le coût total des intérêts diminue.

Effet : **durée diminue**, échéance inchangée.

### Réduire l'échéance (durée inchangée)

L'emprunteur garde l'échéance d'origine mais ré-amortit le capital restant — échéances plus petites sur la durée initiale. Le coût total des intérêts baisse aussi, mais moins que dans la première stratégie.

Effet : **échéance diminue**, durée inchangée.

Le playground implémente actuellement la première stratégie : les versements supplémentaires attaquent directement le capital, les périodes postérieures à la dernière ligne payée sont retirées et le total des intérêts chute en proportion.

## Clauses de pénalité

La plupart des contrats prévoient une **indemnité de remboursement anticipé (IRA)** — généralement en pourcentage du montant remboursé :

- En OHADA, les pénalités au-delà de 2 % sont rares en crédit conso.
- En droit français, l'IRA sur un *crédit immobilier* est plafonnée à six mois d'intérêts sur le capital remboursé ou 3 % du capital restant (le moindre des deux).
- Aux US, les pratiques varient — la plupart des prêts conformes modernes n'ont aucune pénalité.

Le moteur comptabilise la pénalité à la période du remboursement anticipé. L'écriture comprend trois lignes :

| Ligne | Débit | Crédit |
|-------|-------|--------|
| Emprunt (162) | `extra` | |
| Charges HAO (831) | `extra × pénalité %` | |
| Banque (521) | | `extra + extra × pénalité %` |

## Versements périodiques vs ponctuels

- **Versements périodiques** — montant fixe ajouté à chaque échéance. Idéal pour les surperformeurs réguliers.
- **Versement ponctuel** — un seul versement à une période choisie : prime, cession d'actif, refinancement.

Les deux peuvent être cumulés dans le playground pour observer leur effet sur la courbe du capital.

## Quand rembourser ?

Le remboursement anticipé est rationnel quand le coût d'opportunité de la trésorerie (taux sans risque ou rendement attendu d'un investissement) est **inférieur** au taux d'intérêt effectif du prêt. Si le prêt est à 8 % et un placement sûr rapporte 4 %, rembourser économise 4 % net. Si le prêt est à 6 % et un investissement métier rapporte 15 %, garder le prêt et déployer la trésorerie.
