# Franchise — partielle ou totale

## Qu'est-ce qu'une franchise ?

La **franchise** (ou *différé*) est une fenêtre en début de prêt pendant laquelle l'échéancier normal est suspendu. Elle est fréquente pour les projets dont l'actif doit être construit et opérationnel avant de pouvoir servir la dette — construction, agriculture, gros équipements, infrastructures.

## Deux formes

### Franchise partielle (*différé partiel*)

Seuls les intérêts sont versés pendant la période de franchise. Le capital reste intact. À l'issue de la franchise, **un échéancier amortissable normal** s'enclenche sur le capital d'origine pour la durée restante.

Effet : on paie les intérêts sur le capital complet plus longtemps, donc le coût total des intérêts augmente légèrement. Mais aucune pression de remboursement de capital pendant le démarrage.

### Franchise totale (*différé total*)

Rien n'est versé pendant la franchise — mais les intérêts courent. Ces intérêts courus sont **capitalisés** au capital, qui augmente. À la fin de la franchise, le nouveau capital (plus élevé) s'amortit sur la durée restante.

Effet : le capital restant dû *augmente* pendant la franchise, puis s'amortit. On parle d'**amortissement négatif**, signal d'alerte dans certaines réglementations (IFRS, règles consommateur US imposant des informations explicites).

## Impact comptable

| Étape | Trésorerie | Résultat | Bilan |
|-------|------------|----------|-------|
| Franchise partielle | Sortie = intérêts | Charge d'intérêts | Dette inchangée |
| Franchise totale | Aucune | Charge d'intérêts | Dette **augmente** (capitalisée) |
| Après franchise | Sortie = échéance complète | Intérêts + capital | Dette diminue |

L'écriture `grace-capitalization` du playground modélise le cas du différé total : débit compte 671 Intérêts, crédit compte 162 Emprunts. Pas de ligne trésorerie.

## Pièges classiques

- **Double-comptage des intérêts.** Certains tableurs calculent l'échéancier post-franchise sur le capital *initial* même en différé total. Cela sous-estime le coût total de façon sensible sur les prêts longs.
- **Covenants oubliés.** La franchise totale gonfle le ratio dette/EBITDA au moment où le levier est maximal. Vérifier la définition exacte des covenants avant de retenir cette structure.
