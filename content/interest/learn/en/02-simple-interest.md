# Simple Interest

## The Formula

$$I = P \cdot r \cdot t$$

- **P** — principal (the original amount)
- **r** — annual rate, as a decimal (0.10 for 10%)
- **t** — time in years

The total amount owed or owned at the end of the term is `P + I`.

## What Makes It "Simple"

The rate is applied **only** to the original principal. Interest that accrues in year 1 does *not* earn its own interest in year 2. The growth line is perfectly straight.

Concretely, 1,000,000 XOF placed at 10% simple interest for 5 years produces:

$$I = 1{,}000{,}000 \times 0{.}10 \times 5 = 500{,}000$$

Total: 1,500,000 XOF. Year by year, the interest accrues in equal slices of 100,000 each.

## Where Simple Interest Shows Up

In contemporary finance, simple interest appears mostly in:

- **Short-term commercial paper** — most SYSCOHADA-zone trade credit quotes simple interest on invoices under 90 days.
- **Money-market instruments** and **Treasury bills** in the BCEAO and BEAC zones.
- **Legal-interest calculations** — many OHADA jurisdictions compute statutory interest on overdue accounts using simple interest.
- **Introductory pedagogy** — it is the cleanest setting to teach day-count conventions, before the complication of compounding.

## The t in P·r·t Is Not Obvious

When the term is a whole number of years, `t` is easy. When the loan runs for 73 days or 18 months, `t` depends on which day-count convention applies. A 90-day loan at 10% under **actual/360** accrues slightly more interest than under **actual/365**, even though the rate and dates are identical. The next section covers how.
