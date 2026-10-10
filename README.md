# LOCALAY

LOCALAY is a community-powered local discovery platform. It helps people find local food spots, hidden places, nature destinations, and local experiences, backed by community reviews, practical access information, and community-reported auto-rickshaw fares.

Malappuram, Kerala is the **launch region**, not a permanent restriction. The app is designed to expand to other towns and districts. Region selection and place data are driven by stable `regionId` references — not hard-coded town names.

## Status

Step 3 complete: discovery with mock data — place cards, category/search filters, place detail page, map placeholder, service abstraction, and 65 passing tests. Firebase, maps, and community submissions remain deferred (see `docs/MVP_ROADMAP.md`).

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
npm run dev          # start the dev server at http://localhost:5173
npm test             # run all tests once (currently 65 tests)
npm run test:watch   # run tests in watch mode
npm run build        # production build into dist/
npm run preview      # serve the production build locally
```

Copy `.env.example` to `.env.local` for local environment values. Never commit `.env.local`.

## Key URLs (dev server)

| Path | Description |
|---|---|
| `/` | Home page — hero, search, category grid |
| `/discover` | Discovery page — search + category filter + place cards |
| `/discover?q=biriyani` | Pre-filtered search |
| `/discover?category=food` | Pre-filtered by category |
| `/place/:placeId` | Place detail — location, access, map placeholder, tags |

## Project structure

```
src/
  components/          shared, reusable UI pieces
    Button.jsx
    Badge.jsx
    Card.jsx
    SearchInput.jsx
    LoadingState.jsx
    EmptyState.jsx
    LocationSelector.jsx
    CategoryGrid.jsx     — navigates to /discover?category=<id>
  context/
    LocationContext.jsx  — region selection context + useLocation hook
  data/
    categories.js        — six discovery categories
    regions.js           — region reference data (Malappuram default)
    mockPlaces.js        — DEMO places (all marked _demo:true)
  features/
    discovery/
      usePlaces.js       — async hook: loads + filters places
      PlaceCard.jsx      — linked summary card
      CategoryFilter.jsx — horizontal pill filter strip
      MapPlaceholder.jsx — clearly labelled map stub
  layouts/
    MainLayout.jsx       — sticky header + Discover nav link + footer
  pages/
    HomePage.jsx         — hero search navigates to /discover
    DiscoverPage.jsx     — URL-param driven search + filter + results
    PlaceDetailPage.jsx  — full place detail with all info sections
  routes/
    AppRoutes.jsx        — /, /discover, /place/:placeId
  services/
    placeService.js      — getPlaces(filters), getPlaceById(id)
    regionService.js     — getRegions(), getRegionById(id)
  styles/
    index.css
  utils/
    search.js            — normalise, matchesQuery, filterPlaces (pure)
    format.js            — formatDifficulty, difficultyIcon, etc. (pure)
tests/
  setup.js
  HomePage.test.jsx
  LocationSelector.test.jsx
  regions.test.js
  categories.test.js
  mockPlaces.test.js     — data integrity checks
  search.test.js         — search utility unit tests
  format.test.js         — format utility unit tests
  discovery.test.jsx     — DiscoverPage + PlaceDetailPage integration
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
  available: true,
}
```

Then add places for that region in `src/data/mockPlaces.js` using `regionId: "my-town-kerala"`. No page or component changes needed.

## Mock data rules

- All demo records must carry `_demo: true`.
- Never invent data and label it verified.
- No fabricated ratings, reviews, or prices marked as real.
- Clearly label all illustrative content in the UI.
- When Firebase lands (Step 4), `placeService.js` and `regionService.js` are the only files that change.

## Service contract

```
placeService.getPlaces({ query?, categoryId?, regionId? })  → Promise<Place[]>
placeService.getPlaceById(placeId)                          → Promise<Place | null>

regionService.getRegions({ availableOnly? })                → Promise<Region[]>
regionService.getRegionById(regionId)                       → Promise<Region | null>
```

## Styling conventions

- Use Tailwind utilities and theme tokens from `tailwind.config.js`.
- Colour palette: `monsoon` (greens, 50–900) and `turmeric` (yellows, 100–600).
- Fonts: `font-display` (Fraunces) for headings, `font-sans` (Inter) for body.
- Every interactive element must have a visible `:focus-visible` ring.

## GitHub setup

1. Create an empty repository on GitHub.
2. From the project folder:

```bash
git init
git add .
git commit -m "feat: discovery with mock data (step 3)"
git branch -M main
git remote add origin https://github.com/<your-username>/localay.git
git push -u origin main
```

## Team and workflow

See `docs/TEAM_WORKFLOW.md` for branch rules and ownership.

## Security

Do not commit Firebase credentials or any real secrets. Use `.env.local` for local values.
