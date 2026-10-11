# Mind AI Project

> "Your only competition is your previous self."

A personal productivity and achievement-tracking web app. Plan your daily tasks, complete them, and see how you are progressing compared with **your own** past performance: today's progress, this week vs. last week, and your personal bests.

**Status:** Phase 1 (planning) complete. See [`docs/PROGRESS.md`](docs/PROGRESS.md).

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
_Will be added in Phase 2, when the app is initialized._

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
  - Design System: Phase 2
- Plan and quality:
  - [Implementation Plan](docs/IMPLEMENTATION_PLAN.md)
  - [Testing Plan](docs/TESTING_PLAN.md)
  - [Decisions](docs/DECISIONS.md)
  - [Progress](docs/PROGRESS.md)

## Development with Claude Code
Project instructions for Claude Code are in [`CLAUDE.md`](CLAUDE.md). Shared settings and the review agent are in `.claude/`.
