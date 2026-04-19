# Prepayments & Extra Payments

## Two Prepayment Strategies

Borrowers repay early for different reasons, and the *way* they repay materially changes the outcome.

### Shorten the Term (Same Payment)

The borrower keeps the scheduled periodic payment unchanged and directs the extra cash at the principal. Interest accrues on a smaller balance, so the loan is retired faster and total interest falls.

Effect: **duration shrinks**, payment unchanged.

### Reduce the Payment (Same Term)

The borrower keeps the loan's term unchanged but re-amortises the remaining balance — smaller payments over the original end date. Total interest also falls, but less than in the first strategy.

Effect: **payment shrinks**, duration unchanged.

The playground currently implements the first strategy — extra payments attack principal directly, periods after the last paid row are dropped, and total interest drops proportionally.

## Penalty Clauses

Many contracts carry a **prepayment penalty** — typically expressed as a percentage of the prepaid amount:

- In OHADA, penalties above 2% are uncommon for consumer credit.
- Under French law, the penalty on a *crédit immobilier* is capped at 6 months of interest on the prepaid amount or 3% of the outstanding balance (whichever is lower).
- US mortgages vary — most modern conforming loans have no penalty at all.

The engine charges the penalty at the period in which the prepayment happens. The journal entry has three lines:

| Line | Debit | Credit |
|------|-------|--------|
| Bank Loan (162) | `extra` | |
| Exceptional Expense (831) | `extra × penalty%` | |
| Bank (521) | | `extra + extra × penalty%` |

## Extras vs Lump Sums

- **Extras per period** — a fixed amount added on top of every payment. Good for steady overperformers.
- **Lump sum** — a one-time extra at a chosen period, representing a bonus, asset sale, or refinancing.

You can combine both in the playground to see the difference on the balance curve.

## When to Prepay

Prepayment is rational when the opportunity cost of the cash (risk-free rate or expected investment return) is **below** the loan's effective interest rate. If the loan is at 8% and a safe deposit pays 4%, prepaying saves 4% net. If the loan is at 6% and a business investment returns 15%, keep the loan and deploy the cash.
