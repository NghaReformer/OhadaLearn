# Nominal vs APR vs Effective Annual Rate

Three different rates describe the same loan, and they answer three different questions.

## Nominal Rate (the sticker)

The rate printed on the contract. Answers: **"What rate do they quote me?"**

- Does **not** account for compounding within the year.
- Does **not** account for fees, insurance, or other costs.
- Divided by periods-per-year to get the periodic rate used in the formulas.

Example: 12% nominal, monthly compounding → 1.0% per month.

## Effective Annual Rate — EAR (the true compounding cost)

The yield an investor would earn if the loan's periodic rate compounded for one year:

$$\text{EAR} = \left(1 + \frac{r_{nominal}}{m}\right)^m - 1$$

Answers: **"If I rolled this rate for a year, what would I actually pay?"**

Example: 12% nominal monthly → EAR = $(1 + 0.01)^{12} - 1 = 12.68\%$. The EAR is always ≥ the nominal rate when compounding is more frequent than annual.

## APR — Annual Percentage Rate (the regulatory comparison tool)

APR is computed by solving for the rate that equates the **net cash received** to the **total outflows** (payments + insurance + fees) over the life of the loan:

$$P - F = \sum_{k=1}^{n} \frac{\text{OutFlow}_k}{(1 + r_{periodic})^k}, \quad \text{APR} = r_{periodic} \cdot m$$

Answers: **"How does this loan compare to others, all-in?"**

- Regulated in many jurisdictions (TEG in France, Truth-in-Lending in the US, OHADA Uniform Act on Credit).
- Includes mandatory insurance, origination fees, and penalty clauses that are *certain*.
- Excludes late fees and optional costs.

Example: on a 10M FCFA, 60-month loan at 8% nominal with 1% origination and 0.3% monthly insurance, the APR might come out around 10.5% — materially higher than the 8.30% EAR of the rate alone.

## Why It Matters

| Question | Use this rate |
|----------|--------------|
| Monthly payment math | Nominal / periodic |
| Comparing to a deposit account return | EAR |
| Comparing two loan offers | APR |
| Accounting for a loan under IFRS-9 | Effective interest rate (close to APR) |
| Quoting a rate to a customer | Nominal (but you must also disclose APR) |
