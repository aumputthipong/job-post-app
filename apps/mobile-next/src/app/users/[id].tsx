import { useLocalSearchParams } from "expo-router";
import { ScreenPlaceholder } from "@/components/screen-placeholder";

// Replaces OtherProfileScreen.js. Lands in step 4.3.
export default function UserProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ScreenPlaceholder title="โปรไฟล์ผู้ใช้" note={`id: ${id} — Phase 4.3`} />;
}
