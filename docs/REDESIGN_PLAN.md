# NextU identity redesign — approved 2026-10-22

Scope: the existing React/Vite/JavaScript application. Preserve Supabase, business rules, translations and user data. No dependencies, commits, pushes, merges or deployment without permission. Stop after each redesign phase for approval.

## Approved design
Forest #174F43; sage #DCE9DE; light canvas #F8F7F3; dark canvas #171C1A and surface #242B27. IBM Plex Sans Arabic covers both scripts; 16px body, 28–32px titles, 48–56px hero numbers. 4px spacing grid, 10px controls, 16px cards, 20px dialogs. Solid present vs dashed past remains meaningful.
Logo: a U with the right stem rising into an arrow, never mirrored with RTL; full/icon/favicon light/dark SVG assets. Themes: Light, Dark, System, persisted independently as nextu.theme, applied before paint; semantic contrasting foregrounds, native color-scheme and system changes supported.

## Phase 1 — identity and foundation (completed; Phase 2 authorized)
- [x] Tests first: saved/system/invalid/blocked storage, cross-tab synchronization, first-paint behavior.
- [x] Theme context/provider/hook and accessible three-choice control in existing shells; no settings route.
- [x] Theme tokens, inverse/on-action colors; reuse existing token consumers and chart CSS variables.
- [x] U-arrow SVG assets, shared BrandMark, favicon; retain existing font and no new dependencies.
- [x] Update DESIGN_SYSTEM, run tests/lint/build and browser checks, write concise Arabic report, stop for approval.

## Remaining phases (await approval individually)
2. Owner-scoped authentication shell, appearance menu and form controls completed; approved by owner 2026-10-24.
3. Dashboard & Application UI Refinement: explicitly approved by owner 2026-10-24; plan in PHASE_3_UI_PLAN.md. Covers Dashboard/Tasks/Analytics, shared navigation/cards/dialogs/toasts, responsiveness, accessibility and final regression QA.
4. Original application-page scope moved into owner-approved Phase 3 (D-34); no separate implementation needed for that same scope.
5. Final visual/accessibility/RTL/LTR/theme/regression verification included in Phase 3 at owner request; no unrelated phase starts.

## Phase 1 file map
src/lib/theme/{theme.js,ThemeContext.js,ThemeProvider.jsx,useTheme.js,ThemeProvider.test.jsx}; src/components/layout/ThemeSwitch.jsx; src/index.css; index.html; AppProviders and existing shells; BrandMark; public/brand/*.svg and favicon.svg. Only foundational foreground tokens are adjusted in shared buttons/task checks to avoid dark-mode contrast regressions; component redesign stays in phase 2.

Phase 1 verification: 379/379 tests with maxWorkers=2 after a cold Analytics import timed out during the concurrent build/test attempt. Lint/build passed; 24 themed layout combinations, pre-React dark paint, System switching, persistence and real auth/session browser checks passed. No application timeout/assertions altered. Phase 2 explicitly authorized on 2026-10-23 with the authentication scope below.

## Phase 2 — owner-scoped auth refinement (approved 2026-10-23)

The owner explicitly includes the authentication redesign in Phase 2. Preserve existing uncommitted valid work, the React/Vite/JS stack, Arabic/English and Supabase contracts. Do not touch project-presentation. No Phase 3, commit, push or deployment.

Implementation plan (executed inline):
- [x] Inspect existing shared AuthLayout/AuthProductPreview and ThemeSwitch in running Chrome before editing.
- [x] Add regression coverage for menu focus leaving and viewport scrolling; reproduce before fixing.
- [x] Refine menu positioning/dismissal and shared authentication layout only where inspection finds a problem. Keep illustrative preview separate from user data.
- [x] Verify all four auth routes, both languages/themes and responsive widths in real Chrome; test System, persistence, keyboard and validation.
- [x] Run lint, relevant/full tests and production build; obtain independent code review, write Arabic phase report, stop for owner review.

Phase 2 verification (2026-10-23): 388/388 tests in 44 files, lint and Supabase production build passed. Chrome: 158/158 checks, including 48 route/language/theme/width layouts, translated menu bounds, System media changes, reload persistence, keyboard, dismissal and login validation. Independent source review: no actionable findings. See phase-reports/REDESIGN_PHASE_2_EXPLAINED.md and artifacts/redesign-phase2/verification.json. Stopped for owner review; Phase 3 remains unstarted.
