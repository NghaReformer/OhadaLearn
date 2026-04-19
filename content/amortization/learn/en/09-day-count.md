# Day Count Conventions

## Why Day Counts Matter

Interest doesn't know what a "month" is. It accrues over **days**. When a lender and borrower need to agree on how much interest is owed between two dates, they choose a **day count convention**:

$$\text{Interest} = \text{Principal} \cdot \text{Rate} \cdot \frac{\text{Days}(d_1, d_2)}{\text{DaysInYear}}$$

The fraction of the year is called the **year fraction**. Conventions disagree about both the numerator (how many days elapsed) and the denominator (how many days in a year).

## The Four Canonical Conventions

### 30/360 — the banker's year

Each month counts as 30 days; each year as 360. Simple and symmetrical. A full month always accrues `1/12` of the annual interest, no matter if it has 28, 30, or 31 calendar days.

**Used for:** US corporate bonds, Eurobonds, SYSCOHADA and PCG loan schedules.
**Good for:** predictability and simple spreadsheet math.

### Actual/365 (ACT/365)

Use the actual number of calendar days between the two dates, divide by 365 (even in leap years).

**Used for:** sterling money markets, some commercial loans in the UK and Commonwealth.
**Good for:** accuracy when the period is an odd number of days.

### Actual/360 (ACT/360)

Actual days in the numerator, but 360 in the denominator — so a full year accrues $365/360 \approx 1.014 \times$ the nominal rate.

**Used for:** USD LIBOR, most US money-market instruments, some OHADA trade finance.
**Good for:** lenders (it yields slightly higher effective rates).

### Actual/Actual (ACT/ACT)

Days actually elapsed, divided by 365 or 366 depending on whether the accrual falls in a leap year (or a proportional split if it straddles one).

**Used for:** US Treasury bonds, ISDA swap documentation, IFRS effective-interest calculations.
**Good for:** precision.

## Choice Affects the Schedule

Switch a 10M FCFA, 60-month loan from 30/360 to ACT/360 and you will see the interest column drift up by a small amount each period — because most months have 30 or 31 actual days but ACT/360 still divides by 360. Over the life of a long loan, the difference can amount to thousands in extra interest.

## Accounting Implications

Under SYSCOHADA and French PCG, 30/360 is the default for retail and SME schedules and is rarely challenged in practice. Under IFRS-9, the **effective interest rate** must reflect the *actual* timing of cash flows — ACT/ACT is the conceptually correct convention, although in practice 30/360 is often used as a simplification when the impact is immaterial.
