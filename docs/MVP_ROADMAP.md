# MVP Roadmap

## Step 1 (done): Foundation
Project root, Vite, React, Tailwind, Router, Vitest, landing page, docs.

## Step 2 (done): Design system and app shell
Responsive header/nav with LOCALAY branding, mobile hamburger menu, location selector, `LocationContext` with default region, hero section with search input and suggestion pills, community banner, category grid (food, nature, viewpoints, waterfalls, treks, experiences), shared UI components (Button, Badge, Card, SearchInput, LoadingState, EmptyState, SubmissionStatusBadge, AuthModal), extended Tailwind theme, 56 passing unit and integration tests.

## Step 3 (done): Discovery with local data
Place data model, category browsing, place detail pages (`PlaceDetailPage`), verified spot discovery, and multi-region town filtering.

## Step 4 (done): Firebase foundation
Firebase JS SDK v10 (Auth, Firestore, Cloud Storage), environment variable configuration (`.env.example`), automatic **Demo Mode** fallback, abstract service layer (`src/services/`), Firestore security rules (`firestore.rules`), storage rules (`storage.rules`), compound indexes (`firestore.indexes.json`), and comprehensive setup documentation (`docs/FIREBASE_SETUP.md`).

## Step 5 (done): Community content & moderation
Authenticated place proposals (`SubmitPlaceForm`), community reviews & ratings (`AddReviewForm`), crowd-sourced dish price reports (`AddDishPriceForm`), road access & terrain updates (`AccessUpdateForm`), place correction requests (`CorrectionRequestForm`), user contributions tracking dashboard (`MyContributionsPage`), and authorized moderator panel (`ModerationPage`) with 5 moderation lifecycle states (`pending`, `community_reported`, `verified`, `rejected`, `needs_recheck`).

## Step 6 (done): Access information & spatial data
Road access condition reporting, parking options, terrain details, and data-driven coordinate markers.

## Step 7 (done): AutoFare
Community-reported auto-rickshaw fare comparison tool (`AutoFarePage`), fare calculator & statistical range finder (`calculateFareSummary`), recency filtering (180-day window), neutral outcome status badges (`Within reported range`, `Below reported range`, `Above reported range`, `Insufficient comparable data`), and full methodology documentation (`docs/AUTOFARE_ALGORITHM.md`).

## Step 8 (done): Final integration & geographic expansion
Multi-region district/town data model (`regionId`, `districtId`, `townId`), Malappuram launch region population, unpopulated region empty states, secret auditing, dead button removal, 56 unit/integration test suite, production Vite build, and final deployment documentation.
