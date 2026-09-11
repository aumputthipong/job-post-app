import { Stack } from "expo-router";
import { ScreenPlaceholder } from "@/components/screen-placeholder";

// Replaces CreateFind.js. Lands in step 4.5.
export default function NewJob() {
  return (
    <>
      <Stack.Screen options={{ title: "สร้างประกาศงาน" }} />
      <ScreenPlaceholder title="สร้างประกาศงาน" note="Phase 4.5" />
    </>
  );
}
