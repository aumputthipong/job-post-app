import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { fullName, type UserDoc } from "@/lib/data";
import { Avatar } from "./media";
import { ResumeButton, ResumeEditor } from "./resume";
import { InfoRow, Section } from "./ui";

const orDash = (value?: string) => value?.trim() || "-";

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
    <View className="m-4 items-center rounded-card bg-surface p-6" style={{ elevation: 3 }}>
      <View>
        <Avatar uri={user.imageUrl} name={fullName(user)} size="lg" />
        {avatarAction}
      </View>
      <Text className="mt-3 text-2xl font-bold text-primary">{fullName(user)}</Text>
      <Text className="mt-1 text-base text-text-subtle">{user.job || "ไม่ระบุตำแหน่ง"}</Text>
      {children}
    </View>
  );
}

/** `editable` is the owner's own profile: the résumé can be uploaded or changed there. */
export function ProfileDetails({ user, editable }: { user: UserDoc; editable?: boolean }) {
  return (
    <View className="mx-4 mb-8 rounded-card bg-surface p-5">
      <Section title="เกี่ยวกับฉัน">
        <Text className="text-base leading-6 text-text">{orDash(user.aboutme)}</Text>
      </Section>

      <Section title="เรซูเม่">
        {editable ? (
          <ResumeEditor resume={user.resume} />
        ) : user.resume ? (
          <ResumeButton resume={user.resume} />
        ) : (
          <Text className="text-text-subtle">ยังไม่มีเรซูเม่</Text>
        )}
      </Section>

      {user.companyName ? (
        <Section title="บริษัท">
          <InfoRow icon="business-outline">{user.companyName}</InfoRow>
          {user.companyLocation ? <InfoRow icon="location-outline">{user.companyLocation}</InfoRow> : null}
        </Section>
      ) : null}

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
  );
}
