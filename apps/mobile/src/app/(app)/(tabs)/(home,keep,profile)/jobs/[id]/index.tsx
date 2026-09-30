import { postImages } from "@jobapp-platform/shared";
import { router, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { CommentList } from "@/components/comment-list";
import { Badges, chooseContact, ContactRows, DetailCard, Fact, FactPanel } from "@/components/detail";
import { PrimaryButton } from "@/components/form";
import { ImageCarousel } from "@/components/image-carousel";
import { FavoriteButton, RatePost } from "@/components/post-actions";
import { ActionBar, Bullets, EmptyState, ErrorState, Loading, Stars } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { colors } from "@/lib/colors";
import { useJobPost, useRatingSummary } from "@/lib/data";
import { formatWage, isNew, timeAgo } from "@/lib/format";
import { CATEGORY_ICONS } from "@/lib/post-options";

// Reading order: what and who (hero) → the facts people decide on (pay, place) →
// the job itself → how to get in touch → what others said. Actions are pinned below.
export default function JobDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: job, loading, error } = useJobPost(id);
  const rating = useRatingSummary("find", id);
  const { user } = useAuth();

  if (error) return <ErrorState error={error} />;
  if (loading) return <Loading />;
  if (!job) return <EmptyState icon="alert-circle-outline" message="ไม่พบประกาศนี้ อาจถูกลบไปแล้ว" />;
  const isOwner = user?.uid === job.postById;
  const images = postImages(job);
  const posted = timeAgo(job.createdAt);

  return (
    <View className="flex-1 bg-background">
      <KeyboardAwareScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        bottomOffset={24}
      >
        {images.length ? <ImageCarousel images={images} height={220} /> : null}

        <View className="bg-surface px-5 pb-5 pt-4">
          <Text className="text-2xl font-bold leading-8 text-text">{job.jobTitle}</Text>
          <Text className="mt-1 text-lg text-text-muted">{job.agency}</Text>
          <View className="mt-2 flex-row items-center">
            <Stars value={rating.average} size={14} />
            <Text className="ml-2 flex-1 text-sm text-text-subtle" numberOfLines={1}>
              {[rating.count ? `${rating.average.toFixed(1)} (${rating.count})` : "ยังไม่มีรีวิว", posted && `ลงประกาศ ${posted}`]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          </View>
          <Badges
            items={[
              ...(isNew(job.createdAt) ? [{ label: "ประกาศใหม่", tone: "new" as const }] : []),
              ...[job.jobType, job.workModel].filter((v): v is string => !!v).map((label) => ({ label })),
            ]}
          />

          <FactPanel>
            <Fact icon="cash-outline" label="ค่าตอบแทน" value={formatWage(job)} strong />
            {job.location ? <Fact icon="location-outline" label="สถานที่ทำงาน" value={job.location} /> : null}
            <Fact icon={CATEGORY_ICONS[job.category] ?? "pricetag-outline"} label="ตำแหน่ง · หมวดหมู่" value={[job.position, job.category].filter(Boolean).join(" · ")} />
            {job.openings ? <Fact icon="people-outline" label="จำนวนที่รับ" value={`${job.openings} อัตรา`} /> : null}
          </FactPanel>
        </View>

        <DetailCard title="รายละเอียดงาน" icon="document-text-outline">
          <Text className="text-base leading-7 text-text">{job.detail}</Text>
        </DetailCard>

        <DetailCard title="คุณสมบัติผู้สมัคร" icon="ribbon-outline">
          <Bullets items={job.attributes} />
        </DetailCard>

        <DetailCard title="สวัสดิการ" icon="gift-outline">
          {job.welfareBenefits?.length ? (
            <View className="flex-row flex-wrap">
              {job.welfareBenefits.map((benefit, i) => (
                <View key={i} className="mb-2 mr-2 rounded-full bg-primary-soft px-3 py-1.5">
                  <Text className="text-sm text-primary-dark" numberOfLines={1}>{benefit}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-text-subtle">ไม่ระบุ</Text>
          )}
        </DetailCard>

        <DetailCard title="ช่องทางติดต่อ" icon="call-outline">
          <ContactRows email={job.email} phone={job.phone} />
        </DetailCard>

        <DetailCard title="รีวิวและความคิดเห็น" icon="chatbubbles-outline">
          {isOwner ? null : <RatePost kind="find" postId={job.id} title="ให้คะแนนประกาศนี้" />}
          <CommentList kind="find" postId={job.id} />
        </DetailCard>
      </KeyboardAwareScrollView>

      <ActionBar>
        {isOwner ? (
          <View className="flex-1">
            <PrimaryButton title="แก้ไขประกาศ" icon="create-outline" onPress={() => router.push(`/jobs/${job.id}/edit`)} />
          </View>
        ) : (
          <>
            <FavoriteButton postId={job.id} variant="button" />
            <View className="ml-3 flex-[1.4]">
              <PrimaryButton
                title="ติดต่อสมัครงาน"
                icon="paper-plane-outline"
                onPress={() => chooseContact({ phone: job.phone, email: job.email, subject: `สมัครงาน: ${job.jobTitle}` })}
              />
            </View>
          </>
        )}
      </ActionBar>
    </View>
  );
}
