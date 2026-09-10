import Constants from "expo-constants";

const API_PORT = 4000;

/**
 * Where the backend lives.
 *
 * "localhost" is useless from the app's point of view — on the Android
 * emulator it means the emulator itself, not the development machine. Rather
 * than hardcode an address that breaks the moment the network changes, this
 * reuses the host Expo already served the bundle from: that is by definition
 * the development machine, and it is reachable the same way from the emulator
 * and from a real phone on the same network.
 */
export function getApiBaseUrl() {
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.manifest?.hostUri;

  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:${API_PORT}`;
  }

  // Only reached in a standalone build, which this project doesn't produce yet.
  return `http://localhost:${API_PORT}`;
}
