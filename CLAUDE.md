# Mind AI Project — Claude Code Instructions

A personal productivity and achievement-tracking web app: "Your only competition is your previous self." Users plan dated tasks and compare their progress with their own past. The owner is a frontend developer who is learning React Router, Recharts, Supabase, and PostgreSQL through this project. **Building the app and teaching the owner are equally important.**

## Documentation (read only what the task needs)
- Scope: `docs/MVP_SCOPE.md`. Do not build anything listed as excluded.
- Business rules BR-xx: `docs/PRD.md` (the single source of truth).
- Requirements FR, NFR, VR: `docs/SRS.md`. Stories US-xx: `docs/USER_STORIES.md`.
- Structure and layers: `docs/ARCHITECTURE.md`. Service signatures: `docs/API_CONTRACTS.md`.
- Database and RLS: `docs/DATABASE_SCHEMA.md`. Tests: `docs/TESTING_PLAN.md`.
- Tasks per phase: `docs/IMPLEMENTATION_PLAN.md`. Status: `docs/PROGRESS.md`. Decisions: `docs/DECISIONS.md`.
- Reference documents by ID. Do not copy their content into other files.

## Stack (fixed; changes need owner approval)
- React, Vite, **JavaScript and JSX only (never TypeScript)**.
- Tailwind CSS v4 via `@tailwindcss/vite`. React Router (declarative mode). Lucide React. Recharts.
- Supabase (Auth, PostgreSQL, RLS). Vitest and React Testing Library. ESLint. Vercel.
- Follow current official documentation when configuring tools. A new library needs a reason recorded in `DECISIONS.md`.

## Workflow: phase-level approval (D-14)
1. Start a phase only after the owner explicitly approves it.
2. Within an approved phase, execute all of its tasks in order without asking after each task. You may create and edit files, install the dependencies listed for the phase, and run lint and tests.
3. Make minor technical decisions yourself and record the important ones in `docs/DECISIONS.md`.
4. Ask the owner only about decisions that significantly affect product requirements, architecture, security, cost, or existing work.
5. Never add features outside the MVP. Never change the stack.
6. End of phase:
   - Run the `code-reviewer` subagent and fix critical findings.
   - Update `docs/PROGRESS.md` (check off the tasks in `IMPLEMENTATION_PLAN.md`).
   - Deliver the Arabic report.
   - **STOP.** Do not start the next phase.
7. **Never without explicit approval:** `git commit`, `git push`, public deployment, deleting existing work, or paid-service changes. Propose one commit message per phase.

### Arabic phase report (concise)
Cover: what was completed · important files created or changed · why the key technical decisions were made · new technologies and concepts to understand · how the owner can test it · unresolved issues.

## Learning-first rules
- Explanations to the owner are in **Arabic**. Code, identifiers, and `docs/` are in English (D-03).
- When introducing an unfamiliar technology, cover in Arabic:
  - What it is, simply.
  - Why we need it here.
  - The core concepts.
  - A small example from this project.
  - How it connects to React.
  - How to test it.
  - A short takeaway.
- Introduce one unfamiliar technology at a time. Do not assume backend, database, or security knowledge.
- In the terminal, avoid wide Markdown tables (RTL rendering problems). Use lists.

## Coding conventions
- Feature-based layout as in `docs/ARCHITECTURE.md` §3. The `@/` alias points to `src/`.
- Layers: components → hooks/context → `@/services`. Business rules are **pure functions** in `features/*/lib/` or `src/lib/`, with `today` passed in as a parameter.
- UI code must never import the Supabase client. Only `src/services/supabase/*` may.
- Calendar dates are `"YYYY-MM-DD"` strings handled through `src/lib/dates.js`. Weeks start on Saturday (BR-03).
- Every UI string goes through `t()`. Use logical Tailwind utilities only (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`); never `ml-`, `mr-`, `left-`, or `right-`. Use `dir="auto"` on user text.
- Every data view handles loading, empty, and error states. Forms validate with the shared validators (VR-xx).
- Accessibility: semantic HTML, labels, visible focus, keyboard operation, and a text alternative for every chart.
- Components: PascalCase `.jsx`. Hooks: `useX.js`. Other modules: camelCase `.js`. Tests sit next to their file as `*.test.js(x)`.
- Keep components small. Do not create speculative abstractions or empty placeholder files.

## Security
- Never commit or read `.env*` secrets. Only `VITE_SUPABASE_URL` and the anon/publishable key belong in the frontend. **Never use the service-role or secret key in the frontend.**
- RLS is enabled on every table, with policies scoped to `auth.uid() = user_id`.
- Never use `dangerouslySetInnerHTML`. Never show raw backend errors to users.

## Testing
- Commands: `npm run lint`, `npm run test:run`, `npm run build` (available from Phases 2 and 3).
- Every business rule gets unit tests. Components are tested by role or label with React Testing Library.
- **Never claim that tests passed unless you ran them in this session.** Record the results in `docs/PROGRESS.md`.
