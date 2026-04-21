# Effective vs Nominal Rate

## The Core Formula

$$\text{EIR} = \left(1 + \frac{r}{m}\right)^m - 1$$

The **effective interest rate** (EIR), or effective annual rate (EAR), is the true annualised yield once compounding has been accounted for. The **nominal rate** is merely what the contract quotes before adjustment.

For the continuous case:

$$\text{EIR} = e^r - 1$$

## The Classic Trap

A loan quoted as "12% per annum, compounded monthly" does *not* actually cost 12% per year. The real cost is:

$$\left(1 + \frac{0.12}{12}\right)^{12} - 1 = 0.126825 = 12.6825\%$$

Over a 1,000,000 XOF balance that is an extra 6,825 XOF of interest in year 1 — not from a higher rate, but from the compounding mechanic hidden inside the quote.

## Why Banks Use Nominal Rates

Nominal rates are easier to compare across products with different frequencies. They are also the number that typically appears in loan agreements for regulatory reasons: most disclosure regimes require the "stated" or "nominal" rate to be published, even when the effective rate is the more meaningful number.

This creates an information asymmetry. A bank can offer a loan at "11.8% nominal, monthly" and a competitor at "12.0% nominal, annual." The first loan is the cheaper of the two, but only if the customer does the conversion.

## Inverting the Formula

To recover the nominal rate from a quoted EIR:

$$r = m \cdot \left((1 + \text{EIR})^{1/m} - 1\right)$$

This comes up frequently when converting between IFRS disclosures (which report EIR) and local tax filings (which often require nominal equivalents).

## Under SYSCOHADA Revised and IFRS 9

Starting with SYSCOHADA Revised (2017) and IFRS 9 (mandatory 2018), all financial instruments classified as "amortised cost" are measured using the effective interest rate — never the nominal rate. This affects:

- Loans receivable and payable
- Bond investments
- Trade receivables with significant financing components
- Debt-structured lease receivables

The next section explains what "measured using the EIR" actually means for a bond's carrying amount.
