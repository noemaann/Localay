# MVP Roadmap

## Step 1 (done): Foundation
Project root, Vite, React, Tailwind, Router, Vitest, landing page, docs.

## Step 2 (done): Design system and app shell
Responsive header/nav, LOCALAY branding, location selector, LocationContext,
hero section, search input, category grid, shared UI components (Button, Badge,
Card, SearchInput, LoadingState, EmptyState), extended Tailwind theme,
skip-to-content link. 17 tests.

## Step 3 (done): Discovery with mock data
Place data model (regionId-based hierarchy), 12 demo places (all _demo:true),
service abstraction (placeService, regionService), search and filter utilities,
DiscoverPage (URL-param driven filters, search, category pills, place grid),
PlaceDetailPage (location, access, map placeholder, tags), usePlaces hook,
PlaceCard, CategoryFilter, MapPlaceholder, navigation wired end-to-end.
65 tests (8 test files).

## Step 4: Firebase foundation
Firebase project setup, config via env variables, auth, Firestore, security
rules. Replace mock implementations in placeService.js and regionService.js.

## Step 5: Community content
Submit places, reviews, and ratings with moderation basics.

## Step 6: Maps
Leaflet and OpenStreetMap integration. Replace MapPlaceholder with real maps.
Nearby places, access information.

## Step 7: AutoFare
Community-reported auto-rickshaw fares with route and time context.

## Step 8: Expansion and launch
Multi-region support, performance, accessibility pass, deployment.

## Deferred
Firebase, real maps (Leaflet), AutoFare, user accounts, community submissions.
