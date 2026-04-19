# Assurance et frais — le vrai coût du crédit

## Pourquoi le taux affiché ment

Le **taux nominal** du contrat n'est qu'une partie de l'histoire. Les prêteurs perçoivent une série de coûts accessoires qui relèvent le coût réel du crédit :

- **Frais de dossier** — ponctuels au déblocage, souvent 0,5 %–2,0 % du capital.
- **Assurance emprunteur** — prime périodique calculée sur le capital initial ou restant.
- **Indemnité de remboursement anticipé (IRA)** — pénalité en cas de remboursement avant terme.
- **Frais de gestion** — frais mensuels de tenue de compte, rarement matériels mais toujours présents.

Cumulés, ces coûts poussent le **TAEG (Taux Annuel Effectif Global)** sensiblement au-dessus du taux nominal.

## Modélisation de l'assurance

Le playground propose deux assiettes :

- **Assiette initiale** — prime = `taux × capital initial`, versée chaque période. Simple, courant en crédit conso.
- **Assiette restante** — prime = `taux × capital restant`, recalculée chaque période. Plus équitable pour l'emprunteur, standard IFRS/US.

Dans les deux cas, l'assurance est comptabilisée **séparément** des intérêts : c'est une charge d'exploitation (625 en SYSCOHADA), pas un coût financier. Elle pèse sur la trésorerie et le coût total, mais pas sur la ligne « charges d'intérêts ».

## Frais de dossier — deux traitements

**Passage immédiat en charges (SYSCOHADA, PCG).** Les frais transitent par le compte 62 Services extérieurs au déblocage. Le prêt est comptabilisé à sa valeur faciale.

**Capitalisation et amortissement (IFRS 9, US GAAP).** Les frais sont nets du passif, et le **taux d'intérêt effectif** est calculé de sorte que tous les flux futurs actualisés égalisent le produit net perçu. La charge d'intérêts de chaque période reflète ce taux effectif plus élevé.

Les deux traitements produisent le même impact total sur le résultat sur la durée du prêt — la différence est le *calendrier*.

## TAEG — ce qu'il mesure

Le TAEG est le taux périodique qui égalise le flux net perçu et les flux sortants (échéances + assurance + frais) :

$$P - F = \sum_{k=1}^{n} \frac{A_k + I_k}{(1 + r_{TAEG}/m)^k}$$

où $F$ sont les frais de dossier, $A_k$ l'échéance contractuelle, $I_k$ la prime d'assurance et $m$ la fréquence annuelle. C'est un nombre normalisé qui permet la comparaison à iso-base de deux offres.

Le bandeau de KPI du playground affiche le TAEG en temps réel lorsqu'on modifie les frais et l'assurance.
