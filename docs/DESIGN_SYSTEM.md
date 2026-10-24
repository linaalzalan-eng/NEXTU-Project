# NextU Design System

Updated 2026-10-24; identity redesign approved by owner (D-32). Tokens live in src/index.css. This supersedes the original light-only specification; product behavior remains in PRD.md.

## 1. Direction
A calm, precise workspace for personal progress. Forest green anchors the brand; sage supports achievement. Solid present vs dashed past remains the chart motif. No gradients, ornamental metrics, glass effects or attention-seeking motion.

## 2. Semantic palette
| Role / existing utility | Light | Dark |
| --- | --- | --- |
| brand | #174F43 | #174F43 (identity constant) |
| sage | #DCE9DE | #DCE9DE (identity constant) |
| paper | #F8F7F3 | #171C1A |
| surface | #FFFFFF | #242B27 |
| field | #F3F2EE | #2B2D2B |
| sunken | #EFEFE8 | #2C3530 |
| ink | #202B26 | #F1F4EE |
| ink-2 | #4E6056 | #C2CDC3 |
| ink-3 | #606F65 | #A0B1A4 |
| line | #DCE3DA | #3A473E |
| line-strong | #84978A | #829788 |
| pine-50 | #DCE9DE | #283F33 |
| pine-600 (action/chart) | #174F43 | #ACD4BB |
| pine-700 (hover/link) | #103E34 | #C3E4CE |
| on-primary | #FFFFFF | #172B20 |
| inverse / on-inverse | #174F43 / #F3F7F1 | #102E26 / #F3F7F1 |

Semantic action colors may brighten in dark mode; the brand's source color does not change. Use on-primary on filled primary actions, on-danger on destructive actions and on-inverse on dark brand panels. White is not the universal button foreground. Legacy ember token names now map to sage/green achievement colors for compatibility. Warning/error retain their functional amber/red roles with matching dark surfaces and contrasting foregrounds.

Measured core text/surface and filled action pairs meet 4.5:1 in both themes (lowest measured 5.07:1). This does not replace final per-component accessibility review.

## 3. Typography
IBM Plex Sans Arabic is retained for both Arabic and Latin: no new font dependency. Body/inputs 16px, labels 14px, card titles 18px, section titles 20px, page headings 28–32px in later page refinements, hero numerals 48–56px. Weights 400/500/600/700. Arabic line-height 1.7, English 1.6. Never track Arabic letters. Keep Latin brand text LTR in both languages; tabular numerals for comparable values.

## 4. Spacing and layout
4px spacing grid; related blocks 16–24px apart, larger sections 32–40px. Preserve current logical gutters px-4/md:px-6/lg:px-10 and max-w-6xl until page refinement. Sidebar on the start side from lg; mobile top controls and bottom navigation. Minimum primary touch targets 44px. Preserve logical properties and native input direction rules; email/password use LTR and task text dir=auto.

## 5. Shape and elevation
Control radius 10px (rounded-md), card radius 16px (rounded-lg), dialog radius 20px (rounded-xl). One-pixel semantic borders; subtle theme-aware shadows. Layer surfaces rather than adding excessive boxes. No gradients or decorative animation.

## 6. Interaction and state
Keyboard focus: 2px semantic outline with 2px offset. Short color transitions (150ms), with reduced motion respected. Loading retains labels and busy semantics; errors retain icon/text and linked field messages. Skeletons, dialogs, backdrops, toasts and empty states consume the same theme variables. Shared controls, cards, dialogs, navigation and page layouts are refined in owner-approved Phase 3 (D-34).

## 7. Themes
Final owner refinement (2026-10-24, D-35): only Light and Dark. A native sun/moon button switches to the other theme; its translated accessible name names the destination and keyboard focus remains on the button. No dropdown or System option.
ThemeProvider/useTheme retain preference/resolvedTheme/setTheme and localStorage key nextu.theme. Explicit saved choices override OS preferences. Legacy System is resolved once from the OS and persisted as light/dark; missing/invalid/blocked storage defaults to Light, with visit-only toggling when blocked. Cross-tab storage synchronization remains. The pre-paint script applies the same normalization before React to prevent a color flash. No OS subscription remains.
Shared neutral fields, native color-scheme, autofill paint and semantic chart colors remain supported. Native date values use LTR numeric order and start alignment in both interface languages.

## 8. Logo
The U represents You. Its right stem rises into an upward arrow: progress starts with the same person. The mark uses a 36-unit grid and 2.6-unit rounded strokes inside a 10-unit rounded square; it is never RTL-mirrored. BrandMark reuses this authored geometry.
Exports: public/brand/logo-light.svg, logo-dark.svg, icon-light.svg, icon-dark.svg. public/favicon.svg follows OS preference without JS; theme initialization and provider choose the explicit matching icon when JS is available. Full logo exports retain editable SVG text in the existing font family with system fallback; the icon is entirely vector paths.

## 9. Page direction and staged rollout
Auth: owner-scoped Phase 2 delivers the balanced form/product-preview redesign (D-33). Desktop uses a 432px preview column inside a forest panel and a 400px form on the canvas. Below 1024px, the preview panel is hidden to prioritize account forms. Headings are 30–32px; fields/actions are 48px high. The static preview is explicitly labelled Demo data / بيانات تجريبية, with a visible disclaimer that it is not account activity, with 8/10 today, 21 this week and 18 last week; it never reads user data. All four account routes and their confirmation/expired states share AuthLayout. Phase 2 approved by the owner on 2026-10-24. Dashboard: daily progress remains the visual anchor; Tasks retains efficient actions; Analytics retains solid/dashed comparisons and accessible summaries/tables. Owner-approved Phase 3 now includes Dashboard, Tasks, Analytics and shared application UI (D-34), superseding the earlier Phase 4 placement. Daily progress spans the content width with three count tiles; support panels sit beside tasks only from xl to respect sidebar width. Quick-add separates title and date/action rows. Chart labels are 13px, planned segments use line-strong (at least 3:1 against surface), and exact data remains available as tables. No new settings route or business feature is introduced; theme/language preferences use existing shells.

## 10. Validation and approval
After each approved redesign phase: relevant tests, lint/build, browser/RTL/theme checks, concise Arabic explanation and explicit owner approval before continuing. No commits/push/merge/deploy without permission. Plan: REDESIGN_PLAN.md.

Phase 3 contrast: normal neutral text pairs meet at least 4.5:1 across paper/surface/sunken/field in both themes; chart planned segments meet at least 3:1 against surface. Appearance menus use documentElement.clientWidth/clientHeight to exclude classic scrollbars. Mobile language controls retain the language name while hiding the redundant icon below sm. Native dialogs scroll within the dynamic viewport.

Final Dashboard refinement: compact daily summary and count tiles, lightweight NextU Buddy using existing motivation bands, and a New task button revealing the existing TaskForm. Expanded form focuses the title; Escape collapses and restores focus. Buddy expressions follow actual task counts and the existing rounded progress band, with CSS-only tap/completion motion disabled for reduced motion. No service/calculation changes.
