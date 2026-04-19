# Les mathématiques — Valeur actuelle et échéance

## La formule d'annuité

Pour un prêt amortissable standard de capital $P$, de taux périodique $r$ et de $n$ périodes, l'échéance constante $A$ vaut :

$$A = P \cdot \frac{r}{1 - (1 + r)^{-n}}$$

C'est l'unique montant qui, actualisé au taux $r$, donne une valeur actuelle égale à $P$. Le numérateur représente l'intérêt sur le capital total ; le dénominateur est un facteur d'annuité qui répartit ce coût sur $n$ périodes.

## D'où vient le taux

Le **taux nominal annuel** affiché au contrat (par ex. 8 %) est divisé par la fréquence pour obtenir le **taux périodique** :

- Mensuel : $r = 8\,\% / 12 = 0{,}6667\,\%$
- Trimestriel : $r = 8\,\% / 4 = 2{,}0\,\%$
- Semestriel : $r = 8\,\% / 2 = 4{,}0\,\%$

Cette convention *nominale* (dite *simple*) est la norme pour les crédits en zone OHADA, en France et aux États-Unis.

## Dynamique période par période

L'intérêt de la période est :

$$I_k = r \cdot B_{k-1}$$

où $B_{k-1}$ est le capital restant dû en début de période. La part de capital vaut alors :

$$P_k = A - I_k$$

et le nouveau capital restant devient $B_k = B_{k-1} - P_k$. En début de prêt amortissable, $B_{k-1}$ est élevé, donc $I_k$ est élevé et $P_k$ faible — les intérêts sont concentrés devant. En fin de prêt, $B_{k-1}$ est faible et presque tout l'échéance est du capital.

## Cas limite : taux nul

Si $r = 0$ la formule dégénère (division par zéro). Dans ce cas l'échéance se ramène à $A = P / n$ — amortissement linéaire sans intérêts. Le moteur gère cette situation proprement.
