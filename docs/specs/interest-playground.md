# Interest Playground — Implementation Spec

**Status:** Approved shape, pending implementation
**Date:** 2026-04-21
**Slug:** `interest`
**Category:** `business-math`
**Standards:** SYSCOHADA, IFRS, French PCG, US-GAAP (no standard-specific logic — pure math)
**Companion doc:** [interest-playground-shape.md](./interest-playground-shape.md)

---

## Goal

Native Svelte 5 playground teaching the three-level interest ladder — Simple → Compound → Effective vs Nominal — as one continuous learning journey. Mirrors bank-reconciliation's architecture; maximises reuse of TVM's rate/frequency primitives; introduces **zero** duplicate types or utilities.

By the end of Mode 3, the learner can defend `(1 + r/m)^m − 1` not as a memorised formula but as the inevitable consequence of shortening the compounding period — and can read an IFRS 9 / SYSCOHADA Revised amortised-cost schedule without confusion.

---

## Reuse-First Architecture

All building blocks with an existing home are sourced from there. New code only where logic is genuinely interest-specific.

### Reused from `$lib/` (no changes needed)

| Module | Used for |
|---|---|
| `$lib/components/playground/PlaygroundShell.svelte` | Tabs wrapper, share, settings |
| `$lib/components/playground/PlaygroundLearn.svelte` | Learn tab |
| `$lib/components/playground/PlaygroundScenarios.svelte` | Scenarios tab |
| `$lib/components/playground/ExercisePanel.svelte` | Exercise rendering |
| `$lib/format/` | `fmtCurrency`, `fmtPct`, `fmtNumber`, `parseLocaleNumber`, `getCurrencyLocale` |
| `$lib/contracts/playground.ts` | `PlaygroundManifest`, `ExerciseTypeDef`, `ExerciseFeedback` |
| `$lib/content/loader.ts` + `types.ts` | `LearnSection`, `Scenario`, `ExerciseTemplateFile` |
| `$lib/i18n/` | Translation registry |
| `$lib/persistence/` | `createPersistentStore` for playground state |
| `$lib/stores/preferences.ts` | `currency$`, `locale$` |
| `$lib/playgrounds/_registry.ts` | `registerPlayground` |
| `$lib/finance/dayCount.ts` | `yearFraction(startIso, endIso, convention)` — day-count from day one per user decision |
| `$lib/playgrounds/tvm/types.ts` | **`CompoundingFrequency`** — single source of truth, no duplication |
| `$lib/playgrounds/tvm/engine.ts` | **`getPeriodsPerYear(freq)`**, **`getEffectivePeriodicRate(...)`** — EIR core already exists; Mode 3a is a thin wrapper |

### Components to PROMOTE before interest implementation

Same approach as bank-rec: promote once, then interest imports cleanly. The CVP / Journal Entry / Amortization callers update to the new path in the same promotion commit.

| Source | Destination | Why |
|---|---|---|
| `playgrounds/cvp/components/NumberField.svelte` | `$lib/components/playground/NumberField.svelte` | Principal, rate, term, bond face/coupon inputs |
| `playgrounds/amortization/components/KpiStrip.svelte` | `$lib/components/playground/KpiStrip.svelte` | Rate summary (nominal, EIR, continuous equivalent) — already flagged by bank-rec spec; do it once, both consume it |

If bank-rec lands first, these promotions already exist — skip this section.

### Helpers to PROMOTE

| Source | Destination | Used for |
|---|---|---|
| `playgrounds/cvp/grader.ts` → `gradeNumeric` | `$lib/grading/numeric.ts` | Numeric exercise grading (per user decision: reuse as-is) |

Same note: if bank-rec lands first, already done.

### NOT extracted yet (premature abstraction)

- **`SimpleGrowthChart` → `GenericTimelineChart`** — defer until a 2nd consumer exists
- **Formula-animation system** — inline SVG + CSS transitions in `FormulaPanel.svelte`; generalise if ≥2 more playgrounds need it
- **`DivergenceRibbon` → generic two-series divergence chart** — defer

