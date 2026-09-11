import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { cert, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const firestoreEmulator = process.env.FIRESTORE_EMULATOR_HOST;
const authEmulator = process.env.FIREBASE_AUTH_EMULATOR_HOST;

/** True when talking to the local Firebase Emulator Suite instead of the real project. */
export const usingEmulators = Boolean(firestoreEmulator || authEmulator);

/**
 * Two modes:
 *
 * - **Emulators** (FIRESTORE_EMULATOR_HOST / FIREBASE_AUTH_EMULATOR_HOST set,
 *   as `firebase emulators:exec` does). No credentials are loaded at all, and the
 *   project id must be a `demo-*` one — Firebase refuses to route a demo project
 *   to real services, so a mistake here fails instead of touching production.
 *
 * - **Production** (the default): the SAME Firebase project the mobile app uses,
 *   authenticated with a service account. The Admin SDK bypasses security rules
 *   by design, which is what lets the API be the only writer (Phase 3).
 */
function loadApp(): App {
  if (usingEmulators) {
    // Setting only one of these would emulate half the backend and send the
    // other half — auth or data — to the real project.
    if (!firestoreEmulator || !authEmulator) {
      throw new Error(
        "Set both FIRESTORE_EMULATOR_HOST and FIREBASE_AUTH_EMULATOR_HOST, or neither. " +
          "With only one, the other service would talk to the real project.",
      );
    }

    const projectId = process.env.GCLOUD_PROJECT ?? "demo-jobapp";
    if (!projectId.startsWith("demo-")) {
      throw new Error(
        `Refusing to run against emulators with project "${projectId}". ` +
          `Use a "demo-" project id so nothing can reach production.`,
      );
    }

    return initializeApp({ projectId });
  }

  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS ?? "./serviceAccountKey.json";

  if (!existsSync(keyPath)) {
    throw new Error(
      `Firebase service account key not found at "${keyPath}". ` +
        `Copy .env.example to .env, download a key from Firebase Console > ` +
        `Project Settings > Service Accounts, and point GOOGLE_APPLICATION_CREDENTIALS at it.`,
    );
  }

  // require() (via createRequire) keeps the JSON out of the TS build graph
  // and works whether the path is relative or absolute.
  const require = createRequire(import.meta.url);
  const serviceAccount = require(keyPath.startsWith(".") ? `${process.cwd()}/${keyPath}` : keyPath);

  return initializeApp({
    credential: cert(serviceAccount),
  });
}

export const firebaseApp = loadApp();
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
