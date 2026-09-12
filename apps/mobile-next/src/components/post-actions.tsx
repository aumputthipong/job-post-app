import { Ionicons } from "@expo/vector-icons";
import type { PostKind } from "@jobapp-platform/shared";
import { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useFavoriteIds, useRatingSummary } from "@/lib/data";
import { StarPicker } from "./ui";

// Both controls show the new value straight away; the Firestore listener
// confirms it a moment later, and that clears the local override.

export function FavoriteButton({ postId }: { postId: string }) {
  const { user } = useAuth();
  const saved = useFavoriteIds(user?.uid).ids.has(postId);
  const [override, setOverride] = useState<boolean | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => setOverride(null), [saved]);

  const toggle = async () => {
    setPending(true);
    setOverride(!saved);
    try {
      await api.toggleFavorite("find", postId);
    } catch (error) {
      setOverride(null);
      Alert.alert("บันทึกไม่สำเร็จ", (error as Error).message);
    } finally {
      setPending(false);
    }
  };

  const shown = override ?? saved;
  return (
    <TouchableOpacity onPress={toggle} disabled={pending} hitSlop={8} accessibilityLabel="บันทึกงานนี้">
      <Ionicons name={shown ? "star" : "star-outline"} size={24} color={shown ? "#FF9800" : "#083C6B"} />
    </TouchableOpacity>
  );
}

export function RatePost({ kind, postId, title }: { kind: PostKind; postId: string; title: string }) {
  const { user } = useAuth();
  const { ratings } = useRatingSummary(kind, postId);
  const mine = ratings.find((r) => r.userId === user?.uid)?.rating ?? 0;
  const [override, setOverride] = useState<number | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => setOverride(null), [mine]);

  const rate = async (value: number) => {
    setPending(true);
    setOverride(value);
    try {
      await api.rate(kind, postId, value);
    } catch (error) {
      setOverride(null);
      Alert.alert("ให้คะแนนไม่สำเร็จ", (error as Error).message);
    } finally {
      setPending(false);
    }
  };

  return (
    <View className="mb-6 items-center rounded-2xl bg-background px-4 py-5">
      <Text className="mb-3 text-base font-bold text-text" numberOfLines={1}>
        {title}
      </Text>
      <StarPicker value={override ?? mine} onChange={rate} disabled={pending} />
      <Text className="mt-2 text-xs text-text-subtle" numberOfLines={1}>
        {mine ? `คุณให้ ${mine} ดาว · แตะเพื่อเปลี่ยน` : "แตะดาวเพื่อให้คะแนน"}
      </Text>
    </View>
  );
}