### Genuinely NEW (interest-specific)

- `ModeTabs.svelte` — Simple / Compound / Effective selector
- `SimpleGrowthChart.svelte` — linear growth + timeline scrubber
- `CompoundGrowthChart.svelte` — exponential curve + frequency-morph slider + "interest-on-interest" stacked bars; includes continuous case overlay
- `DivergenceRibbon.svelte` — EIR vs nominal schedule divergence (the signature Mode 3 visual)
- `FormulaPanel.svelte` — animated formula with clickable terms that highlight their visual representation
- `ComparisonDrawer.svelte` — slide-out, persistent across modes; pin snapshots of results from each mode
- `BondInputsPanel.svelte` — face value, coupon rate, market rate, term, payment frequency (always visible in Mode 3 per user decision)
- `RateSummaryStrip.svelte` — shows nominal, EIR, and continuous equivalent side-by-side using promoted `KpiStrip`
- `engine.ts` — pure functions (below)
- `types.ts` — domain model (below)

---

## Domain Model (`types.ts`)

```ts
import type { CurrencyCode } from '$lib/format';
import type { CompoundingFrequency } from '$lib/playgrounds/tvm/types';
import type { DayCount } from '$lib/finance/dayCount';

export type InterestMode = 'simple' | 'compound' | 'effective';

export type AmortisationMethod = 'straight-line' | 'eir';

export interface InterestInputs {
  principal: number;
  nominalRate: number;          // annual, as decimal (0.12 for 12%)
  startDate: string;            // ISO
  endDate: string;              // ISO
  dayCount: DayCount;           // reused from $lib/finance
  frequency: CompoundingFrequency;  // reused from TVM
  continuous: boolean;          // Mode 2 overlay toggle (per user decision: included)
}

export interface BondInputs {
  faceValue: number;
  couponRate: number;           // annual
  marketRate: number;           // annual — used as EIR at issuance
  termYears: number;
  paymentFrequency: CompoundingFrequency;
}

export interface SimpleResult {
  interest: number;
  total: number;
  perPeriod: Array<{            // one row per calendar period as sliced by day-count
    periodEnd: string;
    fraction: number;           // yearFraction covered
    interestThisPeriod: number;
    cumulativeInterest: number;
    cumulativeTotal: number;
  }>;
}

export interface CompoundResult {
  futureValue: number;
  interest: number;
  effectiveAnnualRate: number;  // computed via TVM's getEffectivePeriodicRate
  continuousEquivalent: number; // P * e^(r*t) — for Mode 2 continuous toggle
  perPeriod: Array<{
    periodIndex: number;
    periodEnd: string;
    balanceStart: number;
    interestThisPeriod: number;
    balanceEnd: number;
    cumulativeInterestOnPrincipal: number;  // stacked-bar: flat rate × principal × Δt
    cumulativeInterestOnInterest: number;   // stacked-bar: remainder
  }>;
}

export interface EirConversion {
  nominalRate: number;
  frequency: CompoundingFrequency;
  effectiveAnnualRate: number;
  continuousEquivalent: number;
}

export interface AmortisationRow {
  periodIndex: number;
  periodEnd: string;
  openingCarryingAmount: number;
  cashInterest: number;          // faceValue × couponRate / freq
  eirInterest: number;           // openingCarryingAmount × marketRate / freq
  discountAmortisation: number;  // eirInterest − cashInterest (can be negative = premium)
  closingCarryingAmount: number;
}

export interface AmortisationSchedule {
  method: AmortisationMethod;
  issuePrice: number;
  totalInterestExpense: number;
  rows: AmortisationRow[];
}

export interface EirResult {
  conversion: EirConversion;
  straightLine: AmortisationSchedule;
  eir: AmortisationSchedule;
  divergenceSeries: Array<{      // driver for DivergenceRibbon
    periodIndex: number;
    straightLineCarrying: number;
    eirCarrying: number;
    gap: number;
  }>;
}

export interface InterestSnapshot {
  id: string;
  mode: InterestMode;
  label: string;                 // user-defined or auto-generated
  inputsHash: string;            // for dedup detection
  summary: {
    principal: number;
    rate: number;                // nominal for Modes 1-2, market for Mode 3
    termYears: number;
    resultHeadline: number;      // simple: total; compound: FV; effective: EIR
    resultLabelKey: string;      // i18n key for the headline label
  };
  createdAt: string;             // ISO
}

export interface InterestState {
  mode: InterestMode;
  inputs: InterestInputs;
  bondInputs: BondInputs;        // always present; only used in Mode 3
  snapshots: InterestSnapshot[];
}

export interface InterestKpis {
  nominalRate: number;
  effectiveAnnualRate: number;
  continuousEquivalent: number;
  principalRatio: number;        // total / principal
  periodCount: number;
}
```

