# Continuous Compounding

## The Limit

$$FV = P \cdot e^{r \cdot t}$$

Continuous compounding is what you get when you shrink the compounding period to zero. No discrete periods — a smooth exponential curve growing at the instantaneous rate `r`.

## Where It Comes From

Start with the discrete compound formula and let `m → ∞`:

$$\lim_{m \to \infty} \left(1 + \frac{r}{m}\right)^{m \cdot t} = e^{r \cdot t}$$

The constant `e ≈ 2.71828` appears here for the same reason it appears throughout calculus: it is the base at which a compounding process grows at a rate equal to itself. The connection between compound interest and `e` is not coincidence — it is the historical reason `e` was discovered (by Bernoulli, in 1683, studying exactly this problem).

## Practical Relevance

For most consumer products you will never meet a rate quoted as continuously-compounded. But:

- **Derivatives pricing** (Black-Scholes, binomial trees) uses continuous compounding as the default. IFRS 13 fair-value measurement borrows this convention.
- **Risk models** — value-at-risk and expected shortfall calculations typically assume continuous compounding.
- **Long-horizon investment planning** — once the term is measured in decades, the difference between daily and continuous is usually less than rounding error.

## Converting Between Conventions

If you have a rate quoted as continuous `r_c` and need an equivalent discrete EAR:

$$\text{EAR} = e^{r_c} - 1$$

Going the other way:

$$r_c = \ln(1 + \text{EAR})$$

The playground shows both the continuous equivalent and the EAR in the Rate Summary panel — flip between modes to see how they line up.

## An Aesthetic Note

The continuous curve is the mathematically beautiful case. It has no kinks, no jump points, no "end of period" moments. It grows by `r%` of itself per *instant* — the most natural possible growth law. Students who absorb this tend to reason more cleanly about time-value problems later.
