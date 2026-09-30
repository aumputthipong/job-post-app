import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SubmitButton } from "@/components/form";
import { ErrorState, Loading } from "@/components/ui";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useNotiPreference } from "@/lib/data";
import { CATEGORIES } from "@/lib/post-options";
import { colors } from "@/lib/colors";

export default function NotificationSettings() {
  const { user } = useAuth();
  const { categories, loading, error } = useNotiPreference(user?.uid);
  const [selected, setSelected] = useState<string[] | null>(null);
  const [saving, setSaving] = useState(false);

  // Start from what's saved, once it has loaded.
  useEffect(() => {
    if (!loading && selected === null) setSelected(categories);
  }, [loading, categories, selected]);

  if (error) return <ErrorState error={error} />;
  if (loading || selected === null) return <Loading />;

  const toggle = (category: string) =>
    setSelected((s) => (s!.includes(category) ? s!.filter((c) => c !== category) : [...s!, category]));

  const save = async () => {
    setSaving(true);
    try {
      await api.updateNotiPreferences(selected);
      router.back();
    } catch (e) {
      Alert.alert("บันทึกไม่สำเร็จ", (e as Error).message);
      setSaving(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View className="mb-4 rounded-card bg-surface p-5" style={{ elevation: 2 }}>
        <Text className="mb-1 text-lg font-bold text-text">หมวดงานที่ติดตาม</Text>
        <Text className="mb-4 text-sm text-text-subtle">
          เมื่อมีประกาศใหม่ในหมวดที่เลือก จะแจ้งเตือนในแอป · เลือกได้หลายหมวด
        </Text>
        <View className="flex-row flex-wrap">
          {CATEGORIES.map((category) => {
            const on = selected.includes(category);
            return (
              <TouchableOpacity
                key={category}
                onPress={() => toggle(category)}
                className={`mb-2 mr-2 flex-row items-center rounded-full border px-4 py-2 ${
                  on ? "border-primary bg-primary-soft" : "border-border bg-surface"
                }`}
                accessibilityState={{ checked: on }}
              >
                {on ? <Ionicons name="checkmark" size={16} color={colors.primary.DEFAULT} style={{ marginRight: 4 }} /> : null}
                <Text className={on ? "font-semibold text-primary-dark" : "text-text"} numberOfLines={1}>
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <Text className="mb-4 text-center text-sm text-text-subtle">
        คอมเมนต์และคะแนนบนโพสต์ของคุณ แจ้งเตือนเสมอ
      </Text>
      <SubmitButton title="บันทึก" onPress={save} loading={saving} />
    </ScrollView>
  );
}
