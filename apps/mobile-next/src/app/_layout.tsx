import { Stack } from "expo-router";
import { Providers } from "./providers";

import "../global.css";

// No auth check yet — index.tsx redirects to /welcome unconditionally.
// 4.2 replaces that with a real Firebase-auth-state redirect.
export default function RootLayout() {
  return (
    <Providers>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="jobs" />
        <Stack.Screen name="hires" />
        <Stack.Screen name="users" />
      </Stack>
    </Providers>
  );
}
