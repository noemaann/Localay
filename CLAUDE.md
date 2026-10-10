# CLAUDE.md

Guidance for AI coding sessions working on LOCALAY.

## Project

LOCALAY is a community-powered local discovery platform covering local food spots, hidden places, nature destinations, local experiences, community reviews, road access information, and community-reported auto-rickshaw fares (AutoFare).

Malappuram, Kerala is the initial launch region. Never hard-code Malappuram as an application-wide restriction. Region, district, and town must be data so expansion needs no code changes.

## Stack

React 18, Vite, JavaScript with JSX (no TypeScript), Tailwind CSS 3, React Router 6, Vitest, React Testing Library, Firebase JS SDK v10 (Auth, Firestore, Cloud Storage).

## Commands

- `cmd /c npm install` install dependencies
- `cmd /c npm run dev` start dev server
- `cmd /c npm test` run tests once (56 tests passing)
- `cmd /c npm run test:watch` watch mode
- `cmd /c npm run build` production build

Run `cmd /c npm test` and `cmd /c npm run build` before declaring work done.

## Architecture Rules

1. Pages in `src/pages` compose components and features; they hold no business logic.
2. Shared UI lives in `src/components`; feature-specific code lives in `src/features/<name>/`.
3. All Firebase and network calls go through `src/services`. UI code must never import the Firebase SDK directly.
4. `src/utils` holds pure functions only.
5. Routes are declared in `src/routes/AppRoutes.jsx`.
6. Use Tailwind utilities and theme tokens from `tailwind.config.js`; avoid ad-hoc CSS.
7. Keep region, categories, and reference data configurable in `src/data`.
8. Every new service, utility, and feature component gets a test in `tests/`.

## Moderation & Data Governance

- New community submissions enter controlled moderation states (`pending`, `community_reported`, `verified`, `rejected`, `needs_recheck`).
- Submissions are never published automatically as verified facts.
- Historical fare reports and dish prices are append-only and never overwritten.

## Secrets

Never commit Firebase keys, service accounts, or `.env*` files except `.env.example`. Use `VITE_`-prefixed variables read through `import.meta.env`, documented in `.env.example` with empty values.
