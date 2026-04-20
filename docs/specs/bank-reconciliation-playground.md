# Bank Reconciliation Playground — Implementation Spec

**Status:** Approved plan, pending implementation
**Date:** 2026-04-20
**Slug:** `bank-reconciliation`
**Category:** financial-accounting
**Standards:** SYSCOHADA, IFRS, French PCG, US-GAAP

---

## Goal

Native Svelte 5 playground teaching the bank reconciliation process (rapprochement bancaire) to OHADA-zone accounting students. Mirrors Amortization's architecture; reuses shared modules; introduces no duplicate types/components/utilities.

---

## Reuse-First Architecture

Building blocks are sourced from existing shared modules. New code is written **only** for genuinely bank-reconciliation-specific logic (matching algorithm, two-column statement, item classification).

### Reused from `$lib/` (no changes needed)
| Module | Used For |
|---|---|
| `$lib/components/playground/PlaygroundShell.svelte` | Main wrapper (tabs, share, settings) |
| `$lib/components/playground/PlaygroundLearn.svelte` | Learn tab |
| `$lib/components/playground/PlaygroundScenarios.svelte` | Scenarios tab |
| `$lib/components/playground/ExercisePanel.svelte` | Exercise rendering |
| `$lib/shared/chart-of-accounts/` | `getAccount(key, framework)` for all account resolution |
| `$lib/format/` | `fmtCurrency`, `fmtPct`, `fmtNumber` |
| `$lib/contracts/playground.ts` | `PlaygroundManifest`, `ExerciseTypeDef`, `ExerciseFeedback` |
| `$lib/content/loader.ts` + `types.ts` | `LearnSection`, `Scenario`, `ExerciseTemplateFile` |
| `$lib/i18n/` | Translation registry |
| `$lib/persistence/` | `createPersistentStore` for state |
| `$lib/stores/preferences.ts` | `currency$`, `accountingStandard$`, `locale$` |
| `$lib/playgrounds/_registry.ts` | `registerPlayground` |
| `$lib/finance/dayCount.ts` | `yearFraction` for date-window matching |

### Components to PROMOTE before bank-rec implementation
These four already live under one playground but are clearly generic. Promote them once; bank-rec then imports from `$lib/components/playground/`. CVP / Journal Entry / Amortization update their imports — no behavior change.

| Source | Destination | Why |
|---|---|---|
| `playgrounds/journal-entry/components/AccountPicker.svelte` | `$lib/components/playground/AccountPicker.svelte` | Bank-rec needs account selection for adjusting JEs and item classification |
| `playgrounds/journal-entry/components/BalanceIndicator.svelte` | `$lib/components/playground/BalanceIndicator.svelte` | Reuse for any debit-equals-credit display |
| `playgrounds/cvp/components/NumberField.svelte` | `$lib/components/playground/NumberField.svelte` | Generic numeric input for opening/closing balances, amount fields |
| `playgrounds/amortization/components/KpiStrip.svelte` | `$lib/components/playground/KpiStrip.svelte` | Refactor props from `{kpis: AmortizationKpis}` to `{kpis: KpiItem[]}` where `KpiItem = { labelKey, value, format }` |

### Helpers to PROMOTE
| Source | Destination | Used For |
|---|---|---|
| `playgrounds/cvp/grader.ts` → `gradeNumeric` | `$lib/grading/numeric.ts` | Numeric exercise grading (tolerance, abs/rel) |
| `playgrounds/journal-entry/grader.ts` → `gradeJournalEntry` | `$lib/grading/journal-entry.ts` | JE exercise grading (3-pass line matching, canonical form) |

### NOT extracted yet (premature abstraction)
- **`ScheduleTable` → `GenericTable`** — defer until a 3rd playground actually needs it. Bank-rec's bank/ledger panels are simple enough to build inline.
- **`LifecyclePanel` extraction** — bank-rec's adjusting-entries panel is read-only and small; build a focused `AdjustingEntriesPanel` for now, share if pattern repeats.

### Genuinely NEW (bank-rec specific)
- `BankStatementPanel.svelte` — editable bank-side transaction list
- `LedgerPanel.svelte` — editable books-side ledger list
- `ReconciliationStatement.svelte` — two-column "état de rapprochement"
- `AdjustingEntriesPanel.svelte` — read-only display of auto-generated adjusting JEs
- `UnmatchedItemsPanel.svelte` — drag-to-classify unmatched items (hand-rolled `pointer*` events)
- `MatchingPairsOverlay.svelte` — SVG lines linking matched rows (optional v1.1)

---

## Domain Model (`types.ts`)

