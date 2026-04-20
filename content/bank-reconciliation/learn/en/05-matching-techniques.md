# Matching Bank vs. Ledger

## Three Passes

The matching algorithm — whether done by hand or by software — runs three passes over the unmatched items in decreasing order of confidence:

**Pass 1 — Reference + amount.** When a bank line and a ledger line share a check number or wire reference and the amounts agree, they are the same transaction. Confidence: 100%.

**Pass 2 — Amount + date proximity.** Same absolute amount, dates within a few days. Most matches without a reference fall here. Confidence: ~85%.

**Pass 3 — Fuzzy.** Same amount, broader date window, descriptions that share key tokens. Useful for transcription mistakes. Confidence: ~60% — flagged for review.

## What Doesn't Match

Anything still unmatched after pass 3 is a reconciling item — by definition. Classify it (see *Reconciling Items*) and decide which side it adjusts.

## Manual Overrides

The algorithm is wrong sometimes. Two equal payments on the same day to different vendors will pair up incorrectly without help. Manual matches always win — they lock the participants out of the auto-passes.

## Sum Matches

A common gotcha: a single bank deposit equals the sum of two ledger entries (split deposit). Most simple matchers miss this. The remedy is either to split the bank line or to allow many-to-one matches — out of scope for the basic playground.
