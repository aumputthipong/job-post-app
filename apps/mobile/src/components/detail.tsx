import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import { Alert, Linking, Text, TouchableOpacity, View } from "react-native";
import { colors } from "@/lib/colors";

type IconName = ComponentProps<typeof Ionicons>["name"];

/*
 * Building blocks for the post detail screens, in reading order, laid out like a job board's
 * job page: DetailHero (what and who, on navy) → FactTable of what people decide on →
 * a Section per topic → contact → reviews. Actions sit in the ActionBar pinned below.
 */

export function DetailHero({
  mark,
  title,
  subtitle,
  children,
}: {
  mark: ReactNode;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <View className="bg-secondary px-5 pb-6 pt-3">
      <View className="flex-row items-start">
        {mark}
        <View className="ml-4 flex-1">
          <Text className="text-[22px] font-bold leading-8 text-surface">{title}</Text>
          {subtitle ? <Text className="mt-0.5 text-base text-surface/80">{subtitle}</Text> : null}
        </View>
      </View>
      {children}
    </View>
  );
}

/** A full-width white section; the navy bar marks where each topic starts. */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="mt-2 bg-surface px-5 py-5">
      <View className="mb-4 flex-row items-center">
        <View className="h-5 w-1 rounded-full bg-secondary" />
        <Text className="ml-2.5 text-lg font-bold text-secondary">{title}</Text>
      </View>
      {children}
    </View>
  );
}

export function Badges({ items }: { items: { label: string; tone?: "new" }[] }) {
  if (!items.length) return null;
  return (
    <View className="flex-row flex-wrap px-5 pt-4">
      {items.map(({ label, tone }) => (
        <View key={label} className={`mb-1.5 mr-2 rounded-md px-2.5 py-1 ${tone === "new" ? "bg-fresh-soft" : "bg-secondary-soft"}`}>
          <Text className={`text-xs font-semibold ${tone === "new" ? "text-fresh" : "text-secondary"}`} numberOfLines={1}>
            {label}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** The facts people decide on, as label / value rows. */
export function FactTable({ children }: { children: ReactNode }) {
  return <View className="px-5 pb-2 pt-1">{children}</View>;
}

export function Fact({ icon, label, value, strong }: { icon: IconName; label: string; value: string; strong?: boolean }) {
  return (
    <View className="flex-row items-start border-b border-border py-3">
      <Ionicons name={icon} size={18} color={strong ? colors.primary.DEFAULT : colors.text.subtle} style={{ marginTop: 2 }} />
      <Text className="ml-2.5 w-[100px] text-[15px] leading-6 text-text-subtle">{label}</Text>
      <Text className={`flex-1 text-[15px] leading-6 ${strong ? "font-bold text-primary-dark" : "text-text"}`}>{value}</Text>
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
