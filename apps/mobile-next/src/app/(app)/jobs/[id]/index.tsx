import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CommentList } from "@/components/comment-list";
import { PostImage } from "@/components/media";
import { FavoriteButton, RatePost } from "@/components/post-actions";
import { useAuth } from "@/lib/auth-context";
import { Bullets, EmptyState, ErrorState, Fab, InfoRow, Loading, Section, Stars } from "@/components/ui";
import { useJobPost, useRatingSummary } from "@/lib/data";

export default function JobDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: job, loading, error } = useJobPost(id);
  const rating = useRatingSummary("find", id);
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  if (error) return <ErrorState error={error} />;
  if (loading) return <Loading />;
  if (!job) return <EmptyState icon="alert-circle-outline" message="ไม่พบประกาศนี้ อาจถูกลบไปแล้ว" />;
  const isOwner = user?.uid === job.postById;

  return (
    <View className="flex-1">
      <Stack.Screen options={{ headerRight: () => <FavoriteButton postId={job.id} /> }} />
      <ScrollView
        className="flex-1 bg-surface"
        contentContainerStyle={{ paddingBottom: insets.bottom + (isOwner ? 96 : 0) }}
        keyboardShouldPersistTaps="handled"
      >
        <PostImage uri={job.imageUrl} className="h-56 w-full" />

        <View className="p-5">
          <Text className="text-2xl font-bold text-primary">{job.jobTitle}</Text>
          <Text className="mt-1 text-base text-text-muted">{job.agency}</Text>
          <View className="mt-3 flex-row items-center">
            <Stars value={rating.average} />
            <Text className="ml-2 text-sm text-text-subtle" numberOfLines={1}>
              {rating.count ? `${rating.average.toFixed(1)} / 5 (${rating.count} รีวิว)` : "ยังไม่มีรีวิว"}
            </Text>
          </View>

          <View className="my-5 h-px bg-border" />

          <Section title="รายละเอียดงาน">
            <InfoRow icon="briefcase-outline">ตำแหน่ง: {job.position}</InfoRow>
            <InfoRow icon="cash-outline">
              ค่าจ้าง: {job.wage} บาท / {job.employmentType}
            </InfoRow>
            <InfoRow icon="pricetag-outline">หมวดหมู่: {job.category}</InfoRow>
            <Text className="mt-2 text-base leading-6 text-text">{job.detail}</Text>
          </Section>

          <Section title="คุณสมบัติ">
            <Bullets items={job.attributes} />
          </Section>

          <Section title="สวัสดิการ">
            <Bullets items={job.welfareBenefits} />
          </Section>

          <Section title="ช่องทางติดต่อ">
            <InfoRow icon="mail-outline">{job.email || "ไม่ระบุ"}</InfoRow>
            <InfoRow icon="call-outline">{job.phone || "ไม่ระบุ"}</InfoRow>
          </Section>

          {isOwner ? null : <RatePost kind="find" postId={job.id} title="ให้คะแนนโพสต์นี้" />}

          <View className="mb-5 h-px bg-border" />
          <CommentList kind="find" postId={job.id} />
        </View>
      </ScrollView>
      {isOwner ? <Fab href={`/jobs/${job.id}/edit`} icon="create-outline" label="แก้ไขประกาศ" /> : null}
    </View>
  );
}
