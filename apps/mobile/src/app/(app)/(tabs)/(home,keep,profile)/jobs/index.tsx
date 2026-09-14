import { useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { JobCard } from "@/components/job-card";
import { useHideTabBarOnScroll, useTabBarHeight } from "@/components/tab-bar";
import { EmptyState, ErrorState, Fab, Loading, SearchBar } from "@/components/ui";
import { useJobPosts } from "@/lib/data";

export default function Jobs() {
  const { data: jobs, loading, error } = useJobPosts();
  const [search, setSearch] = useState("");
  const tabBarHeight = useTabBarHeight();
  const hideTabBar = useHideTabBarOnScroll(!loading && !error);

  const shown = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return jobs ?? [];
    return (jobs ?? []).filter((job) =>
      [job.jobTitle, job.position, job.agency].some((field) => field?.toLowerCase().includes(term)),
    );
  }, [jobs, search]);

  return (
    <View className="flex-1 bg-background">
      {error ? (
        <ErrorState error={error} />
      ) : loading ? (
        <Loading />
      ) : (
        <FlatList
          data={shown}
          keyExtractor={(job) => job.id}
          renderItem={({ item }) => <JobCard job={item} />}
          ListHeaderComponent={
            <SearchBar value={search} onChangeText={setSearch} placeholder="ค้นหาตำแหน่งงาน..." />
          }
          ListEmptyComponent={
            <EmptyState
              icon="document-text-outline"
              message={search ? "ไม่พบตำแหน่งงานที่คุณค้นหา" : "ยังไม่มีประกาศงาน"}
            />
          }
          contentContainerStyle={{ paddingBottom: tabBarHeight + 100 }}
          keyboardShouldPersistTaps="handled"
          {...hideTabBar}
        />
      )}
      <Fab href="/jobs/new" label="สร้างประกาศงาน" />
    </View>
  );
}
