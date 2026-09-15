import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import { Alert, Linking, Text, TouchableOpacity, View } from "react-native";
import { colors } from "@/lib/colors";

type IconName = ComponentProps<typeof Ionicons>["name"];

/*
 * Building blocks for the post detail screens, in reading order:
 *   hero (title, who, badges) → FactPanel of what people decide on → Card per topic →
 *   contact → reviews. Actions sit in the ActionBar pinned below.
 */

export function DetailCard({ title, icon, children }: { title: string; icon: IconName; children: ReactNode }) {
  return (
    <View className="mx-4 mt-3 rounded-card border border-border bg-surface p-5">
      <View className="mb-3 flex-row items-center">
        <Ionicons name={icon} size={20} color={colors.secondary.DEFAULT} />
        <Text className="ml-2 text-lg font-bold text-text">{title}</Text>
      </View>
      {children}
    </View>
  );
}

export function Badges({ items }: { items: { label: string; tone?: "new" }[] }) {
  if (!items.length) return null;
  return (
    <View className="mt-3 flex-row flex-wrap">
      {items.map(({ label, tone }) => (
        <View key={label} className={`mb-1.5 mr-2 rounded-md px-2.5 py-1 ${tone === "new" ? "bg-success-soft" : "bg-secondary-soft"}`}>
          <Text className={`text-xs font-semibold ${tone === "new" ? "text-success" : "text-secondary"}`} numberOfLines={1}>
            {label}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function FactPanel({ children }: { children: ReactNode }) {
  return <View className="mt-4 gap-3 rounded-2xl bg-background p-4">{children}</View>;
}

export function Fact({ icon, label, value, strong }: { icon: IconName; label: string; value: string; strong?: boolean }) {
  return (
    <View className="flex-row items-center">
      <View className="h-9 w-9 items-center justify-center rounded-xl bg-surface">
        <Ionicons name={icon} size={18} color={colors.secondary.DEFAULT} />
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-xs text-text-subtle">{label}</Text>
        <Text className={strong ? "text-base font-bold text-primary" : "text-base text-text"}>{value}</Text>
      </View>
    </View>
  );
}

const open = (url: string) =>
  Linking.openURL(url).catch(() => Alert.alert("เปิดไม่ได้", "อุปกรณ์นี้ไม่รองรับการทำรายการนี้"));

/** Email and phone rows that open the mail or phone app. */
export function ContactRows({ email, phone }: { email?: string; phone?: string }) {
  return (
    <>
      <ContactRow icon="mail-outline" value={email} onPress={() => open(`mailto:${email}`)} />
      <ContactRow icon="call-outline" value={phone} onPress={() => open(`tel:${phone}`)} last />
    </>
  );
}

function ContactRow({ icon, value, onPress, last }: { icon: IconName; value?: string; onPress: () => void; last?: boolean }) {
  return (
    <TouchableOpacity className={`flex-row items-center py-3 ${last ? "" : "border-b border-border"}`} onPress={onPress} disabled={!value}>
      <Ionicons name={icon} size={20} color={colors.text.subtle} />
      <Text className="ml-3 flex-1 text-base text-text" numberOfLines={1}>
        {value || "ไม่ระบุ"}
      </Text>
      {value ? <Ionicons name="chevron-forward" size={18} color={colors.placeholder} /> : null}
    </TouchableOpacity>
  );
}

/** Asks whether to call or email, then opens that app. */
export function chooseContact({ phone, email, subject }: { phone?: string; email?: string; subject: string }) {
  const options = [
    ...(phone ? [{ text: `โทร ${phone}`, onPress: () => open(`tel:${phone}`) }] : []),
    ...(email ? [{ text: "ส่งอีเมล", onPress: () => open(`mailto:${email}?subject=${encodeURIComponent(subject)}`) }] : []),
  ];
  if (!options.length) return Alert.alert("ไม่มีช่องทางติดต่อ", "ผู้ประกาศยังไม่ได้ระบุช่องทางติดต่อ");
  Alert.alert("ติดต่อผู้ประกาศ", "เลือกช่องทางที่ต้องการ", [...options, { text: "ยกเลิก", style: "cancel" }]);
}
