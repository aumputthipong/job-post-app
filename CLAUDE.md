# CLAUDE.md

Portfolio project: a legacy university Expo app (job board) being given a real
backend and a modernized frontend, while keeping the **same Firebase project
and data** (`log-in-d8f2c`). Solo developer, no real users, nothing is deployed —
the API runs locally only.

Read `MIGRATION.md` for the full history and the reasoning behind each decision.

## Layout

- `apps/mobile` — Expo SDK 49 / RN 0.72, still JavaScript, Redux + React Navigation 6
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

npm run mobile                                # Metro for apps/mobile-next; press `a` for Android
npm test                                      # starts emulators, runs API + rules tests, stops them
npm run typecheck -w @jobapp-platform/api

# Against the real project — only when that is the point.
npm run dev -w @jobapp-platform/api           # API on :4000 against log-in-d8f2c
npm run start -w @jobapp-platform/mobile      # Metro; open in Expo Go
```

The emulators need Java 21+. `scripts/firebase.mjs` finds one on its own (JAVA_HOME, then the
JDK bundled with Android Studio), so the machine's default `java` can stay at 17.

Headless check that the app still bundles:
`cd apps/mobile && npx expo export --platform android --output-dir <tmp>`

The mobile app finds the API through the host Expo served the bundle from
(`apps/mobile/api/config.js`), so no IP is hardcoded.

## Architecture (settled — don't re-litigate)

- **Reads** stay on the client via Firestore `onSnapshot` (`apps/mobile/data/liveCollection.js`,
  subscribes only after login).
- **Writes** all go through the API. No screen writes to Firestore directly any more.
- **Firestore rules** allow signed-in reads and deny every client write (Phase 3, verified).
  The API uses the Admin SDK, which bypasses rules.
- **Media** goes to Cloudinary via `POST /uploads`. Firebase Storage is dead on this project
  (Spark plan, no billing account: 402 to clients, "billing account absent" to Admin SDK).
  The owner has no credit card, so Blaze is not an option. Old image URLs are dead;
  `components/PostImage.js` falls back to a placeholder.
- Every API route takes the user id from the verified ID token, never from the body.

## Secrets (all gitignored — never commit)

- `apps/api/serviceAccountKey.json` — Firebase Admin key
- `apps/api/.env` — `PORT`, `GOOGLE_APPLICATION_CREDENTIALS`, `CLOUDINARY_*`
- `apps/mobile/database/firebaseDB.js` — Firebase web config

## Working with the live project — read before touching data

- **Develop and test against the emulators** (project `demo-jobapp`). A `demo-` project id
  cannot reach real services — Firebase fails the call instead — and `firebaseAdmin.ts` refuses
  to start with only one emulator variable set, or with a non-demo project id. `test/setup.ts`
  stops the test run outright if the emulators aren't in use, because the production key sits in
  `apps/api/` and the tests wipe the database between cases.
- The original `apps/mobile` app still talks to production; only touch it deliberately.
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

- AVD `Medium_Phone_API_36.1`; open the app with
  `adb shell am start -a android.intent.action.VIEW -d "exp://<LAN-IP>:8081"`
- **Never run `adb shell pm clear host.exp.exponent`** — it corrupts Expo Go
  ("Failed to load all assets"). If that happens, `adb uninstall host.exp.exponent` and let
  `npx expo start --android --go` reinstall the SDK 49 build.
- `expo start` may open a chooser page in Chrome; tap "Expo Go".

## Status and what's next

Phases 0–3 are done and tested in the emulator by the owner. **Phase 4 is in progress** —
the plan and its reasoning are in `MIGRATION.md`. In short: a new app in `apps/mobile-next`
on the current Expo SDK (TypeScript, Expo Router, NativeWind, TanStack Query, modular
Firebase SDK) built screen by screen, with `apps/mobile` kept runnable as the reference until
parity. Decided and not to be revisited without the owner: no in-place SDK upgrade, **no
Zustand**, no notification tab in the new app. Steps 4.0–4.5 done (emulators + tests;
scaffold; auth with route guard; read-only screens on live Firestore listeners; favourite,
rating, comment, Keep; create/edit/delete posts with upload). Next is 4.6 (own profile and
avatar). `apps/mobile-next/metro.config.js` carries several monorepo resolution fixes —
read its comments (and MIGRATION.md 4.2, 4.5) before touching it. Uploads must send an
`expo-file-system` `File`, not a `{ uri, name, type }` object (MIGRATION.md 4.5).

Deferred by request: notification preferences (`EditNoti`) save fine, but nothing ever reads
`User Noti` to send a notification. Treat it as a feature to build later, not a bug to polish.

Known pre-existing limitation in `apps/mobile`: list screens read module-scope arrays mutated
in place, so a new post may only appear after navigating away and back. `apps/mobile-next`
lists are live listeners and don't have this.

## Conventions

- Owner communicates in Thai; reply in Thai.
- Commit in small, single-purpose commits with messages that explain *why*. No attribution lines.
- Comments in code: short, sparse — only where genuinely non-obvious. Not a paragraph per line.
- Work on a feature branch and open a PR (`gh pr create`); don't push straight to `main`.
- Verify against the running app or live API before calling something done.
