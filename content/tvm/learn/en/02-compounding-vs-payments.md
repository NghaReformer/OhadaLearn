# Compounding vs. Payment Frequency

Most calculators bundle "compounding" and "payment" into one frequency selector. That's a shortcut that fails the moment a real product describes interest one way and instalments another — a bond accrues semi-annually but pays quarterly; a loan compounds daily but bills monthly.

## Two distinct rates

- **Compounding frequency** — how often the bank converts a fraction of a year's interest into principal.
- **Payment frequency** — how often cash actually changes hands.

When the two match, the calculator uses the simple periodic rate `r/m`. When they differ, the calculator first builds the **Effective Annual Rate (EAR)** and then converts back down to a per-payment rate:

$$\text{EAR} = \left(1 + \frac{r}{m_{\text{comp}}}\right)^{m_{\text{comp}}} - 1, \qquad r_{\text{pay}} = (1 + \text{EAR})^{1/m_{\text{pay}}} - 1$$

Without that step, every annuity factor is wrong by a few basis points — small per period, large over a 25-year horizon.

## Continuous compounding

Picking "Continuous" disables the payment input: $$e^{rt}$$ describes a frictionless accumulation, not discrete cash events. Use it for bond pricing, option models, and academic problems; for practical loans and savings the discrete frequencies are what banks actually use.

## When in doubt

Set both frequencies to the same value. The result is the textbook annuity formula. Only deviate when the product genuinely behaves that way — and document the choice next to the result.
