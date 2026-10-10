# Firebase & Backend Foundation Setup Guide

This document explains the Firebase integration, data architecture, security model, environment configuration, and trusted backend validation requirements for **LOCALAY**.

---

## 1. Overview & Architecture

LOCALAY uses Firebase JavaScript SDK (v10+) for Authentication, Cloud Firestore (NoSQL database), and Cloud Storage.

To maintain clean architecture, **UI components never import the Firebase SDK directly**. All data access, authentication, and storage operations pass through the abstract service layer in `src/services`:

```
React UI Components / Pages
          │
          ▼
   src/services (placeService, authService, etc.)
          │
    ┌─────┴──────────────────────────────┐
    ▼                                    ▼
Cloud Firestore / Storage         In-Memory Mock Store
(Live Firebase Mode)                 (Demo Mode)
```

---

## 2. Environment Variables & Demo Mode

### Environment Variables
Copy `.env.example` to `.env.local` for local development. Never commit `.env.local` or secret credentials.

```env
# Firebase Web App Credentials
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef123456

# Explicit Demo Mode Toggle (true / false)
VITE_USE_DEMO_MODE=false
```

### Demo Mode Behavior
When `VITE_FIREBASE_API_KEY` or `VITE_FIREBASE_PROJECT_ID` is missing/empty, OR when `VITE_USE_DEMO_MODE=true` is specified, LOCALAY automatically enters **Demo Mode**:
- Uses in-memory seed data (`src/services/mockData.js`).
- Simulates user sign-in and sign-out without needing network connections.
- Allows immediate frontend development and testing without a live Firebase backend project.

---

## 3. Firebase Console Setup Process

### Step 1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and name it `localay-app` (or your preferred name).
3. Disable or enable Google Analytics as needed.

### Step 2: Register Web App
1. In Project Overview, click the **Web icon (`</>`)**.
2. App nickname: `LOCALAY Web`.
3. Copy the `firebaseConfig` keys into your `.env.local` file under `VITE_FIREBASE_*`.

### Step 3: Enable Authentication
1. Go to **Authentication** > **Get Started**.
2. Under **Sign-in method**, enable:
   - **Google**: Configure support email.
   - **Email/Password**: Enable standard credentials.

### Step 4: Enable Cloud Firestore
1. Go to **Firestore Database** > **Create database**.
2. Choose a database location close to your primary audience (e.g., `asia-south1` for Mumbai/Kerala).
3. Start in **Production Mode** (rules will be deployed via CLI).

### Step 5: Enable Cloud Storage
1. Go to **Storage** > **Get Started**.
2. Start in **Production Mode**.

---

## 4. Firestore Data Model & Schema Definition

LOCALAY uses 8 core Firestore collections. All records include `regionId`, `districtId`, and `townId` where applicable to ensure multi-region scalability beyond the launch region (Malappuram).

### Collections Summary

| Collection | Description | Trusted / Unmoderated | Key Fields |
|---|---|---|---|
| `regions` | Region reference data | Trusted | `id`, `name`, `districtId`, `state`, `country`, `available` |
| `places` | Verified discovery spots | Trusted | `id`, `name`, `regionId`, `districtId`, `townId`, `category`, `status`, `location` |
| `reviews` | Place reviews & ratings | Moderated Community | `id`, `placeId`, `rating` (1-5), `content`, `userId`, `status` |
| `dishPrices` | Crowd-sourced dish prices | Historical Series | `id`, `placeId`, `dishName`, `price`, `currency`, `userId` |
| `placeUpdates` | Proposed place corrections | Unmoderated Community | `id`, `placeId`, `proposedChanges`, `userId`, `status` |
| `fareReports` | AutoFare auto reports | Historical Series | `id`, `regionId`, `townId`, `origin`, `destination`, `distanceKm`, `fareAmount`, `status` |
| `submissions` | New place proposals | Unmoderated Community | `id`, `type`, `placeData`, `userId`, `status` |
| `users` | User profiles & roles | User Managed | `id` (UID), `displayName`, `email`, `role`, `createdAt` |

---

## 5. Community Moderation Lifecycle & States

All unmoderated community submissions enter controlled moderation states. No raw community submission is published automatically as a verified fact.

### Moderation States

| State | Badge Label | Description |
|---|---|---|
| `pending` | **Pending Review** | Initial state for all new place proposals, reviews, and corrections. Hidden from public discovery until moderated. |
| `community_reported` | **Community Reported** | Published as user-contributed context (e.g. crowd-sourced dish prices, unverified auto fares) clearly flagged for visitors. |
| `verified` | **Verified** | Verified by an authorized moderator. For place proposals, approving as `verified` automatically publishes a trusted `places` record. |
| `rejected` | **Rejected** | Rejected by moderator due to spam, inaccurate data, or duplicate entries. |
| `needs_recheck` | **Needs Recheck** | Flagged by moderator requiring ground re-verification or contributor clarifying details. |

---

## 6. Security Rules & Storage Policies

Security rules are located in `firestore.rules` and `storage.rules`.

### Firestore Security Highlights
- **Public Discovery**: `regions`, approved `places`, approved `reviews`, `dishPrices`, and `fareReports` are publicly readable (`allow read: if true` or `status == 'approved'`).
- **Protected Actions**: Creating reviews, fare reports, dish prices, or place proposals requires authentication (`request.auth != null`).
- **Numeric & Bounds Validation**:
  - `reviews.rating` must be between `1` and `5`.
  - `fareReports.distanceKm` must be `> 0` and `< 500`.
  - `fareReports.fareAmount` must be `> 0` and `< 50000`.
  - `dishPrices.price` must be `> 0` and `< 100000`.
- **Anti-Self-Moderation**: Regular users cannot mark their own submissions as `approved` or `verified`. Attempts to override `status` default to `'pending'` or `'unverified'` unless performed by a user with role `'admin'` or `'moderator'`.
- **Role Control**: Users cannot alter their own `role` field in `users/{userId}`.

### Storage Security Highlights
- File size capped at **5 MB** (`request.resource.size < 5 * 1024 * 1024`).
- MIME types restricted to images (`image/jpeg`, `image/png`, `image/webp`).

---

## 7. Deployment of Rules & Indexes

Install Firebase CLI if needed:
```bash
npm install -g firebase-tools
firebase login
firebase init firestore
firebase init storage
```

Deploy security rules and indexes:
```bash
firebase deploy --only firestore:rules,firestore:indexes,storage:rules
```

---

## 8. Privileged Backend & Moderation Functions

While Firestore Security Rules enforce document schemas and field-level permissions, the following moderation operations **must be deployed and executed in trusted server environments** (e.g., Firebase Cloud Functions or an Admin SDK backend):

1. **Automated Submission Publishing**: Cloud Function listener on `submissions/{submissionId}` that automatically creates/updates corresponding `places` documents when status transitions to `verified`.
2. **Media Virus & Content Moderation**: Cloud Storage triggers scanning user-uploaded cover photos for inappropriate content before serving via CDN.
3. **Spam & Rate-Limiting Controls**: Enforcement of maximum contribution thresholds per user per 24 hours.
4. **Moderation Audit Logging**: Maintaining an immutable `moderationLogs` ledger recording every status change, moderator UID, timestamp, and notes.
5. **Elevated Administrative Role Assignment**: Privileged Cloud Function granting `moderator` or `admin` roles to user profiles.
