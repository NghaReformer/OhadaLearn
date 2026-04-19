# The Math — Present Value & Periodic Payment

## The Annuity Formula

For a standard amortizing loan with principal $P$, periodic rate $r$, and $n$ periods, the constant periodic payment $A$ is:

$$A = P \cdot \frac{r}{1 - (1 + r)^{-n}}$$

This payment is the unique amount that, when discounted at rate $r$, has a present value equal to $P$. The numerator is the interest on the full principal; the denominator is an annuity factor that spreads that cost over $n$ periods.

## Where the Rate Comes From

The **nominal annual rate** posted on a contract (say, 8%) is divided by the periods-per-year to get the **periodic rate**:

- Monthly: $r = 8\% / 12 = 0.6667\%$
- Quarterly: $r = 8\% / 4 = 2.0\%$
- Semiannual: $r = 8\% / 2 = 4.0\%$

This *nominal* (a.k.a. *simple*) convention is the norm for consumer and commercial loans in OHADA, France, and the US.

## Per-Period Dynamics

Each period the interest portion is:

$$I_k = r \cdot B_{k-1}$$

where $B_{k-1}$ is the outstanding balance at the start of the period. The principal portion is the rest of the payment:

$$P_k = A - I_k$$

and the new balance becomes $B_k = B_{k-1} - P_k$. Early in the life of an annuity loan, $B_{k-1}$ is large, so $I_k$ is large and $P_k$ is small — interest is front-loaded. By the last period, $B_{k-1}$ is tiny and almost all of the payment is principal.

## Zero-Rate Edge Case

If $r = 0$ the formula degenerates (you'd divide by zero). In that case the payment is simply $A = P / n$ — a straight-line amortization with no interest. The engine handles this edge case cleanly.
