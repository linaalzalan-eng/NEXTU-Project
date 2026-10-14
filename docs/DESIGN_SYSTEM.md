# Design System

The visual and interaction rules for the UI. Tokens live in `src/index.css` (`@theme`). Product rules are in `PRD.md`, and flows in `USER_FLOW.md`.

## 1. Direction

**"A quiet notebook that remembers your best."** The style is editorial and calm, close to a well-made paper planner. It avoids the look of a generic SaaS dashboard.

- **Paper and ink.** A warm off-white canvas, near-black ink text, and hairline borders. Surfaces are separated by lines and whitespace more than by shadows.
- **One primary, one accent.**
  - **Pine** (deep green) means growth and action: buttons, progress, the active navigation item.
  - **Ember** (burnt orange) is reserved for *you at your best*: personal-best highlights and the "today" marker. Because it is rare, it stays meaningful.
- **Big numbers, small labels.** The key number on each screen (today's rate, this week's count) is set large. Supporting facts are sentences, not a grid of identical stat cards.
- **The "past self" motif.** Your past performance is drawn as a **dashed ink outline** ("ghost"), and the present as a **solid pine fill**. Comparing yourself with your previous self becomes a visible, repeated shape, not decoration (Analytics comparison, Phase 4 charts).
- **Calm motion.** Only short color and opacity transitions (150 ms). Nothing bounces or glows. `prefers-reduced-motion` turns transitions off.

Avoided on purpose: gradients, glassmorphism, glow effects, large radii everywhere, decorative charts, and filler copy.

## 2. Color Tokens (light mode only in the MVP)

Each token is a Tailwind v4 theme variable, for example `--color-pine-600`, used as `bg-pine-600`, `text-pine-600`, or `border-pine-600`. The default Tailwind palette is **removed** (`--color-*: initial`), so only these colors can be used.

Neutrals:
- `paper` `#F6F4EF`: the app canvas.
- `surface` `#FFFFFF`: panels, inputs, dialogs.
- `sunken` `#EFECE5`: subtle fills (hover rows, the progress track background on paper).
- `ink` `#1B1A17`: primary text and the focus ring. Contrast: 15.8:1 on paper.
- `ink-2` `#57534A`: secondary text. Contrast: 7.0:1 on paper.
- `ink-3` `#6B665B`: tertiary text such as hints and metadata. Contrast: 5.2:1 on paper.
- `line` `#E3DED3`: decorative dividers and panel borders.
- `line-strong` `#857E70`: borders of form controls. Contrast: 3.7:1 on paper and 4.0:1 on white, which meets WCAG 1.4.11 for UI components.

Pine (primary):
- `pine-50` `#E4EEE8`: soft fills, the active navigation background, and the progress track.
- `pine-600` `#1E5A47`: primary buttons, progress fill, links. White text on it: 8.1:1.
- `pine-700` `#174837`: hover and pressed states.

Ember (accent: "you at your best"):
- `ember-50` `#FBEBDD`: highlight background.
- `ember-600` `#C2551F`: icons, markers, and fills only. It is not used for small text (4.1:1).
- `ember-700` `#9C4114`: ember text. Contrast: 5.7:1 on `ember-50`.

Status:
- `danger-50` `#FBE9E7` with `danger-600` `#B3261E`: errors and destructive actions. Contrast: 5.6:1. `danger-700` `#8F1E18` is the hover state of danger buttons.
- `warning-50` `#FBF1DA` with `warning-700` `#8A5A00`: overdue notices. Contrast: 5.3:1.
- Success uses **pine**, so the palette stays small.

Rules:
- Meaning never relies on color alone. Status also uses an icon or a word (WCAG 1.4.1).
- Text on colored backgrounds always uses the pairs listed above.

## 3. Typography

