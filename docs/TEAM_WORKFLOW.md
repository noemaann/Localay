# Team Workflow & Contribution Standards

## Roles & Ownership

- **UI/UX Teammate**: Design system, components (`src/components`), pages (`src/pages`), layouts (`src/layouts`), styling, accessibility, responsive mobile behavior.
- **Backend/Firebase Teammate**: Firebase project, authentication (`src/services/authService.js`), Firestore data model, security rules (`firestore.rules`, `storage.rules`), storage, service contracts (`src/services`).
- **Shared Areas**: `src/features`, `src/routes`, `docs`, `tests`.

Each teammate is the primary reviewer for changes in their owned directories.

## Development Commands

```bash
cmd /c npm install       # Install dependencies
cmd /c npm run dev       # Start Vite local development server
cmd /c npm test          # Run full test suite (56 tests)
cmd /c npm run build     # Production Vite bundle build
cmd /c npm run preview   # Preview production build locally
```

## Branch Strategy & Pull Requests

- `main` is protected and always deployable.
- Feature branches follow: `feat/<feature-name>`, `fix/<bug-name>`, `docs/<topic>`.
- All PRs require:
  1. Passing unit and integration tests (`npm test`).
  2. Successful production build (`npm run build`).
  3. No leaked credentials or hardcoded secrets.
  4. Interface alignment (UI components call `src/services` functions exclusively).

## Secret Hygiene

Never commit `.env.local` or real Firebase keys/private credentials. Placeholders only in `.env.example`.
