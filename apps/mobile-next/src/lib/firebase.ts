import Constants from "expo-constants";
import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

// Points at the local emulators by default (see CLAUDE.md) — never at the
// production project apps/mobile uses. Set EXPO_PUBLIC_USE_PRODUCTION_FIREBASE=1
// to opt in deliberately.
//
// Auth isn't wired up here yet — initializeAuth()/getAuth() throw "Component
// auth has not been registered yet" under Metro on this setup (confirmed: the
// same call works fine in a plain Node script against the same firebase
// package and emulator, so it's Metro/Hermes-specific, not a version or
// monorepo-duplication issue). Left for step 4.2 to solve properly.
const useProduction = process.env.EXPO_PUBLIC_USE_PRODUCTION_FIREBASE === "1";

const emulatorConfig = {
  apiKey: "demo-jobapp",
  projectId: "demo-jobapp",
  appId: "demo-jobapp",
};

const productionConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// "localhost" means the device itself, not the dev machine — derive the
// emulator host from the address Expo served the bundle from instead.
function getDevHost(): string {
  const hostUri = Constants.expoConfig?.hostUri ?? (Constants as any).manifest?.hostUri;
  return hostUri ? hostUri.split(":")[0]! : "localhost";
}

function createApp(): FirebaseApp {
  if (getApps().length > 0) return getApps()[0]!;
  return initializeApp(useProduction ? productionConfig : emulatorConfig);
}

export const firebaseApp = createApp();
export const db = getFirestore(firebaseApp);

if (!useProduction) {
  connectFirestoreEmulator(db, getDevHost(), 8080);
}
