# L'état à deux colonnes

## Format SYSCOHADA

La comptabilité de la zone OHADA (et la tradition française dont elle hérite) utilise un **état de rapprochement à deux colonnes** : côté banque à gauche, côté livres à droite. Chaque côté part de son solde brut de clôture et descend jusqu'au même chiffre véritable de trésorerie.

| **Selon le relevé** | | **Selon le grand-livre** | |
|---|---:|---|---:|
| Solde du relevé | 500 000 | Solde comptable | 520 000 |
| + Dépôts en transit | 50 000 | + Intérêts créditeurs | 0 |
| − Chèques non encaissés | (30 000) | − Frais bancaires | 0 |
| ± Erreurs de la banque | 0 | − Chèques impayés | 0 |
| | | ± Erreurs de l'entreprise | 0 |
| **Solde rapproché** | **520 000** | **Solde rapproché** | **520 000** |

Les deux soldes rapprochés **doivent** être égaux. Sinon, un élément manque ou est mal classé.

## Pourquoi deux colonnes ?

Le format à deux colonnes rend la symétrie visible : chaque élément de rapprochement apparaît sur exactement un côté, selon la partie qui doit agir. Il sert aussi de contrôle — si vous régularisez par erreur les deux côtés pour un même élément, les soldes rapprochés divergent du double du montant, et l'erreur saute aux yeux.

## L'écart

Le résultat final — `banque rapprochée − livres rapprochés` — est l'**écart**. Lorsqu'il est nul (au centime près), le travail est terminé. Lorsqu'il est non nul, il correspond au montant de l'élément manquant ou mal classé.
