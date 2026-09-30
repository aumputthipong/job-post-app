import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { JobCard } from "@/components/job-card";
import { useHideTabBarOnScroll, useTabBarHeight } from "@/components/tab-bar";
import { EmptyState, ErrorState, Fab, Loading, SearchBar } from "@/components/ui";
import { colors } from "@/lib/colors";
import { useJobPosts } from "@/lib/data";
import { CATEGORY_ICONS } from "@/lib/post-options";

export default function Jobs() {
  const { data: jobs, loading, error } = useJobPosts();
  // Set by the category tiles on Home.
  const { category } = useLocalSearchParams<{ category?: string }>();
  const [search, setSearch] = useState("");
  const tabBarHeight = useTabBarHeight();
  const hideTabBar = useHideTabBarOnScroll(!loading && !error);

  const shown = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (jobs ?? []).filter(
      (job) =>
        (!category || job.category === category) &&
        (!term || [job.jobTitle, job.position, job.agency].some((field) => field?.toLowerCase().includes(term))),
    );
  }, [jobs, search, category]);

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
            <>
              <SearchBar value={search} onChangeText={setSearch} placeholder="ค้นหาตำแหน่งงาน..." />
              {category ? (
                <View className="mx-4 mb-3 flex-row items-center">
                  <TouchableOpacity
                    className="flex-row items-center rounded-full border border-primary bg-primary-soft py-1.5 pl-3 pr-2"
                    onPress={() => router.setParams({ category: undefined })}
                    accessibilityLabel={`ล้างตัวกรอง ${category}`}
                  >
                    <Ionicons name={CATEGORY_ICONS[category] ?? "pricetag-outline"} size={15} color={colors.primary.DEFAULT} />
                    <Text className="mx-1.5 font-semibold text-primary-dark">{category}</Text>
                    <Ionicons name="close" size={16} color={colors.primary.dark} />
                  </TouchableOpacity>
                  <Text className="ml-3 text-sm text-text-subtle">{shown.length} ตำแหน่ง</Text>
                </View>
              ) : null}
            </>
          }
          ListEmptyComponent={
            <EmptyState
              icon="document-text-outline"
              message={search || category ? "ไม่พบตำแหน่งงานที่ตรงกับที่เลือก" : "ยังไม่มีประกาศงาน"}
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
