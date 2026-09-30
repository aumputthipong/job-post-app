import { Ionicons } from "@expo/vector-icons";
import { Link, router, Stack } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import { Avatar } from "@/components/media";
import { useTabBarHeight } from "@/components/tab-bar";
import { EmptyState, ErrorState, Loading } from "@/components/ui";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { fullName, type NotificationDoc, type UserDoc, useNotifications, useUsers } from "@/lib/data";
import { timeAgo } from "@/lib/format";
import { colors } from "@/lib/colors";

const VERBS = {
  comment: "แสดงความคิดเห็นในโพสต์ของคุณ",
  rating: "ให้คะแนนโพสต์ของคุณ",
  new_post: "ลงประกาศใหม่ในหมวดที่คุณติดตาม",
} as const;

export default function Notifications() {
  const { user } = useAuth();
  const { data, loading, error, unread } = useNotifications(user?.uid);
  const { byId } = useUsers();
  const tabBarHeight = useTabBarHeight();
  const [markingAll, setMarkingAll] = useState(false);

  const markAll = async () => {
    setMarkingAll(true);
    try {
      await api.markAllNotificationsRead();
    } catch (e) {
      Alert.alert("ทำรายการไม่สำเร็จ", (e as Error).message);
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          headerRight: () =>
            markingAll ? (
              <ActivityIndicator color={colors.primary.DEFAULT} />
            ) : unread ? (
              <TouchableOpacity onPress={markAll} hitSlop={8}>
                <Text className="font-semibold text-primary">อ่านทั้งหมด</Text>
              </TouchableOpacity>
            ) : null,
        }}
      />
      {error ? (
        <ErrorState error={error} />
      ) : loading ? (
        <Loading />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(n) => n.id}
          renderItem={({ item }) => <NotificationRow notification={item} actor={byId.get(item.actorIds[0] ?? "")} />}
          ListHeaderComponent={
            <Link href="/notification-settings" asChild>
              <TouchableOpacity className="mx-4 my-3 flex-row items-center rounded-card bg-surface p-4" activeOpacity={0.8}>
                <Ionicons name="options-outline" size={20} color={colors.secondary.DEFAULT} />
                <Text className="ml-3 flex-1 text-text">เลือกหมวดงานที่อยากรับแจ้งเตือน</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.border.strong} />
              </TouchableOpacity>
            </Link>
          }
          ListEmptyComponent={
            <EmptyState icon="notifications-off-outline" message="ยังไม่มีการแจ้งเตือน เมื่อมีคนคอมเมนต์ ให้คะแนน หรือมีประกาศใหม่ในหมวดที่ติดตาม จะแสดงที่นี่" />
          }
          contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}
        />
      )}
    </View>
  );
}

function NotificationRow({ notification: n, actor }: { notification: NotificationDoc; actor?: UserDoc }) {
  const others = n.actorCount > 1 ? ` และอีก ${n.actorCount - 1} คน` : "";

  const open = () => {
    // Opening doesn't wait on the API: the listener turns the row read a moment later.
    if (!n.read) api.markNotificationRead(n.id).catch(() => undefined);
    router.push(n.postKind === "find" ? `/jobs/${n.postId}` : `/hires/${n.postId}`);
  };

  return (
    <TouchableOpacity
      onPress={open}
      activeOpacity={0.7}
      className={`flex-row border-b border-border px-4 py-3 ${n.read ? "bg-background" : "bg-primary-soft"}`}
    >
      <Avatar uri={actor?.imageUrl} name={fullName(actor)} />
      <View className="ml-3 flex-1">
        <Text className="text-[15px] leading-5 text-text">
          <Text className="font-bold">{fullName(actor)}</Text>
          {others} {VERBS[n.type]}
        </Text>
        <Text className="mt-0.5 text-sm text-text-muted" numberOfLines={1}>
          "{n.postTitle}"
        </Text>
        <Text className="mt-1 text-xs text-text-subtle">{timeAgo(n.updatedAt)}</Text>
      </View>
      {n.read ? null : <View className="ml-2 mt-2 h-2.5 w-2.5 rounded-full bg-primary" />}
    </TouchableOpacity>
  );
}
