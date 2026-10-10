# Team Workflow

## Roles

- **UI/UX owner**: design system, components, pages, layouts, styling, accessibility, responsive behavior.
- **Backend/Firebase owner**: Firebase project, authentication, Firestore data model, security rules, storage, `src/services`.

Each owner is the primary reviewer for changes in their area. Cross-area changes need review from both.

## Branches

- `main` is always deployable and protected. No direct pushes.
- Create short-lived branches from `main`:
  - `feat/<area>-<short-name>` for example `feat/ui-place-card`
  - `fix/<short-name>`
  - `docs/<short-name>`
  - `chore/<short-name>`

## Pull requests

1. Keep PRs small and focused on one change.
2. Pull the latest `main` and rebase or merge before opening the PR.
3. Run `npm test` and `npm run build`; both must pass.
4. Describe what changed, why, and how to test it. Include screenshots for UI changes.
5. Request review from the other teammate (or the area owner).
6. Merge with squash after approval. Delete the branch.

## Commit messages

Use short, conventional prefixes: `feat:`, `fix:`, `docs:`, `chore:`, `test:`, `refactor:`.

## Avoiding conflicts

- Stay within your owned folders where possible.
- Agree on interfaces first. UI calls functions in `src/services`; backend defines their inputs and outputs. Use mock data until the real service lands.
- Do not commit secrets. Share Firebase values privately.
