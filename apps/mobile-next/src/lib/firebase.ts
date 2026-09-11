import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import {
  connectAuthEmulator,
  // @ts-expect-error exported by the RN build; firebase's shared .d.ts omits it
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

// Emulators by default (see CLAUDE.md) — never the production project that
// apps/mobile uses. Set EXPO_PUBLIC_USE_PRODUCTION_FIREBASE=1 to opt in.
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

// "localhost" is the device itself — use the host Expo served the bundle from.
export function getDevHost(): string {
  const hostUri = Constants.expoConfig?.hostUri ?? (Constants as any).manifest?.hostUri;
  return hostUri ? hostUri.split(":")[0]! : "localhost";
}

function createApp(): FirebaseApp {
  if (getApps().length > 0) return getApps()[0]!;
  return initializeApp(useProduction ? productionConfig : emulatorConfig);
}

export const firebaseApp = createApp();

// Persisted in AsyncStorage so a signed-in user stays signed in across restarts.
export const auth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(firebaseApp);

if (!useProduction) {
  const host = getDevHost();
  connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
  connectFirestoreEmulator(db, host, 8080);
}
