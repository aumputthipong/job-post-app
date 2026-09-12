import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CommentList } from "@/components/comment-list";
import { Avatar, PostImage } from "@/components/media";
import { RatePost } from "@/components/post-actions";
import { useAuth } from "@/lib/auth-context";
import { EmptyState, ErrorState, InfoRow, Loading, Section, Stars } from "@/components/ui";
import { fullName, useHirePost, useRatingSummary, useUser } from "@/lib/data";

export default function HireDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: hire, loading, error } = useHirePost(id);
  const { data: author } = useUser(hire?.postById);
  const rating = useRatingSummary("hire", id);
  const [viewerOpen, setViewerOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  if (error) return <ErrorState error={error} />;
  if (loading) return <Loading />;
  if (!hire) return <EmptyState icon="alert-circle-outline" message="ไม่พบประกาศนี้ อาจถูกลบไปแล้ว" />;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: insets.bottom }}
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen options={{ title: "รายละเอียดฟรีแลนซ์" }} />

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

        <Section title="เรซูเม่ / ผลงาน">
          {hire.resumeUrl ? (
            <TouchableOpacity activeOpacity={0.8} onPress={() => setViewerOpen(true)}>
              <PostImage uri={hire.resumeUrl} className="h-56 w-full rounded-xl" />
              <View className="absolute bottom-3 right-3 flex-row items-center rounded-full bg-black/60 px-3 py-1.5">
                <Ionicons name="expand-outline" size={16} color="#FFFFFF" />
                <Text className="ml-1.5 text-xs text-surface" numberOfLines={1}>
                  แตะเพื่อดูรูปเต็ม
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <Text className="text-text-subtle">ไม่มีไฟล์แนบ</Text>
          )}
        </Section>

        {user?.uid !== hire.postById ? (
          <RatePost kind="hire" postId={hire.id} title="ให้คะแนนฟรีแลนซ์คนนี้" />
        ) : null}

        <View className="mb-5 h-px bg-border" />
        <CommentList kind="hire" postId={hire.id} />
      </View>

      <Modal visible={viewerOpen} transparent animationType="fade" onRequestClose={() => setViewerOpen(false)}>
        <Pressable className="flex-1 bg-black" onPress={() => setViewerOpen(false)}>
          <Image source={{ uri: hire.resumeUrl }} contentFit="contain" style={{ flex: 1 }} />
          <View className="absolute right-5 top-12">
            <Ionicons name="close" size={32} color="#FFFFFF" />
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
