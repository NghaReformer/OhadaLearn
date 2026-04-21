# Interest Playground — Shape Doc

**Status:** Draft for review — not yet an implementation spec
**Date:** 2026-04-21
**Slug:** `interest`
**Category:** `business-math`
**Standards:** SYSCOHADA, IFRS, French PCG, US-GAAP (no standard-specific logic needed — pure math)
**Origin:** 2026-04-21 daily-review idea P5, expanded to include Simple vs Compound

---

## Goal

A single interactive playground that teaches the **three-level interest ladder** — Simple → Compound → Effective — as one continuous pedagogical journey with rich visuals, rather than three disconnected calculators.

The learner builds intuition in this order:
1. **Simple interest** — interest is a flat line on the time axis; principal is static.
2. **Compound interest** — interest earns interest; the curve bends upward; frequency matters.
3. **Effective vs Nominal rate** — a 12% nominal rate compounded monthly is *not* 12%; it's 12.68%. Then: what does SYSCOHADA Revised / IFRS 9 mean when they say "measure at amortised cost using the effective interest rate"?

By the end, the learner can defend the formula **(1 + r/m)^m − 1** not as a trick but as an inevitable consequence of compounding.

---

## Why one playground, not two

Report P5 (EIR vs Nominal) targets Master-level. A separate Licence-level "Simple vs Compound" would lose the narrative arc that makes EIR *understandable*. By tabbing the three modes inside one playground:

- Licence 1/2 learners can stop after Mode 2 (Compound) — the first two modes stand alone.
- Licence 3 / Master learners continue into Mode 3 (EIR) — each mode's output becomes the next mode's input.
- The shared timeline axis makes the "why" visible: EIR appears naturally as the limit of shortening the compounding period.

Cost: a larger playground component. Mitigated by lazy-loading per mode.

---

## Information architecture

```
Interest Playground
├── Learn tab (reused shell)
├── Play tab
│   ├── Mode selector: Simple | Compound | Effective
│   ├── Shared input panel (principal, rate, term, frequency)
│   ├── Mode-specific canvas:
│   │   • Simple   → linear growth chart + per-period table
│   │   • Compound → exponential curve + compounding-steps chart
│   │   • Effective→ side-by-side nominal/EIR schedules + carrying-value divergence
│   └── Comparison drawer (slide-out, persistent across modes)
└── Scenarios tab (reused shell)
    • Bank loan comparison — which of 3 offers is actually cheapest?
    • Savings goal — how long to double at 6% compounded daily?
    • IFRS 9 transition — restate a legacy loan from straight-line to EIR
```

### Mode 1 — Simple Interest
- **Inputs:** principal, annual rate, term (years or days), day-count (actual/360 vs actual/365) — reuse `$lib/finance/dayCount.ts`
- **Formula panel:** `I = P × r × t` displayed as a moving equation where each term is clickable and highlights its visual representation
- **Visual:** linear growth chart; principal as a shaded baseline; interest as a triangle accumulating above it; timeline scrubber shows interest at any point `t`
- **Misconception addressed:** students treat simple interest as a legacy/trivial case, skipping the day-count subtleties that matter for commercial paper and short-term SYSCOHADA transactions

### Mode 2 — Compound Interest
- **Inputs:** above + compounding frequency (annual / semi-annual / quarterly / monthly / weekly / daily / continuous)
- **Formula panel:** `FV = P(1 + r/m)^(m·t)` with each compounding period animated as a bar jumping up and rolling into the next principal
- **Visual:** exponential curve overlaid on Mode 1's linear line, showing the growing divergence; a secondary chart with stacked bars per compounding period showing "interest-on-principal" vs "interest-on-interest"; a slider for `m` that morphs the curve continuously and shows the limit as `m → ∞` converging to `P·e^(r·t)`
- **Misconception addressed:** students memorize `(1+r)^n` but don't internalize that `m` fundamentally changes the yield

### Mode 3 — Effective vs Nominal
- **Inputs:** above + (optional) bond parameters: face value, coupon rate, market rate at issuance, term
- **Two sub-modes inside Mode 3:**
  - **Rate conversion** — pure math. Nominal input, EIR output (and vice versa) with the formula `EIR = (1 + r_nom/m)^m − 1` visualized as a twist: the nominal rate "inflates" to its effective equivalent
  - **Amortised-cost schedule** — bond amortisation using EIR method (IFRS 9 / SYSCOHADA Revised). Side-by-side tables: straight-line vs EIR, with a divergence chart showing carrying amounts over time
- **Visual:** the signature chart is a **divergence ribbon** — two lines (nominal schedule, EIR schedule) with the gap between them shaded, showing cumulative over/understatement of interest expense under each method
- **Misconception addressed:** students who ace Mode 2 still can't read a bond amortisation table because they conflate coupon rate with yield and don't see why IFRS/SYSCOHADA Revised mandates EIR

### Comparison drawer (persistent)
A slide-out panel the learner can pin values into across modes. Example: "Set rate = 10%, term = 5 years, principal = 1,000,000 XOF. Pin Mode 1 result. Switch to Mode 2 → pin. Switch to Mode 3 → pin." The drawer then shows all three side by side with the deltas. This is where the pedagogical payoff happens — the three-mode comparison IS the lesson.

---

## Reuse-first architecture