```ts
import type { AccountingFramework } from '$lib/shared/chart-of-accounts';
import type { CurrencyCode } from '$lib/format';

export type ItemCategory =
  | 'outstanding-check'    // ledger-only check, not yet cleared
  | 'deposit-in-transit'   // ledger-only deposit, not yet on statement
  | 'bank-charge'          // statement-only debit (627)
  | 'interest-earned'      // statement-only credit (771)
  | 'nsf-check'            // bounced customer check (411)
  | 'direct-debit'         // statement-only auto-debit
  | 'standing-order'       // statement-only auto-credit
  | 'bank-error'           // adjust BANK side
  | 'company-error';       // adjust BOOKS side

export type Side = 'bank' | 'books';
export type AdjustmentTarget = 'bank' | 'books' | 'none';

export interface BankTransaction {
  id: string;
  date: string;             // ISO
  description: string;
  amount: number;           // minor units, signed (+ = credit to depositor)
  reference?: string;       // check #, wire id
  cleared: boolean;
}

export interface LedgerEntry {
  id: string;
  date: string;
  description: string;
  amount: number;           // signed (+ = increases cash on books)
  reference?: string;
  recorded: boolean;
}

export interface MatchPair {
  bankTxId: string;
  ledgerEntryId: string;
  matchType: 'exact-amount-ref' | 'exact-amount-date' | 'fuzzy' | 'manual';
  confidence: number;       // 0..1
}

export interface ReconcilingItem {
  id: string;
  category: ItemCategory;
  amount: number;           // always positive; sign derived from category + side
  side: Side;
  target: AdjustmentTarget;
  sourceTxId?: string;
  description: string;
  needsJournalEntry: boolean;
}

export interface ReconciliationInputs {
  periodEnd: string;
  currency: CurrencyCode;
  openingBankBalance: number;
  closingBankBalance: number;
  openingBookBalance: number;
  closingBookBalance: number;
  bankTransactions: BankTransaction[];
  ledgerEntries: LedgerEntry[];
  manualMatches: MatchPair[];
  manualClassifications: Record<string, ItemCategory>;
}

export interface BankReconciliationStatement {
  bankSide: {
    statementBalance: number;
    addDepositsInTransit: number;
    lessOutstandingChecks: number;
    addLessBankErrors: number;
    adjustedBalance: number;
  };
  booksSide: {
    bookBalance: number;
    addInterest: number;
    lessBankCharges: number;
    lessNsfChecks: number;
    addLessCompanyErrors: number;
    adjustedBalance: number;
  };
  variance: number;
  isReconciled: boolean;
}

export interface BankReconciliationKpis {
  matchedCount: number;
  unmatchedBankCount: number;
  unmatchedBooksCount: number;
  matchedAmount: number;
  variance: number;
  itemsByCategory: Record<ItemCategory, number>;
  reconciliationStatus: 'reconciled' | 'unbalanced' | 'pending';
}

export interface ReconciliationResult {
  matches: MatchPair[];
  items: ReconcilingItem[];
  unmatchedBank: BankTransaction[];
  unmatchedBooks: LedgerEntry[];
  statement: BankReconciliationStatement;
  kpis: BankReconciliationKpis;
}
```

---

## Engine (`engine.ts`) — Pure TS class

```ts
class BankReconciliationEngine {
  match(inputs: ReconciliationInputs): MatchPair[]
  classify(inputs: ReconciliationInputs, matches: MatchPair[]): ReconcilingItem[]
  buildStatement(inputs: ReconciliationInputs, items: ReconcilingItem[]): BankReconciliationStatement
  computeKpis(result: Omit<ReconciliationResult, 'kpis'>): BankReconciliationKpis
  reconcile(inputs: ReconciliationInputs): ReconciliationResult   // orchestrator
  solveMissingBalance(inputs: ReconciliationInputs, knownSide: Side): number
  detectErrorItem(items: ReconcilingItem[], variance: number): string | null
}
```

**Matching algorithm** — 3 deterministic passes (greedy):
1. `exact-amount-ref` (confidence 1.0): same `reference` + same `|amount|`
2. `exact-amount-date` (0.85): same `|amount|`, dates within ±3 days
3. `fuzzy` (0.6): same `|amount|`, dates within ±10 days, description token overlap > 0.5

`inputs.manualMatches` always wins; participants removed from prior passes.

**Balance equation** (single source of truth):
```
adjustedBank  = statementBalance + Σ depositsInTransit − Σ outstandingChecks ± Σ bankErrors
adjustedBooks = bookBalance + Σ interest − Σ bankCharges − Σ nsfChecks − Σ directDebits ± Σ companyErrors
isReconciled  = |adjustedBank − adjustedBooks| < 1   // 1 minor unit
```

All sums in integers; division only at presentation.

---

## Journal Entry Builder (`journal-entries.ts`)

```ts
export function buildAdjustingEntries(
  result: ReconciliationResult,
  _framework: AccountingFramework,
): AdjustingJournalEntry[]
```

