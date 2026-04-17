# Target Profit

## Pre-Tax Target

Often the question isn't "how many units to break even" but "how many units to hit a profit target."

$$Q = \frac{\text{Fixed Costs} + \text{Target Profit}}{\text{CM per unit}}$$

The logic is identical to BEP, except the numerator now includes the profit you want *on top of* covering fixed costs. Every unit of CM first fills the fixed-cost bucket, then starts filling the target-profit bucket.

## After-Tax Target — Gross Up First

If the target is *after-tax* (net income), you must first "gross up" to the required pre-tax operating income:

$$\text{Pre-tax Target} = \frac{\text{After-tax Target}}{1 - t}$$

where $t$ is the effective tax rate (as a decimal). Only then can you plug into the standard formula:

$$Q = \frac{\text{FC} + \text{Pre-tax Target}}{\text{CM}}$$

## Example

Fixed costs $200,000. Price $75, variable cost $30 — so CM = $45. Target after-tax profit $100,000 at 30% tax rate.

1. Gross up: $100,000 / (1 − 0.30) = **$142,857**
2. Required volume: ($200,000 + $142,857) / $45 = **7,619 units**

## Pitfalls

- **Confusing operating income with net income.** Always clarify whether the target is pre-tax (operating income) or post-tax (net income) — the formulas diverge by the tax factor.
- **Using a tax rate near 100%.** As tax rate approaches 1, the grossed-up target explodes. The playground caps effective rate at 99.99% to avoid division-by-zero.
- **Assuming taxes apply at a loss.** Most tax systems don't refund losses — so when operating income is negative, the effective tax is zero, not negative. The playground handles this automatically.
