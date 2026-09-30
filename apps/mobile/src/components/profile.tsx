import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import { Text, View } from "react-native";
import { colors } from "@/lib/colors";
import { fullName, type UserDoc } from "@/lib/data";
import { DetailCard } from "./detail";
import { Avatar } from "./media";
import { ResumeButton, ResumeEditor } from "./resume";

type IconName = ComponentProps<typeof Ionicons>["name"];

/** Avatar, name and job. `avatarAction` sits on the avatar, `children` below the job. */
export function ProfileCard({
  user,
  avatarAction,
  children,
}: {
  user: UserDoc;
  avatarAction?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <View className="mx-4 mt-2 items-center rounded-card border border-border bg-surface p-6">
      <View>
        <Avatar uri={user.imageUrl} name={fullName(user)} size="lg" />
        {avatarAction}
      </View>
      <Text className="mt-3 text-2xl font-bold text-text">{fullName(user)}</Text>
      <Text className="mt-1 text-base text-text-muted">{user.job || "ไม่ระบุตำแหน่ง"}</Text>
      {user.companyName ? (
        <View className="mt-2 flex-row items-center rounded-full bg-primary-tint px-3 py-1">
          <Ionicons name="business-outline" size={14} color={colors.primary.dark} />
          <Text className="ml-1.5 text-sm font-semibold text-primary-dark" numberOfLines={1}>
            {user.companyName}
          </Text>
        </View>
      ) : null}
      {children}
    </View>
  );
}

/** Label above value, so a missing value reads as "not given" rather than a bare dash. */
function Row({ icon, label, value, last }: { icon: IconName; label: string; value?: string; last?: boolean }) {
  return (
    <View className={`flex-row items-center py-2.5 ${last ? "" : "border-b border-border"}`}>
      <Ionicons name={icon} size={20} color={colors.text.subtle} />
      <View className="ml-3 flex-1">
        <Text className="text-xs text-text-subtle">{label}</Text>
        <Text className={`text-base ${value?.trim() ? "text-text" : "text-text-subtle"}`}>{value?.trim() || "ไม่ระบุ"}</Text>
      </View>
    </View>
  );
}

/** `editable` is the owner's own profile: the résumé can be uploaded or changed there. */
export function ProfileDetails({ user, editable }: { user: UserDoc; editable?: boolean }) {
  const education = [
    { label: "ปริญญาตรี", value: user.bachelor },
    { label: "ปริญญาโท", value: user.master },
    { label: "ปริญญาเอก", value: user.doctoral },
  ].filter((e) => e.value?.trim());

  return (
    <View className="mb-8">
      <DetailCard title="เกี่ยวกับฉัน" icon="person-outline">
        <Text className={`text-base leading-6 ${user.aboutme?.trim() ? "text-text" : "text-text-subtle"}`}>
          {user.aboutme?.trim() || "ยังไม่มีข้อมูลแนะนำตัว"}
        </Text>
      </DetailCard>

      <DetailCard title="เรซูเม่" icon="document-attach-outline">
        {editable ? (
          <ResumeEditor resume={user.resume} />
        ) : user.resume ? (
          <ResumeButton resume={user.resume} />
        ) : (
          <Text className="text-text-subtle">ยังไม่มีเรซูเม่</Text>
        )}
      </DetailCard>

      {user.companyName ? (
        <DetailCard title="บริษัท" icon="business-outline">
          <Row icon="business-outline" label="ชื่อบริษัท" value={user.companyName} />
          <Row icon="location-outline" label="ที่ตั้ง" value={user.companyLocation} last />
        </DetailCard>
      ) : null}

      <DetailCard title="ช่องทางติดต่อ" icon="call-outline">
        <Row icon="mail-outline" label="อีเมล" value={user.email} />
        <Row icon="call-outline" label="เบอร์โทรศัพท์" value={user.phone} />
        <Row icon="chatbubble-ellipses-outline" label="Line" value={user.line} />
        <Row icon="logo-facebook" label="Facebook" value={user.facebook} last />
      </DetailCard>

      {/* The legacy screen showed the email address under ปริญญาตรี. */}
      <DetailCard title="การศึกษา" icon="school-outline">
        {education.length ? (
          education.map((e, i) => <Row key={e.label} icon="school-outline" label={e.label} value={e.value} last={i === education.length - 1} />)
        ) : (
          <Text className="text-text-subtle">ยังไม่ได้ระบุการศึกษา</Text>
        )}
      </DetailCard>
    </View>
  );
}
