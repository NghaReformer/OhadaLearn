# Taux effectif vs taux nominal

## La formule fondamentale

$$\text{TIE} = \left(1 + \frac{i}{m}\right)^m - 1$$

Le **taux d'intérêt effectif** (TIE), ou taux annuel effectif, est le véritable rendement annualisé une fois la capitalisation prise en compte. Le **taux nominal** est simplement ce que le contrat affiche avant ajustement.

Pour le cas continu :

$$\text{TIE} = e^i - 1$$

## Le piège classique

Un prêt coté à « 12 % l'an, capitalisé mensuellement » ne coûte *pas* réellement 12 % par an. Le coût réel est :

$$\left(1 + \frac{0{,}12}{12}\right)^{12} - 1 = 0{,}126825 = 12{,}6825\,\%$$

Sur un solde de 1 000 000 FCFA, cela représente 6 825 FCFA d'intérêts supplémentaires la première année — non pas à cause d'un taux plus élevé, mais du mécanisme de capitalisation caché dans la cotation.

## Pourquoi les banques utilisent les taux nominaux

Les taux nominaux sont plus faciles à comparer entre produits de fréquences différentes. Ils constituent aussi le chiffre qui apparaît habituellement dans les conventions de prêt pour des raisons réglementaires : la plupart des régimes d'information obligent à publier le taux « affiché » ou « nominal », même lorsque le taux effectif est le chiffre le plus significatif.

Cela crée une asymétrie d'information. Une banque peut proposer un prêt à « 11,8 % nominal, mensuel » et un concurrent à « 12,0 % nominal, annuel ». Le premier prêt est le moins cher des deux, mais uniquement si le client effectue la conversion.

## Inverser la formule

Pour retrouver le taux nominal à partir d'un TIE coté :

$$i = m \cdot \left((1 + \text{TIE})^{1/m} - 1\right)$$

Cela revient fréquemment lors de la conversion entre informations IFRS (qui publient le TIE) et déclarations fiscales locales (qui exigent souvent des équivalents nominaux).

## Sous SYSCOHADA Révisé et IFRS 9

Depuis SYSCOHADA Révisé (2017) et IFRS 9 (obligatoire en 2018), tous les instruments financiers classés au « coût amorti » sont évalués avec le taux d'intérêt effectif — jamais avec le taux nominal. Cela concerne :

- Les prêts à recevoir et à payer
- Les placements obligataires
- Les créances clients avec composante de financement significative
- Les créances de location-financement

La section suivante explique ce que « évalué avec le TIE » signifie concrètement pour la valeur comptable d'une obligation.