- **Family:** **IBM Plex Sans Arabic** for both languages (D-21). It has matching Arabic and Latin glyphs, so mixed text such as an English task title in the Arabic UI looks like one family. Fallback: `system-ui, "Segoe UI", Tahoma, sans-serif`.
- **Weights:** 400 (body), 500 (labels, buttons), 600 (headings, numbers), 700 (display numbers only).
- **Digits:** Latin digits in both languages (D-02). Numbers that change or align use `tabular-nums`.
- **Arabic rules:**
  - Never add letter-spacing to Arabic text, because it breaks letter joining. Tight tracking (`tracking-tight`) is applied only to Latin numerals and the English display text, through `ltr:` or on number elements.
  - Body line-height is 1.7 in Arabic and 1.6 in English. The Arabic script needs more vertical room.
  - Never use italic for Arabic. Emphasis uses weight.

Scale (rem, Tailwind names):
- `text-xs` 0.75: tiny metadata only.
- `text-sm` 0.875: labels, secondary text, navigation.
- `text-base` 1: body and inputs (inputs never go below 16px, which also prevents iOS zoom).
- `text-lg` 1.125: card titles.
- `text-xl` 1.25: section titles.
- `text-2xl` 1.5 and `text-3xl` 1.875: page titles (mobile and desktop).
- `text-display` 3.5 (`--text-display`): the one hero number per screen.

Hierarchy pattern for a page header:
- An **eyebrow** (`text-sm`, `ink-3`), usually the date.
- A **title** (`text-2xl` or `lg:text-3xl`, weight 600).
- An optional one-line **lede** (`ink-2`).

## 4. Spacing, Layout, and Breakpoints

- **Base unit:** 4px (the Tailwind default spacing scale). Common steps are 2, 3, 4, 6, 8, 10, and 12 (8 to 48px).
- **Page gutter:** `px-4` on mobile, `md:px-6`, and `lg:px-10`. Content max width: `max-w-6xl`.
- **Vertical rhythm:**
  - 24px (`gap-6`) between related blocks.
  - 40px (`gap-10`) between page sections.
- **Breakpoints:** the Tailwind defaults: `sm` 640, `md` 768, `lg` 1024, `xl` 1280.
  - **Below `lg`:** a top bar with the brand and the language switch, and a fixed **bottom navigation** bar (64px plus the iOS safe-area inset).
  - **`lg` and above:** a fixed **side navigation** on the *start* side (right in Arabic, left in English), 16rem wide, separated by a hairline `line` border.
- **Grid:** the Dashboard uses one column on mobile, and from `lg` a main column (2fr) plus a side column (1fr).
- **Touch targets:** at least 44×44px on mobile (US-24).

## 5. Radii and Elevation

Radii are deliberately small:
- `rounded-md` (6px): inputs, buttons, small chips.
- `rounded-lg` (10px): panels and cards.
- `rounded-xl` (14px): dialogs only.
- `rounded-full`: progress bars and the avatar or brand mark only.

Shadows are rare. Most surfaces use a 1px `line` border instead.
- `shadow-hairline`: `0 1px 0 rgb(27 26 23 / 0.04)`, for panels on paper.
- `shadow-raised`: `0 1px 2px rgb(27 26 23 / 0.06), 0 2px 6px -2px rgb(27 26 23 / 0.08)`, for the hover state of interactive cards.
- `shadow-overlay`: `0 16px 40px -12px rgb(27 26 23 / 0.25)`, for dialogs and toasts.

## 6. States

These apply to every interactive element:
- **Focus:** a 2px `ink` outline with a 2px offset, shown with `:focus-visible` only (keyboard). It is defined globally in `index.css`, so no component can forget it.
- **Hover:** a color step only, such as `pine-600` to `pine-700`, or a transparent background to `sunken`. There are no scale or translate effects.
- **Active (pressed):** the darker step.
- **Disabled:** 50% opacity, `cursor-not-allowed`, and no hover change. Buttons that are temporarily busy are not disabled. They show a loading state instead.
- **Loading:**
  - Buttons keep their label and show a `Spinner` (with a hidden "Loading…" label) in the icon position, plus `aria-busy="true"`.
  - Data areas use quiet `sunken` skeleton blocks. They pulse only when `motion-safe`.
- **Error:** a `danger-600` border plus an icon and message under the field. The message is linked to the field with `aria-describedby`, and the field gets `aria-invalid="true"`.
- **Selected (navigation):** `pine-50` background, `pine-700` text, and a 3px pine bar on the *start* edge (`border-s-3`).

## 7. Components (`src/components/ui`)

