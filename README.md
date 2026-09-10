# jobapp-platform

Backend + modernized frontend for the original [job-app-project](https://github.com/aumputthipong/job-app-project)
(archived) — same Firebase project, same Firestore data, new architecture.

## Structure

```
apps/
  mobile/    Expo app (legacy source, being modernized incrementally)
  api/       Fastify + TypeScript backend, talks to Firestore via firebase-admin
packages/
  shared/    Zod schemas + Firestore collection name constants, used by both apps
```

## Status

- [x] Phase 0 — repo restructured into a monorepo, dead dependencies removed
- [x] Phase 1 — backend running locally against the live Firebase project
- [~] Phase 2 — every write has an endpoint; mobile screens not yet switched over to them
- [ ] Phase 3 — Firestore rules locked to read-only for clients
- [ ] Phase 4 — frontend modernization (TypeScript, modular Firebase SDK, TanStack Query, Expo Router, NativeWind)

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

### Mobile (`apps/mobile`)

1. Copy `apps/mobile/database/firebaseDB.example.js` to `apps/mobile/database/firebaseDB.js` and fill in the same
   Firebase web config the legacy app used (gitignored — never commit this file)
2. `npm run start -w @jobapp-platform/mobile`

See [MIGRATION.md](./MIGRATION.md) for the full plan and known issues carried over from the legacy app.
