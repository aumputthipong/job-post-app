import { Ionicons } from "@expo/vector-icons";
import { type Href, Link } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar } from "@/components/media";
import { NotificationBell } from "@/components/notification-bell";
import { useTabBarHeight } from "@/components/tab-bar";
import { useAuth } from "@/lib/auth-context";
import { colors } from "@/lib/colors";
import { fullName, type JobPostDoc, useJobPosts, useUser } from "@/lib/data";
import { formatWage, isNew } from "@/lib/format";
import { CATEGORIES, CATEGORY_ICONS, categoryPastel } from "@/lib/post-options";

const services: { title: string; description: string; href: Href; image: number; pastel: keyof typeof colors.pastel }[] = [
  {
    title: "หางาน",
    description: "ตำแหน่งงานจากบริษัทและร้านค้า",
    href: "/jobs",
    image: require("@/assets/images/FindJobIcon.png"),
    pastel: "peach",
  },
  {
    title: "ฟรีแลนซ์",
    description: "จ้างหรือรับงานเป็นชิ้น",
    href: "/hires",
    image: require("@/assets/images/HireJobIcon.png"),
    pastel: "mint",
  },
];

// Home used to be a greeting and two links on an empty page. It now opens on what's new
// (the orange banner — the one loud thing), then ways in: categories, services, latest jobs.
export default function Home() {
  const { user } = useAuth();
  const { data: profile } = useUser(user?.uid);
  const { data: jobs = [] } = useJobPosts();
  const tabBarHeight = useTabBarHeight();
  const fresh = jobs.filter((job) => isNew(job.createdAt)).length;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }} showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between px-5 pb-4 pt-5">
          <View className="flex-1 pr-4">
            <Text className="text-base text-text-muted">สวัสดี</Text>
            <Text className="text-2xl font-bold text-text" numberOfLines={1}>
              คุณ{profile?.firstName || "ผู้ใช้งาน"}
            </Text>
          </View>
          <View className="flex-row items-center">
            <NotificationBell />
            <Link href="/profile" asChild>
              <TouchableOpacity accessibilityLabel="โปรไฟล์">
                <Avatar uri={profile?.imageUrl} name={fullName(profile)} />
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        <Link href="/jobs" asChild>
          <TouchableOpacity className="mx-5 h-[50px] flex-row items-center rounded-xl border border-border bg-surface px-4" activeOpacity={0.8}>
            <Ionicons name="search" size={20} color={colors.text.subtle} />
            <Text className="ml-2 flex-1 text-base text-placeholder">ค้นหาตำแหน่งงาน บริษัท</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/jobs" asChild>
          <TouchableOpacity className="mx-5 mt-4 overflow-hidden rounded-3xl bg-primary p-5" activeOpacity={0.9}>
            {/* Soft circles give the banner depth without a gradient. */}
            <View className="absolute -right-10 -top-12 h-44 w-44 rounded-full bg-white/15" />
            <View className="absolute -bottom-16 right-16 h-32 w-32 rounded-full bg-white/10" />
            <View className="flex-row items-center">
              <View className="flex-1 pr-2">
                <Text className="text-[26px] font-bold leading-9 text-surface">
                  {fresh ? `งานใหม่ ${fresh} ตำแหน่ง` : `เปิดรับ ${jobs.length} ตำแหน่ง`}
                </Text>
                <Text className="mt-1 text-[15px] leading-5 text-surface/90">
                  {fresh ? "ลงประกาศในช่วง 3 วันนี้" : "เลือกดูงานที่เหมาะกับคุณ"}
                </Text>
                <View className="mt-4 flex-row items-center self-start rounded-full bg-surface px-4 py-2">
                  <Text className="font-bold text-primary-dark">ดูงานทั้งหมด</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.primary.dark} style={{ marginLeft: 2 }} />
                </View>
              </View>
              <Image source={require("@/assets/images/FindJobIcon.png")} style={{ width: 104, height: 104 }} resizeMode="contain" />
            </View>
          </TouchableOpacity>
        </Link>

        <SectionHeader title="หมวดหมู่งาน" href="/jobs" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {CATEGORIES.map((category) => {
            const pastel = categoryPastel(category);
            return (
              <Link key={category} href={{ pathname: "/jobs", params: { category } }} asChild>
                <TouchableOpacity className="mr-3 w-[76px] items-center" activeOpacity={0.8}>
                  <View className="h-[64px] w-[64px] items-center justify-center rounded-2xl" style={{ backgroundColor: pastel.bg }}>
                    <Ionicons name={CATEGORY_ICONS[category] ?? "briefcase-outline"} size={28} color={pastel.fg} />
                  </View>
                  <Text className="mt-1.5 text-center text-xs text-text-muted" numberOfLines={1}>
                    {category.replace(/^งาน/, "")}
                  </Text>
                </TouchableOpacity>
              </Link>
            );
          })}
        </ScrollView>

        <SectionHeader title="บริการ" />
        <View className="flex-row px-5">
          {services.map((service, i) => {
            const pastel = colors.pastel[service.pastel];
            return (
              <Link key={service.title} href={service.href} asChild>
                <TouchableOpacity
                  className={`flex-1 rounded-3xl p-4 ${i === 0 ? "mr-3" : ""}`}
                  style={{ backgroundColor: pastel.bg }}
                  activeOpacity={0.85}
                >
                  <Image source={service.image} style={{ width: 64, height: 64 }} resizeMode="contain" />
                  <Text className="mt-3 text-lg font-bold text-text">{service.title}</Text>
                  <Text className="mt-0.5 text-sm leading-5 text-text-muted" numberOfLines={2}>
                    {service.description}
                  </Text>
                </TouchableOpacity>
              </Link>
            );
          })}
        </View>

        {jobs.length ? (
          <>
            <SectionHeader title="งานล่าสุด" href="/jobs" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
              {jobs.slice(0, 6).map((job) => (
                <LatestJob key={job.id} job={job} />
              ))}
            </ScrollView>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title, href }: { title: string; href?: Href }) {
  return (
    <View className="mb-3 mt-7 flex-row items-center justify-between px-5">
      <Text className="text-lg font-bold text-text">{title}</Text>
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

function LatestJob({ job }: { job: JobPostDoc }) {
  const pastel = categoryPastel(job.category);
  return (
    <Link href={`/jobs/${job.id}`} asChild>
      <TouchableOpacity className="mr-3 w-[232px] rounded-3xl border border-border bg-surface p-4" activeOpacity={0.85}>
        <View className="h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: pastel.bg }}>
          <Ionicons name={CATEGORY_ICONS[job.category] ?? "briefcase-outline"} size={20} color={pastel.fg} />
        </View>
        <Text className="mt-3 text-base font-bold leading-6 text-text" numberOfLines={2}>
          {job.jobTitle}
        </Text>
        <Text className="mt-0.5 text-sm text-text-muted" numberOfLines={1}>
          {job.agency}
        </Text>
        <View className="mt-3 self-start rounded-full bg-primary-tint px-3 py-1">
          <Text className="text-sm font-bold text-primary-dark" numberOfLines={1}>
            {formatWage(job)}
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
}