- **Button**
  - Variants:
    - `primary`: pine fill with white text.
    - `secondary`: surface background, `line-strong` border, ink text.
    - `ghost`: transparent, ink-2 text, `sunken` on hover.
    - `danger`: `danger-600` fill with white text.
  - Sizes:
    - `md`: 44px tall, `px-4`.
    - `sm`: 36px tall, `px-3`. Desktop toolbars only.
  - Icon-only buttons need an `aria-label`. Icons sit before the text, in logical order.
  - The `loading` prop shows a spinner and blocks repeated clicks, but keeps the button focusable.
- **Input**
  - A label is always visible above the field. Placeholders are never used as labels.
  - Optional hint text in `ink-3`, and an error in `danger-600`. Both are connected through `aria-describedby`.
  - The field is 48px tall with a `line-strong` border, `rounded-md`, a white background, and `text-base`.
  - Email and password fields use `dir="ltr"` so their characters are entered and shown in the natural direction, even in the Arabic UI.
- **Card:** a `surface` panel with a `line` border, `rounded-lg`, and `p-5` (`lg:p-6`). It has an optional title row. It is used for distinct content, not as the default wrapper for everything.
- **Dialog**
  - Uses the native `<dialog>` with `showModal()`, which gives focus trapping and Escape handling.
  - Focus moves into the dialog on open and returns to the trigger on close.
  - Styling: `rounded-xl` and `shadow-overlay`, with an ink backdrop at 40%.
- **ProgressBar**
  - `role="progressbar"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`, and an accessible label.
  - The track is `pine-50` and the fill is `pine-600`, both `rounded-full`.
  - A `null` value (no tasks) shows an empty track and omits `aria-valuenow`, with `aria-valuetext` such as "No tasks" (BR-06).
  - The fill grows from the start side in both directions.
- **EmptyState:** a Lucide icon in a `sunken` circle, a short title, one encouraging sentence, and an optional action. It never shows blame language (PRD tone).
- **Spinner:** an SVG ring in `currentColor` with a `motion-safe` spin, plus a hidden "Loading…" label.
- **Alert:** an inline banner with a status icon, a title, and text. Variants: `info` (sunken / ink), `success` (pine-50 / pine-700), `warning` (warning-50 / warning-700), and `danger` (danger-50 / danger-600). Errors use `role="alert"`; the others are static text.
- **Toast:** the Close button is 44×44px. Toasts are stacked at the bottom-*end* corner on desktop, and above the bottom navigation on mobile. Rendered inside an `aria-live="polite"` region. Info and success toasts auto-dismiss after 5s, pausing while hovered or focused. Danger toasts stay until closed. Every toast has a Close button.

Navigation (`src/components/layout`):
- **SideNav:** the brand wordmark at the top, then the three destinations (Today, Tasks, Analytics) with Lucide icons, then the language switch at the bottom.
- **BottomNav:** the same three destinations, each with an icon above the label, 64px tall. The current page gets `aria-current="page"` and a pine indicator.
- **LanguageSwitch:** one button showing the *other* language's name in that language ("English" / "العربية"), with `lang` set on the label.

## 8. RTL Rules

- Use only logical utilities: `ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`, `text-end`, `border-s`, `border-e`, `rounded-s`, and `rounded-e`. Physical left and right classes are forbidden.
- Direction-dependent icons (chevrons, arrows) use `rtl:-scale-x-100`. Icons with no direction (check, calendar) are never flipped.
- User text (task titles) uses `dir="auto"`. Email and password inputs use `dir="ltr"`.
- Dates use `Intl.DateTimeFormat` with `ar-u-nu-latn` or `en` (Latin digits).
- Numbers with units are written as whole phrases in each language (for example "67%", "3 tasks"), never as concatenated fragments.

## 9. Accessibility Checklist (per component and page)

- Semantic landmarks: `header`, `nav` (with a label), `main`, and `aside`. A "Skip to content" link is the first focusable element.
- One `h1` per page. Headings do not skip levels.
- Everything works with the keyboard. Focus is always visible, and the focus order follows the visual order in both directions.
- Contrast follows section 2. Information never relies on color alone.
- Animations respect `prefers-reduced-motion`.
- `<html lang dir>` follows the selected language (NFR-46).

