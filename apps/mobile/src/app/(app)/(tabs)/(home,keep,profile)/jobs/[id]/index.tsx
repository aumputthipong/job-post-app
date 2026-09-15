import { Ionicons } from "@expo/vector-icons";
import { postImages } from "@jobapp-platform/shared";
import { Stack, useLocalSearchParams } from "expo-router";
import type { ComponentProps, ReactNode } from "react";
import { Alert, Linking, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { CommentList } from "@/components/comment-list";
import { PrimaryButton } from "@/components/form";
import { ImageCarousel } from "@/components/image-carousel";
import { FavoriteButton, RatePost } from "@/components/post-actions";
import { useTabBarHeight } from "@/components/tab-bar";
import { Bullets, EmptyState, ErrorState, Fab, Loading, Stars } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { useJobPost, useRatingSummary } from "@/lib/data";
import { formatWage, isNew, timeAgo } from "@/lib/format";
import { CATEGORY_ICONS } from "@/lib/post-options";

type IconName = ComponentProps<typeof Ionicons>["name"];

// Reading order: what and who (hero) → the facts people decide on (pay, place) →
// the job itself → how to get in touch → what others said.
export default function JobDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: job, loading, error } = useJobPost(id);
  const rating = useRatingSummary("find", id);
  const tabBarHeight = useTabBarHeight();
  const { user } = useAuth();

  if (error) return <ErrorState error={error} />;
  if (loading) return <Loading />;
  if (!job) return <EmptyState icon="alert-circle-outline" message="ไม่พบประกาศนี้ อาจถูกลบไปแล้ว" />;
  const isOwner = user?.uid === job.postById;
  const images = postImages(job);

  const open = (url: string) => Linking.openURL(url).catch(() => Alert.alert("เปิดไม่ได้", "อุปกรณ์นี้ไม่รองรับการทำรายการนี้"));
  const contact = () => {
    const options = [
      ...(job.phone ? [{ text: `โทร ${job.phone}`, onPress: () => open(`tel:${job.phone}`) }] : []),
      ...(job.email
        ? [{ text: "ส่งอีเมล", onPress: () => open(`mailto:${job.email}?subject=${encodeURIComponent(`สมัครงาน: ${job.jobTitle}`)}`) }]
        : []),
    ];
    Alert.alert("ติดต่อผู้ประกาศ", "เลือกช่องทางที่ต้องการ", [...options, { text: "ยกเลิก", style: "cancel" }]);
  };

  const badges = [isNew(job.createdAt) ? "ประกาศใหม่" : null, job.jobType, job.workModel].filter(Boolean) as string[];

  return (
    <View className="flex-1">
      <Stack.Screen options={{ headerRight: () => <FavoriteButton postId={job.id} /> }} />
      <KeyboardAwareScrollView
        style={{ flex: 1, backgroundColor: "#F5F7FA" }}
        contentContainerStyle={{ paddingBottom: tabBarHeight + (isOwner ? 96 : 24) }}
        keyboardShouldPersistTaps="handled"
        bottomOffset={24}
      >
        {images.length ? <ImageCarousel images={images} height={220} /> : null}

        {/* Level 1 — hero */}
        <View className="bg-surface px-5 pb-5 pt-4">
          <Text className="text-2xl font-bold leading-8 text-text">{job.jobTitle}</Text>
          <Text className="mt-1 text-lg text-text-muted">{job.agency}</Text>
          <View className="mt-2 flex-row items-center">
            <Stars value={rating.average} size={14} />
            <Text className="ml-2 flex-1 text-sm text-text-subtle" numberOfLines={1}>
              {[rating.count ? `${rating.average.toFixed(1)} (${rating.count})` : "ยังไม่มีรีวิว", timeAgo(job.createdAt) && `ลงประกาศ ${timeAgo(job.createdAt)}`]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          </View>
          {badges.length ? (
            <View className="mt-3 flex-row flex-wrap">
              {badges.map((badge) => (
                <View key={badge} className={`mb-1.5 mr-2 rounded-md px-2.5 py-1 ${badge === "ประกาศใหม่" ? "bg-success-soft" : "bg-primary-soft"}`}>
                  <Text className={`text-xs font-semibold ${badge === "ประกาศใหม่" ? "text-success" : "text-primary"}`} numberOfLines={1}>
                    {badge}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* Level 2 — the facts people decide on */}
          <View className="mt-4 rounded-2xl bg-background p-4">
            <Fact icon="cash-outline" label="ค่าตอบแทน" value={formatWage(job)} strong />
            {job.location ? <Fact icon="location-outline" label="สถานที่ทำงาน" value={job.location} /> : null}
            <Fact icon={CATEGORY_ICONS[job.category] ?? "pricetag-outline"} label="ตำแหน่ง · หมวดหมู่" value={[job.position, job.category].filter(Boolean).join(" · ")} />
            {job.openings ? <Fact icon="people-outline" label="จำนวนที่รับ" value={`${job.openings} อัตรา`} last /> : null}
          </View>
        </View>

        {/* Level 3 — content, one card per topic */}
        <Card title="รายละเอียดงาน" icon="document-text-outline">
          <Text className="text-base leading-7 text-text">{job.detail}</Text>
        </Card>

        <Card title="คุณสมบัติผู้สมัคร" icon="ribbon-outline">
          <Bullets items={job.attributes} />
        </Card>

        <Card title="สวัสดิการ" icon="gift-outline">
          {job.welfareBenefits?.length ? (
            <View className="flex-row flex-wrap">
              {job.welfareBenefits.map((benefit, i) => (
                <View key={i} className="mb-2 mr-2 rounded-full bg-primary-soft px-3 py-1.5">
                  <Text className="text-sm text-primary" numberOfLines={1}>{benefit}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-text-subtle">ไม่ระบุ</Text>
          )}
        </Card>

        <Card title="ช่องทางติดต่อ" icon="call-outline">
          <ContactRow icon="mail-outline" value={job.email} onPress={() => open(`mailto:${job.email}`)} />
          <ContactRow icon="call-outline" value={job.phone} onPress={() => open(`tel:${job.phone}`)} />
          {isOwner ? null : <PrimaryButton title="ติดต่อสมัครงาน" icon="paper-plane-outline" onPress={contact} className="mt-3" />}
        </Card>

        {/* Level 4 — what others said */}
        <Card title="รีวิวและความคิดเห็น" icon="chatbubbles-outline">
          {isOwner ? null : <RatePost kind="find" postId={job.id} title="ให้คะแนนประกาศนี้" />}
          <CommentList kind="find" postId={job.id} />
        </Card>
      </KeyboardAwareScrollView>
      {isOwner ? <Fab href={`/jobs/${job.id}/edit`} icon="create-outline" label="แก้ไขประกาศ" /> : null}
    </View>
  );
}

function Card({ title, icon, children }: { title: string; icon: IconName; children: ReactNode }) {
  return (
    <View className="mx-4 mt-3 rounded-card border border-border bg-surface p-5">
      <View className="mb-3 flex-row items-center">
        <Ionicons name={icon} size={20} color="#083C6B" />
        <Text className="ml-2 text-lg font-bold text-text">{title}</Text>
      </View>
      {children}
    </View>
  );
}

function Fact({ icon, label, value, strong, last }: { icon: IconName; label: string; value: string; strong?: boolean; last?: boolean }) {
  return (
    <View className={`flex-row items-center ${last ? "" : "mb-3"}`}>
      <View className="h-9 w-9 items-center justify-center rounded-xl bg-surface">
        <Ionicons name={icon} size={18} color="#083C6B" />
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-xs text-text-subtle">{label}</Text>
        <Text className={strong ? "text-base font-bold text-primary" : "text-base text-text"}>{value}</Text>
      </View>
    </View>
  );
}

function ContactRow({ icon, value, onPress }: { icon: IconName; value?: string; onPress: () => void }) {
  return (
    <TouchableOpacity className="flex-row items-center border-b border-border py-3" onPress={onPress} disabled={!value}>
      <Ionicons name={icon} size={20} color="#64748B" />
      <Text className="ml-3 flex-1 text-base text-text" numberOfLines={1}>
        {value || "ไม่ระบุ"}
      </Text>
      {value ? <Ionicons name="chevron-forward" size={18} color="#94A3B8" /> : null}
    </TouchableOpacity>
  );
}
