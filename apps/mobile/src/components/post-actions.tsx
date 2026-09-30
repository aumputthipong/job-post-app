import { Ionicons } from "@expo/vector-icons";
import type { PostKind } from "@jobapp-platform/shared";
import { useEffect, useRef, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useFavoriteIds, useRatingSummary } from "@/lib/data";
import { StarPicker } from "./ui";
import { colors } from "@/lib/colors";

// Both controls show the new value straight away; the Firestore listener
// confirms it a moment later, and that clears the local override.

/**
 * Save a job to the บันทึกไว้ tab. A bookmark, like that tab's icon — stars mean ratings.
 * `button` is the labelled version for a detail screen's action bar.
 */
export function FavoriteButton({ postId, variant = "icon" }: { postId: string; variant?: "icon" | "button" }) {
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
  const icon = shown ? "bookmark" : "bookmark-outline";
  if (variant === "button") {
    return (
      <TouchableOpacity
        onPress={toggle}
        disabled={pending}
        className={`h-14 flex-1 flex-row items-center justify-center rounded-2xl border ${shown ? "border-primary bg-primary-soft" : "border-border bg-surface"}`}
        accessibilityState={{ selected: shown }}
      >
        <Ionicons name={icon} size={20} color={shown ? colors.primary.DEFAULT : colors.secondary.DEFAULT} />
        <Text className={`ml-1.5 text-base font-bold ${shown ? "text-primary-dark" : "text-secondary"}`} numberOfLines={1}>
          {shown ? "บันทึกแล้ว" : "บันทึกงาน"}
        </Text>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity onPress={toggle} disabled={pending} hitSlop={8} accessibilityLabel={shown ? "เลิกบันทึกงานนี้" : "บันทึกงานนี้"}>
      <Ionicons name={icon} size={24} color={shown ? colors.primary.DEFAULT : colors.text.subtle} />
    </TouchableOpacity>
  );
}

export function RatePost({ kind, postId, title }: { kind: PostKind; postId: string; title: string }) {
  const { user } = useAuth();
  const { ratings } = useRatingSummary(kind, postId);
  const mine = ratings.find((r) => r.userId === user?.uid)?.rating ?? 0;
  const [override, setOverride] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => setOverride(null), [mine]);
  useEffect(() => () => clearTimeout(timer.current), []);

  // Saves ~1 s after the last tap, so trying 1, 3, then 5 stars is one request
  // (and one notification) rather than three.
  const rate = (value: number) => {
    setOverride(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        await api.rate(kind, postId, value);
      } catch (error) {
        setOverride(null);
        Alert.alert("ให้คะแนนไม่สำเร็จ", (error as Error).message);
      }
    }, 1000);
  };

  return (
    <View className="mb-6 items-center rounded-2xl bg-background px-4 py-5">
      <Text className="mb-3 text-base font-bold text-text" numberOfLines={1}>
        {title}
      </Text>
      <StarPicker value={override ?? mine} onChange={rate} />
      <Text className="mt-2 text-xs text-text-subtle" numberOfLines={1}>
        {override !== null && override !== mine
          ? "กำลังบันทึก..."
          : mine
            ? `คุณให้ ${mine} ดาว · แตะเพื่อเปลี่ยน`
            : "แตะดาวเพื่อให้คะแนน"}
      </Text>
    </View>
  );
}
