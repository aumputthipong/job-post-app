import { Stack } from "expo-router";

// Titles live here rather than in each screen, so loading, error and
// not-found states get the right title too instead of the route path.
const TITLES: Record<string, string> = {
  "jobs/index": "ประกาศหางาน",
  "jobs/new": "สร้างประกาศงาน",
  "jobs/[id]/index": "รายละเอียดงาน",
  "jobs/[id]/edit": "แก้ไขประกาศงาน",
  "hires/index": "Find Freelance",
  "hires/new": "สร้างประกาศฟรีแลนซ์",
  "hires/[id]/index": "รายละเอียดฟรีแลนซ์",
  "hires/[id]/edit": "แก้ไขประกาศฟรีแลนซ์",
  "users/[id]": "โปรไฟล์",
};

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
        contentStyle: { backgroundColor: "#F5F7FA" },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {Object.entries(TITLES).map(([name, title]) => (
        <Stack.Screen key={name} name={name} options={{ title }} />
      ))}
    </Stack>
  );
}
