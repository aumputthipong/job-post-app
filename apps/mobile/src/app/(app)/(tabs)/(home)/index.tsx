import { Ionicons } from "@expo/vector-icons";
import { type Href, Link, router } from "expo-router";
import { useMemo, useState } from "react";
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton } from "@/components/form";
import { JobCard } from "@/components/job-card";
import { Avatar } from "@/components/media";
import { NotificationBell } from "@/components/notification-bell";
import { useTabBarHeight } from "@/components/tab-bar";
import { useAuth } from "@/lib/auth-context";
import { colors } from "@/lib/colors";
import { fullName, useHirePosts, useJobPosts, useUser } from "@/lib/data";
import { CATEGORIES, CATEGORY_ICONS } from "@/lib/post-options";

// Opens like a job board: the search is the first thing, on the navy band, then the newest
// jobs as the same rows as the job list, then every category with how many jobs it has.
export default function Home() {
  const { user } = useAuth();
  const { data: profile } = useUser(user?.uid);
  const { data: jobs = [] } = useJobPosts();
  const { data: hires = [] } = useHirePosts();
  const [keyword, setKeyword] = useState("");
  const insets = useSafeAreaInsets();
  const tabBarHeight = useTabBarHeight();

  const counts = useMemo(() => {
    const byCategory = new Map<string, number>();
    for (const job of jobs) byCategory.set(job.category, (byCategory.get(job.category) ?? 0) + 1);
    return byCategory;
  }, [jobs]);

  const search = () => router.push({ pathname: "/jobs", params: keyword.trim() ? { q: keyword.trim() } : {} });

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View className="bg-secondary px-5 pb-16" style={{ paddingTop: insets.top + 12 }}>
        <View className="flex-row items-center">
          <Text className="flex-1 pr-4 text-base text-surface/80" numberOfLines={1}>
            สวัสดี คุณ{profile?.firstName || "ผู้ใช้งาน"}
          </Text>
          <NotificationBell />
          <Link href="/profile" asChild>
            <TouchableOpacity accessibilityLabel="โปรไฟล์">
              <Avatar uri={profile?.imageUrl} name={fullName(profile)} size="sm" />
            </TouchableOpacity>
          </Link>
        </View>
        <Text className="mt-4 text-[28px] font-bold leading-10 text-surface">วันนี้อยากทำงานอะไร</Text>
      </View>

      {/* The one raised surface: it straddles the band's edge, so it reads as the way in. */}
      <View className="-mt-12 mx-4 rounded-2xl bg-surface p-4" style={{ elevation: 4 }}>
        <View className="h-[52px] flex-row items-center rounded-xl border border-border-strong px-4">
          <Ionicons name="search" size={20} color={colors.text.muted} />
          <TextInput
            className="ml-2 flex-1 text-base text-text"
            value={keyword}
            onChangeText={setKeyword}
            onSubmitEditing={search}
            placeholder="ตำแหน่งงาน หรือชื่อบริษัท"
            placeholderTextColor={colors.placeholder}
            returnKeyType="search"
            autoCorrect={false}
          />
        </View>
        <PrimaryButton className="mt-3" title={`ค้นหาจาก ${jobs.length} ตำแหน่ง`} icon="search" onPress={search} />
      </View>

      <View className="mx-4 mt-3 flex-row">
        <Shortcut href="/jobs" title="งานทั้งหมด" count={`${jobs.length} ตำแหน่ง`} image={require("@/assets/images/FindJobIcon.png")} />
        <View className="w-3" />
        <Shortcut href="/hires" title="ฟรีแลนซ์" count={`${hires.length} ประกาศ`} image={require("@/assets/images/HireJobIcon.png")} />
      </View>

      {jobs.length ? (
        <>
          <SectionHeader title="งานล่าสุด" href="/jobs" />
          {jobs.slice(0, 5).map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </>
      ) : null}

      <SectionHeader title="หางานตามสายงาน" />
      <View className="flex-row flex-wrap bg-surface px-2 py-2">
        {CATEGORIES.map((category) => (
          <Link key={category} href={{ pathname: "/jobs", params: { category } }} asChild>
            <TouchableOpacity className="w-1/2 flex-row items-center px-2 py-2.5" activeOpacity={0.6}>
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-secondary-soft">
                <Ionicons name={CATEGORY_ICONS[category] ?? "briefcase-outline"} size={20} color={colors.secondary.DEFAULT} />
              </View>
              <View className="ml-2.5 flex-1">
                <Text className="text-[15px] text-text" numberOfLines={1}>
                  {category}
                </Text>
                <Text className="text-[13px] text-text-subtle">{counts.get(category) ?? 0} ตำแหน่ง</Text>
              </View>
            </TouchableOpacity>
          </Link>
        ))}
      </View>
    </ScrollView>
  );
}

function Shortcut({ href, title, count, image }: { href: Href; title: string; count: string; image: number }) {
  return (
    <Link href={href} asChild>
      <TouchableOpacity className="flex-1 flex-row items-center rounded-xl bg-surface p-3" activeOpacity={0.7}>
        <Image source={image} style={{ width: 36, height: 36 }} resizeMode="contain" />
        <View className="ml-2.5 flex-1">
          <Text className="text-[15px] font-bold text-secondary" numberOfLines={1}>
            {title}
          </Text>
          <Text className="text-[13px] text-text-subtle" numberOfLines={1}>
            {count}
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

function SectionHeader({ title, href }: { title: string; href?: Href }) {
  return (
    <View className="mb-2 mt-6 flex-row items-center justify-between px-4">
      <Text className="text-lg font-bold text-secondary">{title}</Text>
      {href ? (
        <Link href={href} asChild>
          <TouchableOpacity hitSlop={8}>
            <Text className="font-semibold text-primary-dark">ดูทั้งหมด</Text>
          </TouchableOpacity>
        </Link>
      ) : null}
    </View>
  );
}
