# Time Value of Money

A franc you hold today is worth more than a franc promised tomorrow. The reason is opportunity: today's franc can be deposited, lent, or invested to earn a return before tomorrow arrives. Every TVM problem is just an arithmetic of that opportunity.

## The universal equation

The five core variables — Present Value (PV), Future Value (FV), Payment (PMT), rate (r), and number of periods (N) — sit on one equation:

$$0 = PV + PMT \cdot D \cdot \frac{1 - (1+r)^{-N}}{r} + FV \cdot (1+r)^{-N}$$

`D` equals 1 for ordinary annuities (end-of-period) and `(1+r)` for annuity-due (begin-of-period). Pick any four of the five inputs and the equation determines the fifth.

## Sign convention (HP-12C)

The calculator follows the cash-flow convention used by the HP-12C, the TI-BA II Plus, and Excel's `PV`/`FV`/`PMT` functions:

- **Outflows** (money you pay out) are **negative**.
- **Inflows** (money you receive) are **positive**.

A loan of 1,000,000 XOF entered as PV = +1,000,000 will produce PMT < 0 (the monthly payments leaving your account). Reverse the signs and the same calculation describes lending the money out instead.

## Worked example

Deposit 200,000 XAF today at 8% annual compounded annually for 5 years; how much do you have?

- PV = −200,000 (outflow today)
- PMT = 0 (no further deposits)
- N = 5, r = 8% per year
- Solve for FV: `FV = −PV · (1+r)^N = 200,000 · 1.08⁵ ≈ 293,866 XAF`

The result is positive — money flowing back to you at the end.
