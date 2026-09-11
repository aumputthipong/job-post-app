import { useLocalSearchParams } from "expo-router";
import { ScreenPlaceholder } from "@/components/screen-placeholder";

// Replaces EditFind.js. Lands in step 4.5.
export default function EditJob() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ScreenPlaceholder title="แก้ไขประกาศงาน" note={`id: ${id} — Phase 4.5`} />;
}