Returns one entry per `item.needsJournalEntry === true`. Account keys are framework-agnostic (resolved at render time via `getAccount`).

| Category | Debit key | Credit key | OHADA codes |
|---|---|---|---|
| `bank-charge` | `bankServiceCharges` (NEW) | `bank` | 627 / 521 |
| `interest-earned` | `bank` | `interestIncome` | 521 / 771 |
| `nsf-check` | `accountsReceivable` | `bank` | 411 / 521 |
| `direct-debit` | `externalServices` | `bank` | 62 / 521 |
| `standing-order` | `externalServices` | `bank` | 62 / 521 |
| `company-error` | derived from direction | derived | varies |
| `outstanding-check`, `deposit-in-transit`, `bank-error` | none | none | book entry exists / bank's problem |

**One new chart-of-accounts entry needed:** `bankServiceCharges` (code 627, "Services bancaires" / "Bank Service Charges") — added to `$lib/shared/chart-of-accounts/ohada-accounts.ts` plus the three override files.

---

## Component Layout

`Playground.svelte` composes inside `<PlaygroundShell>` with snippet `{#snippet playground(state, updateState)}`. Layout:

- **3-col desktop ≥1200px:** `[InputsPanel] | [BankStatementPanel + LedgerPanel side-by-side] | [KpiStrip + ReconciliationStatement + AdjustingEntriesPanel stacked]`
- **1-col mobile <1200px:** stacked

Component build order (leaf → composite):

1. **Reused/promoted (no new code):** `KpiStrip`, `NumberField`, `AccountPicker`, `BalanceIndicator`
2. **NEW leaf components:**
   - `BankStatementPanel.svelte` — `{ transactions, matches, selectedId, onEdit, onSelect, currency }`
   - `LedgerPanel.svelte` — `{ entries, matches, selectedId, onEdit, onSelect, currency }`
   - `ReconciliationStatement.svelte` — `{ statement, currency, skin: 'classic-fr' | 'modern' }`
   - `AdjustingEntriesPanel.svelte` — `{ entries, framework }` (read-only; uses promoted `AccountPicker` only for label rendering)
   - `UnmatchedItemsPanel.svelte` — `{ unmatchedBank, unmatchedBooks, onClassify }` (hand-rolled drag, no library)
3. **NEW composite:** `InputsPanel.svelte` (period, currency, opening/closing balances; uses `NumberField`)
4. **Shell:** `Playground.svelte`, `Learn.svelte` (one-liner using `PlaygroundLearn`)

---

## Exercises (`exercises.ts`)

Eight exercise types funnel through the same `exerciseMeta` array + `exerciseSolvers` map pattern as `amortization/exercises.ts`. Grading delegates to promoted `gradeNumeric` and `gradeJournalEntry`.

| Slug | Difficulty | Solver returns | Grading |
|---|---|---|---|
| `simple-recon` | fondamental | `{ adjustedBank, adjustedBooks }` | `gradeNumeric` ×2 |
| `outstanding-checks` | fondamental | `{ total }` | `gradeNumeric`, abs tol 1 |
| `classify-items` | intermediaire | per-item `category` | per-item correctness, score = correct/total |
| `compute-adjusted-balance` | intermediaire | `{ adjustedBank }` | `gradeNumeric`, rel tol 0.001 |
| `generate-adjustments` | intermediaire | per-item `{ debitKey, creditKey, amount }` | `gradeJournalEntry` (canonical form) |
| `find-error` | avance | `{ errorItemId }` | exact id match |
| `missing-balance` | avance | `{ closingBank }` | `gradeNumeric`, rel tol 0.001 |
| `multi-month-roll` | avance | `{ month2Adjusted }` | `gradeNumeric`, rel tol 0.001 |

---

## Content (`content/bank-reconciliation/`)

```
content/bank-reconciliation/
├── learn/
│   ├── en/
│   │   ├── 01-intro.md
│   │   ├── 02-why-reconcile.md
│   │   ├── 03-reconciling-items.md
│   │   ├── 04-statement-format.md
│   │   ├── 05-matching-techniques.md
│   │   ├── 06-adjusting-entries.md
│   │   ├── 07-bank-vs-company-errors.md
│   │   ├── 08-syscohada-context.md
│   └── fr/  (parallel)
├── scenarios/
│   ├── 01-simple-2-items.json
│   ├── 02-classic-five-items.json
│   ├── 03-bank-charges-interest.json
│   ├── 04-nsf-and-direct-debit.json
│   ├── 05-bank-error-flag.json
│   └── 06-multi-month.json
└── exercises/
    ├── fondamental/  (2 files)
    ├── intermediaire/ (3 files)
    └── avance/ (3 files)
```

---

