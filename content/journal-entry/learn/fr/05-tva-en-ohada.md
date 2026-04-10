# La TVA dans le SYSCOHADA

## Vue d'ensemble

La **Taxe sur la Valeur Ajoutée (TVA)** est un impôt indirect appliqué à chaque étape de la chaîne d'approvisionnement. Dans la zone OHADA, le taux standard varie selon le pays. Le Cameroun applique un taux de **19,25 %** souvent utilisé comme référence.

## Les Comptes Clés de TVA

| Code | Intitulé | Solde normal |
|------|----------|-------------|
| `4431` | TVA facturée sur ventes | Créditeur |
| `4451` | TVA récupérable sur achats | Débiteur |
| `4441` | TVA due (État) | Créditeur |

## Comptabilisation d'une Vente avec TVA

Vente de marchandises pour 2 500 000 FCFA + TVA 19,25 % :

- Montant TVA : 2 500 000 × 19,25 % = **481 250 FCFA**
- Total encaissé : **2 981 250 FCFA**

| Compte | Débit | Crédit |
|--------|-------|--------|
| `521` Banque | 2 981 250 | |
| `701` Ventes de marchandises | | 2 500 000 |
| `4431` TVA facturée sur ventes | | 481 250 |

## Comptabilisation d'un Achat avec TVA

Achat de marchandises pour 1 200 000 FCFA + TVA 19,25 % :

- Montant TVA : 1 200 000 × 19,25 % = **231 000 FCFA**
- Total réglé : **1 431 000 FCFA**

| Compte | Débit | Crédit |
|--------|-------|--------|
| `601` Achats de marchandises | 1 200 000 | |
| `4451` TVA récupérable sur achats | 231 000 | |
| `401` Fournisseurs | | 1 431 000 |

## Liquidation de la TVA

En fin de période, l'entreprise calcule sa position nette de TVA :

- **TVA collectée** (4431) − **TVA déductible** (4451) = **TVA à payer** (4441)

Si la TVA collectée dépasse la TVA déductible, l'entreprise doit la différence à l'État. Dans le cas contraire, l'entreprise dispose d'un crédit de TVA à reporter.

| Compte | Débit | Crédit |
|--------|-------|--------|
| `4431` TVA facturée sur ventes | 481 250 | |
| `4451` TVA récupérable sur achats | | 231 000 |
| `4441` TVA due | | 250 250 |
