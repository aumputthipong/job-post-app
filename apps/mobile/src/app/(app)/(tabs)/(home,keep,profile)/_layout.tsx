import { Stack } from "expo-router";
import { STACK_OPTIONS } from "@/lib/navigation";

// Each tab has its own stack, so a post opened from Keep goes back to Keep
// with the tab bar still there. The folder name lists the tabs sharing these
// screens; `segment` says which tab this copy belongs to. Forms live here too
// (the tab bar hides for them): outside the tabs, navigating on from a form
// can't tell which tab to land in and picks the first.
//
// Titles live here rather than in each screen, so loading, error and
// not-found states get the right title too instead of the route path.
const ROOTS: Record<string, string> = {
  "(home)": "index",
  "(keep)": "keep",
  "(profile)": "profile",
};

const TITLES: Record<string, string> = {
  "jobs/index": "ประกาศหางาน",
  "jobs/[id]/index": "รายละเอียดงาน",
  "hires/index": "Find Freelance",
  "hires/[id]/index": "รายละเอียดฟรีแลนซ์",
  "users/[id]": "โปรไฟล์",
  "my-posts": "โพสต์ของฉัน",
  notifications: "การแจ้งเตือน",
  "notification-settings": "ตั้งค่าการแจ้งเตือน",
  "jobs/new": "สร้างประกาศงาน",
  "jobs/[id]/edit": "แก้ไขประกาศงาน",
  "hires/new": "สร้างประกาศฟรีแลนซ์",
  "hires/[id]/edit": "แก้ไขประกาศฟรีแลนซ์",
  "edit-profile": "แก้ไขโปรไฟล์",
};

export default function TabStackLayout({ segment }: { segment: string }) {
  const root = ROOTS[segment] ?? "index";
  return (
    <Stack initialRouteName={root} screenOptions={STACK_OPTIONS}>
      <Stack.Screen name={root} options={{ headerShown: false }} />
      {Object.entries(TITLES).map(([name, title]) => (
        <Stack.Screen key={name} name={name} options={{ title }} />
      ))}
    </Stack>
  );
}
