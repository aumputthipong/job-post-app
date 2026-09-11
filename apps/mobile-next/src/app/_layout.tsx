import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Providers } from "@/components/providers";

import "../global.css";

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { user, ready } = useAuth();

  // Keep the splash up until Firebase has restored any saved session.
  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  const signedIn = user !== null;
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="jobs" />
        <Stack.Screen name="hires" />
        <Stack.Screen name="users" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <Providers>
      <RootNavigator />
    </Providers>
  );
}