No new types where TVM already defines one. `CompoundingFrequency` and `DayCount` are imported, never re-declared.

---

## Engine (`engine.ts`) — Pure TS

Functional style with one orchestrator per mode. All rates are annual decimals; periodicity is resolved inside the engine via `getPeriodsPerYear`.

```ts
class InterestEngine {
  // Mode 1
  simple(inputs: InterestInputs): SimpleResult

  // Mode 2
  compound(inputs: InterestInputs): CompoundResult
  continuousFV(principal: number, rate: number, years: number): number

  // Mode 3a — pure rate math
  nominalToEir(nominal: number, freq: CompoundingFrequency): number
  eirToNominal(eir: number, freq: CompoundingFrequency): number
  convert(nominal: number, freq: CompoundingFrequency): EirConversion

  // Mode 3b — bond amortisation
  issuePrice(bond: BondInputs): number
  buildSchedule(bond: BondInputs, method: AmortisationMethod): AmortisationSchedule
  eirAnalysis(bond: BondInputs): EirResult

  // KPIs + snapshots
  computeKpis(state: InterestState, result: SimpleResult | CompoundResult | EirResult): InterestKpis
  makeSnapshot(state: InterestState, label?: string): InterestSnapshot
}
```

### Key invariants

- **Day-count everywhere** — every `yearFraction` call goes through `$lib/finance/dayCount.ts`. No ad-hoc `/365` or `/360`.
- **Frequency everywhere** — every periods-per-year lookup goes through TVM's `getPeriodsPerYear`. No hardcoded 12 / 4 / 1.
- **Continuous formula** — `P · exp(r · t)` using `Math.exp`; `t` from `yearFraction` with the currently selected day-count.
- **EIR = nominalToEir(nom, freq)** is a thin wrapper over `getEffectivePeriodicRate` that annualises the result. Do not re-derive.
- **Bond issue price** = PV of coupon cash flows + PV of face, both discounted at `marketRate`. Reuse `pmt` / geometric series utilities where possible; otherwise implement inline (small function).
- **EIR schedule carrying amount** `C_{n+1} = C_n + (C_n · market_per_period − face · coupon_per_period)` — classic formula; `gap = straightLineCarrying − eirCarrying` drives the divergence ribbon.
- **Rounding** — all arithmetic in `number`; present with `fmtCurrency` / `fmtPct`. Never round mid-calculation.

---

## Component Layout

`Playground.svelte` composes inside `<PlaygroundShell>` with snippet `{#snippet playground(state, updateState)}`.

**Desktop ≥ 1200px (3 columns):**
```
┌──────────────┬─────────────────────────┬──────────────────┐
│ InputsPanel  │   Mode-specific canvas  │  RateSummary     │
│ BondInputs   │   (chart + formula)     │  ComparisonDrawer│
│ (Mode 3)     │                         │                  │
└──────────────┴─────────────────────────┴──────────────────┘
         ModeTabs (sticky top across all columns)
```

