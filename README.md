# jobapp-platform

Backend + modernized frontend for the original [job-app-project](https://github.com/aumputthipong/job-app-project)
(archived) — same Firebase project, same Firestore data, new architecture.

## Structure
```
apps/
  mobile/    Expo app — current SDK, TypeScript, Expo Router, NativeWind, TanStack Query
  api/       Fastify + TypeScript backend, talks to Firestore via firebase-admin
packages/
  shared/    Zod schemas + Firestore collection name constants, used by both apps
```
##  Screenshots

<table>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/5d58cb69-f6f2-40be-86ba-2e329fb89659" width="180" alt="Home Screen" /></td>
    <td><img src="https://github.com/user-attachments/assets/3eff77d5-0305-4b73-921f-9ee9f0acf494" width="180" alt="Job Details" /></td>
    <td><img src="https://github.com/user-attachments/assets/541ae2f5-36f9-4199-ab76-ac136ae56d72" width="180" alt="Application Form" /></td>
    <td><img src="https://github.com/user-attachments/assets/d410928f-4e39-46ac-a9cf-e0735ec9a08b" width="180" alt="Hiring List" /></td>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/ce5f7eff-c2ed-4af8-988e-be56205dbe7a" width="180" alt="Candidate Details" /></td>
    <td><img src="https://github.com/user-attachments/assets/cfa854c6-5bd0-4afa-a124-13e30546ab8b" width="180" alt="User Profile" /></td>
    <td><img src="https://github.com/user-attachments/assets/c8fd56cb-c386-4ba2-8d1a-022cd94304f6" width="180" alt="About App" /></td>
    <td><img src="https://github.com/user-attachments/assets/27b2bde1-2a93-4256-98b8-74ee33940795" width="180" alt="Settings" /></td>
  </tr>
</table>

## Status

- [x] Phase 0 — repo restructured into a monorepo, dead dependencies removed
- [x] Phase 1 — backend running locally against the live Firebase project
- [x] Phase 2 — every write goes through the API; no client writes to Firestore remain
- [x] Phase 3 — Firestore rules deny all client writes (verified against the live project)
- [x] Phase 4 — frontend rebuilt: the Expo SDK 49 app is gone and `apps/mobile` is the new one
      (auth, both boards, posting with image upload, favourites, ratings, comments, profile)

**Deployment is out of scope for now** — the API is meant to run locally during development only.

## Setup

```bash
npm install
```

### Backend (`apps/api`)

1. Get a service account key: Firebase Console → Project Settings → Service Accounts → Generate new private key
2. Save it as `apps/api/serviceAccountKey.json` (gitignored — never commit this file)
3. `cp apps/api/.env.example apps/api/.env`
4. Add Cloudinary credentials to `.env` (free account, no card required —
   media storage, since Firebase Storage is unusable on this project; see MIGRATION.md)
5. `npm run dev -w @jobapp-platform/api`

### Local development and tests (no production access needed)

Needs Java 21+ for the Firestore emulator — found automatically if Android Studio is installed.

```bash
npm run emulators       # Firebase Auth + Firestore emulators, UI at http://127.0.0.1:4001
npm run seed            # sample users, posts, comments; password for all: password123
npm run api:emulators   # API on :4000 against the emulators
npm run mobile          # Metro for apps/mobile — press `a` to open it on Android
npm test                # API + security-rules tests, emulators started and stopped for you
```

### Mobile (`apps/mobile`)

Nothing to configure for local development: without `.env.local` the app talks to the
emulators and finds the API on the machine that served the bundle.

To point it at the real Firebase project instead, copy `apps/mobile/.env.example` to
`.env.local` (gitignored) and fill in the web config, with the API running in production
mode (`npm run dev -w @jobapp-platform/api`).

See [MIGRATION.md](./MIGRATION.md) for the full plan and known issues carried over from the legacy app.
