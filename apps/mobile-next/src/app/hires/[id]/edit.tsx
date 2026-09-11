import { useLocalSearchParams } from "expo-router";
import { ScreenPlaceholder } from "@/components/screen-placeholder";

// Replaces EditHire.js. Lands in step 4.5.
export default function EditHire() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ScreenPlaceholder title="แก้ไขประกาศรับจ้าง" note={`id: ${id} — Phase 4.5`} />;
}
