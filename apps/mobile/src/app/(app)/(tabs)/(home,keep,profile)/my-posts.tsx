import type { PostKind } from "@jobapp-platform/shared";
import { useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { HireCard } from "@/components/hire-card";
import { JobCard } from "@/components/job-card";
import { useHideTabBarOnScroll, useTabBarHeight } from "@/components/tab-bar";
import { EmptyState, ErrorState, Fab, Loading } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { useHirePosts, useJobPosts, useUser } from "@/lib/data";

const SEGMENTS: { kind: PostKind; label: string }[] = [
  { kind: "find", label: "ประกาศหางาน" },
  { kind: "hire", label: "ฟรีแลนซ์" },
];

export default function MyPosts() {
  const { user } = useAuth();
  const { data: profile } = useUser(user?.uid);
  const jobs = useJobPosts();
  const hires = useHirePosts();
  const [kind, setKind] = useState<PostKind>("find");
  const tabBarHeight = useTabBarHeight();

  // Filters the lists the app already listens to, as Keep does.
  const mine = {
    find: (jobs.data ?? []).filter((job) => job.postById === user?.uid),
    hire: (hires.data ?? []).filter((hire) => hire.postById === user?.uid),
  };
  const current = kind === "find" ? jobs : hires;
  const hideTabBar = useHideTabBarOnScroll(!current.loading && !current.error);
  const listProps = { contentContainerStyle: { paddingBottom: tabBarHeight + 100 }, ...hideTabBar };

  return (
    <View className="flex-1 bg-background">
      <View className="mx-4 my-3 flex-row rounded-xl bg-primary-soft p-1">
        {SEGMENTS.map((segment) => {
          const active = segment.kind === kind;
          return (
            <TouchableOpacity
              key={segment.kind}
              onPress={() => setKind(segment.kind)}
              className={`flex-1 items-center rounded-lg py-2 ${active ? "bg-surface" : ""}`}
              style={active ? { elevation: 2 } : undefined}
              accessibilityState={{ selected: active }}
            >
              <Text className={`font-semibold ${active ? "text-primary-dark" : "text-text-muted"}`} numberOfLines={1}>
                {segment.label} ({mine[segment.kind].length})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {current.error ? (
        <ErrorState error={current.error} />
      ) : current.loading ? (
        <Loading />
      ) : kind === "find" ? (
        <FlatList
          data={mine.find}
          keyExtractor={(job) => job.id}
          renderItem={({ item }) => <JobCard job={item} />}
          ListEmptyComponent={<EmptyState icon="document-text-outline" message="คุณยังไม่มีประกาศหางาน" action={{ label: "ลงประกาศงาน", href: "/jobs/new" }} />}
          {...listProps}
        />
      ) : (
        <FlatList
          data={mine.hire}
          keyExtractor={(hire) => hire.id}
          renderItem={({ item }) => <HireCard hire={item} author={profile ?? undefined} />}
          ListEmptyComponent={<EmptyState icon="people-outline" message="คุณยังไม่มีประกาศฟรีแลนซ์" action={{ label: "ลงประกาศฟรีแลนซ์", href: "/hires/new" }} />}
          {...listProps}
        />
      )}

      <Fab
        href={kind === "find" ? "/jobs/new" : "/hires/new"}
        label={kind === "find" ? "สร้างประกาศงาน" : "สร้างประกาศฟรีแลนซ์"}
      />
    </View>
  );
}
