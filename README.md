# NEXTU

> "Meet your next self." (تعرّف على نسختك القادمة)

NEXTU combines *Next* + *You*: the next, better version of you. Philosophy: "Your only competition is your previous self."

A personal productivity and achievement-tracking web app. Plan your daily tasks, complete them, and see how you are progressing compared with **your own** past performance: today's progress, this week vs. last week, and your personal bests.

**Status:** Phase 5 complete with documented external email checks deferred (D-31); Phase 6 final MVP validation and deployment preparation underway. Real Supabase authentication, task CRUD, two-user isolation and browser session persistence verified. See [progress](docs/PROGRESS.md).

## MVP Features
- Email/password authentication with email confirmation, password reset, and private, per-user data.
- Dated tasks: create, edit, reschedule, complete, delete, filter, and handle overdue tasks.
- A daily dashboard with a completion rate, a progress indicator, and a motivating message.
- Analytics: weekly comparison, personal bests, and history charts.
- Arabic (RTL) by default, with English (LTR).

Full scope: [`docs/MVP_SCOPE.md`](docs/MVP_SCOPE.md).

## Tech Stack
- React, Vite, JavaScript (JSX), Tailwind CSS v4, React Router, Lucide React, Recharts.
- Supabase (PostgreSQL, Auth, Row Level Security).
- Vitest and React Testing Library, ESLint.
- Vercel.

## Getting Started

Requirements: Node.js 22.22 or newer (React Router 8 needs it) and npm.

```bash
npm install        # install dependencies
npm run dev        # start the dev server at http://localhost:5173
npm run lint       # check the code with ESLint
npm run build      # production build into dist/
npm run preview    # serve the production build locally
npm run test       # run the tests in watch mode
npm run test:run   # run all tests once
```

While developing:
- Two data sources (`VITE_DATA_SOURCE`, D-08):
  - `mock` (the default, and what the tests use): tasks are saved in this browser's localStorage, and a demo user is signed in. Logging out and in works with any email and password.
  - `supabase`: real accounts and the real database. Copy `.env.example` to `.env.local`, fill in your project's URL and **publishable** key, and set `VITE_DATA_SOURCE=supabase`. The database is created from `supabase/migrations/` in the Supabase SQL Editor. Step-by-step guide: [`docs/phase-reports/PHASE_5_EXPLAINED.md`](docs/phase-reports/PHASE_5_EXPLAINED.md).
- `/tasks` is fully working: add, complete, edit, reschedule, delete, browse dates, filter, and move overdue tasks to today.
- `/dashboard` and `/analytics` are calculated from the same real tasks: today's rate and message, this week vs. last week, personal bests, and charts.
- Development data (only in `npm run dev` with the mock): open the browser console and run `nextu.seed()` for about 10 weeks of realistic tasks, `nextu.seed({ count: 5000 })` for a performance check, or `nextu.clear()` to start empty. Seeding **replaces** the tasks saved in this browser.
- `/login`, `/register`, `/forgot-password`, and `/reset-password` are connected to the auth service. The app pages need a session; without one they open `/login`.
- `/ui` is a development-only gallery of every UI component and state.
- The language switch (العربية / English) is in the sidebar on desktop and in the top bar on mobile. The choice is remembered.

## Documentation
- Why we build it: [Project Intent](docs/PROJECT_INTENT.md).
- What we build:
  - [MVP Scope](docs/MVP_SCOPE.md)
  - [PRD and business rules](docs/PRD.md)
  - [SRS](docs/SRS.md)
  - [User Stories](docs/USER_STORIES.md)
  - [User Flows](docs/USER_FLOW.md)
- How we build it:
  - [Architecture](docs/ARCHITECTURE.md)
  - [Database Schema](docs/DATABASE_SCHEMA.md)
  - [API Contracts](docs/API_CONTRACTS.md)
  - [Design System](docs/DESIGN_SYSTEM.md)
- Plan and quality:
  - [Implementation Plan](docs/IMPLEMENTATION_PLAN.md)
  - [Testing Plan](docs/TESTING_PLAN.md)
  - [Decisions](docs/DECISIONS.md)
  - [Progress](docs/PROGRESS.md)
  - Phase explanations in Arabic: [`docs/phase-reports/`](docs/phase-reports/)

## Development with Claude Code
Project instructions for Claude Code are in [`CLAUDE.md`](CLAUDE.md). Shared settings and the review agent are in `.claude/`.
