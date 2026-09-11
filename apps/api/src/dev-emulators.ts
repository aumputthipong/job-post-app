/**
 * Starts the API against the local Firebase emulators instead of production.
 *
 * The emulator variables have to be in place before firebaseAdmin.ts is
 * evaluated — ES imports are hoisted, so setting them in index.ts would be too
 * late. Setting them here and then loading the server dynamically guarantees
 * the order. Values already in the environment win, so this can still point at
 * emulators on other ports.
 *
 * Start the emulators first: `npm run emulators` from the repo root.
 */
process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";
process.env.GCLOUD_PROJECT ??= "demo-jobapp";

await import("./index.js");
