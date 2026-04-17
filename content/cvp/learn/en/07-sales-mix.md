# Multi-Product Sales Mix

## The Challenge

CVP formulas assume a single product with a single CM. Most businesses sell multiple products with different margins. How do you compute break-even for the entire business at once?

## Weighted-Average Contribution Margin

Collapse the product portfolio into a single "synthetic" product using the **sales mix** as weights:

$$\text{Weighted CM} = \sum_i (\text{CM}_i \times \text{Mix}_i)$$

where $\text{Mix}_i$ is the sales-unit proportion of product $i$ (must sum to 100%).

$$\text{Total BEP (units)} = \frac{\text{Fixed Costs}}{\text{Weighted CM}}$$

Each product's individual BEP is then its **mix share** of the total:

$$\text{BEP}_i = \text{Total BEP} \times \text{Mix}_i$$

## Example

| Product | Price | Variable Cost | CM | Mix % |
|---------|-------|---------------|----|----|
| Basic | $40 | $15 | $25 | 60% |
| Premium | $80 | $40 | $40 | 40% |

- Weighted CM = 0.60 × $25 + 0.40 × $40 = **$31**
- Fixed Costs $62,000 → Total BEP = $62,000 / $31 = **2,000 units**
- Basic BEP = 2,000 × 60% = **1,200 units**
- Premium BEP = 2,000 × 40% = **800 units**

## The Mix Assumption — and Its Fragility

The entire analysis hinges on the mix staying constant. If the real-world mix shifts toward lower-margin products, the weighted CM falls and the actual BEP rises — sometimes dramatically.

**Defensive practice**: always pair a mix-based BEP with a sensitivity range showing BEP at ±10% mix shift. Companies often discover that their "break-even" is really a best-case under-estimate when customers trade down.

## When Mix % Doesn't Sum to 100

The playground flags any mix that doesn't total exactly 100%. A 3-product mix at 40/40/40 is mathematically undefined — are the extra 20 percentage points coming from unaccounted products? Resolve this before acting on the numbers.
