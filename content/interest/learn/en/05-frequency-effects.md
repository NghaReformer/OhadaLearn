# Frequency Effects

## Changing m Changes Everything

Holding the nominal rate `r` and term `t` constant, increasing the compounding frequency `m` produces a larger future value. Intuitively: the *sooner* accrued interest joins the principal base, the *sooner* it starts earning its own interest.

For 1,000,000 XOF at 10% nominal over 5 years:

| Frequency | m | FV | EAR |
|---|---|---|---|
| Annual | 1 | 1,610,510 | 10.00% |
| Semi-annual | 2 | 1,628,895 | 10.25% |
| Quarterly | 4 | 1,638,616 | 10.38% |
| Monthly | 12 | 1,645,309 | 10.47% |
| Daily | 365 | 1,648,608 | 10.52% |
| Continuous | ∞ | 1,648,721 | 10.52% |

## The Pattern

Every increase in `m` yields a *smaller* marginal gain than the previous one. Going from annual to semi-annual adds 18,385 XOF. Going from monthly to daily adds only 3,299 XOF. From daily to continuous, 113 XOF.

The gains are bounded above. The limit as `m → ∞` is:

$$FV_\infty = P \cdot e^{r \cdot t}$$

This is **continuous compounding**, and it is the cleanest case of all — no periodicity, just an instantaneous growth rate `r` applied over time `t`.

## Why This Matters in Practice

Most consumer-facing financial products quote a **nominal rate** plus a **compounding frequency**. A savings account "at 6% compounded daily" and one "at 6.09% compounded annually" pay the *same amount* — the second is just the effective-rate disguise of the first.

Understanding this lets you:

- Compare offers quoted with different frequencies on equal footing
- Spot products where the "headline rate" is misleading
- Restate a loan from one convention to another when switching accounting frameworks

Mode 3 of this playground formalises the conversion.
