import { postImages } from "@jobapp-platform/shared";
import { Ionicons } from "@expo/vector-icons";
import { Link, useLocalSearchParams } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { CommentList } from "@/components/comment-list";
import { ImageCarousel } from "@/components/image-carousel";
import { Avatar } from "@/components/media";
import { RatePost } from "@/components/post-actions";
import { useHideTabBarOnScroll, useTabBarHeight } from "@/components/tab-bar";
import { useAuth } from "@/lib/auth-context";
import { EmptyState, ErrorState, Fab, InfoRow, Loading, Section, Stars } from "@/components/ui";
import { fullName, useHirePost, useRatingSummary, useUser } from "@/lib/data";

export default function HireDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: hire, loading, error } = useHirePost(id);
  const { data: author } = useUser(hire?.postById);
  const rating = useRatingSummary("hire", id);
  const tabBarHeight = useTabBarHeight();
  const hideTabBar = useHideTabBarOnScroll(!!hire && !error);
  const { user } = useAuth();

  if (error) return <ErrorState error={error} />;
  if (loading) return <Loading />;
  if (!hire) return <EmptyState icon="alert-circle-outline" message="ไม่พบประกาศนี้ อาจถูกลบไปแล้ว" />;
  const isOwner = user?.uid === hire.postById;
  const images = postImages(hire);

  return (
    <View className="flex-1">
      <KeyboardAwareScrollView
        style={{ flex: 1, backgroundColor: "#F5F7FA" }}
        contentContainerStyle={{ paddingBottom: tabBarHeight + (isOwner ? 96 : 0) }}
        keyboardShouldPersistTaps="handled"
        bottomOffset={24}
        {...hideTabBar}
      >
        <Link href={`/users/${hire.postById}`} asChild>
          <TouchableOpacity className="m-4 flex-row items-center rounded-card bg-surface p-4" style={{ elevation: 3 }}>
            <Avatar uri={author?.imageUrl} name={fullName(author)} size="lg" />
            <View className="ml-4 flex-1">
              <Text className="text-lg font-bold text-text" numberOfLines={1}>
                {fullName(author)}
              </Text>
              <Text className="text-sm text-text-subtle" numberOfLines={1}>
                {author?.job || "ไม่ระบุตำแหน่ง"}
              </Text>
              <View className="mt-2 flex-row items-center">
                <Stars value={rating.average} size={14} />
                <Text className="ml-2 text-xs text-text-subtle" numberOfLines={1}>
                  {rating.count ? `${rating.average.toFixed(1)} (${rating.count} รีวิว)` : "ยังไม่มีรีวิว"}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CBD5E1" />
          </TouchableOpacity>
        </Link>

        <View className="mx-4 mb-8 rounded-card bg-surface p-5">
          <Text className="mb-4 text-2xl font-bold text-primary">{hire.hireTitle}</Text>

          <Section title="รายละเอียด">
            <Text className="text-base leading-6 text-text">{hire.detail}</Text>
          </Section>

          <Section title="ช่องทางติดต่อ">
            <InfoRow icon="mail-outline">{hire.email || "ไม่ระบุ"}</InfoRow>
            <InfoRow icon="call-outline">{hire.phone || "ไม่ระบุ"}</InfoRow>
          </Section>

          <Section title="ผลงาน">
            {images.length ? (
              <ImageCarousel images={images} height={240} rounded />
            ) : (
              <Text className="text-text-subtle">ยังไม่มีรูปผลงาน</Text>
            )}
          </Section>

          {isOwner ? null : <RatePost kind="hire" postId={hire.id} title="ให้คะแนนฟรีแลนซ์คนนี้" />}

          <View className="mb-5 h-px bg-border" />
          <CommentList kind="hire" postId={hire.id} />
        </View>
      </KeyboardAwareScrollView>
      {isOwner ? <Fab href={`/hires/${hire.id}/edit`} icon="create-outline" label="แก้ไขประกาศ" /> : null}
    </View>
  );
}
