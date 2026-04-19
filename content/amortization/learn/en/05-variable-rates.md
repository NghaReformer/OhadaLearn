# Variable Rates & Rate Schedules

## Why Rates Change Mid-Loan

Most long-term commercial and mortgage loans in OHADA, EU, and US markets are **indexed** to a reference rate — TIBEUR, EURIBOR, SOFR — plus a fixed margin. When the reference moves, so does the periodic rate charged on the loan, either continuously, at fixed reset dates, or by step clauses written into the contract.

## Three Patterns

1. **Periodic resets.** Rate re-reads the reference on each payment date. Highly variable but common for short-term trade finance.
2. **Step-up or step-down schedules.** The contract defines explicit resets at, say, month 12, 24, and 60. Predictable for the borrower, cheap to model.
3. **Cap / floor collars.** The rate floats but is bounded by a maximum and minimum. The effective rate path is a clipped version of the index.

The playground models pattern (2) — you add a row for each `fromPeriod` and the `newRate` that applies from that period onwards.

## How Rate Changes Reshape the Schedule

When a rate change hits in a standard annuity loan, the payment is **recomputed** so that the remaining balance amortizes over the remaining periods at the new rate:

$$A' = B_k \cdot \frac{r'}{1 - (1+r')^{-(n-k)}}$$

where $B_k$ is the balance at the reset, $r'$ the new periodic rate, and $n-k$ the remaining periods. For linear and bullet methods the recalculation is simpler — only the interest portion of each remaining row uses the new rate.

## Reporting & Disclosure

- Interest expense in each period is computed at whatever rate applies to that period.
- For IFRS-9 reporting, the loan's **effective interest rate (EIR)** is the rate that equates all future cash flows to the initial carrying amount. When rates reset, the EIR is recalculated prospectively.
- Under SYSCOHADA, simpler nominal-rate treatment is permitted for loans without significant transaction costs.

## Interpretation

On the schedule table you will see a **"rate-change"** flag on the exact period a new rate takes hold. On the stacked-payment chart you will see the interest bar jump (or drop) and the balance curve bend.