## 10. Screens (text wireframes)

`[ ]` marks a panel, `( )` a button, `___` an input, and `▌` the solid present bar. `┆` marks the dashed "ghost" of the past. Wireframes are drawn in the reading direction. In Arabic, the whole layout mirrors.

### Dashboard (`/dashboard`)
Mobile:
```
NEXTU                         (English)
──────────────────────────────────────
Saturday, 11 October          ← eyebrow
Today                         ← h1
[ Today's progress
  67%  of today's plan done
  ▌▌▌▌▌▌▌▌▌▌▌▌░░░░░░░          progress
  Done 2 | Left 1 | Planned 3 ]
Today's tasks
[ ○ Read 20 pages                       ]  ← pending first (PRD F2)
[ ✓ Reply to emails                     ]
[ ✓ Morning run                         ]
[ A word for today
  "More than halfway there." ]          ← pine-50 panel
[ ⚠ Open tasks from earlier days: 2
  → Review in Tasks ]                   ← warning alert
──────────────────────────────────────
 Today    Tasks    Analytics           ← bottom nav
```
Desktop (`lg`): the side navigation is on the start side. The hero panel takes the full width of the main column (2fr). The side column (1fr) holds the motivating message and the overdue notice. The task list sits under the hero.

Empty: the hero shows "—" and an empty track. EmptyState: "Plan your day" with a "Go to Tasks" action. In Phase 3 the action can open the quick-add instead.

### Tasks (`/tasks`)
```
Tasks                                   ← h1
( ‹ )  Saturday, 11 October  ( › ) (Today)
[ All | Pending | Completed ]           ← Phase 3
[ Add a task… ___________________ (+) ] ← Phase 3
Overdue (2)            ← warning-tinted section
[ ○ Call the bank · Thu 9 Oct  (Move to today) ]
This day
[ ○ Read 20 pages            ✎  🗑 ]
[ ✓ Morning run              ✎  🗑 ]
```
Empty: "No tasks for this day". Filter-specific empty messages follow US-13 and US-15.

### Analytics (`/analytics`)
```
Analytics · "You vs. your previous self"
[ This week so far      Last week so far
  12 completed          9 completed
  ▌▌▌▌▌▌▌▌▌▌▌▌          ┆┆┆┆┆┆┆┆┆           ← present solid, past ghost
  +3 tasks · +8 pts ]
[ ★ Personal best: day (6, Tue 7 Oct) · week (21) ]  ← ember accent
[ Daily breakdown chart · Phase 4 ]
[ 8-week trend chart · Phase 4 ]
[ How we calculate (BR-01…BR-06, plain words) ]
```
Empty: "Your story starts with your first completed task", with a link to Tasks.

### Login (`/login`) and Register (`/register`)
Mobile: a centered form on paper. Desktop: two columns. The *start* half is an ink panel with the philosophy quote in large type. The *end* half holds the form.
```
[ "Meet your next self."    |  Log in
                            |  Email ________ (ltr)
                            |  Password _____ (ltr)
                            |  (Log in)
                            |  Forgot password?
                            |  No account? Create one ]
```
Register has the same layout with "Create account" and a password hint (8–72 characters).

### Check your email (Register state, Phase 5)
The same auth layout. It shows a mail icon, the title "Check your email", the line "We sent a confirmation link to {email}", and a link back to Log in.

### Forgot password (`/forgot-password`)
The auth layout with the title, one Email field, and a "Send reset link". After submitting, the same neutral message is shown for every email (D-19).

### Reset password (`/reset-password`)
The auth layout with "New password", "Confirm new password", and "Save password". Without a recovery session, it shows the "Link invalid or expired" state with a link to Forgot password.

### Not Found (`*`)
Inside the app layout. A large "404" in ink-3, the title "This page doesn't exist", and a "Back to Today" button.

## 11. Phase 2 Preview Data

Until real data exists (Phase 3), the Dashboard, Tasks, and Analytics pages can show **clearly labelled sample data** for design review. A notice at the top of each page says it is sample data and offers a switch to the empty state. The sample data and the switch are removed in Phase 3 and Phase 4 (D-22).
