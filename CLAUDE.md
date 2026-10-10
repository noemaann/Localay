# CLAUDE.md

Guidance for AI coding sessions working on LOCALAY.

## Project

LOCALAY is a community-powered local discovery platform. It covers local food spots, hidden places, nature destinations, local experiences, community reviews, practical access information, and community-reported auto-rickshaw fares (AutoFare, planned).

Malappuram, Kerala is the launch region. Never hard-code Malappuram as an application-wide restriction. Region must be data, so other towns and districts can be added.

## Stack

React 18, Vite, JavaScript with JSX (no TypeScript), Tailwind CSS 3, React Router 6, Vitest, React Testing Library. Firebase and Leaflet with OpenStreetMap come in later steps.

## Commands

- `npm install` install dependencies
- `npm run dev` start dev server
- `npm test` run tests once
- `npm run test:watch` watch mode
- `npm run build` production build

Run `npm test` and `npm run build` before declaring work done.

## Architecture rules

1. Pages in `src/pages` compose components and features; they hold no business logic.
2. Shared UI lives in `src/components`; feature-specific code lives in `src/features/<name>/`.
3. All Firebase and network calls go through `src/services`. UI code must never import the Firebase SDK directly.
4. `src/utils` holds pure functions only.
5. Routes are declared in `src/routes/AppRoutes.jsx`.
6. Use Tailwind utilities and theme tokens from `tailwind.config.js`; avoid ad-hoc CSS.
7. Keep region, categories, and similar reference data configurable in `src/data`.
8. Every new util and non-trivial component gets a test in `tests/`.

## Secrets

Never commit Firebase keys, service accounts, or `.env*` files except `.env.example`. Use `VITE_`-prefixed variables read through `import.meta.env`, documented in `.env.example` with empty values.

## Team ownership

- UI/UX teammate: `src/components`, `src/pages`, `src/layouts`, `src/styles`, Tailwind config.
- Backend/Firebase teammate: `src/services`, Firebase config, security rules, data model.
- Shared: `src/features`, `src/routes`, `docs`. Coordinate through pull requests.

Workflow details are in `docs/TEAM_WORKFLOW.md`.

## Instructions for future sessions

- Read `docs/ARCHITECTURE.md` and `docs/MVP_ROADMAP.md` first.
- Work on one roadmap step at a time; do not build ahead.
- Keep changes small and consistent with existing structure.
- Do not create empty or placeholder files without a purpose.
- Report test and build results honestly, including failures.
