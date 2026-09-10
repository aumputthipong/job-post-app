import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { cert, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

/**
 * Connects to the SAME Firebase project the mobile app already uses
 * (see apps/mobile/database/firebaseDB.js for the matching client config).
 * The Admin SDK authenticates via a service account, not the web API key,
 * and bypasses Firestore/Storage security rules by design — that's what
 * lets the API be the only writer once rules are locked down (Phase 3).
 */
function loadApp(): App {
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
