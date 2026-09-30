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
    <td><img src="https://github.com/user-attachments/assets/92dc5404-06c4-49cd-a67c-2babdf320526" width="180" alt="Home Screen" /></td>
    <td><img src="https://github.com/user-attachments/assets/6cc1fa23-bd12-434c-9234-1b8bea1493dd" width="180" alt="Job Post" /></td>
    <td><img src="https://github.com/user-attachments/assets/356d4a28-eb79-4d33-adf1-d914cf3a0810" width="180" alt="Job Comment" /></td>
    <td><img src="https://github.com/user-attachments/assets/3e9c3ecc-42c4-4ae9-ac89-02d7662329e1" width="180" alt="Job_create" /></td>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/d2bb1e84-fc70-428d-8f82-760d7a7c062d" width="180" alt="Job Search" /></td>
    <td><img src="https://github.com/user-attachments/assets/34009cf6-60f4-42fb-9153-e6a8fadff2e4" width="180" alt="Freelance_search" /></td>
    <td><img src="https://github.com/user-attachments/assets/c25cbe8c-4562-40b0-a7d5-2d0ba24ef10a" width="180" alt="Freelance_detail" /></td>
    <td><img src="https://github.com/user-attachments/assets/18a0fecf-cf6d-400b-8cb9-23af3f075954" width="180" alt="User_Profile" /></td>
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
