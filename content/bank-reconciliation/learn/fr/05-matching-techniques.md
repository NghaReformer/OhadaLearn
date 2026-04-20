# Pointer banque vs grand-livre

## Trois passes

L'algorithme de pointage — qu'il soit manuel ou logiciel — effectue trois passes sur les éléments non pointés, par ordre de confiance décroissante :

**Passe 1 — Référence + montant.** Lorsqu'une ligne du relevé et une ligne du grand-livre partagent le même numéro de chèque ou de virement et que les montants concordent, il s'agit de la même opération. Confiance : 100 %.

**Passe 2 — Montant + proximité de date.** Même montant absolu, dates à quelques jours d'intervalle. La plupart des correspondances sans référence relèvent de cette passe. Confiance : ~85 %.

**Passe 3 — Approximative (fuzzy).** Même montant, fenêtre de date plus large, libellés partageant des mots-clés. Utile pour les fautes de saisie. Confiance : ~60 % — à vérifier.

## Ce qui ne pointe pas

Tout ce qui reste non pointé après la passe 3 est un élément de rapprochement — par définition. Le classer (voir *Éléments de rapprochement*) et décider quel côté il régularise.

## Surcharges manuelles

L'algorithme se trompe parfois. Deux paiements identiques le même jour à des fournisseurs différents seront mal appariés sans aide. Les pointages manuels priment toujours — ils verrouillent les participants des passes automatiques.

## Pointage par somme

Un piège classique : un seul versement bancaire correspond à la somme de deux écritures comptables (dépôt fractionné). La plupart des outils simples ratent cela. Le remède est soit de scinder la ligne bancaire, soit d'autoriser des appariements n-vers-1 — hors périmètre du playground de base.
