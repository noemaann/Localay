# Database Schema & Data Models

This document provides the complete schema definition for the 8 Cloud Firestore collections used by **LOCALAY**.

---

## Collections Overview

```
Firestore Database
├── regions (Public Discovery)
├── places (Verified Discovery Spots)
├── reviews (Place Ratings & Experiences)
├── dishPrices (Crowd-sourced Dish Price History)
├── placeUpdates (Proposed Corrections & Access Info)
├── fareReports (AutoFare Auto-Rickshaw Reports)
├── submissions (Unmoderated New Place Proposals)
└── users (User Profiles & Roles)
```

---

## 1. `regions` Collection

Defines supported administrative and geographical regions.

| Field Name | Type | Constraint | Description |
|---|---|---|---|
| `id` | String | Document ID (PK) | Unique slug, e.g., `"malappuram-kerala"` |
| `name` | String | Required | Display name, e.g., `"Malappuram"` |
| `districtId` | String | Required | District slug, e.g., `"malappuram"` |
| `state` | String | Required | State name, e.g., `"Kerala"` |
| `country` | String | Required | Country name, e.g., `"India"` |
| `label` | String | Required | UI display label, e.g., `"Malappuram, Kerala"` |
| `available` | Boolean | Required | Whether region is active for selection |

---

## 2. `places` Collection

Verified and published discovery places. Managed by moderators/admins.

| Field Name | Type | Constraint | Description |
|---|---|---|---|
| `id` | String | Document ID (PK) | Unique place ID, e.g., `"place_kottakkunnu"` |
| `name` | String | Required | Place display name |
| `regionId` | String | Required (FK) | Region reference ID |
| `districtId` | String | Required | District identifier |
| `townId` | String | Required | Town or locality identifier |
| `category` | String | Required | Category slug (`food`, `nature`, `viewpoints`, etc.) |
| `description` | String | Required | Full description text |
| `address` | String | Optional | Street address / landmarks |
| `location` | Map | Optional | `{ latitude: Number, longitude: Number }` |
| `coverImage` | String | Optional | Image URL |
| `tags` | Array<String> | Optional | Feature tags |
| `status` | String | Enum | `"approved"` \| `"community_reported"` |
| `createdAt` | Timestamp | Server | Record creation timestamp |
| `createdBy` | String | FK | User UID or `"system"` |

---

## 3. `reviews` Collection

Place reviews and ratings submitted by community members.

| Field Name | Type | Constraint | Description |
|---|---|---|---|
| `id` | String | Document ID (PK) | Unique review ID |
| `placeId` | String | Required (FK) | Target place ID |
| `regionId` | String | Required | Region reference |
| `districtId` | String | Required | District reference |
| `userId` | String | Required (FK) | Contributor User UID |
| `authorName` | String | Required | Display name of reviewer |
| `rating` | Number | 1 <= rating <= 5 | Numeric rating |
| `title` | String | Optional | Review headline |
| `content` | String | Required (>= 5 chars) | Review body text |
| `status` | String | Enum | `"pending"` \| `"community_reported"` \| `"verified"` \| `"rejected"` \| `"needs_recheck"` |
| `createdAt` | Timestamp | Server | Submission timestamp |
| `moderatedBy` | String | Optional (FK) | Moderator User UID |

---

## 4. `dishPrices` Collection

Crowd-sourced food and dish pricing. Historical series (append-only).

| Field Name | Type | Constraint | Description |
|---|---|---|---|
| `id` | String | Document ID (PK) | Unique price ID |
| `placeId` | String | Required (FK) | Target food spot place ID |
| `regionId` | String | Required | Region reference |
| `districtId` | String | Required | District reference |
| `dishName` | String | Required | Dish or snack item name |
| `price` | Number | Required (> 0, < 100000) | Price in currency |
| `currency` | String | Default `"INR"` | Currency code |
| `category` | String | Enum | `"snacks"` \| `"main_course"` \| `"beverages"` \| `"desserts"` |
| `userId` | String | Required (FK) | Contributor User UID |
| `createdAt` | Timestamp | Server | Submission timestamp |

