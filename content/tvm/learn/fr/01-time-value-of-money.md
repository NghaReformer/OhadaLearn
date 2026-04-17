# La valeur temporelle de l'argent

Un franc détenu aujourd'hui vaut plus qu'un franc promis demain. La raison est l'opportunité : le franc d'aujourd'hui peut être déposé, prêté ou investi pour générer un rendement avant que demain n'arrive. Tout problème de TVM n'est qu'une arithmétique de cette opportunité.

## L'équation universelle

Les cinq variables clés — Valeur Actuelle (VA), Valeur Future (VF), Paiement (PMT), taux (r) et nombre de périodes (N) — figurent dans une seule équation :

$$0 = VA + PMT \cdot D \cdot \frac{1 - (1+r)^{-N}}{r} + VF \cdot (1+r)^{-N}$$

`D` vaut 1 pour les annuités ordinaires (fin de période) et `(1+r)` pour l'annuité due (début de période). Choisissez quatre des cinq variables et l'équation détermine la cinquième.

## Convention de signe (HP-12C)

Le calculateur suit la convention de flux de trésorerie utilisée par la HP-12C, la TI-BA II Plus et les fonctions `VA`/`VC`/`PMT` d'Excel :

- Les **sorties** (l'argent que vous versez) sont **négatives**.
- Les **entrées** (l'argent que vous recevez) sont **positives**.

Un prêt de 1 000 000 XOF saisi avec VA = +1 000 000 produira PMT < 0 (les mensualités qui quittent votre compte). Inversez les signes et le même calcul décrit le prêt de cet argent à un tiers.

## Exemple guidé

Déposez 200 000 XAF aujourd'hui à 8 % annuel capitalisé annuellement pendant 5 ans ; combien aurez-vous ?

- VA = −200 000 (sortie aujourd'hui)
- PMT = 0 (aucun versement supplémentaire)
- N = 5, r = 8 % par an
- Résoudre VF : `VF = −VA · (1+r)^N = 200 000 · 1,08⁵ ≈ 293 866 XAF`

Le résultat est positif — l'argent revient vers vous au terme.
