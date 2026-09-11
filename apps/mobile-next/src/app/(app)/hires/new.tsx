import { Stack } from "expo-router";
import { ScreenPlaceholder } from "@/components/screen-placeholder";

// Replaces CreateHire.js. Lands in step 4.5.
export default function NewHire() {
  return (
    <>
      <Stack.Screen options={{ title: "สร้างประกาศฟรีแลนซ์" }} />
      <ScreenPlaceholder title="สร้างประกาศรับจ้าง" note="Phase 4.5" />
    </>
  );
}
