# Bank Reconciliation Playground — Claude-in-Chrome Test Prompt

Use this prompt with Claude in Chrome (or Claude Computer Use) to manually exercise the playground in a real browser and capture issues a unit/e2e test cannot easily catch — visual regressions, focus traps, layout breakage, console errors, locale gaps.

The dev server must be running (`npm run dev` in the worktree) and reachable at `http://localhost:5173` (or whichever port Vite reports).

---

## Prompt

You are a QA engineer for the OhadaLearn platform. Your job is to manually exercise the new **Bank Reconciliation** playground in a browser and report every defect you find. Do not fix anything — report only.

### Environment

- Dev server: `http://localhost:5173`
- Open the browser, ensure DevTools console is visible, and clear it before each route navigation.
- Set viewport to 1440 × 900 for the main pass; later you will resize to 768 × 1024 and 390 × 844 for responsive checks.

### Coverage matrix (run every row)

For every step, **check the DevTools console** and flag any error or warning that appears.

#### A. Catalog & navigation
1. Visit `/en/playgrounds`. Confirm the **Bank Reconciliation** card appears with icon, title, and description.
2. Click the card. Confirm the URL becomes `/en/playgrounds/bank-reconciliation` and **no `<iframe>` is present** in the DOM (this is a native module).
3. Confirm a tab bar with at least *Playground*, *Learn*, *Scenarios*, and *Exercises* tabs.

#### B. Default playground state (English, OHADA)
4. The KPI strip should display five tiles: **Matched items**, **Unmatched bank**, **Unmatched books**, **Variance**, **Status**.
5. With the default empty inputs, the **Status** should read "Reconciled" (or equivalent), and **Variance** should be `0.00 XOF` (or whatever the configured currency is).
6. The **Reconciliation Statement** panel should be visible with two columns labelled *Per Bank Statement* and *Per General Ledger*. Both *Adjusted balance* rows should match.
7. The **Adjusting Journal Entries** panel should display "No adjusting entries needed."

#### C. Inputs panel
8. In the *Period & Balances* panel, change **Closing Bank Balance** to `1,200,000`. Confirm the Statement updates live, that **Variance** becomes non-zero, and that **Status** flips to "Unbalanced".
9. Restore Closing Bank Balance to `1,000,000` and confirm the playground returns to "Reconciled".

#### D. Scenarios
10. Open the **Scenarios** tab. Confirm exactly **six** scenario cards: *Simple 2-item*, *Classic 5-item*, *Bank charges & interest*, *NSF & direct debit*, *Spotting a bank error*, *Multi-month rolling*.
11. Click **Classic 5-item reconciliation**. Confirm the playground tab activates and the Bank Statement panel shows three rows including "Frais de tenue de compte" and "Interest credited", and the Ledger panel shows three rows including "Wire from customer".
12. Confirm at least one row in each panel is highlighted as *unmatched* (orange-tinted background) and at least one pair is highlighted as matched (or equivalent visual treatment).
13. Confirm the Reconciliation Statement now shows non-zero rows for *Add interest earned*, *Less bank charges*, *Add deposits in transit*, and *Less outstanding checks*.
14. Confirm the Adjusting Journal Entries panel now lists at least two entries (bank charges, interest earned), each with two debit/credit lines that balance.

#### E. Statement skin toggle
15. With the Classic 5-item scenario loaded, find the *Classic (FR)* / *Modern* toggle in the Reconciliation Statement header.
16. Click *Classic (FR)*. Confirm the layout/spacing changes (gap widens) but the data remains correct.
17. Click *Modern* and confirm it returns to the compact form.

#### F. Manual classification
18. Switch to the *Bank charges & interest* scenario.
19. In the Unmatched Items panel, find the bank-charges row. Open its category dropdown and re-classify it as **NSF check**.
20. Confirm the Adjusting Journal Entries panel updates: the bank-charge entry disappears and an NSF entry (DR Clients / CR Banque) appears with the correct amount.
21. Re-classify back to **Bank charge** and confirm the original entry returns.

#### G. Framework switching
22. Open the *Settings* panel (gear icon or equivalent) and switch the accounting standard from **SYSCOHADA** to **French PCG**. Confirm:
    - In the Adjusting Journal Entries panel, the bank-charge entry now uses French PCG account labels/codes (still 627 if PCG also maps it to that code; verify the *label* text changes language/styling appropriately).
23. Switch to **IFRS** and confirm the Adjusting Journal Entries display IFRS-style names (no codes, e.g., "Bank Service Charges").
24. Switch back to **SYSCOHADA**.

#### H. Locale switch (FR)
25. Use the language toggle (header or settings) to switch to French.
26. Confirm the URL becomes `/fr/playgrounds/bank-reconciliation`.
27. Verify all labels translate: "Période & Soldes", "Solde rapproché", "Frais bancaires", etc. Spot-check the Statement headers, KPI labels, and category dropdowns.
28. Confirm the Statement skin toggle defaults to *Classique (FR)* on French.

#### I. Exercises
29. Open the *Exercises* tab. Confirm exactly **eight** exercises grouped by difficulty (*fondamental*, *intermédiaire*, *avancé*).
30. Open the **Simple reconciliation** exercise. Read the prompt; it should ask for two numeric answers (adjusted bank, adjusted books).
31. Submit deliberately wrong values (`0` for both). Confirm the feedback is red/negative and indicates the answer is wrong.
32. Reset the exercise (or click "Try again" if available). Compute the answer manually from the prompt and submit. Confirm green/positive feedback.
33. Repeat for one *intermédiaire* exercise (e.g., **Classify reconciling items**) and one *avancé* exercise (e.g., **Solve missing balance**).

#### J. Learn tab
34. Open the *Learn* tab. Confirm **eight** sections render in order:
    - 01 Introduction, 02 Why Reconcile, 03 Reconciling Items, 04 Statement Format, 05 Matching Techniques, 06 Adjusting Entries, 07 Bank vs Company Errors, 08 SYSCOHADA Context.
35. On `/fr/playgrounds/bank-reconciliation`, confirm the Learn tab shows the French translations (the headings should be *Introduction*, *Pourquoi rapprocher ?*, etc.).

#### K. Responsive
36. Resize the viewport to **768 × 1024** (tablet portrait). Confirm the 3-column desktop layout collapses gracefully — the bank/ledger panels stack vertically and the Reconciliation Statement remains usable.
37. Resize to **390 × 844** (phone). Confirm no horizontal scrollbars on the body and that the Statement skin toggle, KPIs, and Adjustments panel remain legible.

#### L. State persistence (localStorage)
38. Load the *Bank charges & interest* scenario, then refresh the page (F5). Confirm the same scenario state is restored (look for the same bank-charge and interest rows).
39. Open DevTools → Application → Local Storage → `localhost:5173` and verify a `bank-reconciliation_v1` key exists.

#### M. URL share roundtrip
40. With a non-default state loaded, click the *Share* button. The URL should update with a `?inputs=…` (or similar) query parameter.
41. Open that URL in an incognito window (or different browser) and confirm the same state loads.

### Reporting format

For each defect, report:
- **Step #** (e.g., "C-9")
- **Expected** (one sentence)
- **Actual** (one sentence)
- **Severity:** blocker / major / minor / cosmetic
- **Console output** (if any)
- **Screenshot** (capture and attach for any visual issue)

Group defects by severity at the top of your report. End with a one-line overall verdict: *PASS / PASS-WITH-MINOR / FAIL*.
