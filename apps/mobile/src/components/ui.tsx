import { Ionicons } from "@expo/vector-icons";
import { Link, type Href } from "expo-router";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFollowTabBar, useTabBarHeight } from "./tab-bar";
import { colors } from "@/lib/colors";

/** Read-only 0–5 star rating, with half stars. */
export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <View className="flex-row">
      {[1, 2, 3, 4, 5].map((n) => (
        <Ionicons
          key={n}
          name={value >= n ? "star" : value >= n - 0.5 ? "star-half" : "star-outline"}
          size={size}
          color={colors.accent}
        />
      ))}
    </View>
  );
}

export function StarPicker({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <View className="flex-row">
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity key={n} className="px-1" disabled={disabled} onPress={() => onChange(n)} hitSlop={4}>
          <Ionicons name={value >= n ? "star" : "star-outline"} size={34} color={colors.accent} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function SearchBar({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}) {
  return (
    <View className="mx-4 my-3 h-[50px] flex-row items-center rounded-xl border border-border bg-surface px-4">
      <Ionicons name="search" size={20} color={colors.text.muted} />
      <TextInput
        className="ml-2 flex-1 text-base text-text"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value ? (
        <TouchableOpacity onPress={() => onChangeText("")}>
          <Ionicons name="close-circle" size={20} color={colors.placeholder} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function Fab({
  href,
  icon = "add",
  label,
}: {
  href: Href;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
}) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useTabBarHeight();
  const follow = useFollowTabBar();
  return (
    <Animated.View style={[{ position: "absolute", right: 24, bottom: (tabBarHeight || insets.bottom) + 24 }, follow]}>
      <Link href={href} asChild>
        <TouchableOpacity
          className="h-[60px] w-[60px] items-center justify-center rounded-full bg-primary"
          style={{ elevation: 6 }}
          accessibilityLabel={label}
        >
          <Ionicons name={icon} size={icon === "add" ? 32 : 26} color={colors.onPrimary} />
        </TouchableOpacity>
      </Link>
    </Animated.View>
  );
}

/** Actions pinned under a screen that hides the tab bar (post details). */
export function ActionBar({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-row border-t border-border bg-surface px-4 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
      {children}
    </View>
  );
}

export function Loading() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator color={colors.primary.DEFAULT} />
    </View>
  );
}

export function EmptyState({
  icon,
  message,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  message: string;
}) {
  return (
    <View className="mt-16 items-center px-8">
      <Ionicons name={icon} size={60} color={colors.border.strong} />
      <Text className="mt-4 text-center text-base text-text-subtle">{message}</Text>
    </View>
  );
}

export function ErrorState({ error }: { error: Error }) {
  return (
    <View className="flex-1 items-center justify-center bg-background px-8">
      <Ionicons name="cloud-offline-outline" size={56} color={colors.border.strong} />
      <Text className="mt-4 text-center text-base text-text-subtle">โหลดข้อมูลไม่สำเร็จ</Text>
      <Text className="mt-1 text-center text-xs text-text-subtle">{error.message}</Text>
    </View>
  );
}

export function Bullets({ items, empty = "ไม่ระบุ" }: { items?: string[]; empty?: string }) {
  if (!items?.length) return <Text className="text-text-subtle">{empty}</Text>;
  return (
    <View>
      {items.map((item, i) => (
        <View key={i} className="mb-2 flex-row items-start">
          <View className="mr-3 mt-2 h-1.5 w-1.5 rounded-full bg-secondary" />
          <Text className="flex-1 text-base text-text">{item}</Text>
        </View>
      ))}
    </View>
  );
}
