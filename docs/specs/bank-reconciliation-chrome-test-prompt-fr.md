# Bank Reconciliation Playground — Comprehensive Chrome Test Prompt (FR)

Self-contained prompt for **Claude in Chrome** (or Claude Computer Use). Targets the French locale of the OhadaLearn bank-reconciliation playground end-to-end. The tester must report every defect with severity and reproduction steps, but must NOT modify code.

---

## Prompt

You are a senior QA engineer auditing the new **Rapprochement Bancaire** (Bank Reconciliation) playground in the OhadaLearn SvelteKit app. Your job is to exercise every feature in a real browser, capture defects with screenshots, and produce a structured report. Do not edit source code — report only.

### Context

OhadaLearn is a B2B2C edtech platform for SYSCOHADA accounting students in OHADA-zone universities (francophone Africa). This playground teaches the rapprochement bancaire workflow: comparing the bank statement against the company's general ledger account 521 (Banque), classifying differences into nine categories, producing the two-column "état de rapprochement", and generating adjusting journal entries.

Target audience is bilingual (EN/FR) but the test entry point is the **French** locale. Verify SYSCOHADA-specific behaviour: account 521 (Banque), 627 (Services bancaires), 771 (Intérêts reçus), 411 (Clients), 472 (Comptes d'attente).

### Environment

- **Entry URL:** `http://localhost:4174/fr/playgrounds/bank-reconciliation`
- **Cross-locale URL:** `http://localhost:4174/en/playgrounds/bank-reconciliation` (used in section H)
- **Catalog URL:** `http://localhost:4174/fr/playgrounds`
- The dev/preview server must already be running (`npm run preview` in the worktree). If the URL is unreachable, **stop and report** — do not attempt to start a server yourself.
- Open Chrome DevTools console; clear it before each new route.

### Available tools (Claude in Chrome MCP)

You have:
- `tabs_context_mcp`, `tabs_create_mcp`, `navigate` — tab + URL control
- `read_page` — accessibility tree (use `filter: "interactive"` for actions)
- `find` — natural-language element search
- `get_page_text` — flat text dump (note: dumps ALL DOM, ignores tab visibility)
- `javascript_tool` (`javascript_exec` action) — run JS in the page (best for state introspection and triggering tab clicks)
- `read_console_messages` — DevTools console (always pass a `pattern`)
- `resize_window` — viewport resize
- `tabs_close_mcp` — clean up

The PlaygroundShell uses `<button role="tab">` for the Learn / Playground / Scenarios switcher. To activate one, find it via `[role=tab]` and call `.click()` from `javascript_tool`. Direct DOM `.click()` works (verified).

### Test matrix

For every step: capture a screenshot, check the DevTools console (`pattern: "error|warning|Error|fail"`, `onlyErrors: false`), and flag every error or warning even if the step's expected outcome occurred.

#### A. Catalog & navigation
1. Visit `http://localhost:4174/fr/playgrounds`. Confirm a card with title **"Rapprochement Bancaire"** and the description starting with **"Rapprocher le relevé bancaire et le grand-livre selon la méthode SYSCOHADA…"**.
2. Click the card. Confirm the URL becomes `/fr/playgrounds/bank-reconciliation` and the document title becomes `Rapprochement Bancaire — OhadaLearn`.
3. Confirm there is **no `<iframe>`** in the DOM (this is a native module, not an iframe wrapper). Verify with `document.querySelectorAll('iframe').length === 0` via `javascript_tool`.
4. Confirm the page emoji **🏧** appears next to the page title (not the literal word "bank").

#### B. Tab structure
5. List all `[role=tab]` in the playground tablist. Expected exactly three: **📖 Apprendre**, **🧮 Playground**, **📋 Scénarios**. (If labels appear in English on the FR route, that is a defect.)
6. Confirm the default active tab is **🧮 Playground** (`aria-selected="true"`).

#### C. Default playground state
7. The KPI strip should display **5 tiles** with these French labels: **Éléments pointés**, **Banque non pointée**, **Livres non pointés**, **Écart**, **Statut**.
8. With default empty inputs, **Éléments pointés = 0**, **Banque non pointée = 0**, **Livres non pointés = 0**, **Écart = 0 FCFA**, **Statut = Rapproché** (green pill).
9. The **État de rapprochement** panel (Reconciliation Statement) should show two columns:
   - Left: **Côté banque** with rows *Solde du relevé*, *+ Dépôts en transit*, *− Chèques émis non encaissés*, **Solde rapproché**.
   - Right: **Côté entreprise** with rows *Solde comptable*, *+ Intérêts créditeurs*, *+ Virements permanents reçus*, *− Frais bancaires*, *− Chèques impayés*, *− Prélèvements automatiques*, **Solde rapproché**.
   - Both **Solde rapproché** values must be equal (1 000 000 FCFA by default).
10. The footer below the statement should show **Écart: 0 FCFA** and a green **Rapproché** pill.
11. The **Écritures de régularisation** panel (Adjusting JEs) should display **"Aucune écriture de régularisation nécessaire."**

#### D. Statement skin toggle
12. Confirm the skin toggle in the statement header shows two buttons: **Classique (FR)** and **Moderne**. On the FR locale the default selected button must be **Classique (FR)**.
13. Click **Moderne**; confirm the visual layout updates (gap between columns shrinks slightly) but the data stays correct.
14. Click back to **Classique (FR)** and confirm the original layout returns.

#### E. Inputs panel
15. In *Période & Soldes*, change **Solde bancaire de clôture (relevé)** from 1 000 000 to **1 200 000**. Verify the **État de rapprochement** Right column *Solde rapproché* stays at 1 000 000, the Left column changes to 1 200 000, **Écart** flips to **+200 000 FCFA** (or similar), and the status pill turns red with text **Non rapproché**.
16. Restore the value to 1 000 000 and verify the playground returns to **Rapproché** with zero variance.

#### F. Scenarios — full pass
17. Click the **📋 Scénarios** tab. Confirm exactly **6 scenario cards** with these French titles:
    - Rapprochement à 2 éléments
    - Rapprochement classique à 5 éléments
    - Frais & intérêts
    - Impayé & prélèvement
    - Repérer une erreur bancaire
    - Glissement multi-mois
18. Click **Rapprochement classique à 5 éléments**. The Playground tab activates. Verify:
    - The bank panel (top-left in the workspace) shows three rows: *Frais de tenue de compte* (negative), *Interest credited* (positive), *Wire payment* (positive). One row should be visually marked as matched (paired with a ledger entry); the other two as unmatched (orange-tinted background or equivalent treatment).
    - The ledger panel (top-right) shows three rows including *Wire from customer* (positive, paired by reference WIRE-001), *Customer deposit* (positive, unmatched), *Check #2055 to vendor* (negative, unmatched).
    - The Statement now shows non-zero rows for *+ Intérêts créditeurs (8 000)*, *− Frais bancaires (5 000)*, *+ Dépôts en transit (75 000)*, *− Chèques émis non encaissés (40 000)*.
    - The Écritures de régularisation panel lists **two entries**: *Comptabiliser les frais bancaires* (627 / 521, 5 000 FCFA) and *Comptabiliser les intérêts créditeurs* (521 / 771, 8 000 FCFA). Both entries' debit and credit columns must sum to equal totals.
    - Status may be **Rapproché** or **Non rapproché** depending on whether the scenario was authored to balance perfectly. Either way, document the actual variance shown.
19. Repeat the load + verify pattern for each remaining scenario (sections F.18 → F.23). For each scenario, capture: variance, list of categories present in the unmatched panel, count of adjusting entries, screenshot.

#### G. Manual classification (drag-to-classify)
20. Load **Rapprochement classique à 5 éléments**.
21. In the *Éléments non pointés — glisser pour classer* panel, find the **Frais de tenue de compte** row. Open its category dropdown.
22. Confirm the dropdown contains **9 options** in French: *Chèque émis non encaissé, Dépôt en transit, Frais bancaires, Intérêts créditeurs, Chèque impayé, Prélèvement automatique, Virement permanent, Erreur de la banque, Erreur de l'entreprise*.
23. Select **Chèque impayé** (NSF check) instead of the auto-classified Frais bancaires.
24. Verify the Écritures de régularisation panel updates: the bank-charge entry disappears; an NSF entry **DR 411 Clients / CR 521 Banque** appears with the same amount (5 000 FCFA).
25. Re-classify back to **Frais bancaires** and confirm the original entry returns.

#### H. Locale switch (FR ↔ EN)
26. From the FR route, switch to English (use the language toggle in the header, or directly navigate to `/en/playgrounds/bank-reconciliation`).
27. Verify URL is `/en/…`, document title is `Bank Reconciliation — OhadaLearn`, KPI labels become *Matched items / Unmatched bank / Unmatched books / Variance / Status*.
28. Verify the Statement skin defaults to **Modern** on the EN route (versus Classic (FR) on the FR route). This is the locale-driven default.
29. Switch back to FR. Verify the previously selected scenario is preserved (state should persist via `bank-reconciliation_v1` localStorage key — open DevTools → Application → Local Storage and confirm).

#### I. Framework switching (settings)
30. Stay on the FR route with **Rapprochement classique à 5 éléments** loaded.
31. Open the settings panel (gear icon in the playground header) and switch the *Standard* from **SYSCOHADA** to **PCG**. Verify in the Écritures de régularisation panel: the bank-charge debit account label still shows code **627** but with the French PCG label *Services bancaires* (PCG mirrors the OHADA code for this account).
32. Switch to **IFRS**. Verify accounts now render without numeric codes — labels become *Bank Service Charges / Cash & Cash Equivalents* and *Cash & Cash Equivalents / Finance Income*. The amounts must remain identical.
33. Switch to **US GAAP**. Verify similar code-less labels with US GAAP-style names.
34. Switch back to **SYSCOHADA**.

#### J. Currency switching
35. Open settings and change *Currency* from **XAF** (FCFA, default) to **EUR**. Verify all monetary values in the Statement, KPIs, and Écritures de régularisation re-render with the **€** symbol and European thousand-separator format. Amounts should be the same numerical values (no FX conversion — the playground holds amounts as integer minor units).
36. Change to **USD**, then **GBP**, verifying each.
37. Restore to **XAF**.

#### K. Exercises
38. Scroll to the **Exercises** section (it appears below the Playground content, not in a separate tab). Confirm three difficulty groups with the headings **Fondamental (2)**, **Intermédiaire (3)**, **Avancé (3)** — total **8** exercises.
39. Verify the slug list per group:
    - **Fondamental:** *simple-recon, outstanding-checks*
    - **Intermédiaire:** *classify-items, compute-adjusted-balance, generate-adjustments*
    - **Avancé:** *find-error, missing-balance, multi-month-roll*
40. Open the **simple-recon** exercise. The prompt should ask in French: *"Calculer le solde bancaire rapproché et le solde comptable rapproché."* Two numeric input fields should be present.
41. Submit deliberately wrong values (`0` and `0`). Verify the feedback message comes from the FR `incorrect` key: *"Les deux soldes rapprochés doivent être égaux — relire les éléments."* Score should be < 1.
42. Note the prompt's parameters (statement balance, deposit-in-transit, outstanding-check). Compute the answer manually: `adjustedBank = statement + DIT − OS`. Submit the value into both fields. Verify positive feedback: *"Les deux soldes rapprochés sont égaux — bravo."* and a perfect score.
43. Repeat the wrong-then-right cycle for one **Intermédiaire** exercise (e.g. *compute-adjusted-balance*) and one **Avancé** exercise (e.g. *missing-balance*).

#### L. Learn tab
44. Click the **📖 Apprendre** tab. Confirm **8 sections** render in order, with French headings (the first heading should be **"Rapprochement bancaire — Introduction"**). Capture the full list of section headings and verify against this expected set:
    - 01 Rapprochement bancaire — Introduction
    - 02 Pourquoi rapprocher ?
    - 03 Éléments de rapprochement
    - 04 L'état à deux colonnes
    - 05 Pointer banque vs grand-livre
    - 06 Écritures de régularisation
    - 07 Erreur bancaire vs erreur de l'entreprise
    - 08 Contexte SYSCOHADA
45. Spot-check that markdown rendering produces real tables (not raw `|` characters) for the OHADA accounts table in section 03.

#### M. Responsive
46. Resize the viewport to **1024 × 768** (small desktop / tablet). Verify the 2-column workspace gracefully shrinks; bank/ledger panels should stay side-by-side until ≤ ~1200 px, then stack vertically.
47. Resize to **390 × 844** (phone). Verify:
    - No horizontal page-level scrollbar
    - The Inputs panel and Workspace stack vertically
    - The KPI strip wraps to multiple rows
    - The Statement two columns stack to one column
    - The skin toggle remains accessible
    - Tab labels do not overlap the viewport edges
48. Restore to **1440 × 900**.

#### N. URL share roundtrip
49. With **Rapprochement classique à 5 éléments** loaded and the IFRS standard selected, click the *Partager* / *Share* button (whatever the FR label is). The URL should update with a query parameter (e.g. `?inputs=…` or similar serialised state).
50. Copy the full URL. Open it in a new tab. Verify the same scenario, framework, and skin restore.

#### O. Console hygiene
51. Throughout all steps you should have collected console output. Compile a single list of unique errors and warnings (deduplicate by message). For each, report the route where it appeared.

### Reporting format

Produce a single Markdown report with this structure:

```
# Bank Reconciliation Playground — Chrome QA Report
**Locale tested:** FR (with EN cross-checks in section H)
**Tester:** Claude in Chrome
**Date:** <ISO date>
**Build under test:** `vite preview` of branch claude/sad-darwin-3bbfbb

## Verdict
<PASS / PASS-WITH-MINOR / FAIL>

## Summary
- Total steps executed: …
- Defects: <blocker>/<major>/<minor>/<cosmetic>
- Console errors observed: …

## Defects
| ID  | Step | Severity | Expected | Actual | Console | Screenshot |
|-----|------|----------|----------|--------|---------|------------|
| D-1 | C-7  | minor    | 5 tiles  | 4 tiles | none   | shot-c7.png |
| …   |      |          |          |        |         |             |

## Section-by-section notes
### A. Catalog & navigation
- A-1 PASS …
- A-2 PASS …
…

## Console output
- `[route]` <message>
…

## Open questions / observations
- Anything you noticed that is neither pass nor fail but worth flagging.
```

### Severity guide

- **Blocker** — playground unusable, page crashes, navigation broken, or a French-locale page renders English-only labels in a place a French student would actually see.
- **Major** — wrong calculation, wrong account code resolved, exercise grades incorrect answers as correct (or vice versa), framework switch produces invalid JE, scenario fails to load.
- **Minor** — visual misalignment, missing focus state, label truncation, dropdown overflow, slow interaction (> 1s on a click).
- **Cosmetic** — typo, awkward wording, inconsistent spacing, missing emoji, suboptimal color contrast.

### Out of scope (do not test)

- Anything requiring a Supabase backend (waitlist form is on the landing page, not in this playground).
- Code refactors, performance profiling, accessibility audit beyond the obvious (do not run a full Lighthouse pass).
- Server-side / build-system issues (e.g., the Vite dev fs.allow restriction in worktrees — already known and tracked).

When done, deliver the full report in your reply. Keep it under 1500 words; attach screenshots inline as base64 or as separate references depending on what the chat surface supports.
