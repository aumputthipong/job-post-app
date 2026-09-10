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
2. No `firestore.rules` / `storage.rules` ever existed — if the project is still on Firebase's
   test-mode default rules, anyone with the app's (public) API key can read/write/delete all
   data directly. Locking this down is Phase 3, after writes are moved to the API.
3. Firestore writes lived inside Redux reducers (async side effects in what should be pure
   functions) — being replaced by API calls kicked off from action creators/thunks instead.
4. `data/*.js` files set up `onSnapshot` listeners at module scope and mutate a shared array
   used as Redux `initialState` — works by accident, fragile. To be replaced by hooks in Phase 4.
5. `firebase-admin`, `native-base`, `@react-native-firebase/*`, `react-native-image-picker`,
   `add`, `yarn` were in the mobile app's dependencies but never imported anywhere — removed
   during the Phase 0 cleanup.
6. `android/` (594 MB, Expo-generated, unmodified) was committed to the old repo — deliberately
   NOT copied here. Run `npx expo prebuild` inside `apps/mobile` when a native build is needed.

## Phase plan

1. **Phase 0 — done.** Repo restructured, dead deps removed, `packages/shared` created.
2. **Phase 1 — in progress.** Backend skeleton: Fastify + firebase-admin + Zod validation,
   ID-token auth middleware, `/health`. `/favorites/toggle` and `/ratings` implemented as the
   first two migrated endpoints (chosen as the simplest writes to start with).
3. **Phase 2 — not started.** Migrate remaining writes, in this order:
   - `POST/PUT/DELETE /posts/find` (JobPosts) and `/posts/hire` (HirePosts), including deleting
     the associated Storage image/resume on post delete (the legacy `EditFind.js`/`EditHire.js`
     delete the Firestore doc but never clean up Storage)
   - `POST /comments` (JobComments / HireComments)
   - `PUT /users/me` (User Info) and `PUT /users/me/noti-preferences` (User Noti)
   - `POST /auth/register` — create the Auth user and the `User Info` doc in one transaction
     (today `RegisterScreen.js` does these as two separate calls; if the second fails, the
     user ends up with a login but no profile)
4. **Phase 3 — not started.** Lock `firestore.rules`/`storage.rules` to read-only for clients;
   confirm no write path still goes directly from the app to Firestore.
5. **Phase 4 — not started.** Frontend modernization: TypeScript, modular Firebase SDK
   (replace `firebase/compat`), TanStack Query + Zustand (replace the Redux store), Expo Router
   (replace `navigation/MyNavigator.js`), NativeWind, incremental Expo SDK upgrade.
