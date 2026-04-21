# Intérêts composés

## La formule

$$VF = C \cdot \left(1 + \frac{i}{m}\right)^{m \cdot n}$$

- **C** — capital
- **i** — taux nominal annuel
- **m** — périodes de capitalisation par an
- **n** — durée en années

La valeur future `VF` est le solde en fin de durée, **pas** les intérêts. Les intérêts valent `VF − C`.

## L'idée clé

À chaque période, les intérêts accumulés sont *ajoutés au capital*. À la période suivante, les intérêts sont calculés sur cette base augmentée. C'est « l'intérêt qui produit de l'intérêt ». La courbe se courbe vers le haut plus la durée s'allonge — lentement au début, puis de plus en plus vite.

Comparez, pour 1 000 000 FCFA à 10 % sur 5 ans :

- **Intérêts simples :** `I = 1 000 000 × 0,10 × 5 = 500 000` → total `1 500 000`
- **Composés annuellement :** `VF = 1 000 000 × (1,10)^5 = 1 610 510` → intérêts `610 510`

Les 110 510 supplémentaires proviennent entièrement des intérêts sur intérêts. Sur 30 ans, les deux courbes s'éloignent drastiquement.

## Décomposition

Le graphique du Mode 2 divise le total des intérêts en deux bandes empilées :

- **Intérêts sur capital** — la portion égale à `C · i · n` (ce qu'auraient produit les intérêts simples)
- **Intérêts sur intérêts** — tout ce qui dépasse

Pour des durées courtes, la seconde bande est mince. Pour des durées longues, elle domine.

## Période par période

Le tableau par période affiche, pour chaque étape de capitalisation :
- solde de début de période
- intérêts accumulés sur la seule période
- solde de fin de période

Élément crucial : le « montant d'intérêts accumulés sur la seule période » *augmente à chaque période*, alors même que le taux nominal ne change jamais. C'est toute l'idée de la capitalisation.
