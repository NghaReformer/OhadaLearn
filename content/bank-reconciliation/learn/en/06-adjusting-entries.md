# Adjusting Journal Entries

Every item that adjusts the **books side** of the reconciliation produces a journal entry. Items adjusting only the bank side (deposits in transit, outstanding checks, bank errors) need no entry.

## The Five Standard Entries

| Item | OHADA Debit | OHADA Credit |
|---|---|---|
| Bank charges | 627 — Services bancaires | 521 — Banque |
| Interest earned | 521 — Banque | 771 — Intérêts reçus |
| NSF customer check | 411 — Clients | 521 — Banque |
| Direct debit | 62x — Service expense | 521 — Banque |
| Standing order received | 521 — Banque | 62x — Recurring revenue |

## Multi-framework

The same conceptual entry maps to different account codes under each framework:

- **OHADA**: 627 / 521 for bank charges
- **French PCG**: 627 / 512
- **IFRS**: General Service Charges / Cash & Equivalents
- **US GAAP**: Bank Service Charges / Cash

The playground resolves codes automatically when you switch the accounting standard.

## Company Errors

For company errors, the corrective entry depends on what was originally booked wrong. The playground generates a placeholder entry against a **suspense account** (472 in OHADA), which an accountant then refines.
