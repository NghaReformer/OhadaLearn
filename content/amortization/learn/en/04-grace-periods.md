# Grace Periods — Partial vs Total

## What a Grace Period Is

A **grace period** (or *differé*) is a window at the start of the loan when the normal schedule is suspended. It is common for projects where the asset needs to be built and operational before it can service debt — construction, agriculture, large equipment, infrastructure.

## Two Flavors

### Partial Grace (*différé partiel*)

Only interest is paid during the grace window. Principal is untouched. After the grace period, a **normal amortizing schedule** kicks in on the original principal over the remaining term.

Effect: you pay interest on the full principal for longer, so total interest rises slightly. But you have no principal reduction cash pressure during startup.

### Total Grace (*différé total*)

Nothing is paid during the grace window — but interest continues to accrue. That accrued interest is **capitalised** into the principal, which grows. When the grace ends, the new (larger) principal is amortized over the remaining term.

Effect: the outstanding balance *increases* during grace, then amortizes. This is called **negative amortization** and is a warning sign in some regulatory regimes (e.g., certain IFRS and US consumer loan rules require explicit disclosure).

## Accounting Impact

| Stage | Cash Impact | P&L Impact | Balance Sheet Impact |
|-------|-------------|------------|---------------------|
| Partial grace | Outflow = interest | Interest expense | Liability unchanged |
| Total grace | None | Interest expense | Liability **grows** (capitalized) |
| Post-grace (both) | Outflow = full amortizing payment | Interest + principal split | Liability shrinks |

The `grace-capitalization` lifecycle entry in the playground models the total-grace case: debit Interest Expense (671), credit Bank Loan (162). No cash line.

## Common Pitfalls

- **Double-counting interest.** Some spreadsheets compute the post-grace schedule on the *original* principal even for total grace. That understates total cost by a material margin on long loans.
- **Ignoring covenants.** Total grace inflates the debt-to-EBITDA ratio at the exact moment leverage is highest. Check covenant definitions before accepting a total-grace structure.
