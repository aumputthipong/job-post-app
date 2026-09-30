import { postImages } from "@jobapp-platform/shared";
import { router, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { CommentList } from "@/components/comment-list";
import { Badges, chooseContact, ContactRows, DetailHero, Fact, FactTable, Section } from "@/components/detail";
import { PrimaryButton } from "@/components/form";
import { ImageCarousel } from "@/components/image-carousel";
import { JobMark } from "@/components/job-card";
import { FavoriteButton, RatePost } from "@/components/post-actions";
import { ActionBar, Bullets, EmptyState, ErrorState, Loading, Stars } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { colors } from "@/lib/colors";
import { useJobPost, useRatingSummary } from "@/lib/data";
import { formatWage, isNew, timeAgo } from "@/lib/format";
import { CATEGORY_ICONS } from "@/lib/post-options";

// Reading order: what and who (hero) → the facts people decide on (pay, place) →
// the job itself → how to get in touch → what others said. Actions are pinned below.
// Photos come after the facts: on a job board the company comes first, not a picture.
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
        <DetailHero mark={<JobMark job={job} size={64} />} title={job.jobTitle} subtitle={job.agency}>
          <View className="mt-3 flex-row items-center">
            <Stars value={rating.average} size={14} />
            <Text className="ml-2 flex-1 text-sm text-surface/80" numberOfLines={1}>
              {rating.count ? `${rating.average.toFixed(1)} จาก ${rating.count} รีวิว` : "ยังไม่มีรีวิว"}
            </Text>
          </View>
        </DetailHero>

        <View className="bg-surface">
          <Badges
            items={[
              ...(isNew(job.createdAt) ? [{ label: "ประกาศใหม่", tone: "new" as const }] : []),
              ...[job.jobType, job.workModel].filter((v): v is string => !!v).map((label) => ({ label })),
            ]}
          />
          <FactTable>
            <Fact icon="cash-outline" label="เงินเดือน" value={formatWage(job)} strong />
            {job.location ? <Fact icon="location-outline" label="สถานที่" value={job.location} /> : null}
            {job.position ? <Fact icon="person-outline" label="ตำแหน่ง" value={job.position} /> : null}
            {job.category ? <Fact icon={CATEGORY_ICONS[job.category] ?? "pricetag-outline"} label="สายงาน" value={job.category} /> : null}
            {job.openings ? <Fact icon="people-outline" label="จำนวนที่รับ" value={`${job.openings} อัตรา`} /> : null}
            {posted ? <Fact icon="calendar-outline" label="ลงประกาศ" value={posted} /> : null}
          </FactTable>
        </View>

        {images.length ? (
          <View className="mt-2">
            <ImageCarousel images={images} height={220} />
          </View>
        ) : null}

        <Section title="รายละเอียดงาน">
          <Text className="text-base leading-7 text-text">{job.detail}</Text>
        </Section>

        <Section title="คุณสมบัติผู้สมัคร">
          <Bullets items={job.attributes} />
        </Section>

        <Section title="สวัสดิการ">
          {job.welfareBenefits?.length ? (
            <View className="flex-row flex-wrap">
              {job.welfareBenefits.map((benefit, i) => (
                <View key={i} className="mb-2 mr-2 rounded-md bg-secondary-soft px-3 py-1.5">
                  <Text className="text-sm text-secondary" numberOfLines={1}>{benefit}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-text-subtle">ไม่ระบุ</Text>
          )}
        </Section>

        <Section title="ช่องทางติดต่อ">
          <ContactRows email={job.email} phone={job.phone} />
        </Section>

        <Section title="รีวิวและความคิดเห็น">
          {isOwner ? null : <RatePost kind="find" postId={job.id} title="ให้คะแนนประกาศนี้" />}
          <CommentList kind="find" postId={job.id} />
        </Section>
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
