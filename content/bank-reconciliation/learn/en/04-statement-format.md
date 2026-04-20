# The Two-Column Statement

## SYSCOHADA Format

OHADA-zone accounting (and the French tradition it inherits) uses a **two-column état de rapprochement**: bank side on the left, books side on the right. Each side starts from its raw closing balance and walks down to the same true cash figure.

| **Per Bank Statement** | | **Per General Ledger** | |
|---|---:|---|---:|
| Statement balance | 500,000 | Book balance | 520,000 |
| + Deposits in transit | 50,000 | + Interest earned | 0 |
| − Outstanding checks | (30,000) | − Bank charges | 0 |
| ± Bank errors | 0 | − NSF checks | 0 |
| | | ± Company errors | 0 |
| **Adjusted balance** | **520,000** | **Adjusted balance** | **520,000** |

The two adjusted balances **must** match. If they don't, something is missing or mis-classified.

## Why Two Columns?

The two-column form makes the symmetry visible: every reconciling item appears on exactly one side, depending on who needs to act. It also doubles as a control — if you accidentally adjust both sides for the same item, the adjusted balances diverge by twice the amount, and the error is easy to spot.

## The Variance

The bottom line — `adjusted bank − adjusted books` — is the **variance**. When it is zero (within rounding), you are done. When it is non-zero, the variance equals the amount of the missing or mis-classified item.