---

## 5. `placeUpdates` Collection

Proposed corrections, road access, and terrain updates for existing places.

| Field Name | Type | Constraint | Description |
|---|---|---|---|
| `id` | String | Document ID (PK) | Unique update ID |
| `placeId` | String | Required (FK) | Target place ID |
| `type` | String | Enum | `"general_update"` \| `"access_road"` \| `"correction"` |
| `regionId` | String | Required | Region reference |
| `userId` | String | Required (FK) | Contributor User UID |
| `proposedChanges` | Map | Required | Details map (`roadCondition`, `parkingInfo`, `accessNotes`, `correctionType`) |
| `status` | String | Enum | `"pending"` \| `"community_reported"` \| `"verified"` \| `"rejected"` \| `"needs_recheck"` |
| `createdAt` | Timestamp | Server | Submission timestamp |

---

## 6. `fareReports` Collection

AutoFare auto-rickshaw community fare reports. Append-only series.

| Field Name | Type | Constraint | Description |
|---|---|---|---|
| `id` | String | Document ID (PK) | Unique fare report ID |
| `regionId` | String | Required | Region reference |
| `districtId` | String | Required | District reference |
| `townId` | String | Required | Locality / Town identifier |
| `origin` | String | Required | Pickup stand or landmark |
| `destination` | String | Required | Drop-off destination |
| `distanceKm` | Number | Required (> 0, < 500) | Distance in km |
| `fareAmount` | Number | Required (> 0, < 50000) | Total fare in INR |
| `currency` | String | Default `"INR"` | Currency code |
| `fareType` | String | Enum | `"agreed"` \| `"metered"` |
| `tripType` | String | Enum | `"one_way"` \| `"round_trip"` |
| `timeOfDay` | String | Enum | `"day"` \| `"night"` \| `"peak"` |
| `waitingMinutes` | Number | Default `0` | Waiting time in minutes |
| `waitingCharges` | Number | Default `0` | Waiting charges in INR |
| `tollsAndExtras` | Number | Default `0` | Tolls and extra charges in INR |
| `notes` | String | Optional | Additional trip context |
| `userId` | String | Required (FK) | Contributor User UID |
| `status` | String | Enum | `"unverified"` \| `"community_reported"` \| `"verified"` |
| `createdAt` | Timestamp | Server | Submission timestamp |

---

## 7. `submissions` Collection

Unmoderated community proposals for new places.

| Field Name | Type | Constraint | Description |
|---|---|---|---|
| `id` | String | Document ID (PK) | Unique submission ID |
| `type` | String | Default `"new_place"` | Submission category |
| `regionId` | String | Required | Region reference |
| `districtId` | String | Required | District reference |
| `townId` | String | Required | Locality / Town identifier |
| `placeData` | Map | Required | `{ name, category, description, address, coverImage, accessInfo, roadCondition }` |
| `userId` | String | Required (FK) | Contributor User UID |
| `status` | String | Enum | `"pending"` \| `"community_reported"` \| `"verified"` \| `"rejected"` \| `"needs_recheck"` |
| `createdAt` | Timestamp | Server | Submission timestamp |
| `moderatedBy` | String | Optional (FK) | Moderator User UID |
| `moderationNotes` | String | Optional | Moderator feedback notes |

---

## 8. `users` Collection

User profiles and permission roles.

| Field Name | Type | Constraint | Description |
|---|---|---|---|
| `id` | String | Document ID (Matches Auth `uid`) | User UID |
| `displayName` | String | Required | Contributor name / alias |
| `email` | String | Required | Contributor email |
| `photoURL` | String | Optional | Avatar image URL |
| `role` | String | Enum | `"community_member"` \| `"moderator"` \| `"admin"` |
| `createdAt` | Timestamp | Server | Account creation timestamp |
| `updatedAt` | Timestamp | Server | Last update timestamp |