**Mobile < 1200px:** stacked, drawer slides from bottom.

### Build order (leaf → composite)

1. **Reused / promoted (no new code):** `NumberField`, `KpiStrip`
2. **NEW leaf components:**
   - `ModeTabs.svelte` — `{ mode, onChange }`
   - `FormulaPanel.svelte` — `{ mode, values, activeTerm, onTermClick }`
   - `SimpleGrowthChart.svelte` — `{ inputs, result, scrubberT, onScrub }`
   - `CompoundGrowthChart.svelte` — `{ inputs, result, showContinuous }`
   - `DivergenceRibbon.svelte` — `{ series, skin: 'syscohada' | 'ifrs' }`
   - `RateSummaryStrip.svelte` — `{ nominal, eir, continuous }` — uses `KpiStrip` internally
   - `ComparisonDrawer.svelte` — `{ snapshots, onPin, onRemove, onClear }`
   - `BondInputsPanel.svelte` — `{ bondInputs, onChange }`
3. **NEW composite:** `InputsPanel.svelte` (principal, rate, dates, day-count, frequency, continuous toggle)
4. **Shell:** `Playground.svelte`, `Learn.svelte` (one-liner using `PlaygroundLearn`)

---

## Exercises (`exercises.ts`)

Nine exercise types across the three modes. All grading funnels through promoted `gradeNumeric` (per user decision — no compound-aware grader in v1).

| Slug | Mode | Difficulty | Solver returns | Grading |
|---|---|---|---|---|
| `simple-interest-total` | 1 | fondamental | `{ total }` | `gradeNumeric`, rel tol 0.001 |
| `simple-interest-days` | 1 | fondamental | `{ interest }` | `gradeNumeric`, rel tol 0.001 |
| `compound-fv` | 2 | fondamental | `{ futureValue }` | `gradeNumeric`, rel tol 0.001 |
| `compound-frequency-effect` | 2 | intermediaire | `{ fvAnnual, fvMonthly, fvContinuous }` | 3× `gradeNumeric` |
| `solve-compound-rate` | 2 | intermediaire | `{ rate }` | `gradeNumeric`, abs tol 0.0005 |
| `nominal-to-eir` | 3a | fondamental | `{ eir }` | `gradeNumeric`, abs tol 0.0001 |
| `eir-to-nominal` | 3a | intermediaire | `{ nominal }` | `gradeNumeric`, abs tol 0.0001 |
| `bond-issue-price` | 3b | intermediaire | `{ issuePrice }` | `gradeNumeric`, rel tol 0.001 |
| `eir-interest-period-n` | 3b | avance | `{ eirInterestAtPeriodN }` | `gradeNumeric`, rel tol 0.001 |

---

## Scenarios (3 per user decision)

Living in `content/interest/scenarios/` as JSON following `Scenario` contract.

1. **`01-bank-loan-comparison.json`** — learner is given 3 loan offers with different nominal rates and compounding frequencies (e.g. 11.8% monthly vs 12% quarterly vs 12.2% annually). They must identify which is cheapest. Payoff: reveals that a lower nominal rate can be worse.
2. **`02-savings-doubling-time.json`** — given principal and target (double the principal), learner manipulates rate and frequency (including continuous) to find the shortest doubling time. Connects the Rule of 72 to compounded reality.
3. **`03-ifrs9-transition.json`** — a legacy 5-year bond was measured straight-line under old SYSCOHADA. Restate under SYSCOHADA Revised / IFRS 9 using EIR. Learner sees divergence between old carrying amount and new, and computes the transition adjustment to retained earnings.

---

## Content (`content/interest/`)

