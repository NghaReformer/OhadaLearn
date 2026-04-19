# Les méthodes d'amortissement

## Annuité (méthode française)

La plus répandue dans le monde. Chaque échéance est identique sur toute la durée du prêt. Les intérêts sont élevés au départ (capital restant dû important) et diminuent à mesure que le capital se rembourse. Formule de base :

$$A = P \cdot \frac{r}{1 - (1+r)^{-n}}$$

**Utilisations :** crédit immobilier, crédit conso, prêts PME à moyen terme.
**Avantages :** flux de trésorerie prévisibles.
**Inconvénients :** coût total des intérêts plus élevé qu'en linéaire.

## Linéaire (amortissement constant)

Le capital remboursé chaque période est fixe, égal à $P/n$. Les intérêts sont calculés sur le capital restant dû, ce qui fait que **les échéances décroissent** : la première est la plus lourde, la dernière la plus légère.

**Utilisations :** financement d'équipement, prêts souverains et multilatéraux d'infrastructure.
**Avantages :** moins d'intérêts ; le capital se réduit plus vite.
**Inconvénients :** effort de trésorerie important en début de prêt.

## In fine (bullet)

Seuls les intérêts sont payés pendant la durée. Le capital est remboursé en totalité à l'échéance finale.

**Utilisations :** lignes relais, euro-obligations, certains crédits revolving.
**Avantages :** sortie de trésorerie faible ; le fonds de roulement est préservé.
**Inconvénients :** risque de refinancement et choc de remboursement à la maturité.

## Échéances progressives

L'échéance augmente d'un taux fixe $g$ chaque période — souvent utilisée lorsque le revenu de l'emprunteur est supposé croître avec l'inflation. Les premières échéances sont volontairement allégées, les dernières plus lourdes. La première échéance satisfait :

$$A_1 = P \cdot \frac{r - g}{1 - \left(\frac{1+g}{1+r}\right)^n}$$

**Utilisations :** prêts immobiliers longs en économies inflationnistes.
**Avantages :** accessible au démarrage ; suit la croissance du revenu.
**Inconvénients :** amortissement négatif possible si $g$ est trop élevé.

## Amortissement avec ballon

Un mix entre annuité et in fine : échéances amortissables normales sur la majeure partie de la durée, puis un **ballon** à une période choisie qui solde un capital résiduel important.

**Utilisations :** LOA automobile, crédits soumis à un plafond réglementaire de durée d'amortissement.
**Avantages :** flexibilité — possibilité de refinancer, de renouveler ou de solder.
**Inconvénients :** l'emprunteur doit anticiper le ballon ; pénalités en cas de défaut.
