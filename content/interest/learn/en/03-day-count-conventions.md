# Day-Count Conventions

## Why They Exist

Interest rates are quoted "per year" but most contracts do not run for a whole year. A day-count convention is the formal rule for converting a number of calendar days into a year fraction.

Different markets use different conventions. Using the wrong one for a given instrument produces the wrong interest amount — possibly by 1%–2% on a large transaction. For SYSCOHADA-zone treasurers, this is not academic: it is the difference between a correct and an incorrect journal entry.

## The Four Conventions

| Convention | Numerator (days) | Denominator | Typical Use |
|---|---|---|---|
| **30/360** | Assume every month has 30 days | 360 | SYSCOHADA long-term bonds, most European banking, French PCG |
| **Actual/365** | Real calendar days | 365 | British bond market, many IFRS disclosures |
| **Actual/360** | Real calendar days | 360 | BCEAO/BEAC money market, US money market, most LIBOR-linked products |
| **Actual/Actual** | Real calendar days | Days in the actual year (365 or 366) | Sovereign bonds in many jurisdictions |

## The 30/360 Surprise

Under 30/360, interest for "January 31 to February 28" is calculated as if the period were exactly 28 days — but interest from "February 28 to March 31" is calculated as if the period were exactly 33 days (the rule pins day 31 to day 30 for the start date only, then measures to the actual end date but caps at 30). These edge cases matter for quarterly bond coupons that fall near month-ends.

## Which Produces More Interest?

For the same rate and dates:

- **Actual/360** produces the *most* interest because the denominator is smallest
- **Actual/365** and **30/360** fall in the middle depending on the period
- **Actual/Actual** is closest to calendar-fair over long periods

This explains why BCEAO money-market instruments appear to offer slightly higher yields than bond-market equivalents at the same nominal rate — it is the denominator, not the rate.

## Action

Flip the **Day-count** selector in the playground. Watch the total interest change with no change to rate or dates. The amount of the shift reveals which convention your instrument follows.
