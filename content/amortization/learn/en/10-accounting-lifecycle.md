# Accounting Lifecycle Across Frameworks

A loan is born, lives, and dies. Each phase hits the accounts differently depending on whether you report under **SYSCOHADA**, **French PCG**, **IFRS**, or **US GAAP**. The underlying transaction is the same; the codes and disclosures differ.

## Stage 1 — Disbursement

**Every framework:** Dr Bank (cash received) | Cr Bank Loan (liability recognized).

- **SYSCOHADA:** `521 Banque` / `162 Emprunts auprès des établissements de crédit`.
- **French PCG:** `512 Banques` / `164 Emprunts auprès des établissements de crédit`.
- **IFRS:** Cash / `Non-current borrowings` (classified as financial liability at amortised cost).
- **US GAAP:** `Cash` / `Long-term debt` (or current portion as appropriate).

### Fees at origination

| Framework | Treatment |
|-----------|-----------|
| SYSCOHADA | Dr `62 External Services` immediately. |
| French PCG | Dr `627 Services bancaires` immediately (optional capitalisation in some industries). |
| IFRS-9 | Net against liability; amortise using effective interest method (EIR). |
| US GAAP (ASC 835-30) | Net against liability (was asset pre-ASU 2015-03); amortise via EIR. |

## Stage 2 — Periodic Payment

Each payment splits. Interest in P&L; principal reduces the liability.

```
Dr 671 Interest Expense      (interest portion)
Dr 162 Bank Loan             (principal portion)
    Cr 521 Bank              (total payment)
```

Under IFRS and US GAAP the interest portion equals `EIR × opening carrying amount`, which is subtly different from `nominal × opening face value` when fees were capitalised. SYSCOHADA and PCG use the nominal rate directly and ignore the distinction for plain-vanilla loans.

## Stage 3 — Grace Capitalization (total-grace windows only)

No cash movement. Interest accrues and is capitalised:

```
Dr 671 Interest Expense
    Cr 162 Bank Loan
```

Under IFRS, this is identified as "capitalised interest" and disclosed in the debt rollforward. Under US GAAP the same principle applies, with the additional complication that *borrowing costs on qualifying assets* (ASC 835-20) may be capitalised to the asset rather than expensed — a rule not typical under SYSCOHADA.

## Stage 4 — Insurance Premium

Always an operating expense, never a finance cost:

```
Dr 625 Insurance Expense
    Cr 521 Bank
```

PCG uses `616 Primes d'assurance` (a 616-series account rather than the OHADA 625). IFRS and US GAAP nest it under "operating expenses — insurance" in the presentation but keep it out of interest expense.

## Stage 5 — Prepayment (with optional penalty)

```
Dr 162 Bank Loan              (extra principal)
Dr 831 Exceptional Expense    (penalty, if any)
    Cr 521 Bank               (total cash out)
```

IFRS-9 requires a "modification" analysis when terms change materially on prepayment — if the change is substantial (generally 10% NPV threshold), the old liability is derecognised and a new one booked. For plain early repayments without restructuring, this step doesn't apply. US GAAP has a similar "troubled debt restructuring" rule with different triggers.

## Stage 6 — Final Settlement

The closing entry clears the residual. After it, the liability carrying amount is zero. Any unamortised fees on the IFRS / US GAAP side are recognised in finance costs on the final period.

## Key Takeaway

The **journal structure** is near-identical across frameworks. The **code numbers** differ. The **treatment of fees** is where SYSCOHADA/PCG (immediate expense) diverges from IFRS/US GAAP (EIR amortisation). For educational purposes the playground shows all four side by side — switch frameworks in the lifecycle panel and watch the codes change while the logic stays the same.
