import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { JobCard } from "@/components/job-card";
import { useHideTabBarOnScroll, useTabBarHeight } from "@/components/tab-bar";
import { EmptyState, ErrorState, Loading } from "@/components/ui";
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
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <Text className="px-6 pb-2 pt-5 text-2xl font-bold text-text">บันทึกไว้</Text>
      {error ? (
        <ErrorState error={error} />
      ) : jobs.loading || favorites.loading ? (
        <Loading />
      ) : (
        <FlatList
          data={saved}
          keyExtractor={(job) => job.id}
          renderItem={({ item }) => <JobCard job={item} />}
          ListHeaderComponent={<View className="h-2" />}
          ListEmptyComponent={
            <EmptyState icon="bookmark-outline" message="ยังไม่มีงานที่บันทึกไว้ กด บันทึกงาน ในหน้ารายละเอียดเพื่อเก็บไว้ดูทีหลัง" action={{ label: "ไปดูประกาศงาน", href: "/jobs" }} />
          }
          contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}
          {...hideTabBar}
        />
      )}
    </SafeAreaView>
  );
}