## i18n (`src/lib/i18n/namespaces/bank-reconciliation.{en,fr}.ts`)

Key prefix `br.`:
- `br.title`, `br.desc`, `br.tab.*`
- `br.inputs.*`, `br.bank.*`, `br.books.*`
- `br.statement.*` — line labels (FR: "Solde initial banque", "À ajouter", "À déduire")
- `br.kpi.*`, `br.category.<cat>.{label,desc}`
- `br.je.<cat>.{label,desc,narration}`
- `br.exercise.<slug>.{prompt,correct,incorrect}` × 8
- `br.scenario.<slug>.{title,desc}` × 6
- `pg.bankReconciliation.{title,desc}` (added to `playgrounds.{en,fr}.ts`)

---

## Registry & Catalog Wiring

| File | Change |
|---|---|
| `src/lib/playgrounds/bank-reconciliation/index.ts` | NEW — `registerPlayground('bank-reconciliation', ...)` |
| `src/lib/playgrounds/index.ts` | EDIT — add `import './bank-reconciliation';` |
| `src/lib/i18n/index.ts` | EDIT — register namespace |
| `src/lib/data/playgrounds.ts` | EDIT — append catalog entry (icon: `🏧`, `lineCount: 0`) |
| `src/routes/[lang]/playgrounds/[slug]/` | NO CHANGE — dynamic route handles it |

---

## Build Sequence (4 phases, 16 atomic steps)

### Phase 0 — Promotions (low risk, value compounds across playgrounds)
1. Promote `AccountPicker.svelte` to `$lib/components/playground/`. Update import in `journal-entry/components/JournalEntryForm.svelte`. Run vitest + existing journal-entry e2e.
2. Promote `BalanceIndicator.svelte` to `$lib/components/playground/`. Update journal-entry import. Test.
3. Promote `NumberField.svelte` to `$lib/components/playground/`. Update CVP imports. Test.
4. Promote + refactor `KpiStrip.svelte` to `$lib/components/playground/` with generic `KpiItem[]` props. Update amortization caller. Test.
5. Promote `gradeNumeric` to `$lib/grading/numeric.ts`. Update CVP grader. Test.
6. Promote `gradeJournalEntry` to `$lib/grading/journal-entry.ts`. Update journal-entry grader. Test.

### Phase A — Bank-rec foundation (no UI)
7. Add `bankServiceCharges` (627) to `$lib/shared/chart-of-accounts/ohada-accounts.ts` + 3 override files. Extend chart-of-accounts test.
8. Create `src/lib/playgrounds/bank-reconciliation/types.ts`.
9. Create `engine.ts` — implement match / classify / buildStatement / computeKpis / reconcile / solveMissingBalance.
10. Create `journal-entries.ts` — `buildAdjustingEntries`.
11. Write `tests/unit/bank-reconciliation-engine.test.ts` + `bank-reconciliation-journal-entries.test.ts`. Iterate to green.

### Phase B — Content & i18n
12. Create i18n namespaces + register. Add catalog `pg.bankReconciliation.*` keys.
13. Author 8 learn markdown files (EN + FR).
14. Author 6 scenarios + 8 exercise JSON files.

### Phase C — UI & wiring
15. Create `manifest.ts`, `exercises.ts`, all NEW `.svelte` components (per Component Layout above), `Playground.svelte`, `Learn.svelte`, `index.ts`. Wire registry + catalog.
16. Write `tests/e2e/bank-reconciliation.test.ts`. Run full `npm run test:e2e` + `npm run test:unit`. Hand-test all scenarios + exercises.

---

## Open Decisions (need user input before Phase 0)

1. **Statement layout skins** — default `classic-fr` (T-shaped FR labels) when locale=fr, `modern` otherwise. OK?
2. **Drag-and-drop** — hand-rolled `pointer*` events (no new dep). OK?
3. **CSV/PDF import** — defer to v2; ship "Coming soon" stub button. OK?
4. **Multi-currency mixed items** — v1 flags & excludes from statement. OK?
5. **Exercise count** — ship all 8 in v1, or core 5 first? (5 = `simple-recon`, `outstanding-checks`, `classify-items`, `compute-adjusted-balance`, `generate-adjustments`)
6. **Promotion phase** — do all 6 promotions BEFORE bank-rec build (Phase 0), or skip promotion and direct-import from sibling playgrounds? Recommend Phase 0 for cleaner long-term architecture (bank-rec is the 5th playground; promotion delay only gets worse).

---

## Risks

- Promotions touch CVP + Journal Entry + Amortization. Must run their existing test suites green before proceeding.
- Engine's `classify` uses heuristic keywords ("interest", "fee") — keep override path (`manualClassifications`) prominent in UI.
- Multi-currency reconciliation is genuinely complex; v1 sidesteps by single-currency assumption.
