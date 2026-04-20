# Écritures de régularisation

Tout élément régularisant le **côté livres** du rapprochement produit une écriture comptable. Les éléments ne touchant que le côté banque (dépôts en transit, chèques non encaissés, erreurs bancaires) ne nécessitent aucune écriture.

## Les cinq écritures standard

| Élément | Débit OHADA | Crédit OHADA |
|---|---|---|
| Frais bancaires | 627 — Services bancaires | 521 — Banque |
| Intérêts créditeurs | 521 — Banque | 771 — Intérêts reçus |
| Chèque client impayé | 411 — Clients | 521 — Banque |
| Prélèvement automatique | 62x — Services extérieurs | 521 — Banque |
| Virement permanent reçu | 521 — Banque | 62x — Produits récurrents |

## Multi-référentiel

La même écriture conceptuelle se traduit par des codes de compte différents selon le référentiel :

- **OHADA** : 627 / 521 pour les frais bancaires
- **PCG français** : 627 / 512
- **IFRS** : Other Service Charges / Cash & Equivalents
- **US GAAP** : Bank Service Charges / Cash

Le playground résout les codes automatiquement lorsque vous changez de référentiel.

## Erreurs de l'entreprise

Pour les erreurs de l'entreprise, l'écriture corrective dépend de ce qui a été initialement mal comptabilisé. Le playground propose une écriture provisoire contre un **compte d'attente** (472 en OHADA), qu'un comptable affine ensuite.
