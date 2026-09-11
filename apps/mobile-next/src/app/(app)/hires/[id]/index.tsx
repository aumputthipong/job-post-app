import { useLocalSearchParams } from "expo-router";
import { ScreenPlaceholder } from "@/components/screen-placeholder";

// Replaces HireJobDetailScreen.js. Lands in step 4.3 / 4.4.
export default function HireDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ScreenPlaceholder title="รายละเอียดงานรับจ้าง" note={`id: ${id} — Phase 4.3 / 4.4`} />;
}