```
content/interest/
├── learn/
│   ├── en/
│   │   ├── 01-intro.md
│   │   ├── 02-simple-interest.md
│   │   ├── 03-day-count-conventions.md
│   │   ├── 04-compound-interest.md
│   │   ├── 05-frequency-effects.md
│   │   ├── 06-continuous-compounding.md
│   │   ├── 07-effective-vs-nominal.md
│   │   ├── 08-amortised-cost-eir.md
│   │   └── 09-syscohada-revised-context.md
│   └── fr/  (parallel)
├── scenarios/
│   ├── 01-bank-loan-comparison.json
│   ├── 02-savings-doubling-time.json
│   └── 03-ifrs9-transition.json
└── exercises/
    ├── fondamental/  (3 files)
    ├── intermediaire/ (4 files)
    └── avance/ (1 file — bond-specific)
```

---

## i18n (`src/lib/i18n/namespaces/interest.{en,fr}.ts`)

Key prefix `int.`:
- `int.title`, `int.desc`, `int.tab.*`
- `int.mode.{simple,compound,effective}.{label,tabShort}`
- `int.inputs.*` — principal, rate, dates, day-count options, frequency options, continuous toggle
- `int.bond.*` — face value, coupon rate, market rate, term, payment frequency
- `int.formula.{simple,compound,continuous,eirConversion}.{terms…}` — each term keyed for the clickable highlight
- `int.chart.{simple,compound,divergence}.{title,xAxis,yAxis,legend…}`
- `int.rate.{nominal,effective,continuous}.{label,tooltip}`
- `int.drawer.{empty,pin,compare,clear,labelFor}`
- `int.kpi.*`
- `int.exercise.<slug>.{prompt,correct,incorrect,hint}` × 9
- `int.scenario.<slug>.{title,desc,intro}` × 3
- `int.scenario.01.offers.[0..2].{label,nominalRate,frequency}` — scenario-specific structured keys
- `pg.interest.{title,desc}` (added to `playgrounds.{en,fr}.ts`)

`npm run i18n:check` must pass before any PR merges.

---

## Registry & Catalog Wiring

| File | Change |
|---|---|
| `src/lib/playgrounds/interest/index.ts` | NEW — `registerPlayground('interest', ...)` |
| `src/lib/playgrounds/index.ts` | EDIT — add `import './interest';` |
| `src/lib/i18n/index.ts` | EDIT — register `interest` namespace |
| `src/lib/data/playgrounds.ts` | EDIT — append catalog entry (`icon` value depends on icon-system PR status; if still emoji era, use `📈`, `lineCount: 0`) |
| `src/routes/[lang]/playgrounds/[slug]/` | NO CHANGE — dynamic route handles it |

---

## Build Sequence (4 phases, 17 atomic steps)

### Phase 0 — Promotions (skip if bank-rec already merged; low-risk)

1. Promote `NumberField.svelte` → `$lib/components/playground/`. Update CVP imports. Vitest + CVP e2e green.
2. Promote `KpiStrip.svelte` → `$lib/components/playground/` with `KpiItem[]` generic props. Update amortization caller. Green.
3. Promote `gradeNumeric` → `$lib/grading/numeric.ts`. Update CVP grader. Green.

### Phase A — Interest foundation (no UI)

4. Create `src/lib/playgrounds/interest/types.ts`. Import `CompoundingFrequency` from TVM; import `DayCount` from finance.
5. Create `engine.ts` — `InterestEngine` class with all methods listed above. Reuse `getPeriodsPerYear` + `getEffectivePeriodicRate` from TVM. Implement bond issue-price + EIR schedule inline.
6. Write `tests/unit/interest-engine.test.ts`:
   - Simple interest round-trip
   - Compound FV vs known values (1000 @ 10% annually for 5y = 1610.51)
   - Monthly compounding effective rate (12% nom → 12.68% EIR)
   - Continuous limit (as m→∞, FV → P·e^(rt))
   - Bond issue price: par (coupon = market) = face; discount (market > coupon); premium (market < coupon)
   - EIR schedule row-1 closing matches published textbook examples
   - Day-count sensitivity: same rate + term, different conventions → different totals
