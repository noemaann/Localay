# LOCALAY — Community-Powered Local Discovery Platform

LOCALAY is a community-powered local discovery platform covering hidden food spots, nature destinations, local experiences, community reviews, road access information, and community-reported auto-rickshaw fares (AutoFare).

Malappuram, Kerala is the **initial launch region**, not a permanent application boundary. The platform supports multi-region geographic expansion (district and town-level hierarchy) driven entirely by data (`src/data/regions.js` & Firestore collections).

---

## 🚀 Key Features

- **Local Discovery & Exploration**: Search, filter by category (Food, Nature, Viewpoints, Waterfalls, Treks, Experiences), and browse local spot details with practical access details and interactive maps.
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
- **Testing**: Vitest, React Testing Library, jsdom

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
VITE_USE_DEMO_MODE=true
```

## Key URLs (dev server)

| Path | Description |
|---|---|
| `/` | Home page — hero, search, category grid |
| `/discover` | Discovery page — search + category filter + place cards |
| `/discover?q=biriyani` | Pre-filtered search |
| `/discover?category=food` | Pre-filtered by category |
| `/place/:placeId` | Place detail — location, access, map placeholder, tags |
| `/places/:placeId` | Place detail with community reviews & updates |
| `/autofare` | Auto-rickshaw fare comparison & reporting tool |
| `/contribute` | Propose new places to the community |
| `/my-contributions` | Personal contribution tracking dashboard |
| `/moderation` | Moderator dashboard for review queue |

---

## 📚 Documentation Index

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Layered architecture & region data model
- [`docs/DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md) — 8 Firestore collections schema definition
- [`docs/FIREBASE_SETUP.md`](docs/FIREBASE_SETUP.md) — Firebase console setup, security rules, indexes & rules deployment
- [`docs/SECURITY_AND_MODERATION.md`](docs/SECURITY_AND_MODERATION.md) — Security rules, moderation states & anti-self-approval safeguards
- [`docs/AUTOFARE_ALGORITHM.md`](docs/AUTOFARE_ALGORITHM.md) — AutoFare calculation methodology & statistical limits
- [`docs/MVP_ROADMAP.md`](docs/MVP_ROADMAP.md) — Step-by-step progress & release status
- [`docs/FINAL_IMPLEMENTATION_REPORT.md`](docs/FINAL_IMPLEMENTATION_REPORT.md) — Final integration report & deployment checklist

---

## Security

Do not commit Firebase credentials or any real secrets. Use `.env.local` for local values.
