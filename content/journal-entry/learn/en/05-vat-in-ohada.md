# VAT Handling in SYSCOHADA

## Overview

Value Added Tax (**TVA** — *Taxe sur la Valeur Ajoutée*) is a consumption tax applied at each stage of the supply chain. In the OHADA zone, the standard rate varies by country. Cameroon uses **19.25%** as a common reference rate.

## Key VAT Accounts

| Code | French Name | English Name | Normal Balance |
|------|------------|--------------|----------------|
| `4431` | TVA facturée sur ventes | VAT Collected | Credit |
| `4451` | TVA récupérable sur achats | VAT Deductible | Debit |
| `4441` | TVA due (État) | VAT Payable | Credit |

## Recording a Sale with VAT

Selling merchandise for 2,500,000 XAF + 19.25% VAT:

- VAT amount: 2,500,000 × 19.25% = **481,250 XAF**
- Total collected: **2,981,250 XAF**

| Account | Debit | Credit |
|---------|-------|--------|
| `521` Bank | 2,981,250 | |
| `701` Sales - Merchandise | | 2,500,000 |
| `4431` VAT Collected | | 481,250 |

## Recording a Purchase with VAT

Purchasing merchandise for 1,200,000 XAF + 19.25% VAT:

- VAT amount: 1,200,000 × 19.25% = **231,000 XAF**
- Total paid: **1,431,000 XAF**

| Account | Debit | Credit |
|---------|-------|--------|
| `601` Purchases - Merchandise | 1,200,000 | |
| `4451` VAT Deductible | 231,000 | |
| `401` Accounts Payable | | 1,431,000 |

## VAT Settlement

At period end, the company calculates the net VAT position:

- **VAT Collected** (4431) − **VAT Deductible** (4451) = **VAT Payable** (4441)

If collected > deductible, the company owes the difference to the State. If deductible > collected, the company has a VAT credit to carry forward.

| Account | Debit | Credit |
|---------|-------|--------|
| `4431` VAT Collected | 481,250 | |
| `4451` VAT Deductible | | 231,000 |
| `4441` VAT Payable | | 250,250 |
