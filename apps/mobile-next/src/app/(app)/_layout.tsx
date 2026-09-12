import { Stack } from "expo-router";

// One stack for everything behind sign-in, so a screen pushed from a tab
// gets a back button to it.
export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: "#083C6B",
        headerTitleStyle: { fontWeight: "bold" },
        headerStyle: { backgroundColor: "#F5F7FA" },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
