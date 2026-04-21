# Coût amorti avec le taux d'intérêt effectif

## Le cadre

Vous achetez une obligation à 5 ans à l'émission. Valeur nominale : 1 000 000 FCFA. Taux de coupon : 8 % annuel. Taux du marché à l'émission : 10 %. Puisque le coupon (8 %) est inférieur à l'exigence du marché (10 %), l'obligation est **émise avec une décote** — vous payez moins que la valeur nominale à l'émission en échange de recevoir la valeur nominale à l'échéance.

Le prix d'émission est la valeur actuelle de tous les flux actualisés au taux du marché :

$$\text{Prix d'émission} = 80{\,}000 \cdot \frac{1 - (1{,}10)^{-5}}{0{,}10} + 1{\,}000{\,}000 \cdot (1{,}10)^{-5} = 924{\,}184$$

Vous payez 924 184 aujourd'hui et recevez (80 000 × 5 = 400 000) de coupons + 1 000 000 à l'échéance = 1 400 000. Gain net : 475 816.

## Deux méthodes pour étaler ce gain

Comment les 475 816 doivent-ils être comptabilisés en charges d'intérêts sur 5 ans dans les livres de l'émetteur (ou en produits d'intérêts dans les livres du porteur) ?

### Méthode linéaire — simple mais biaisée

Répartir la décote (1 000 000 − 924 184 = 75 816) uniformément sur 5 ans. Chaque année :

- Coupon encaissé = 80 000
- Amortissement de la décote = 75 816 / 5 = 15 163
- Charge d'intérêts = 80 000 + 15 163 = 95 163 (identique chaque année)

La valeur comptable monte linéairement de 924 184 à 1 000 000.

### Méthode du TIE — rigoureuse

À chaque période, la charge d'intérêts vaut **la valeur comptable de début multipliée par le taux du marché**. Année 1 :

- Valeur comptable d'ouverture = 924 184
- Charge d'intérêts = 924 184 × 10 % = 92 418
- Coupon encaissé = 80 000
- Amortissement de la décote = 92 418 − 80 000 = 12 418
- Valeur comptable de clôture = 924 184 + 12 418 = 936 603

Année 2 :
- Ouverture = 936 603
- Charge d'intérêts = 936 603 × 10 % = 93 660
- Amortissement de la décote = 13 660
- Clôture = 950 263

La charge d'intérêts augmente chaque année. La valeur comptable *accélère* vers la valeur nominale.

## Pourquoi le TIE est « la bonne méthode »

La méthode du TIE a une propriété cruciale : la charge d'intérêts enregistrée chaque année représente un **rendement effectif constant** sur la valeur comptable. La méthode linéaire, en étalant la décote uniformément, produit un rendement effectif *décroissant* — mentant sur le coût réel du financement dans les années finales.

SYSCOHADA Révisé et IFRS 9 imposent tous deux la méthode du TIE pour cette raison. La méthode linéaire reste courante dans les systèmes hérités et dans les juridictions où la différence est non significative pour de petites obligations.

## Le graphique de divergence

Le Mode 3 visualise l'écart entre les deux courbes de valeur comptable. À l'émission et à l'échéance, les deux méthodes donnent le même chiffre. Entre les deux, elles divergent — l'écart est maximal vers le milieu de la durée. Cet écart représente la différence de charge d'intérêts cumulée comptabilisée selon chaque méthode à tout instant donné.
