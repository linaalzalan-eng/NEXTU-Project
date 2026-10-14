# Project Intent — NEXTU

> "Meet your next self." (تعرّف على نسختك القادمة)

**Name:** NEXTU = *Next* + *You*, the next, better version of you (D-24). Philosophy: "Your only competition is your previous self."

## Vision

A modern, motivating web platform that helps individuals plan their days, see what they accomplished, and understand whether they are improving compared to their own past — without pressure and without comparing themselves to anyone else.

## Problem Statement

Typical to-do apps answer "what do I need to do?" but not "am I getting better?". Completed tasks disappear, so users lose the sense of progress, cannot spot trends, and have no fair baseline to measure themselves against. Comparing with other people adds pressure and is often meaningless.

## Target Audience

General individual users who want to organize daily activities, track achievements, build consistency, and develop better routines. The MVP is not tailored to a specific group (students, employees, etc.).

Primary language context: Arabic-speaking users (RTL), with English supported (see D-02 in `DECISIONS.md`).

## Core Philosophy

1. **Self-comparison only.** The only benchmark is the user's own history.
2. **Encourage, don't pressure.** Messages are supportive; a low day is information, not failure.
3. **Transparent numbers.** Every statistic has a simple, documented formula (see Business Rules in `PRD.md`).
4. **Honest metrics.** Completion rate measures *plan adherence*, not productivity or task difficulty.

## Unique Value Proposition

A daily task manager that turns completed work into a personal progress story: today's progress, this week vs. last week, and personal bests — all computed from the user's own data with transparent rules.

## Product Goals (MVP)

- G1 — Let a user plan and manage dated tasks quickly (create, edit, complete, delete).
- G2 — Show today's progress at a glance.
- G3 — Show weekly progress and a fair comparison with the previous week.
- G4 — Highlight personal bests to motivate improvement.
- G5 — Keep each user's data private and persistent across sessions and devices.
- G6 — Work well on mobile and desktop, in Arabic (RTL) and English (LTR).

## MVP Boundaries

In scope and out of scope are defined once in `MVP_SCOPE.md`.

## Success Criteria

Product (Beta):
- A new user can register and create their first task in under 2 minutes.
- Users can answer "Am I doing better than last week?" from the Analytics page without explanation.
- No user can access another user's data (verified by tests, see `TESTING_PLAN.md`).

Learning (project owner):
- The owner can explain, debug, and modify every part of the codebase, including the Supabase/RLS setup.

## Future Direction (post-MVP, not committed)

- Optional task difficulty/effort weighting for a richer progress score.
- Streaks, reflections/journaling, categories or tags.
- AI-powered insights and recommendations.
- Gamification, challenges, Pomodoro timer.
- Native mobile apps.

These are listed only to avoid closing doors; the MVP architecture must not be built around them.
