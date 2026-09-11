import { useLocalSearchParams } from "expo-router";
import { ScreenPlaceholder } from "@/components/screen-placeholder";

// Replaces FindJobDetailScreen.js. Lands in step 4.3 (view) / 4.4 (favourite,
// rating, comments).
export default function JobDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ScreenPlaceholder title="รายละเอียดงาน" note={`id: ${id} — Phase 4.3 / 4.4`} />;
}
