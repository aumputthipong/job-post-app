# Migration plan

Origin: [job-app-project](https://github.com/aumputthipong/job-app-project) (university team project, archived).
Same Firebase project and Firestore data are reused — nothing is migrated at the data layer.

## Decisions made

- New repo, monorepo layout (npm workspaces) — see chat history for the reasoning
- No deployment for now — API runs locally only
- Priority: finish the backend first, modernize the frontend after
- Frontend will move to Expo Router, as part of a rebuilt app (Phase 4, see below)

## Known issues carried over from the legacy code (tracked, not yet all fixed)

**Deferred, by request (2026-09-11):** the notification-preferences flow
(`EditNoti.js` / `PUT /users/me/noti-preferences`) works — saves correctly, no
error — but the underlying feature is incomplete in the legacy design: there
is no code anywhere that reads `User Noti` and actually sends a notification.
It only stores a preference nobody consumes. Revisit this as a feature, not a
bug fix, in Phase 4 or later rather than polishing the current dead-end flow.

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
3. **Resolved in Phase 3.** No `firestore.rules` / `storage.rules` ever existed — if the project is still on Firebase's
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
2. **Phase 1 — done.** Backend skeleton: Fastify + firebase-admin + Zod validation,
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

   **Client migrated 2026-09-10.** No screen writes to Firestore any more — an audit for
   `.add(` / `.set(` / `.update(` / `.delete()` / `firebase.storage()` across screens, store,
   data, navigation and components comes back empty. What is left of the Firebase client SDK
   is `firebase.auth()` (14 uses) and three reads: HomeScreen and MyProFileScreen fetching the
   caller's own profile, and the onSnapshot subscriptions in data/liveCollection.js. That is
   the hybrid split we chose: realtime reads stay on the client, writes go through the API.

   Bugs found and fixed while migrating the screens:
   - Neither create screen would post without an image — the submit handler ended in
     `else { console.log("No image to upload") }`, so the button silently did nothing.
   - Deleting a post had no confirmation step at all.
   - `HireJobDetailScreen.editImg` took no argument and read the `image` state that
     `setImage()` had been given on the line above, which React had not applied yet: the
     first image change uploaded nothing, later ones uploaded the previously picked file.
   - `jobsReducer` imported `SET_NEW_POST_AVAILABLE`, which nothing exports.
   - The shared schema called the avatar `photoUrl`; the data and every screen use `imageUrl`,
     so Zod would have stripped it and avatar changes would never have saved.
   - **Found in emulator testing 2026-09-11:** `CreateFind`'s root element was a `ScrollView`
     wrapping another `ScrollView` (`CreateHire`, otherwise identical, correctly used
     `SafeAreaView`). Two nested vertical ScrollViews fight over layout and touch handling,
     so content ran off the bottom of the screen with no way to scroll to it — the submit
     button existed but was unreachable, making it impossible to create a Find Job post at
     all. Fixed by matching CreateHire's `SafeAreaView` root.
4. **Phase 3 — done 2026-09-10.** `firestore.rules` now grants signed-in reads and denies
   every client write. Verified against the live project with a real ID token over the REST
   API: all nine collections readable (User Noti only via the `notiBy` filter the app sends —
   an unfiltered list is refused, on purpose); client update/create on JobPosts, JobComments,
   FavoriteJobs and the caller's own profile all return 403; Admin SDK writes still succeed.
   The probes wrote each field back to its existing value, so no data changed.
   `storage.rules` was not published — the console won't open Storage on the Spark plan —
   which is harmless while the bucket is unreachable anyway.
5. **Phase 4 — planned 2026-09-11, in progress.** Frontend modernization.

   **Approach: a new app alongside the old one, not an in-place upgrade.** TypeScript, Expo
   Router, NativeWind and TanStack Query each touch every screen, so all 17 screens (~5,400
   lines) get rewritten regardless. Upgrading SDK 49 one version at a time would mean fixing
   breakage five or six times in code that is about to be deleted, and would drag along the
   Expo Router that shipped with SDK 49. Instead `apps/mobile-next` starts on the current SDK
   (and so on the New Architecture from day one) and screens are ported one at a time, while
   `apps/mobile` stays runnable as the reference. When the new app reaches parity, the old
   one is deleted and `mobile-next` is renamed to `mobile`. The API and `packages/shared` are
   unchanged — the new app consumes the contract Phase 2 already proved.

   **Stack decisions:**
   - TanStack Query for server state. Firestore `onSnapshot` listeners write into the query
     cache and screens read with `useQuery`; writes are `useMutation` calls to the API and the
     listener picks up the result, so lists update without navigating away and back.
   - **No Zustand** (it was in the original plan). Once server state lives in the query cache,
     what remains is auth — a small context over `onAuthStateChanged` — and per-screen UI
     state. Nothing needs a global store yet; adding one would be stack for its own sake.
   - Modular Firebase SDK with React Native auth persistence, so login survives a restart.
   - Third-party UI libraries mostly dropped: the dropdown (5 files) and rating (2 files) are
     small enough to build with NativeWind; `react-native-image-zoom-viewer` is unmaintained;
     `react-navigation-header-buttons` and `react-native-virtualized-view` are unnecessary
     under Expo Router; `axios` and `react-native-element-dropdown` were never used.
   - The notification tab is left out of the new app until the feature exists (see the
     deferred note above) rather than porting a screen that stores a preference nothing reads.

   **Steps:**
   - 4.0 Firebase Emulator Suite + API and rules tests — so testing stops touching production.
     **Done 2026-09-11.** Emulators run under the project id `demo-jobapp`; Firebase will not
     route a `demo-` project to real services, so a misconfiguration fails rather than writing
     to `log-in-d8f2c`. The API refuses to start half-emulated or with a non-demo id. 55 tests
     (`npm test`): 28 against the API through real emulator-issued ID tokens, covering each bug
     fixed in Phase 2 — impersonation via `postById`, posting without an image, orphaned
     comments/ratings/favourites on delete, the `RatingJobs` name, duplicate notification rows,
     the avatar field — and 27 against `firestore.rules` with the client SDK. Both suites were
     checked to catch real regressions: planting the `postById` impersonation bug fails exactly
     its test, and opening `JobPosts` to client writes fails exactly the two write tests.
     `npm run seed` loads Thai sample data for developing the new app. firebase-tools 15 needs
     Java 21; `scripts/firebase.mjs` finds the JDK Android Studio ships rather than asking for a
     system-wide Java upgrade.
   - 4.1 Scaffold `apps/mobile-next`: current SDK, TypeScript, Expo Router, NativeWind,
     TanStack Query, design tokens taken from the March 2026 redesign. **Done 2026-09-11.**
     Full route tree scaffolded (auth/tabs/jobs/hires/users) as placeholders.
     *Correction:* 4.1 was recorded as "NativeWind styling rendering correctly" — it wasn't.
     Two copies of `react-native-css-interop` were in the bundle (see 4.2), so `className`
     did nothing; the screenshot that looked styled was default text. Found and fixed in 4.2.
   - 4.2 Auth: welcome, login, register, persistence, route guard. **Done 2026-09-11**, tested
     on the emulator against the Firebase emulators: validation messages, wrong password,
     sign-in, session surviving an app restart, sign-out, duplicate email (409 from the API),
     and registration landing signed in. Route guard is Expo Router's `Stack.Protected`;
     the splash stays up until Firebase has restored any saved session.

     Four monorepo/Metro problems, all in `apps/mobile-next/metro.config.js`:
     - *Firebase Auth "Component auth has not been registered yet".* Not a duplicate package
       but a duplicate *file*: with package exports on, `import "@firebase/app"` resolved to
       its ESM build while `@firebase/auth`'s React Native build `require`s the CJS build —
       two component registries. `@firebase/*` now resolves with package exports off.
     - *NativeWind did nothing.* The css-interop pin added in 4.1 created a second copy;
       styles registered in one, `className` read the other. Pin removed; every
       `react-native-css-interop` import now resolves to nativewind's own copy.
     - *Two Reacts.* Packages hoisted to the workspace root (e.g. `@tanstack/react-query`)
       resolved `react` to apps/mobile's React 18 while the app runs React 19 — would have
       broken the first `useQuery`. `react` / `react-native` are pinned to the app's copies.
     - *`./x.js` imports from packages/shared.* Written that way for Node ESM (the API);
       Metro now retries without the extension.

     Also: the Firebase emulators bound to 127.0.0.1 only, unreachable from the emulator or a
     phone — `firebase.json` now binds them to 0.0.0.0 (fake data only). Register/login
     validation moved to `packages/shared` so the app and the API share one schema.
   - 4.3 Read-only screens: home, both job lists, both detail screens, other user's profile.
     **Built 2026-09-11** and walked through on the emulator against seeded data: lists,
     search, details with rating and comments, the resume viewer, and the author profile. The
     owner's own run-through is still pending; it's a checklist in PR #3.
     - Data comes from Firestore listeners written into the TanStack Query cache
       (`src/lib/live-query.ts`), so lists update live and back navigation is instant.
       Posts are sorted on the client because legacy documents without `createdAt` would be
       dropped by `orderBy`.
     - Everything behind sign-in is one `(app)` stack (tabs plus pushed screens) so a
       screen opened from a tab gets a back button.
     - Fixed along the way: the legacy profile screen showed the email under ปริญญาตรี.
     - *Thai label clipping.* A shrink-to-fit label (e.g. the attribute chip) sometimes lost
       its last word: "มีประสบการณ์งานปูน" drew as "มีประสบการณ์งาน". Yoga's size was right
       (same bounds either way); Android's draw-time layout wrapped the last word onto a
       second, clipped line. It happened whenever the screen rendered from cached data during
       the push animation, e.g. reopening the job list. It isn't Fast Refresh only, as first
       noted. `numberOfLines={1}` fixes it (0/6 clipped vs 4/4 before). Single-line labels
       that size to their text get it; full-width text isn't affected.
   - 4.4 Favourite, rating, comment, Keep.
   - 4.5 Create / edit / delete posts with image upload.
   - 4.6 Own profile and avatar.
   - 4.7 Parity check against the old app, delete it, rename, update docs.

   Route tree, mapped from `navigation/MyNavigator.js`:

   ```
   app/_layout.tsx          providers + guard: (auth) or (app)
   app/(auth)/              welcome, login, register
   app/(app)/_layout.tsx    one stack for everything behind sign-in
   app/(app)/(tabs)/        index (home), keep, profile
   app/(app)/jobs/          index, new, [id], [id]/edit
   app/(app)/hires/         index, new, [id], [id]/edit
   app/(app)/users/[id].tsx another user's profile
   ```
