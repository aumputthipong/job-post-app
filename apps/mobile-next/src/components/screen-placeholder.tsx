import { Text, View } from "react-native";

// Stand-in for a route not built yet — see the Phase 4 step list in MIGRATION.md.
export function ScreenPlaceholder({ title, note }: { title: string; note?: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <Text className="text-lg font-semibold text-primary">{title}</Text>
      {note ? <Text className="mt-2 text-center text-text-subtle">{note}</Text> : null}
    </View>
  );
}
