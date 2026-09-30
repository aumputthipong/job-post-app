import { FlatList, Text, View } from "react-native";
import { JobCard } from "@/components/job-card";
import { useHideTabBarOnScroll, useTabBarHeight } from "@/components/tab-bar";
import { EmptyState, ErrorState, Loading, TabHeader } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { useFavoriteIds, useJobPosts } from "@/lib/data";

export default function Keep() {
  const { user } = useAuth();
  const tabBarHeight = useTabBarHeight();
  const jobs = useJobPosts();
  const favorites = useFavoriteIds(user?.uid);
  const saved = (jobs.data ?? []).filter((job) => favorites.ids.has(job.id));
  const error = jobs.error ?? favorites.error;
  const hideTabBar = useHideTabBarOnScroll(!jobs.loading && !favorites.loading && !error);

  return (
    <View className="flex-1 bg-background">
      <TabHeader title="บันทึกไว้" />
      {error ? (
        <ErrorState error={error} />
      ) : jobs.loading || favorites.loading ? (
        <Loading />
      ) : (
        <FlatList
          data={saved}
          keyExtractor={(job) => job.id}
          renderItem={({ item }) => <JobCard job={item} />}
          ListHeaderComponent={
            saved.length ? (
              <Text className="px-4 py-3 text-[15px] text-text-muted">
                บันทึกไว้ <Text className="font-bold text-text">{saved.length}</Text> ตำแหน่ง
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState icon="bookmark-outline" message="ยังไม่มีงานที่บันทึกไว้ กด บันทึกงาน ในหน้ารายละเอียดเพื่อเก็บไว้ดูทีหลัง" action={{ label: "ไปดูประกาศงาน", href: "/jobs" }} />
          }
          contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}
          {...hideTabBar}
        />
      )}
    </View>
  );
}
