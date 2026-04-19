# Amortization Methods — A Deep Dive

## Annuity (French Method)

The most common method worldwide. Each payment is identical over the life of the loan. Interest is high at the start (large outstanding balance) and shrinks as the principal is repaid. Classroom formula:

$$A = P \cdot \frac{r}{1 - (1+r)^{-n}}$$

**Used for:** home loans, consumer credit, SME term loans.
**Pros:** predictable cash flow.
**Cons:** borrower pays more interest overall than under a linear schedule.

## Linear (Constant Principal)

The principal repaid each period is fixed at $P/n$. Interest is always computed on the remaining balance, so **payments decline** over time: the first payment is the largest, the last payment is the smallest.

**Used for:** equipment financing, government and multilateral infrastructure loans.
**Pros:** less total interest; balance shrinks faster.
**Cons:** heavy up-front cash requirement.

## Bullet (In Fine)

Only interest is paid during the term. The full principal is repaid as a single lump sum at maturity.

**Used for:** bridge facilities, eurobonds, some revolving credit lines.
**Pros:** low periodic cash outflow; preserves working capital.
**Cons:** refinancing risk and a large redemption shock at maturity.

## Progressive Payments

The payment grows by a fixed rate $g$ each period — often used when the borrower expects their income to rise with inflation. Early payments are intentionally light; later payments heavier. The initial payment satisfies a modified annuity formula:

$$A_1 = P \cdot \frac{r - g}{1 - \left(\frac{1+g}{1+r}\right)^n}$$

**Used for:** long-term home loans in inflation-prone economies.
**Pros:** affordable early; matches growing income.
**Cons:** negative amortization is possible if $g$ is too aggressive.

## Balloon

A mix of annuity and bullet: normal amortizing payments for most of the life, then a large **balloon** payment at a chosen period that retires a sizable residual.

**Used for:** vehicle leases with buy-out, tenors where regulators cap amortization length.
**Pros:** flexibility — can be refinanced, renewed, or paid off.
**Cons:** borrower must plan for the balloon; penalties if missed.
