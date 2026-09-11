import { Ionicons } from "@expo/vector-icons";
import { Link, Stack } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PostImage } from "@/components/media";
import { EmptyState, ErrorState, Fab, Loading, SearchBar } from "@/components/ui";
import { type JobPostDoc, useJobPosts } from "@/lib/data";

export default function Jobs() {
  const { data: jobs, loading, error } = useJobPosts();
  const [search, setSearch] = useState("");
  const insets = useSafeAreaInsets();

  const shown = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return jobs ?? [];
    return (jobs ?? []).filter((job) =>
      [job.jobTitle, job.position, job.agency].some((field) => field?.toLowerCase().includes(term)),
    );
  }, [jobs, search]);

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: "ประกาศหางาน" }} />
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
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          keyboardShouldPersistTaps="handled"
        />
      )}
      <Fab href="/jobs/new" />
    </View>
  );
}

function JobCard({ job }: { job: JobPostDoc }) {
  return (
    <Link href={`/jobs/${job.id}`} asChild>
      <TouchableOpacity
        className="mx-4 mb-4 overflow-hidden rounded-card bg-surface"
        style={{ elevation: 4 }}
        activeOpacity={0.8}
      >
        <PostImage uri={job.imageUrl} className="h-40 w-full" />
        <View className="p-4">
          <Text className="mb-2 text-xl font-bold text-primary" numberOfLines={2}>
            {job.jobTitle}
          </Text>
          <View className="mb-1.5 flex-row items-center">
            <Ionicons name="briefcase-outline" size={16} color="#666666" />
            <Text className="ml-2 text-[15px] text-[#4A5568]">
              {job.position} · {job.agency}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="cash-outline" size={16} color="#083C6B" />
            <Text className="ml-2 text-[15px] font-bold text-primary">
              {job.wage} บาท / {job.employmentType}
            </Text>
          </View>
          {job.attributes?.length ? (
            <View className="mt-2.5 flex-row flex-wrap">
              {job.attributes.map((attribute, i) => (
                <View key={i} className="mb-2 mr-2 rounded-lg bg-[#EBF8FF] px-2.5 py-1">
                  <Text className="text-xs font-semibold text-primary-light">{attribute}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    </Link>
  );
}
