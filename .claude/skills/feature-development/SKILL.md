---
name: feature-development
description: How to add or change a feature in the NEXTU frontend — where files go, the component/hook/service layers, i18n with t(), RTL-safe Tailwind, design tokens, and the accessibility and state checklist. Use when building pages, feature components, or UI in src/.
---

# Feature development — NEXTU

Follow `CLAUDE.md` first. This skill is the practical checklist for writing frontend code. Rules are referenced by ID; read the source document when a rule matters.

## 1. Where the file goes (ARCHITECTURE §3)
- **Route screen** → `src/pages/XPage.jsx`. Thin: it reads params, composes feature components, and has no business logic. Pages use `PageHeader` (it also sets the `<title>`).
- **Feature UI** → `src/features/<feature>/components/`. Presentational: it receives values and calls hook actions. No fetching, no calculations.
- **State** → `src/features/<feature>/<Feature>Context.js` (the context object only), `<Feature>Provider.jsx`, and `use<Feature>.js`. The split keeps React Fast Refresh working (pattern: `features/tasks`, `lib/i18n`, `components/ui/Toast*`).
- **Business rules** → pure functions in `src/features/<feature>/lib/` or `src/lib/`, with `today` passed in. Each one gets unit tests next to it.
- **Data** → only through `@/services` (D-08). UI never imports Supabase. Task UI calls `useTaskActions()` (feedback included) or `useTasks()` (state).
- **Shared UI** → `src/components/ui` (no feature knowledge). App chrome → `src/components/layout`.
- Use the `@/` import alias. Do not create empty or placeholder files.

## 2. Text and language (D-02)
- Every visible string goes through `t('area.key', { param })` from `useI18n()`. Add the key to **both** `src/lib/i18n/en.js` and `ar.js` in the same change.
- Avoid building sentences from fragments. For counts, prefer label–value phrasing ("Open tasks: {count}") over Arabic plural forms.
- Dates: `formatDate(date, options)` for a `Date`, `formatDay('YYYY-MM-DD', options)` for a calendar day, both from `useI18n()` (Latin digits in both languages). Never pass a calendar day to `formatDate`.
- User text (task titles) gets `dir="auto"`. Email and password inputs get `dir="ltr"`. Signed numbers go in `<bdi dir="ltr">`.

## 3. Styling (DESIGN_SYSTEM.md)
- Use only theme tokens: `paper`, `surface`, `sunken`, `ink`, `ink-2`, `ink-3`, `line`, `line-strong`, `pine-*`, `ember-*`, `danger-*`, and `warning-*`. The default Tailwind palette is removed on purpose.
- Use **logical utilities only**: `ms- me- ps- pe- start- end- text-start text-end border-s border-e rounded-s rounded-e`. Never use `ml- mr- pl- pr- left- right- text-left text-right`.
- Mirror direction-dependent icons with `rtl:-scale-x-100`.
- Ember is only for "you at your best". Going down is shown in ink, never red.
- Don't add gradients, glow, blur, or decorative animation. Transitions are color or opacity changes of about 150 ms.
- Buttons: `<Button>`. Links that look like buttons: `<Link className={buttonStyles(...)}>`. Inline links: `textLink({ tone })`.

## 4. Component checklist (before saying "done")
- [ ] **States:** loading, empty (`EmptyState`, encouraging copy), and error (`Alert` variant `danger` with a Retry action).
- [ ] **Semantics:** one `h1` per page (from `PageHeader`); sections have headings; lists use `ul`/`li`; buttons are `<button>`, navigation uses `<Link>`.
- [ ] **Forms:** use `Input` (a visible label, with hint and error linked through `aria-describedby`); validate with the shared VR-xx validators.
- [ ] **Keyboard:** everything is reachable and operable; focus stays visible (the global `:focus-visible` style); dialogs use `Dialog`.
- [ ] **Meaning without color:** status also uses an icon or a word, plus `sr-only` text where needed.
- [ ] **Charts:** use `ChartFigure` (a visible summary sentence and a "Show as table" view; the drawing is `aria-hidden`), wrap the Recharts drawing in `ChartCanvas`, take colors from `chartTheme.js`, and mirror with `directionProps(dir)`. One value axis per chart.
- [ ] **RTL:** check the screen in Arabic **and** English, at 360px and 1280px.
- [ ] Run `npm run lint`. From Phase 3, also run `npm run test:run`.

## 5. Phase 2 preview code (D-22)
`src/pages/preview/usePreviewSubmit.js` and the `/ui` gallery exist only for design review. Since Phase 4 the Tasks, Dashboard, and Analytics pages use real data; only the auth pages still use the preview, until Phase 5. When a phase connects real data to a page, delete the preview imports from that page. Once nothing uses a preview file, delete it.
