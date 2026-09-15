import { Ionicons } from "@expo/vector-icons";
import { postImages } from "@jobapp-platform/shared";
import { Link, router, useLocalSearchParams } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { CommentList } from "@/components/comment-list";
import { Badges, chooseContact, ContactRows, DetailCard, Fact, FactPanel } from "@/components/detail";
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
        <View className="bg-surface px-5 pb-5 pt-4">
          <Text className="text-2xl font-bold leading-8 text-text">{hire.hireTitle}</Text>

          <Link href={`/users/${hire.postById}`} asChild>
            <TouchableOpacity className="mt-3 flex-row items-center" activeOpacity={0.7}>
              <Avatar uri={author?.imageUrl} name={fullName(author)} />
              <View className="ml-3 flex-1">
                <Text className="text-base font-semibold text-text" numberOfLines={1}>{fullName(author)}</Text>
                <Text className="text-sm text-text-subtle" numberOfLines={1}>{author?.job || "ไม่ระบุตำแหน่ง"}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.border.strong} />
            </TouchableOpacity>
          </Link>

          {/* The category is in the facts below, so only the "new" badge goes here. */}
          <Badges items={isNew(hire.createdAt) ? [{ label: "ประกาศใหม่", tone: "new" }] : []} />

          <FactPanel>
            <Fact icon={CATEGORY_ICONS[hire.category] ?? "pricetag-outline"} label="หมวดหมู่" value={hire.category} />
            <View className="flex-row items-center">
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-surface">
                <Ionicons name="star-outline" size={18} color={colors.secondary.DEFAULT} />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs text-text-subtle">รีวิว</Text>
                <View className="flex-row items-center">
                  <Stars value={rating.average} size={14} />
                  <Text className="ml-2 text-base text-text">{rating.count ? `${rating.average.toFixed(1)} (${rating.count})` : "ยังไม่มีรีวิว"}</Text>
                </View>
              </View>
            </View>
            {posted ? <Fact icon="time-outline" label="ลงประกาศ" value={posted} /> : null}
          </FactPanel>
        </View>

        <DetailCard title="รายละเอียด" icon="document-text-outline">
          <Text className="text-base leading-7 text-text">{hire.detail}</Text>
        </DetailCard>

        <DetailCard title="ผลงาน" icon="images-outline">
          {images.length ? <ImageCarousel images={images} height={220} rounded /> : <Text className="text-text-subtle">ยังไม่มีรูปผลงาน</Text>}
        </DetailCard>

        {/* The résumé lives on the author's profile, so every post of theirs shares it. */}
        {author?.resume ? (
          <DetailCard title="เรซูเม่" icon="document-attach-outline">
            <ResumeButton resume={author.resume} />
          </DetailCard>
        ) : null}

        <DetailCard title="ช่องทางติดต่อ" icon="call-outline">
          <ContactRows email={hire.email} phone={hire.phone} />
        </DetailCard>

        <DetailCard title="รีวิวและความคิดเห็น" icon="chatbubbles-outline">
          {isOwner ? null : <RatePost kind="hire" postId={hire.id} title="ให้คะแนนฟรีแลนซ์คนนี้" />}
          <CommentList kind="hire" postId={hire.id} />
        </DetailCard>
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
