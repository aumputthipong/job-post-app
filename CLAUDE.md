# CLAUDE.md

Portfolio project: a legacy university Expo app (job board) being given a real
backend and a modernized frontend, while keeping the **same Firebase project
and data** (`log-in-d8f2c`). Solo developer, no real users, nothing is deployed —
the API runs locally only.

Read `MIGRATION.md` for the full history and the reasoning behind each decision.

## Layout

- `apps/mobile` — Expo SDK 57 / RN 0.86, TypeScript, Expo Router, NativeWind, TanStack Query
- `apps/api` — Fastify 5 + TypeScript + firebase-admin, run with `tsx`
- `packages/shared` — Zod schemas + `COLLECTIONS` constants used by both apps
- `firestore.rules` / `storage.rules` — source of truth, but see "Publishing rules"

## Running it

```bash
npm install                                   # from repo root (npm workspaces)

# Local development — the default. Nothing here can reach production.
npm run emulators                             # Firebase Auth + Firestore emulators (UI on :4001)
npm run seed                                  # sample data; every account's password is password123
npm run api:emulators                         # API on :4000 against the emulators

npm run mobile                                # Metro for apps/mobile; press `a` for Android
npm test                                      # starts emulators, runs API + rules tests, stops them
npm run typecheck -w @jobapp-platform/api

# Against the real project — only when that is the point.
npm run dev -w @jobapp-platform/api           # API on :4000 against log-in-d8f2c
# the app needs apps/mobile/.env.local (see .env.example) to leave the emulators
```

`npm test` empties the emulators between cases, so it can't share them with someone testing
the app. To run it during a session, start a second set on other ports: copy `firebase.json`
to a scratch file with different `auth`, `firestore`, `hub` and `logging` ports, then
`node scripts/firebase.mjs emulators:exec --config <that file> --project demo-jobapp --only
auth,firestore "npm run test:run -w @jobapp-platform/api"`. The tests read the hosts from the
environment `emulators:exec` sets, so nothing else needs changing.

The emulators need Java 21+. `scripts/firebase.mjs` finds one on its own (JAVA_HOME, then the
JDK bundled with Android Studio), so the machine's default `java` can stay at 17.

Headless check that the app still bundles:
`cd apps/mobile && npx expo export --platform android --output-dir <tmp>`
(the old SDK 49 app is gone; `git log -- apps/mobile-legacy` finds it if a comparison is needed)

The mobile app finds the API through the host Expo served the bundle from
(`getDevHost()` in `src/lib/firebase.ts`), so no IP is hardcoded.

## Architecture (settled — don't re-litigate)

- **Reads** stay on the client via Firestore `onSnapshot`, written into the TanStack Query
  cache (`src/lib/live-query.ts`), so screens share one listener and one cached value.
- **Writes** all go through the API. No screen writes to Firestore directly any more.
- **Firestore rules** allow signed-in reads and deny every client write (Phase 3, verified).
  The API uses the Admin SDK, which bypasses rules.
- **Media** goes to Cloudinary via `POST /uploads`. Firebase Storage is dead on this project
  (Spark plan, no billing account: 402 to clients, "billing account absent" to Admin SDK).
  The owner has no credit card, so Blaze is not an option. Old image URLs are dead;
  `PostImage` falls back to a placeholder.
- Every API route takes the user id from the verified ID token, never from the body.

## Secrets (all gitignored — never commit)

- `apps/api/serviceAccountKey.json` — Firebase Admin key
- `apps/api/.env` — `PORT`, `GOOGLE_APPLICATION_CREDENTIALS`, `CLOUDINARY_*`
- `apps/mobile/.env.local` — Firebase web config, only needed to run against production
  (the retired app's copy is kept at `apps/mobile-legacy/database/firebaseDB.js`, gitignored)

## Working with the live project — read before touching data

- **Develop and test against the emulators** (project `demo-jobapp`). A `demo-` project id
  cannot reach real services — Firebase fails the call instead — and `firebaseAdmin.ts` refuses
  to start with only one emulator variable set, or with a non-demo project id. `test/setup.ts`
  stops the test run outright if the emulators aren't in use, because the production key sits in
  `apps/api/` and the tests wipe the database between cases.
- The app talks to the emulators unless `apps/mobile/.env.local` says otherwise.
- **Never test `/auth/register` with a real address.** A "duplicate email" test once created
  a real account because the address turned out not to be registered.
- Deleting Auth users and publishing security rules from scripts are blocked by the
  Claude Code auto-mode classifier. The owner does those in the Firebase Console —
  hand them exact steps/content instead of looping on workarounds.
- Probe writes against production should be no-ops (write a field back to its current value).
- `User Noti` can only be queried with a `where("notiBy", "==", uid)` filter; an unfiltered
  list is refused by the rules on purpose.

## Publishing rules

Edit `firestore.rules` in the repo, commit, then give the owner the file contents to paste
into Firebase Console → Firestore → Rules → Publish. Storage rules cannot be opened in the
console on the Spark plan; that's harmless while the bucket is unreachable.

## Android emulator notes (Windows)

- AVD `Medium_Phone`; open the app with
  `adb shell am start -a android.intent.action.VIEW -d "exp://<LAN-IP>:8081"`
- **Never run `adb shell pm clear host.exp.exponent`** — it corrupts Expo Go
  ("Failed to load all assets"). If that happens, `adb uninstall host.exp.exponent` and let
  `npx expo start --android --go` reinstall the matching Expo Go build.
- `expo start` may open a chooser page in Chrome; tap "Expo Go".

## Status and what's next

Phases 0–4 are built and merged. **Phase 4 ended with 4.7**: the SDK 49 app was deleted and
the rebuilt one took its place at `apps/mobile`. Decided and not to be revisited without the
owner: no in-place SDK upgrade, **no Zustand**, no push notifications while the app runs in
Expo Go.

**Phase 5 is in progress** (MIGRATION.md 5.1–5.5): my posts, several images per post,
in-app notifications grouped per post.

Still open, and the owner's call:
- The new app has only run against the emulators. One run against the real project is
  wanted before trusting it there (MIGRATION.md 4.7).

`apps/mobile/metro.config.js` carries several monorepo resolution fixes — read its comments
(and MIGRATION.md 4.2, 4.5) before touching it; the workspace root still holds React 18 /
RN 0.72 / expo 49 as peers of the old async-storage that `apps/api`'s firebase brings in.
Uploads must send an `expo-file-system` `File`, not a `{ uri, name, type }` object
(MIGRATION.md 4.5).

The legacy app's lists read module-scope arrays mutated in place, so a new post only
appeared after navigating away and back. The rebuilt lists are live listeners; that's gone.

## Conventions

- Owner communicates in Thai; reply in Thai.
- Commit in small, single-purpose commits with messages that explain *why*. No attribution lines.
- Comments in code: short, sparse — only where genuinely non-obvious. Not a paragraph per line.
- Work on a feature branch and open a PR (`gh pr create`); don't push straight to `main`.
- Verify against the running app or live API before calling something done.
