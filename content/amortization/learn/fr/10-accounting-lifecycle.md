# Cycle comptable à travers les référentiels

Un prêt naît, vit et s'éteint. Chaque phase impacte les comptes différemment selon que l'on rapporte en **SYSCOHADA**, **PCG français**, **IFRS** ou **US GAAP**. La transaction sous-jacente est la même ; les numéros de compte et les informations à fournir diffèrent.

## Étape 1 — Déblocage

**Tous référentiels :** Dr Banque (trésorerie reçue) | Cr Emprunt (passif constaté).

- **SYSCOHADA :** `521 Banque` / `162 Emprunts auprès des établissements de crédit`.
- **PCG français :** `512 Banques` / `164 Emprunts auprès des établissements de crédit`.
- **IFRS :** Trésorerie / `Emprunts non courants` (passif financier au coût amorti).
- **US GAAP :** `Cash` / `Long-term debt` (ou portion courante).

### Frais de dossier

| Référentiel | Traitement |
|-------------|-----------|
| SYSCOHADA | Dr `62 Services extérieurs` immédiatement. |
| PCG français | Dr `627 Services bancaires` immédiatement (capitalisation optionnelle en certaines industries). |
| IFRS 9 | Nets du passif ; amortissement au taux d'intérêt effectif (TIE). |
| US GAAP (ASC 835-30) | Nets du passif (actif avant ASU 2015-03) ; amortissement TIE. |

## Étape 2 — Échéance périodique

Chaque échéance se scinde. Les intérêts en résultat ; le capital diminue le passif.

```
Dr 671 Charges d'intérêts    (part intérêts)
Dr 162 Emprunts               (part capital)
    Cr 521 Banque             (échéance totale)
```

En IFRS et US GAAP la part intérêts est égale au `TIE × valeur comptable d'ouverture`, ce qui diffère légèrement de `nominal × valeur faciale d'ouverture` lorsque des frais ont été capitalisés. SYSCOHADA et PCG utilisent directement le taux nominal et ignorent cette distinction pour les prêts classiques.

## Étape 3 — Capitalisation en franchise totale

Aucun mouvement de trésorerie. Les intérêts courent et sont capitalisés :

```
Dr 671 Charges d'intérêts
    Cr 162 Emprunts
```

En IFRS, ces intérêts capitalisés sont identifiés comme tels et divulgués dans le rollforward de la dette. En US GAAP le principe est identique, avec la spécificité que les *coûts d'emprunt sur actifs qualifiants* (ASC 835-20) peuvent être capitalisés à l'actif plutôt qu'imputés en charge — règle absente en SYSCOHADA.

## Étape 4 — Prime d'assurance

Toujours une charge d'exploitation, jamais un coût financier :

```
Dr 625 Primes d'assurance
    Cr 521 Banque
```

Le PCG utilise `616 Primes d'assurance` (série 616 plutôt que la 625 OHADA). IFRS et US GAAP la classent sous « charges d'exploitation — assurance » dans la présentation mais l'excluent de la charge d'intérêts.

## Étape 5 — Remboursement anticipé (avec pénalité éventuelle)

```
Dr 162 Emprunts               (capital supplémentaire)
Dr 831 Charges HAO            (pénalité éventuelle)
    Cr 521 Banque             (trésorerie totale)
```

IFRS 9 exige une analyse de « modification » quand les termes changent matériellement lors d'un remboursement — si le changement est substantiel (généralement seuil de 10 % de la valeur actualisée), l'ancien passif est décomptabilisé et un nouveau passif est constaté. Pour un simple remboursement anticipé sans restructuration, cette étape ne s'applique pas. US GAAP connaît une règle analogue de « troubled debt restructuring » avec des seuils différents.

## Étape 6 — Règlement final

L'écriture finale solde le résidu. Après, la valeur comptable du passif est nulle. Tout solde non amorti de frais côté IFRS / US GAAP est constaté en charge financière sur la dernière période.

## Message clé

La **structure des écritures** est quasiment identique entre référentiels. Les **numéros de compte** diffèrent. Le **traitement des frais** est le point où SYSCOHADA/PCG (charge immédiate) diverge d'IFRS/US GAAP (amortissement TIE). À fins pédagogiques le playground affiche les quatre côte-à-côte — changer de référentiel dans le panneau Lifecycle : les codes changent, la logique reste la même.
