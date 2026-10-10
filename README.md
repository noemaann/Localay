# LOCALAY

LOCALAY is a community-powered local discovery platform. It helps people find local food spots, hidden places, nature destinations, and local experiences, backed by community reviews, practical access information, and community-reported auto-rickshaw fares.

Malappuram, Kerala is the **launch region**, not a permanent restriction. The app is designed to expand to other towns and districts across Kerala and beyond. Region selection is driven by data (`src/data/regions.js`) with no hard-coded region names in logic or components.

## Status

Step 2 complete: UI/UX foundation — responsive layout, navigation, branding, hero section, location selector, discovery category grid, and a full set of shared UI components. Firebase, maps, discovery detail pages, and AutoFare remain deferred (see `docs/MVP_ROADMAP.md`).

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
npm test         # run all tests once
npm run build    # production build into dist/
npm run preview  # serve the production build locally
npm run test:watch  # run tests in watch mode
```

Copy `.env.example` to `.env.local` if you need local environment values. Never commit `.env.local`.

## Project structure

```
src/
  components/          shared, reusable UI pieces
    Button.jsx         primary/secondary/ghost button
    Badge.jsx          label/tag/status badge
    Card.jsx           surface container with optional hover lift
    SearchInput.jsx    search field with icon and clear button
    LoadingState.jsx   spinner with aria-live for screen readers
    EmptyState.jsx     no-results placeholder with action slot
    LocationSelector.jsx  dropdown to switch the active region
    CategoryGrid.jsx   six-tile discovery category grid
  context/
    LocationContext.jsx   region selection context + useLocation hook
  data/
    categories.js      six discovery categories (food, nature, …)
    regions.js         region reference data (Malappuram default)
  features/            feature modules (added in later steps)
  layouts/
    MainLayout.jsx     sticky header + nav + footer shell
  pages/
    HomePage.jsx       hero, search, community banner, category grid
  routes/
    AppRoutes.jsx      route declarations
  services/            external integrations (Firebase later)
  styles/
    index.css          Tailwind entry + base styles + skip link
  utils/               pure helper functions
tests/
  setup.js             Vitest + @testing-library/jest-dom configuration
  HomePage.test.jsx    landing page integration tests
  regions.test.js      regions data unit tests
  categories.test.js   categories data unit tests
  LocationSelector.test.jsx  component interaction tests
docs/
  ARCHITECTURE.md
  MVP_ROADMAP.md
  TEAM_WORKFLOW.md
```

## Adding a new region

Open `src/data/regions.js` and add an entry to `REGIONS`:

```js
{
  id: "my-town-kerala",
  name: "My Town",
  state: "Kerala",
  country: "India",
  label: "My Town, Kerala",
  available: true,   // set false to show as "Coming soon"
}
```

No component or page changes are needed. The LocationSelector picks it up automatically.

## Styling conventions

- Use Tailwind utilities and theme tokens defined in `tailwind.config.js`.
- Do not add ad-hoc CSS values outside the design system.
- Colour palette: `monsoon` (greens, full scale 50–900) and `turmeric` (yellows, 100–600).
- Fonts: `font-display` (Fraunces) for headings, `font-sans` (Inter) for body.
- Every interactive element must have a visible `:focus-visible` ring using `outline-monsoon-600`.

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
