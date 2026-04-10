# CLAUDE.md

> You are a senior UI designer and frontend developer.
> Build premium, dark-themed interfaces.
> Use subtle animations, proper spacing, and visual hierarchy.
> No emoji icons. No inline styles. No generic gradients.

## What This Is

OhadaLearn — a B2B2C edtech platform for SYSCOHADA accounting education targeting OHADA zone universities.

**Phase 1 (current):** Demo site with embedded playgrounds and waitlist form.

## Tech Stack

- **Framework:** SvelteKit 2 + Svelte 5 (runes API)
- **Language:** TypeScript
- **Database:** Supabase (Postgres + Auth)
- **Hosting:** Vercel
- **Testing:** Vitest (unit), Playwright (e2e)

## Svelte 5 Syntax — IMPORTANT

This project uses **Svelte 5 runes**. Do NOT use Svelte 4 syntax:
- Props: `let { prop } = $props()` (NOT `export let prop`)
- State: `let x = $state(value)` (NOT `let x = value`)
- Derived: `let y = $derived(expr)` (NOT `$: y = expr`)
- Effects: `$effect(() => { ... })` (NOT `$: { ... }`)
- Events: `onclick={handler}` (NOT `on:click={handler}`)
- Children: `{@render children()}` with `let { children } = $props()` (NOT `<slot />`)
- Page state: `import { page } from '$app/state'` (NOT `$app/stores`)

## Architecture

### Foundation Systems (src/lib/)
- `theme/` — Centralized design tokens (tokens.ts → css-generator.ts → injected via layout). Change one file to restyle everything.
- `i18n/` — Namespace-based bilingual EN/FR. Type-safe TranslationKey union auto-generated from namespace files. Run `npm run i18n:check` to verify parity.
- `format/` — Currency (16 currencies), number, percentage formatters. Locale-aware with parseLocaleNumber for EU/US formats.
- `persistence/` — SSR-safe localStorage abstraction with deep-merge and versioning.
- `stores/preferences.ts` — Global user preferences (currency, locale, accounting standard). Single source of truth.
- `contracts/playground.ts` — TypeScript interfaces for the Phase 2 plugin system (PlaygroundModule, ExerciseTypeDef).

### Routes
- `(public)` — Landing page, playground catalog, playground iframe wrappers, privacy policy
- `api/waitlist` — POST endpoint for waitlist signups (Supabase)

### Static Assets
- `static/playgrounds/` — Existing HTML playground files served as-is in iframes

## Conventions

- All user-facing strings must be bilingual (EN/FR) via the i18n system
- All colors/fonts/spacing via CSS custom properties from theme tokens — NEVER hardcode hex colors
- Server-only code goes in `$lib/server/` — SvelteKit enforces the boundary
- Commit messages: `feat:`, `fix:`, `test:`, `chore:`, `docs:`

## Common Commands

```bash
npm run dev              # Start dev server
npm run build            # Production build (requires .env)
npm run i18n:check       # Verify EN/FR translation parity + regenerate types
npx vitest run           # Run unit tests
npx playwright test      # Run e2e tests (requires prior npm run build)
npm run test:e2e         # Build + run e2e tests in one step
```

## E2E Test Notes

- Playwright uses `adapter-node` (not `adapter-auto`) for proper `vite preview` support
- Tests run with `workers: 1` (serial) — WSL/NTFS parallel connections are unreliable
- Run `npm run build` before `npx playwright test` if not using `npm run test:e2e`
- `.env` must exist for build to succeed (required by `$env/static/private`)

## Design Spec

Full product design: `../accounting-playgrounds/docs/superpowers/specs/2026-04-09-ohadalearn-product-design.md`
Phase 2 optimizations: `../accounting-playgrounds/docs/superpowers/specs/2026-04-09-ohadalearn-phase2-optimizations.md`