7. Iterate Phase A to green.

### Phase B — Content & i18n

8. Create `interest.{en,fr}.ts` namespaces + register in `src/lib/i18n/index.ts`. Add `pg.interest.*` keys. `npm run i18n:check` green.
9. Author 9 learn markdown files (EN + FR).
10. Author 3 scenarios JSON + 9 exercise JSON files (all 9 per table above).

### Phase C — UI & wiring

11. Build NEW leaf components per Component Layout (`ModeTabs`, `FormulaPanel`, `SimpleGrowthChart`, `CompoundGrowthChart`, `DivergenceRibbon`, `RateSummaryStrip`, `ComparisonDrawer`, `BondInputsPanel`) — all passing typecheck; all hex via theme tokens; all fonts via `var(--font-*)`; all user-visible strings through `translate(...)`.
12. Build `InputsPanel.svelte` (composite).
13. Build `Playground.svelte` + `Learn.svelte` + `manifest.ts` + `exercises.ts` + `index.ts`. Wire registry + catalog.
14. Write `tests/e2e/interest.test.ts`:
    - Mode switches preserve common inputs (principal, rate, dates)
    - Bond inputs always visible when mode=effective (per user decision)
    - Continuous-compounding toggle shows/hides the e-curve overlay
    - Drawer pin/remove round-trip
    - One exercise from each difficulty band passes with correct input
15. Run `npm run test:unit` + `npm run test:e2e`. Fix.
16. Hand-test all 3 scenarios + all 9 exercises in EN and FR.
17. Verify `npm run build` green; visually regression-test all three modes against a theme variant swap (confirm no hex remnants).

---

## Open Decisions

All previously open questions have been answered by the user:

1. **Scenarios scope for v1** → **3 scenarios** (bank loan, savings goal, IFRS 9 transition)
2. **Continuous compounding** → **include** in Mode 2 with a toggle overlay
3. **Bond amortisation inputs in Mode 3** → **always visible** (no toggle)
4. **Day-count in compound mode** → **full day-count day one** — reuse `$lib/finance/dayCount.ts`
5. **Exercise grading** → **reuse `gradeNumeric` as-is** — no compounding-aware grader in v1

One new open decision surfaces during spec writing:

6. **Bond schedule skin** — show SYSCOHADA Revised / IFRS 9 presentation side-by-side by default, or make the skin selector opt-in like bank-rec's `classic-fr` vs `modern`? Recommend **both shown side-by-side** — the entire point of Mode 3 is the comparison.

---

## Risks

- **Continuous compounding** is taught rarely in Cameroon Licence programs; misframing it as core rather than context may confuse target learners. Mitigate: put behind a clearly-labelled "advanced" overlay toggle, not on by default.
- **Day-count conventions** cascade into every mode including Mode 2; a bug in `yearFraction` for one convention affects all three. Mitigate: Phase A test-matrix covers (day-count × frequency) pairs, not just individual conventions.
- **Bond issue-price formula** is simple arithmetically but easy to mis-sign for premiums vs discounts. Mitigate: Phase A test includes par/discount/premium cases explicitly.
- **IFRS 9 transition scenario** touches a political accounting topic (restatement via retained earnings). Keep content factual, not advocating a presentation style — the playground teaches computation, not policy.
- **Promotions phase** overlaps with bank-rec's promotion phase. If bank-rec lands first, Phase 0 is a no-op. If this lands first, bank-rec inherits. Either order works; document current state at PR-open time.

---

## Non-goals (explicit)

- Loan amortisation schedules with principal payments — covered by Amortization playground; link from Learn tab only
- Bond pricing beyond amortised cost (YTM, convexity, duration) — separate playground if demand
- Present/Future-value calculators beyond Mode 3's bond-issue use — TVM playground covers this
- Tax effects on interest income/expense — orthogonal; add later if demand
- Multi-currency interest computation — single-currency assumption for v1
