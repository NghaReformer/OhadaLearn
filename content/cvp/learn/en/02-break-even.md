# Break-Even Point

## Definition

The **break-even point (BEP)** is the sales volume at which total revenue equals total costs — exactly zero profit, exactly zero loss.

$$\text{BEP (units)} = \frac{\text{Fixed Costs}}{\text{CM per unit}}$$

$$\text{BEP (sales)} = \frac{\text{Fixed Costs}}{\text{CM Ratio}}$$

## Intuition

Every unit you sell contributes its CM toward covering fixed costs. Once enough units are sold that cumulative CM equals total fixed costs, the hurdle is cleared — the next unit contributes pure operating profit.

The **classic CVP chart** visualizes this as the intersection of the revenue line and the total-cost line. Left of the intersection: losses (red zone). Right of the intersection: profits (green zone).

## Rounding Rule

In practice, **always round up** to the next whole unit. You can't sell half a product, and selling BEP − 1 units still leaves a tiny loss.

If BEP = 4,166.67, then practically you need to sell **4,167 units** to cross into profit.

## What Changes BEP?

- **Raising price** → larger CM → lower BEP (fewer units needed)
- **Cutting variable cost** → larger CM → lower BEP
- **Cutting fixed cost** → lower hurdle → lower BEP
- **Volume itself does not change BEP** — volume tells you where you *are*, not where BEP *is*

## When BEP Doesn't Exist

If variable cost ≥ price, CM is zero or negative. Every unit sold either breaks even on that unit alone (CM = 0) or makes the loss worse (CM < 0). In either case there's no volume that recovers the fixed costs — the business model is broken and BEP is undefined (infinite).

The playground detects this and shows a warning banner: **"Variable cost exceeds price — every unit sold increases the loss."**
