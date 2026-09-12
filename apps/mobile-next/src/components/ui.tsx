import { Ionicons } from "@expo/vector-icons";
import { Link, type Href } from "expo-router";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Read-only 0–5 star rating, with half stars. */
export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <View className="flex-row">
      {[1, 2, 3, 4, 5].map((n) => (
        <Ionicons
          key={n}
          name={value >= n ? "star" : value >= n - 0.5 ? "star-half" : "star-outline"}
          size={size}
          color="#FF9800"
        />
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
      <Ionicons name="search" size={20} color="#666666" />
      <TextInput
        className="ml-2 flex-1 text-base text-text"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value ? (
        <TouchableOpacity onPress={() => onChangeText("")}>
          <Ionicons name="close-circle" size={20} color="#94A3B8" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function Fab({ href }: { href: Href }) {
  const insets = useSafeAreaInsets();
  return (
    <Link href={href} asChild>
      <TouchableOpacity
        className="absolute right-6 h-[60px] w-[60px] items-center justify-center rounded-full bg-primary"
        style={{ bottom: insets.bottom + 24, elevation: 6 }}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </Link>
  );
}

export function Loading() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator color="#083C6B" />
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
      <Ionicons name={icon} size={60} color="#CBD5E1" />
      <Text className="mt-4 text-center text-base text-text-subtle">{message}</Text>
    </View>
  );
}

export function ErrorState({ error }: { error: Error }) {
  return (
    <View className="flex-1 items-center justify-center bg-background px-8">
      <Ionicons name="cloud-offline-outline" size={56} color="#CBD5E1" />
      <Text className="mt-4 text-center text-base text-text-subtle">โหลดข้อมูลไม่สำเร็จ</Text>
      <Text className="mt-1 text-center text-xs text-text-subtle">{error.message}</Text>
    </View>
  );
}

/** Title + content block used on the detail and profile screens. */
export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-6">
      <Text className="mb-3 text-lg font-bold text-primary">{title}</Text>
      {children}
    </View>
  );
}

export function InfoRow({
  icon,
  children,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  children: React.ReactNode;
}) {
  return (
    <View className="mb-2 flex-row items-center">
      <Ionicons name={icon} size={20} color="#083C6B" />
      <Text className="ml-3 flex-1 text-base text-text">{children}</Text>
    </View>
  );
}

export function Bullets({ items, empty = "ไม่ระบุ" }: { items?: string[]; empty?: string }) {
  if (!items?.length) return <Text className="text-text-subtle">{empty}</Text>;
  return (
    <View>
      {items.map((item, i) => (
        <View key={i} className="mb-2 flex-row items-start">
          <View className="mr-3 mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
          <Text className="flex-1 text-base text-text">{item}</Text>
        </View>
      ))}
    </View>
  );
}
