import { Ionicons } from "@expo/vector-icons";
import { postImages } from "@jobapp-platform/shared";
import { Link, router, useLocalSearchParams } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { CommentList } from "@/components/comment-list";
import { Badges, chooseContact, ContactRows, DetailHero, Fact, FactTable, Section } from "@/components/detail";
import { PrimaryButton } from "@/components/form";
import { ImageCarousel } from "@/components/image-carousel";
import { Avatar } from "@/components/media";
import { RatePost } from "@/components/post-actions";
import { ResumeButton } from "@/components/resume";
import { ActionBar, EmptyState, ErrorState, Loading, Stars } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { colors } from "@/lib/colors";
import { fullName, useHirePost, useRatingSummary, useUser } from "@/lib/data";
import { isNew, timeAgo } from "@/lib/format";
import { CATEGORY_ICONS } from "@/lib/post-options";

// Same order as a job: what and who → key facts → the offer and its portfolio →
// contact → reviews, with the actions pinned below.
export default function HireDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: hire, loading, error } = useHirePost(id);
  const { data: author } = useUser(hire?.postById);
  const rating = useRatingSummary("hire", id);
  const { user } = useAuth();

  if (error) return <ErrorState error={error} />;
  if (loading) return <Loading />;
  if (!hire) return <EmptyState icon="alert-circle-outline" message="ไม่พบประกาศนี้ อาจถูกลบไปแล้ว" />;
  const isOwner = user?.uid === hire.postById;
  const images = postImages(hire);
  const posted = timeAgo(hire.createdAt);

  return (
    <View className="flex-1 bg-background">
      <KeyboardAwareScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        bottomOffset={24}
      >
        <DetailHero mark={<Avatar uri={author?.imageUrl} name={fullName(author)} size="md" />} title={hire.hireTitle}>
          <Link href={`/users/${hire.postById}`} asChild>
            <TouchableOpacity className="ml-16 mt-2 flex-row items-center self-start" activeOpacity={0.7} hitSlop={8}>
              <Text className="text-base text-surface/80" numberOfLines={1}>
                {fullName(author)}
                {author?.job ? `, ${author.job}` : ""}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.onPrimary} style={{ marginLeft: 4, opacity: 0.8 }} />
            </TouchableOpacity>
          </Link>
        </DetailHero>

        <View className="bg-surface">
          {/* The category is in the facts below, so only the "new" badge goes here. */}
          <Badges items={isNew(hire.createdAt) ? [{ label: "ประกาศใหม่", tone: "new" }] : []} />
          <FactTable>
            {hire.category ? <Fact icon={CATEGORY_ICONS[hire.category] ?? "pricetag-outline"} label="หมวดหมู่" value={hire.category} /> : null}
            <View className="flex-row items-center border-b border-border py-3">
              <Ionicons name="star-outline" size={18} color={colors.text.subtle} />
              <Text className="ml-2.5 w-[100px] text-[15px] leading-6 text-text-subtle">รีวิว</Text>
              <Stars value={rating.average} size={14} />
              <Text className="ml-2 flex-1 text-[15px] text-text">{rating.count ? `${rating.average.toFixed(1)} (${rating.count})` : "ยังไม่มีรีวิว"}</Text>
            </View>
            {posted ? <Fact icon="time-outline" label="ลงประกาศ" value={posted} /> : null}
          </FactTable>
        </View>

        <Section title="รายละเอียด">
          <Text className="text-base leading-7 text-text">{hire.detail}</Text>
        </Section>

        <Section title="ผลงาน">
          {images.length ? <ImageCarousel images={images} height={220} rounded /> : <Text className="text-text-subtle">ยังไม่มีรูปผลงาน</Text>}
        </Section>

        {/* The résumé lives on the author's profile, so every post of theirs shares it. */}
        {author?.resume ? (
          <Section title="เรซูเม่">
            <ResumeButton resume={author.resume} />
          </Section>
        ) : null}

        <Section title="ช่องทางติดต่อ">
          <ContactRows email={hire.email} phone={hire.phone} />
        </Section>

        <Section title="รีวิวและความคิดเห็น">
          {isOwner ? null : <RatePost kind="hire" postId={hire.id} title="ให้คะแนนฟรีแลนซ์คนนี้" />}
          <CommentList kind="hire" postId={hire.id} />
        </Section>
      </KeyboardAwareScrollView>

      <ActionBar>
        {isOwner ? (
          <View className="flex-1">
            <PrimaryButton title="แก้ไขประกาศ" icon="create-outline" onPress={() => router.push(`/hires/${hire.id}/edit`)} />
          </View>
        ) : (
          <>
            <View className="flex-1">
              <PrimaryButton title="ดูโปรไฟล์" variant="secondary" icon="person-outline" onPress={() => router.push(`/users/${hire.postById}`)} />
            </View>
            <View className="ml-3 flex-[1.4]">
              <PrimaryButton
                title="ติดต่อจ้างงาน"
                icon="chatbubble-ellipses-outline"
                onPress={() => chooseContact({ phone: hire.phone, email: hire.email, subject: `ติดต่อจ้างงาน: ${hire.hireTitle}` })}
              />
            </View>
          </>
        )}
      </ActionBar>
    </View>
  );
}
