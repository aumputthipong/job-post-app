# Migration plan

Origin: [job-app-project](https://github.com/aumputthipong/job-app-project) (university team project, archived).
Same Firebase project and Firestore data are reused — nothing is migrated at the data layer.

## Decisions made

- New repo, monorepo layout (npm workspaces) — see chat history for the reasoning
- No deployment for now — API runs locally only
- Priority: finish the backend first, modernize the frontend after
- Frontend will move to Expo Router (queued for Phase 4, not started)

## Known issues carried over from the legacy code (tracked, not yet all fixed)

1. **Fixed by `packages/shared`**: `jobsReducer.js` wrote ratings to a Firestore collection
   named `"RatingJobs"` while `data/Jobs-data.js` read from `"JobRatings"` — two different
   string literals for what should have been one collection, so Find-job ratings never
   displayed. `COLLECTIONS.JOB_RATINGS` in `packages/shared` is now the only name used.
   **Resolved 2026-09-10:** the live project did have 18 orphaned rating docs under the
   old `"RatingJobs"` name (real user ratings that never displayed). They were copied to
   `"JobRatings"` preserving doc ids, verified, and the source docs deleted — see
   `apps/api/scripts/migrations/001-merge-rating-jobs-into-job-ratings.ts`.
2. **Firebase Storage is dead on this project.** It sits behind the Blaze plan and the
   bucket has no billing account, so every path to the object data fails: clients get
   402 Payment Required, the Admin SDK gets "billing account is disabled in state absent",
   and signed URLs get 403. Object *metadata* still lists, so the 53 objects (36.7 MB) exist
   but cannot be read — the existing images can't even be exported without enabling billing.
   Decision: don't pay to unlock media we'd migrate away from anyway. New uploads go to
   Cloudinary (free tier, no card) through `POST /uploads`; the dead `imageUrl` values left
   in Firestore need a placeholder in the UI. `apps/api/scripts/backup-storage.ts` is kept
   ready in case billing is ever enabled.
3. No `firestore.rules` / `storage.rules` ever existed — if the project is still on Firebase's
   test-mode default rules, anyone with the app's (public) API key can read/write/delete all
   data directly. Locking this down is Phase 3, after writes are moved to the API.
4. Firestore writes lived inside Redux reducers (async side effects in what should be pure
   functions) — being replaced by API calls kicked off from action creators/thunks instead.
5. `data/*.js` files set up `onSnapshot` listeners at module scope and mutate a shared array
   used as Redux `initialState` — works by accident, fragile. To be replaced by hooks in Phase 4.
6. `firebase-admin`, `native-base`, `@react-native-firebase/*`, `react-native-image-picker`,
   `add`, `yarn` were in the mobile app's dependencies but never imported anywhere — removed
   during the Phase 0 cleanup.
7. `android/` (594 MB, Expo-generated, unmodified) was committed to the old repo — deliberately
   NOT copied here. Run `npx expo prebuild` inside `apps/mobile` when a native build is needed.

## Phase plan

1. **Phase 0 — done.** Repo restructured, dead deps removed, `packages/shared` created.
2. **Phase 1 — in progress.** Backend skeleton: Fastify + firebase-admin + Zod validation,
   ID-token auth middleware, `/health`. `/favorites/toggle` and `/ratings` implemented as the
   first two migrated endpoints (chosen as the simplest writes to start with).
3. **Phase 2 — backend done, client not yet switched over.** All writes now have an
   endpoint, verified running against the live project:

   | Endpoint | Replaces |
   | --- | --- |
   | `POST/PUT/DELETE /posts/find`, `/posts/hire` | CreateFind, CreateHire, EditFind, EditHire |
   | `POST/DELETE /comments/:postKind` | comment writes in both detail screens |
   | `GET/PUT /users/me` | MyProFileScreen |
   | `GET/PUT /users/me/noti-preferences` | EditNoti |
   | `POST /favorites/toggle` | TOGGLE_FAVORITE in both reducers |
   | `PUT /ratings` | SCORE_RATING / HIRE_RATING |
   | `POST /uploads` | `firebase.storage().put()` in 5 screens |
   | `POST /auth/register` | RegisterScreen |

   Remaining: point the mobile screens at these endpoints instead of writing to Firestore
   directly, one screen at a time.
4. **Phase 3 — not started.** Lock `firestore.rules`/`storage.rules` to read-only for clients;
   confirm no write path still goes directly from the app to Firestore.
5. **Phase 4 — not started.** Frontend modernization: TypeScript, modular Firebase SDK
   (replace `firebase/compat`), TanStack Query + Zustand (replace the Redux store), Expo Router
   (replace `navigation/MyNavigator.js`), NativeWind, incremental Expo SDK upgrade.
