# Amortised Cost with the Effective Interest Rate

## The Setting

You buy a 5-year bond at issuance. Face value: 1,000,000 XOF. Coupon rate: 8% annually. Market rate at issuance: 10%. Because the coupon (8%) is less than what the market demands (10%), the bond is **issued at a discount** — you pay less than face at issuance in exchange for receiving face at maturity.

The issue price is the present value of all cash flows discounted at the market rate:

$$\text{Issue Price} = 80{,}000 \cdot \frac{1 - (1.10)^{-5}}{0.10} + 1{,}000{,}000 \cdot (1.10)^{-5} = 924{,}184$$

You pay 924,184 today and collect (80,000 × 5 = 400,000) in coupons + 1,000,000 at maturity = 1,400,000. Net gain: 475,816.

## Two Methods to Spread That Gain

How should the 475,816 be recognised as interest expense over 5 years in the issuer's books (or interest income in the holder's books)?

### Straight-Line Method — Simple but Biased

Split the discount (1,000,000 − 924,184 = 75,816) evenly across 5 years. Each year:

- Cash interest (coupon paid) = 80,000
- Discount amortisation = 75,816 / 5 = 15,163
- Interest expense = 80,000 + 15,163 = 95,163 (same every year)

The carrying amount climbs linearly from 924,184 to 1,000,000.

### Effective-Interest-Rate Method — Principled

Each period, the interest expense is the **opening carrying amount times the market rate**. Year 1:

- Opening carrying amount = 924,184
- Interest expense = 924,184 × 10% = 92,418
- Cash interest paid = 80,000
- Discount amortisation = 92,418 − 80,000 = 12,418
- Closing carrying amount = 924,184 + 12,418 = 936,603

Year 2:
- Opening = 936,603
- Interest expense = 936,603 × 10% = 93,660
- Discount amortisation = 13,660
- Closing = 950,263

The interest expense grows each year. The carrying amount *accelerates* toward face value.

## Why EIR Is "The Right One"

The EIR method has one crucial property: the interest expense recorded each year is a **constant effective yield** on the carrying amount. The straight-line method, by spreading the discount evenly, produces a *declining* effective yield — lying about the true cost of funds in later years.

SYSCOHADA Revised and IFRS 9 both mandate the EIR method for this reason. The straight-line method remains common in legacy systems and in jurisdictions where the difference is immaterial for small bonds.

## The Divergence Chart

Mode 3 visualises the gap between the two carrying-amount curves. At issuance and at maturity, both methods produce the same number. In between, they diverge — the gap is largest around the midpoint of the term. That gap is the difference in cumulative interest expense recognised under each method at any given moment.
