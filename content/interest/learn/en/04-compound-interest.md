# Compound Interest

## The Formula

$$FV = P \cdot \left(1 + \frac{r}{m}\right)^{m \cdot t}$$

- **P** — principal
- **r** — nominal annual rate
- **m** — compounding periods per year
- **t** — time in years

The future value `FV` is the balance at the end of the term, **not** the interest. Interest is `FV − P`.

## The Key Insight

Each period, the accrued interest is *added to the principal*. In the next period, interest is computed on that enlarged base. This is "interest earning interest." The growth curve bends upward the longer the term — slowly at first, then sharply.

Compare, for 1,000,000 XOF at 10% over 5 years:

- **Simple interest:** `I = 1,000,000 × 0.10 × 5 = 500,000` → total `1,500,000`
- **Compound annually:** `FV = 1,000,000 × (1.10)^5 = 1,610,510` → interest `610,510`

The extra 110,510 comes entirely from interest on interest. Over 30 years, the two curves are *worlds* apart.

## Decomposition

The Mode 2 chart splits the total interest into two stacked bands:

- **Interest on principal** — the portion equal to `P · r · t` (what simple interest would have produced)
- **Interest on interest** — everything above that

For short terms, the second band is thin. For long terms, it dominates.

## Period by Period

The per-period table shows, for each compounding step:
- balance at start of period
- interest accrued in that single period
- balance at end of period

Crucially, the "interest accrued in that single period" *grows every period* even though the nominal rate never changes. That is the whole point of compounding.
