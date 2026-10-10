# Security, Permissions & Moderation Policy

This document defines the security boundaries, data governance, anti-self-moderation rules, and Cloud Storage security policies for **LOCALAY**.

---

## 1. Security Architecture & Principles

LOCALAY enforces a strict **Zero Unrestricted Access Policy**:
- **Never deploy `allow read, write: if true;` to production.**
- **Isolation of Unmoderated Content**: Unverified community contributions land in `submissions` and `placeUpdates` with `status: 'pending'`, isolated from public discovery spots (`places`).
- **Anti-Self-Moderation**: Regular users cannot mark their own submissions as `approved` or `verified`. In `firestore.rules`, creating or updating documents enforces `status == 'pending'` or `'unverified'` unless the user possesses an `admin` or `moderator` role.
- **Role Isolation**: Users cannot modify their own `role` property in `users/{userId}`.

---

## 2. Moderation Lifecycle & States

Every community contribution passes through a transparent moderation lifecycle:

```
[User Contribution Submitted]
             │
             ▼
    status: 'pending' / 'unverified'
             │
             ├──► Approved by Moderator ──► status: 'verified' / 'approved' (Published)
             ├──► Community Reported     ──► status: 'community_reported' (Public Context)
             ├──► Flagged for Recheck    ──► status: 'needs_recheck'
             └──► Rejected by Moderator  ──► status: 'rejected'
```

### State Definitions
1. `pending`: Initial unmoderated state. Hidden from public discovery.
2. `community_reported`: Published as user-contributed context (e.g. dish prices, crowd auto fares).
3. `verified`: Reviewed and confirmed by an authorized moderator. For place proposals, approving as `verified` automatically publishes a trusted `places` document.
4. `rejected`: Rejected due to spam, invalid coordinates, or offensive content.
5. `needs_recheck`: Requires ground re-checking by local scouts or clarification from the contributor.

---

## 3. Firestore Security Rules Matrix

| Collection | Read Permission | Create Permission | Update / Delete Permission | Field Constraints |
|---|---|---|---|---|
| `regions` | Public (`if true`) | Admin Only | Admin Only | Administrative region metadata |
| `places` | Public (`status == 'approved'`) \| Moderator | Moderator / Admin Only | Moderator / Admin Only | Trusted place records |
| `reviews` | Public (`status == 'approved'`) \| Owner \| Moderator | Authenticated Users (`request.auth != null`) | Owner (cannot alter `status`) \| Moderator | `rating >= 1 && rating <= 5`, `status: 'pending'` |
| `dishPrices` | Public (`if true`) | Authenticated Users | Moderator / Admin Only | Append-only. `price > 0 && price < 100000` |
| `placeUpdates` | Owner \| Moderator | Authenticated Users | Moderator / Admin Only | `status: 'pending'` |
| `fareReports` | Public (`if true`) | Authenticated Users | Moderator / Admin Only | Append-only. `distanceKm > 0`, `fareAmount > 0` |
| `submissions` | Owner \| Moderator | Authenticated Users | Moderator / Admin Only | `status: 'pending'` |
| `users` | Authenticated Users | Owner (`role == 'community_member'`) | Owner (cannot alter `role`) \| Admin | Role escalation blocked |

---

## 4. Cloud Storage Security Policy

Security rules in `storage.rules` enforce:
- **Max File Size**: 5 MB (`request.resource.size < 5 * 1024 * 1024`).
- **MIME Type Validation**: Restricted strictly to JPEG, PNG, and WebP images (`request.resource.contentType.matches('image/(jpeg|png|webp)')`).
- **Path Authorization**: Users can only write to their own folder paths (`submissions/{userId}/...`, `reviews/{userId}/...`).
