# LOCALAY

LOCALAY is a community-powered local discovery platform. It helps people find local food spots, hidden places, nature destinations, and local experiences, backed by community reviews, practical access information, and community-reported auto-rickshaw fares.

Malappuram, Kerala is the **launch region**, not a permanent restriction. The app is designed to expand to other towns and districts across Kerala and beyond.

## Status

Step 1: project foundation only. The app has a landing page, routing, Tailwind styling, and a test setup. Firebase, maps, discovery pages, and AutoFare are intentionally deferred (see `docs/MVP_ROADMAP.md`).

## Tech stack

- React 18 with Vite (JavaScript and JSX)
- Tailwind CSS 3
- React Router 6
- Vitest and React Testing Library
- Later: Firebase, Leaflet with OpenStreetMap

## Local development

Requirements: Node.js 18 or newer.

```bash
npm install
npm run dev      # start the dev server at http://localhost:5173
npm test         # run tests once
npm run build    # production build into dist/
npm run preview  # serve the production build locally
```

Copy `.env.example` to `.env.local` if you need local environment values. Never commit `.env.local`.

## Project structure

```
src/
  components/  shared UI pieces
  features/    feature modules (added later)
  layouts/     page shells (header, footer)
  pages/       route-level screens
  routes/      route definitions
  services/    external integrations (Firebase later)
  data/        static reference data
  styles/      global CSS and Tailwind entry
  utils/       pure helpers
tests/         Vitest tests
docs/          team workflow, architecture, roadmap
```

## GitHub setup

1. Create an empty repository on GitHub (no README, no .gitignore).
2. From the project folder:

```bash
git init
git add .
git commit -m "chore: initial LOCALAY project foundation"
git branch -M main
git remote add origin https://github.com/<your-username>/localay.git
git push -u origin main
```

3. In GitHub settings, protect `main`: require a pull request and at least one review before merging.
4. Invite your teammate as a collaborator.

## Team and workflow

One teammate owns UI/UX; the other owns backend and Firebase. See `docs/TEAM_WORKFLOW.md` for branches, pull requests, and ownership rules.

## Security

Do not commit Firebase credentials, service account files, or any real secrets. Use `.env.local` for local values. `.gitignore` already excludes them.
