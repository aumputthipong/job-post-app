/**
 * Runs before any test file is imported.
 *
 * apps/api/serviceAccountKey.json sits right next to these tests, and the Admin
 * SDK falls back to it whenever the emulator variables are missing. The tests
 * wipe every document between cases — so running them against production would
 * delete the real data. Stop here unless the emulators are unambiguously in use.
 */
const firestore = process.env.FIRESTORE_EMULATOR_HOST;
const auth = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const project = process.env.GCLOUD_PROJECT ?? "demo-jobapp";

if (!firestore || !auth || !project.startsWith("demo-")) {
  throw new Error(
    "Tests must run against the Firebase emulators, never the real project.\n" +
      "Run `npm test` from the repo root, which starts the emulators for you.",
  );
}