Following the precedent set by [bank-reconciliation-playground.md](./bank-reconciliation-playground.md).

### Reused from `$lib/` (no changes)
| Module | Used for |
|---|---|
| `$lib/components/playground/PlaygroundShell.svelte` | Tabs wrapper, share/settings |
| `$lib/components/playground/PlaygroundLearn.svelte` | Learn tab |
| `$lib/components/playground/PlaygroundScenarios.svelte` | Scenarios tab |
| `$lib/components/playground/ExercisePanel.svelte` | Exercise rendering |
| `$lib/components/playground/NumberField.svelte` | Principal, rate, term inputs |
| `$lib/format/` | `fmtCurrency`, `fmtPct`, `fmtNumber` |
| `$lib/contracts/playground.ts` | `PlaygroundManifest`, `ExerciseTypeDef`, `ExerciseFeedback` |
| `$lib/content/loader.ts` + `types.ts` | `LearnSection`, `Scenario`, `ExerciseTemplateFile` |
| `$lib/i18n/` | Translation registry (new namespace `pg.interest.*`) |
| `$lib/persistence/` | `createPersistentStore` for state |
| `$lib/stores/preferences.ts` | `currency$`, `locale$` |
| `$lib/playgrounds/_registry.ts` | `registerPlayground` |
| `$lib/finance/dayCount.ts` | `yearFraction` for day-count conventions |
| `$lib/playgrounds/tvm/engine.ts` | **Reuse PV/FV primitives** — check what's exported; the EIR amortisation is TVM-adjacent and should not duplicate discount-factor logic |
| `$lib/playgrounds/amortization/engine.ts` | **Check for reusable schedule-building utilities** (period iteration, carrying-amount tracking) |

### Genuinely new (interest-specific)
- `ModeTabs.svelte` — Simple / Compound / Effective selector
- `SimpleGrowthChart.svelte` — linear chart + timeline scrubber
- `CompoundGrowthChart.svelte` — exponential curve + frequency-morph slider
- `DivergenceRibbon.svelte` — EIR vs nominal divergence chart (the signature visual)
- `FormulaPanel.svelte` — animated formula with clickable terms
- `ComparisonDrawer.svelte` — slide-out pin-and-compare panel
- `engine.ts` — pure functions: `simpleInterest`, `compoundFV`, `nominalToEir`, `eirToNominal`, `eirAmortisationSchedule`
- `types.ts` — `InterestMode`, `CompoundingFrequency`, `AmortisationMethod`, `InterestSnapshot` (for drawer pins)

### Deliberately NOT extracted yet
- **`SimpleGrowthChart` → `GenericTimelineChart`** — defer until a 2nd consumer exists. Premature abstraction.
- **Formula animation system** — inline SVG/CSS in `FormulaPanel` for now. Generalise only if 2 more playgrounds need it.

### Rule-check preflight (before any code lands)
All rules from [CLAUDE.md](../../CLAUDE.md) apply; the daily-review trigger will catch violations, so pre-emptively:
- No emoji in manifest `icon` — wait for the icon-system PR or use a textual identifier
- No hardcoded hex — even gradient stops go through theme tokens (use the new `greenDeep`/`errorDeep` added in [fix/cvp-theme-tokens](https://github.com/NghaReformer/OhadaLearn/pull/new/fix/cvp-theme-tokens) as precedent for adding new tokens when needed)
- No `export let`, `$:`, `on:click`, `<slot/>`, `$app/stores` — Svelte 5 runes only
- All strings bilingual (EN/FR) via new `pg.interest` namespace; `npm run i18n:check` must pass

---

## Open questions

Before writing the implementation spec, decisions needed:

1. **Scenarios scope for v1** — 3 scenarios (bank loan, savings goal, IFRS 9 transition), or just 1 to start?
2. **Continuous compounding** — include `e^(r·t)` case in Mode 2, or drop it as out-of-scope for OHADA curriculum?
3. **Bond amortisation inputs** — Mode 3b requires bond-specific inputs (face, coupon). Keep inline, or put behind a "switch to bond mode" toggle to keep the simple nominal-↔-EIR conversion uncluttered?
4. **Day-count in compound mode** — compounding and day-count interact non-trivially (actual/actual vs 30/360 inside a compounded formula). Support only "years" in Mode 2 for v1, or full day-count from day one?
5. **Exercises — grading approach** — numeric tolerance for interest calculations is harder than CVP (rounding can drift). Do we reuse `$lib/grading/numeric.ts` as-is (per bank-rec pattern) or introduce a compounding-aware grader?

---

## Not in scope

Explicitly out to prevent scope creep:
- Loan amortisation schedules with principal payments (already covered by the Amortization playground — link to it from Learn tab)
- Bond pricing beyond amortised cost (YTM calculators, convexity, duration — separate playground if needed)
- Present/Future-value calculators beyond what's needed to contextualise EIR (TVM playground covers this)
- Tax effects on interest income (orthogonal concern — add later if demand)

---

## Next step

Get user sign-off on: (a) the three-mode ladder architecture, (b) the reuse-first module list, (c) answers to the 5 open questions. Then write the full implementation spec (`interest-playground.md`) in the bank-reconciliation format, and a companion browser-test prompt.

**I am NOT yet writing the implementation spec or the code. This doc is the alignment artifact.**
