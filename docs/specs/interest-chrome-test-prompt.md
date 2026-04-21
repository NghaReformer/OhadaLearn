# Interest Playground — Claude-in-Chrome Test Prompt

Use this prompt with Claude in Chrome (or Claude Computer Use) to manually exercise the Interest playground in a real browser and capture issues a unit/e2e test cannot easily catch — visual regressions, focus traps, layout breakage, console errors, locale gaps, numerical correctness under edge cases, and pedagogical clarity.

Target URL: **https://ohadalearn.vercel.app/en/playgrounds/interest**

---

## Prompt

You are a QA engineer and pedagogy reviewer for the OhadaLearn platform. Your job is to manually exercise the new **Interest** playground in a real browser and report every defect, friction, and gap you find. Do **not** fix anything — report only.

### Context (you need this to judge correctness)

The Interest playground teaches interest calculation as a **three-mode ladder**:

1. **Simple** — interest accrues at a flat rate on the original principal. `I = P × r × t`. The growth line is straight.
2. **Compound** — interest earns interest. `FV = P × (1 + r/m)^(m·t)`. The growth curve bends upward. A continuous-compounding overlay (`FV = P × e^(r·t)`) is available.
3. **Effective** — the nominal-vs-EIR subtlety and bond amortised-cost schedules under SYSCOHADA Revised / IFRS 9. A "divergence ribbon" visualises the gap between straight-line and EIR carrying amounts.

