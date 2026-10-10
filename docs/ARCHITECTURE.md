# Architecture

## Overview

LOCALAY is a single-page React application built with Vite, styled with Tailwind CSS, and routed via React Router 6.
Data persistence, authentication, and file storage are abstracted through a service layer (`src/services`), connecting to Cloud Firestore, Firebase Auth, and Cloud Storage, or seamlessly falling back to an in-memory **Demo Mode** when live Firebase config is absent.

## Layered Architecture

```
pages  ──►  features / components  ──►  services  ──►  Firebase SDK (Auth/Firestore/Storage)
                                   ──►  utils    └──►  Mock In-Memory Store (Demo Mode)
```

- **`src/pages`**: Route-level screens (`HomePage`, `ContributePage`, `MyContributionsPage`, `ModerationPage`, `PlaceDetailPage`, `AutoFarePage`). Holds UI routing composition only.
- **`src/layouts`**: Shared page shells (`MainLayout` with header, navigation, location selector, auth pill, and footer).
- **`src/features`**: Product feature modules (`contributions`, `autofare`).
- **`src/components`**: Generic, reusable UI components (`Button`, `Badge`, `Card`, `SearchInput`, `SubmissionStatusBadge`, `AuthModal`, etc.).
- **`src/services`**: The **only** system boundary. UI code imports service functions and never accesses Firebase SDK directly.
- **`src/context`**: Application contexts (`LocationContext`, `AuthContext`).

Dependencies flow strictly downward. Services never import from pages or components.

## Region & Geographic Expansion Model

Malappuram is the populated initial launch region. Geographic expansion is built into the architecture:
- Every place, review, dish price, update, submission, and fare report document contains `regionId`, `districtId`, and optional `townId`.
- Adding a new town or district requires registering region data in `src/data/regions.js` (or database configuration), requiring **zero UI or component redesign**.
- Unpopulated or newly added regions display graceful empty states without breaking layout.

## Moderation & Data Governance Architecture

Unmoderated community contributions are isolated in `submissions` and `placeUpdates` with `status: 'pending'`.
- Only authorized moderators (`isModerator`) can approve submissions, transition status (`verified`, `community_reported`, `rejected`, `needs_recheck`), or publish verified spots into `places`.
- Historical price submissions (`dishPrices`) and AutoFare reports (`fareReports`) append new historical records rather than overwriting past entries.

## Testing & Verification

Vitest with jsdom and React Testing Library. All unit and integration tests reside in `tests/`.
