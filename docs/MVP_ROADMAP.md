# MVP Roadmap

## Step 1 (done): Foundation
Project root, Vite, React, Tailwind, Router, Vitest, landing page, docs.

## Step 2 (done): Design system and app shell
Responsive header/nav with LOCALAY branding, mobile hamburger menu,
location selector, `LocationContext` with default region, hero section with
search input and suggestion pills, community banner, category grid (food,
nature, viewpoints, waterfalls, treks, experiences), shared UI components
(Button, Badge, Card, SearchInput, LoadingState, EmptyState), extended
Tailwind theme, skip-to-content link, 17 passing tests.

## Step 3: Discovery with local data
Place data model, category browsing, place detail pages using static data in `src/data`.

## Step 4: Firebase foundation
Firebase project setup, config via env variables, auth, Firestore, security rules, `src/services`.

## Step 5: Community content
Submit places, reviews, and ratings with moderation basics.

## Step 6: Maps
Leaflet and OpenStreetMap integration, nearby places, access information.

## Step 7: AutoFare
Community-reported auto-rickshaw fares with route and time context.

## Step 8: Expansion and launch
Multi-region support, performance, accessibility pass, deployment.

## Deferred for now
Firebase, maps, AutoFare, place detail pages, user accounts.
