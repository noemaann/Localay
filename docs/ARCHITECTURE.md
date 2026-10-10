# Architecture

## Overview

A single-page React app built with Vite. React Router handles navigation. Tailwind handles styling. Firebase (later) provides auth, database, and storage. Leaflet with OpenStreetMap (later) provides maps.

## Layers

```
pages  ->  features / components  ->  services  ->  Firebase
                                  ->  utils
```

- **pages**: route-level screens; compose features and components.
- **layouts**: shared shells rendered through React Router `Outlet`.
- **features**: self-contained product areas (discovery, reviews, autofare).
- **components**: generic reusable UI.
- **services**: the only boundary to external systems.
- **utils**: pure helpers.
- **data**: static reference data.

Dependencies point downward only. Services never import from components or pages.

## Region model

Malappuram is the launch region. Regions (state, district, town) must be modeled as data so expansion needs no code changes. Avoid hard-coded region names in logic.

## Routing

Routes are declared in `src/routes/AppRoutes.jsx` inside `MainLayout`. Add new pages by creating a component in `src/pages` and registering a route.

## Testing

Vitest with jsdom and React Testing Library. Tests live in `tests/`. Setup is in `tests/setup.js`.

## Configuration and secrets

Environment values use `VITE_` variables documented in `.env.example`. Real values stay in untracked `.env.local`.