Target learners range from Licence 1 to Master and practising professionals in the OHADA zone (Cameroon, Côte d'Ivoire, Senegal, Gabon, etc.). All user-visible text must be bilingual (English + French). Dark theme only.

**Reference numerical answers you should see in the UI** (memorise these — any deviation is a bug):

- 1,000,000 @ 10% simple over 5 years under **30/360** → interest `500,000`, total `1,500,000`
- 1,000 @ 10% annually compounded over 5 years → FV `1,610.51`
- 12% nominal compounded monthly → EIR `12.6825%`
- 10% nominal compounded continuously → EIR `10.5171%` (= e^0.10 − 1)
- Bond: face `1,000,000` / coupon 8% / market 10% / 5 years annual → issue price ≈ `924,184`
- EIR schedule row 1 of that bond: opening `924,184`, cash interest `80,000`, interest expense ≈ `92,418`, discount amortisation ≈ `12,418`, closing ≈ `936,603`
- Last row closing = `1,000,000` exactly for both SL and EIR methods

### Environment

- URL: `https://ohadalearn.vercel.app/en/playgrounds/interest`
- Open the browser, ensure DevTools **Console** and **Network** tabs are visible. Clear the console before each route change.
- Run the main pass at viewport **1440 × 900**, then responsive passes at **768 × 1024** and **390 × 844**.
- For every step, **check the console**: flag any error or warning as at least a minor defect.

### Coverage matrix (run every row)

#### A. Catalog & navigation
1. Visit `/en/playgrounds`. Confirm an **Interest** (or *Interest Lab*) card appears with icon, title, and description.
2. Click the card. Confirm the URL becomes `/en/playgrounds/interest` and **no `<iframe>` is present** in the DOM (this is a native Svelte module).
3. Confirm a tab bar with at least *Playground*, *Learn*, *Scenarios*, *Exercises* tabs.

#### B. Default playground state (Simple mode)
4. The **Mode Tabs** show `Simple Interest / Compound Interest / Effective vs Nominal`. *Simple* is active.
5. The **Inputs Panel** (left sidebar) shows: Principal = `1,000,000`, Nominal rate = `10%`, Start date (today), End date (+5 years), Frequency = Annual, Day-count = 30/360, "Also show continuous" unchecked.
6. The **Bond Inputs Panel** is **not** visible in Simple or Compound modes.
7. The **Rate Summary Strip** reads: Nominal `10.000%`, Effective annual rate `10.000%`, Continuous equivalent ≈ `9.531%`.
8. A **Simple Growth Chart** shows a straight line rising from principal to total. A dashed horizontal "Principal" reference line is drawn at 1,000,000.

#### C. Simple mode numerics
9. With the defaults above, visually confirm the chart reaches total ≈ `1,500,000` at the end.
10. Change Day-count from `30/360` → `actual/365` → `actual/360`. Confirm the chart's endpoint changes (actual/360 should produce the highest total of the three).
11. Change Principal to `2,000,000`. Confirm the Rate Summary does **not** change (it is a function of the rate, not the principal) and the chart scales.

#### D. Compound mode
12. Click **Compound Interest** tab.
13. A **Compound Growth Chart** replaces the linear one. It shows a curved line (green) and a straight dashed line (accent-soft) representing the simple-interest baseline.
14. Change Frequency to `Monthly`. Confirm the Rate Summary EIR updates to ≈ `10.471%` (for rate=10%) and the chart FV increases slightly above the annual compounding endpoint.
15. Set Rate = `12%`, Frequency = `Monthly`. Confirm EIR = `12.6825%`.
16. Check the "Also show continuous" box. Confirm a dashed amber curve appears slightly above the green compound curve. Turn it off. Confirm the amber curve disappears.
17. Set Frequency = `Continuous`, Rate = `10%`. Confirm the EIR reads `10.517%` (= e^0.10 − 1). The chart should now show one continuous curve.

#### E. Effective mode — rate summary & bond inputs
18. Click **Effective vs Nominal** tab.
19. A second panel, **Bond Parameters**, appears below the main Inputs panel with defaults: face = `1,000,000`, coupon = `8%`, market = `10%`, term = `5 years`, payment freq = Annual.
20. A **relation badge** at the bottom of the Bond panel reads "Discount bond — market rate exceeds coupon" in a green-tinted box.
21. Set coupon = `10%` (equal to market). The badge changes to "Par bond — coupon equals market rate" (neutral styling).
22. Set coupon = `12%`. The badge changes to "Premium bond — market rate below coupon" in an amber-tinted box.
23. Reset coupon = `8%`.

#### F. Effective mode — divergence ribbon and schedules
24. With default Effective-mode values (face 1M, coupon 8%, market 10%, 5y annual), confirm a **Divergence Ribbon** chart renders above the schedules with:
    - A solid accent-coloured line (EIR)
    - A dashed amber line (Straight-line)
    - A soft ribbon shaded between them
    - Both lines meet at the same point at period 5 (closing = face value)
25. Confirm two **Schedule Tables** stacked side by side (desktop) labelled *Straight-line* and *EIR*.
26. Read row 1 of the **EIR** schedule. Expected (rounded): opening `924,184`, cash interest `80,000`, interest expense `92,418`, discount amortisation `12,418`, closing `936,603`.
27. Scroll to the last row of the **EIR** schedule. Confirm closing carrying amount = `1,000,000` **exactly** (no floating-point artifacts like `1,000,000.0000002`).
28. Do the same check on the **Straight-line** table's last row. Same expectation: closing = `1,000,000` exactly.
29. Set market rate = `12%`. Confirm both schedules recompute live and the divergence ribbon re-renders without a visible layout shift of the chart title.

#### G. Rate summary live updates
30. Change Nominal rate slider/field from `10%` → `8%` → `14%` in any mode. The Rate Summary Strip must update instantly each time (no stale values).

#### H. Scenarios
31. Open the **Scenarios** tab. Confirm exactly **three** scenario cards: *Bank loan comparison*, *Savings doubling time*, *IFRS 9 transition*.
32. Click **Bank loan comparison**. The playground tab activates. Confirm inputs reflect one of the three pinned loan offers (principal 10,000,000; rate 11.8%; 3-year term; monthly).
33. Click **Savings doubling time**. Confirm the continuous-compounding toggle is ON by default.
34. Click **IFRS 9 transition**. Confirm the mode switches to **Effective** and bond inputs are loaded.

#### I. Exercises
35. Open the **Exercises** tab. Confirm exactly **9** exercises grouped into *fondamental* (4), *intermédiaire* (4), *avancé* (1).
36. Open **Simple interest total** (fondamental). Submit `0`. Confirm red/negative feedback.
37. Compute the correct answer manually from the prompt's parameters and submit. Confirm green/positive feedback.
38. Repeat for one *intermédiaire* exercise (e.g., **Nominal to EIR** or **Bond issue price**).
39. Open the single *avancé* exercise (**EIR interest in period N**). Read the prompt; confirm it includes a bond description and asks for interest in a specific period.

#### J. Learn tab
40. Open the **Learn** tab. Confirm **9** sections render in order:
    - 01 Introduction — three-mode ladder
    - 02 Simple interest
    - 03 Day-count conventions
    - 04 Compound interest
    - 05 Frequency effects
    - 06 Continuous compounding
    - 07 Effective vs nominal rate
    - 08 Amortised cost with EIR
    - 09 SYSCOHADA Revised context
41. Each section should render its markdown (headings, tables, code/math) correctly. No raw `$$…$$` LaTeX showing through if MathJax isn't configured — if LaTeX renders as literal `$$`, flag as a minor defect.

#### K. Locale switch (FR)
42. Use the language toggle (header or URL edit to `/fr/playgrounds/interest`).
43. Confirm every visible label translates: mode tab names ("Intérêts simples", "Intérêts composés", "Taux effectif vs nominal"), input labels ("Capital", "Taux nominal annuel", "Fréquence de capitalisation"), rate summary ("Nominal", "Taux d'intérêt effectif", "Équivalent continu"), chart captions, schedule headers.
44. Scenario and exercise titles/descriptions must be in French.
45. Learn-tab headings must be French translations of the 9 sections.

#### L. Responsive
46. Resize to **768 × 1024** (tablet portrait). Confirm the 2-column layout collapses to 1-column. Inputs panel stacks above the workspace. Charts and schedule tables remain usable.
47. In Effective mode at this width, confirm the two schedule tables stack vertically (no horizontal clipping).
48. Resize to **390 × 844** (phone). Confirm no horizontal scrollbars on the body. Confirm Mode Tabs remain tappable (at least 40px tall). Confirm the Divergence Ribbon chart is still readable (SVG should scale via `viewBox`).

#### M. State persistence (localStorage)
49. In Effective mode, change coupon rate to `7.5%`, then refresh the page (F5). Confirm the mode and coupon rate are restored.
50. Open DevTools → Application → Local Storage → the deployed origin, and verify an `interest_v1` key exists.

#### N. URL share roundtrip (if shell exposes a share button)
51. With a non-default state, click *Share* (if present). Confirm the URL updates with a query parameter.
52. Open that URL in an incognito window and confirm the same state loads.

#### O. Cross-mode navigation integrity
53. Set Principal = `2,500,000` in Simple. Switch to Compound. Confirm Principal is still `2,500,000` (shared input across modes).
54. Switch to Effective. Confirm the Principal field in the Inputs panel is still `2,500,000` even though bond computations use `faceValue` from the Bond panel (they are separate fields, by design).
55. Switch back to Simple. Confirm Principal is still `2,500,000`.

#### P. Theme and visual hygiene
56. Inspect the rendered DOM. Confirm no hardcoded hex colors appear in any `style` attribute or inline style of interest-playground elements. All colours must resolve via CSS custom properties (`var(--*)`).
57. Confirm no emoji icons render inside the **main playground UI** (the catalog card icon `📈` is acceptable since the icon system is a known follow-up).
58. Confirm dark-theme consistency across all modes: panel backgrounds, text contrast, chart axes.

---

### Reporting format

Structure your report into **three explicit sections**. Do not merge them.

#### 1. Issues (defects — things that are broken)

For each defect:
- **Step #** (e.g., `F-27`)
- **Expected** (one sentence)
- **Actual** (one sentence)
- **Severity:** blocker / major / minor / cosmetic
- **Console output** (if any)
- **Screenshot** (attach)

Group defects under **Blocker**, **Major**, **Minor**, **Cosmetic** headings.

#### 2. UX suggestions (not broken, but could be better)

For each suggestion:
- **Area** (e.g., "Inputs Panel", "Divergence Ribbon", "Rate Summary")
- **Observation** — what you noticed (one sentence)
- **Suggestion** — what could change (one sentence)
- **Rationale** — why this helps the target learner (one short paragraph)

Topics to consider explicitly:
- Information density and whitespace on desktop vs mobile
- Chart legibility (axis labels, legend placement, color accessibility under dark theme)
- Input affordances (step increments, keyboard navigation, validation messaging)
- The pedagogical arc: does Mode 2 *naturally* lead to Mode 3, or does it feel disconnected?
- Bond input clarity — is "coupon rate" vs "market rate at issuance" obvious to a Licence-2 student?
- Whether the relation badge ("Discount/Par/Premium bond") conveys the concept or adds noise

#### 3. Gaps (missing features the playground seems to assume but doesn't have)

For each gap:
- **Feature** (short name)
- **Where it would live** (panel / tab / mode)
- **Why it matters** (one sentence — the pedagogical or practical payoff)
- **Priority**: high (blocks a core use case) / medium / low (nice-to-have)

Topics to consider explicitly:
- Formula display — are the formulas (`I = P·r·t`, `FV = P(1+r/m)^(m·t)`, `EIR = (1+r/m)^m − 1`) visible anywhere in the playground UI? If not, should they be?
- Snapshot/comparison — can the learner save results from one mode and compare against another, or must they remember values mentally?
- Frequency morph — is there a control in Compound mode that lets the learner *smoothly* see how the curve changes as compounding frequency increases from annual → continuous?
- Interaction with existing playgrounds — is there any cross-link to the Amortization or TVM playgrounds for the bond/PV mechanics that overlap?
- Print / export — can a schedule be exported to CSV for the user's own work?
- Ability to type a specific end date vs. term-years (inputs currently use dates; check if term-years mode exists)
- Scenario onboarding — does clicking a scenario explain *what to look for*, or does the learner have to infer?

---

### Final deliverable

End your report with:

- A **one-line overall verdict**: *READY* / *READY-WITH-FIXES* / *NOT-READY*
- A **top-3 list of most impactful improvements** the team should make next (pulled from any of the three sections)
- A **runtime note** stating the browser + OS + viewport used for the main pass and whether any console error was observed that blocked a test step

Keep the total report under **600 lines**. Prioritise depth over breadth — it is better to describe one issue fully with repro and screenshot than to list ten one-liners.
