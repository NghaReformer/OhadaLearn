# Capitalisation continue

## La limite

$$VF = C \cdot e^{i \cdot n}$$

La capitalisation continue s'obtient en faisant tendre la période de capitalisation vers zéro. Pas de périodes discrètes — une courbe exponentielle lisse qui croît au taux instantané `i`.

## D'où elle vient

Partez de la formule composée discrète et faites tendre `m → ∞` :

$$\lim_{m \to \infty} \left(1 + \frac{i}{m}\right)^{m \cdot n} = e^{i \cdot n}$$

La constante `e ≈ 2,71828` apparaît ici pour la même raison qu'elle apparaît partout en analyse : c'est la base pour laquelle un processus de capitalisation croît à un rythme égal à lui-même. Le lien entre intérêts composés et `e` n'est pas une coïncidence — c'est la raison historique de la découverte de `e` (par Bernoulli, en 1683, en étudiant précisément ce problème).

## Pertinence pratique

Pour la plupart des produits grand public vous ne rencontrerez jamais de taux coté en capitalisation continue. Mais :

- **La valorisation des dérivés** (Black-Scholes, arbres binomiaux) utilise par défaut la capitalisation continue. La norme IFRS 13 *Évaluation de la juste valeur* adopte cette convention.
- **Les modèles de risque** — VaR et espérance de perte en queue supposent typiquement une capitalisation continue.
- **La planification d'investissement à horizon long** — dès que la durée se mesure en décennies, la différence entre journalier et continu est habituellement inférieure à l'erreur d'arrondi.

## Conversion entre conventions

Si vous disposez d'un taux coté en continu `i_c` et cherchez un TIE discret équivalent :

$$\text{TIE} = e^{i_c} - 1$$

Dans l'autre sens :

$$i_c = \ln(1 + \text{TIE})$$

Le playground affiche à la fois l'équivalent continu et le TIE dans le panneau Synthèse des taux — changez de mode pour voir comment ils s'alignent.

## Une note esthétique

La courbe continue est le cas mathématiquement beau. Aucun point anguleux, aucune discontinuité, aucun moment « fin de période ». Elle croît de `i%` d'elle-même par *instant* — la loi de croissance la plus naturelle possible. Les étudiants qui intègrent cela raisonnent ensuite plus proprement sur les problèmes temporels.
