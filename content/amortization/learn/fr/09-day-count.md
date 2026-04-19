# Conventions de décompte des jours

## Pourquoi les conventions comptent

Les intérêts ne connaissent pas les mois ; ils courent **au jour le jour**. Quand prêteur et emprunteur doivent s'accorder sur les intérêts dus entre deux dates, ils choisissent une **convention de décompte** :

$$\text{Intérêts} = \text{Capital} \cdot \text{Taux} \cdot \frac{\text{Jours}(d_1, d_2)}{\text{Jours dans l'année}}$$

Cette fraction de l'année est la **fraction d'année**. Les conventions diffèrent sur le numérateur (combien de jours écoulés) et sur le dénominateur (combien de jours dans l'année).

## Les quatre conventions canoniques

### 30/360 — l'année du banquier

Chaque mois compte pour 30 jours, chaque année pour 360. Simple et symétrique : un mois complet accroît toujours $1/12$ de l'intérêt annuel, qu'il ait 28, 30 ou 31 jours calendaires.

**Utilisations :** obligations corporate US, euro-obligations, échéanciers SYSCOHADA et PCG.
**Avantage :** prévisibilité et calculs simples en tableur.

### Actual/365 (ACT/365)

Nombre réel de jours entre les deux dates, divisé par 365 (même en année bissextile).

**Utilisations :** marchés monétaires sterling, certains crédits commerciaux UK et Commonwealth.
**Avantage :** précision quand la période est d'un nombre de jours atypique.

### Actual/360 (ACT/360)

Jours réels au numérateur, 360 au dénominateur — donc une année complète accroît $365/360 \approx 1{,}014 \times$ le taux nominal.

**Utilisations :** USD LIBOR, plupart des instruments monétaires US, certains crédits de trade OHADA.
**Avantage :** pour le prêteur (taux effectifs légèrement plus élevés).

### Actual/Actual (ACT/ACT)

Jours réellement écoulés, divisé par 365 ou 366 selon que l'année est bissextile (ou répartition proportionnelle si la période chevauche).

**Utilisations :** obligations du Trésor US, documentation ISDA des swaps, calcul TIE IFRS.
**Avantage :** précision.

## Le choix affecte l'échéancier

Basculer un prêt de 10 M FCFA sur 60 mois du 30/360 à l'ACT/360 fait dériver la colonne intérêts vers le haut de façon régulière — car la plupart des mois ont 30 ou 31 jours réels mais ACT/360 divise toujours par 360. Sur la durée d'un prêt long, l'écart se chiffre en milliers d'unités d'intérêts supplémentaires.

## Implications comptables

En SYSCOHADA et PCG français, le 30/360 est le défaut pour les échéanciers retail et PME, rarement contesté en pratique. En IFRS 9, le **taux d'intérêt effectif** doit refléter le *calendrier réel* des flux — ACT/ACT est conceptuellement correct, bien que le 30/360 soit souvent retenu comme simplification quand l'impact est non significatif.
