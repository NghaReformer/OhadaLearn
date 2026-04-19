# Taux variables et échéanciers de taux

## Pourquoi les taux bougent en cours de prêt

La plupart des crédits long terme en zone OHADA, UE et US sont **indexés** sur un taux de référence — TIBEUR, EURIBOR, SOFR — majoré d'une marge fixe. Quand la référence bouge, le taux périodique du prêt bouge aussi, soit en continu, soit à des dates de révision fixes, soit par paliers contractuels.

## Trois schémas

1. **Révisions périodiques.** Le taux relit la référence à chaque échéance. Très variable mais fréquent pour le financement du commerce à court terme.
2. **Paliers progressifs ou dégressifs.** Le contrat définit explicitement des révisions à, par exemple, 12, 24 et 60 mois. Prévisible pour l'emprunteur, facile à modéliser.
3. **Tunnels cap / floor.** Le taux flotte mais reste borné par un maximum et un minimum. Le chemin effectif du taux est une version écrêtée de l'indice.

Le playground modélise le schéma (2) : on ajoute une ligne par révision, avec `fromPeriod` et `newRate` applicable à partir de cette période.

## Comment une révision remodèle l'échéancier

Quand une révision intervient sur un prêt annuité, l'échéance est **recalculée** de sorte que le capital restant s'amortisse au nouveau taux sur les périodes restantes :

$$A' = B_k \cdot \frac{r'}{1 - (1+r')^{-(n-k)}}$$

où $B_k$ est le capital au moment de la révision, $r'$ le nouveau taux périodique et $n-k$ les périodes restantes. Pour les méthodes linéaire et in fine, le recalcul se limite à la colonne intérêts des lignes restantes.

## Reporting et information

- La charge d'intérêt de chaque période est calculée au taux applicable à cette période.
- En IFRS 9, le **taux d'intérêt effectif (TIE)** est le taux qui égalise tous les flux futurs à la valeur comptable initiale. Lors des révisions, le TIE est recalculé prospectivement.
- En SYSCOHADA, un traitement au taux nominal est admis pour les prêts sans coûts de transaction significatifs.

## Lecture

Le tableau d'amortissement fait apparaître un drapeau **« rate-change »** précisément à la période où le nouveau taux prend effet. Sur le graphique des échéances empilées, la barre d'intérêts fait un saut (ou une chute) et la courbe du capital restant s'incurve.
