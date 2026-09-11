import { useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/media";
import { EmptyState, ErrorState, InfoRow, Loading, Section } from "@/components/ui";
import { fullName, useUser } from "@/lib/data";

const orDash = (value?: string) => value?.trim() || "-";

export default function UserProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: user, loading, error } = useUser(id);
  const insets = useSafeAreaInsets();

  if (error) return <ErrorState error={error} />;
  if (loading) return <Loading />;
  if (!user) return <EmptyState icon="person-outline" message="ไม่พบผู้ใช้นี้" />;

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingBottom: insets.bottom }}>
      <View className="m-4 items-center rounded-card bg-surface p-6" style={{ elevation: 3 }}>
        <Avatar uri={user.imageUrl} name={fullName(user)} size="lg" />
        <Text className="mt-3 text-2xl font-bold text-primary">{fullName(user)}</Text>
        <Text className="mt-1 text-base text-text-subtle">{user.job || "ไม่ระบุตำแหน่ง"}</Text>
      </View>

      <View className="mx-4 mb-8 rounded-card bg-surface p-5">
        <Section title="เกี่ยวกับฉัน">
          <Text className="text-base leading-6 text-text">{orDash(user.aboutme)}</Text>
        </Section>

        <Section title="ช่องทางติดต่อ">
          <InfoRow icon="mail-outline">{orDash(user.email)}</InfoRow>
          <InfoRow icon="call-outline">{orDash(user.phone)}</InfoRow>
          <InfoRow icon="chatbubble-ellipses-outline">Line: {orDash(user.line)}</InfoRow>
          <InfoRow icon="logo-facebook">{orDash(user.facebook)}</InfoRow>
        </Section>

        {/* The legacy screen showed the email address under ปริญญาตรี. */}
        <Section title="การศึกษา">
          <InfoRow icon="school-outline">ปริญญาตรี: {orDash(user.bachelor)}</InfoRow>
          <InfoRow icon="school-outline">ปริญญาโท: {orDash(user.master)}</InfoRow>
          <InfoRow icon="school-outline">ปริญญาเอก: {orDash(user.doctoral)}</InfoRow>
        </Section>
      </View>
    </ScrollView>
  );
}
