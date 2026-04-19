# Insurance & Fees — The True Cost of Credit

## Why the Posted Rate Lies

The **nominal rate** on a loan contract is only part of the story. Lenders charge an array of ancillary costs that push the true cost of credit higher:

- **Origination fee** — a one-off charge at disbursement, often 0.5%–2.0% of principal.
- **Credit insurance** — a periodic premium computed on the original or outstanding balance.
- **Prepayment penalty** — a fee charged if the borrower repays early.
- **Service fees** — monthly maintenance fees, rarely material but always present.

Together these push the **APR (Annual Percentage Rate)** meaningfully above the nominal rate.

## Modeling Insurance

The playground supports two bases:

- **Initial basis** — premium = `rate × initial principal`, paid every period. Simple, common for consumer loans.
- **Remaining basis** — premium = `rate × outstanding balance`, recomputed each period. Fairer to the borrower, standard for IFRS/US contracts.

In both cases, insurance is recorded **separately** from interest — it is an operating expense (625 under SYSCOHADA), not a finance cost. It affects cash outflow and total cost, but not the interest expense line.

## Origination Fees — Two Treatments

**Expense immediately (SYSCOHADA, PCG).** The fee is passed through 62 External Services at disbursement. The loan is recorded at its face value.

**Capitalise and amortise (IFRS-9, US GAAP).** The fee is netted against the liability, and the loan's **effective interest rate** is computed so that all future cash flows discount to the net-of-fee proceeds. Interest expense in each period reflects this higher effective rate.

Both treatments give the same total P&L impact over the life of the loan — the difference is *timing*.

## APR — What It Measures

APR is the periodic rate that equates the cash flow stream:

$$P - F = \sum_{k=1}^{n} \frac{A_k + I_k}{(1 + r_{APR}/m)^k}$$

where $F$ is the origination fee, $A_k$ is the scheduled payment, $I_k$ the insurance premium, and $m$ the periods-per-year. It is a standardised number that lets borrowers compare loans on a like-for-like basis.

The KPI strip in the playground shows the APR in real time as you tweak fees and insurance.
