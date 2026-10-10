# LOCALAY — Community-Powered Local Discovery Platform

LOCALAY is a community-powered local discovery platform covering hidden food spots, nature destinations, local experiences, community reviews, road access information, and community-reported auto-rickshaw fares (AutoFare).

Malappuram, Kerala is the **initial launch region**, not a permanent application boundary. The platform supports multi-region geographic expansion (district and town-level hierarchy) driven entirely by data (`src/data/regions.js` & Firestore collections).

---

## 🚀 Key Features

- **Firebase Backend & Demo Mode**: Firebase Authentication, Cloud Firestore, and Cloud Storage integration. Supports an explicit **Demo Mode** fallback with rich in-memory datasets when live Firebase credentials are not supplied.
- **Multi-Region Expansion**: Dynamic region selection context with town/locality hierarchy (`regionId`, `districtId`, `townId`). Adding a new town or district requires data configuration without UI code changes.
- **Authenticated Community Contributions**:
  - Place proposals (`submissions`)
  - Community reviews & 1–5 star ratings (`reviews`)
  - Crowd-sourced food & dish prices (`dishPrices` with historical series preservation)
  - Road access & terrain condition updates (`placeUpdates`)
  - Place correction requests
- **Moderation Lifecycle**: Controlled moderation states (`pending`, `community_reported`, `verified`, `rejected`, `needs_recheck`). Prevents unmoderated community submissions from publishing automatically as verified facts.
- **AutoFare Rickshaw Fare Comparison**: Responsible fare calculation algorithm (`calculateFareSummary`) computing descriptive statistics (min, median, max, 25th-75th percentiles) with neutral status labels (`Within reported range`, `Below reported range`, `Above reported range`, `Insufficient comparable data`).

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, JavaScript (JSX), Tailwind CSS 3, React Router 6
- **Backend & Data**: Firebase JS SDK v10 (Auth, Firestore, Cloud Storage), Firestore Rules & Indexes
- **Testing**: Vitest, React Testing Library, jsdom (56 passing tests)

---

## 📦 Development Setup

Requirements: Node.js 18 or newer.

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Run full unit and integration test suite
npm test

# 4. Create production build
npm run build

# 5. Preview production build locally
npm run preview
```

### Environment Configuration
Copy `.env.example` to `.env.local` for local Firebase credentials:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_USE_DEMO_MODE=false
```

---

## 📚 Documentation Index

- [`docs/ARCHITECTURE.md`](file:///c:/Users/Shinil/Documents/Projects/Layover%202026/Localay/docs/ARCHITECTURE.md) — Layered architecture & region data model
- [`docs/DATABASE_SCHEMA.md`](file:///c:/Users/Shinil/Documents/Projects/Layover%202026/Localay/docs/DATABASE_SCHEMA.md) — 8 Firestore collections schema definition
- [`docs/FIREBASE_SETUP.md`](file:///c:/Users/Shinil/Documents/Projects/Layover%202026/Localay/docs/FIREBASE_SETUP.md) — Firebase console setup, security rules, indexes & rules deployment
- [`docs/SECURITY_AND_MODERATION.md`](file:///c:/Users/Shinil/Documents/Projects/Layover%202026/Localay/docs/SECURITY_AND_MODERATION.md) — Security rules, moderation states & anti-self-approval safeguards
- [`docs/AUTOFARE_ALGORITHM.md`](file:///c:/Users/Shinil/Documents/Projects/Layover%202026/Localay/docs/AUTOFARE_ALGORITHM.md) — AutoFare calculation methodology & statistical limits
- [`docs/MVP_ROADMAP.md`](file:///c:/Users/Shinil/Documents/Projects/Layover%202026/Localay/docs/MVP_ROADMAP.md) — Step-by-step progress & release status
- [`docs/FINAL_IMPLEMENTATION_REPORT.md`](file:///c:/Users/Shinil/Documents/Projects/Layover%202026/Localay/docs/FINAL_IMPLEMENTATION_REPORT.md) — Final integration report & deployment checklist
