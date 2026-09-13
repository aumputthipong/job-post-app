import { Ionicons } from "@expo/vector-icons";
import { type Href, Link } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar } from "@/components/media";
import { useAuth } from "@/lib/auth-context";
import { fullName, useUser } from "@/lib/data";

const menu: { title: string; description: string; href: Href; image: number }[] = [
  {
    title: "Find Job",
    description: "ค้นหาตำแหน่งงาน สมัครงานที่ต้องการ",
    href: "/jobs",
    image: require("@/assets/images/FindJobIcon.png"),
  },
  {
    title: "Find Freelance",
    description: "ลงประกาศหา Freelance และรับงาน Freelance",
    href: "/hires",
    image: require("@/assets/images/HireJobIcon.png"),
  },
];

export default function Home() {
  const { user } = useAuth();
  const { data: profile } = useUser(user?.uid);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-1 px-6 pt-5">
        <View className="mb-8 flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className="mb-1 text-base text-text-muted">สวัสดี,</Text>
            <Text className="text-2xl font-bold text-primary" numberOfLines={1}>
              คุณ {profile?.firstName || "ผู้ใช้งาน"}
            </Text>
          </View>
          <Link href="/profile" asChild>
            <TouchableOpacity>
              <Avatar uri={profile?.imageUrl} name={fullName(profile)} />
            </TouchableOpacity>
          </Link>
        </View>

        <Text className="mb-5 text-lg font-semibold text-text">เลือกรูปแบบการใช้งาน</Text>

        {menu.map((item) => (
          <Link key={item.title} href={item.href} asChild>
            <TouchableOpacity
              className="mb-4 flex-row items-center rounded-card bg-surface p-5"
              style={{ elevation: 3 }}
              activeOpacity={0.7}
            >
              <View className="mr-4 h-[120px] w-[120px] items-center justify-center rounded-xl bg-[#F0F4F8] p-2">
                <Image source={item.image} className="h-full w-full" resizeMode="contain" />
              </View>
              <View className="flex-1 pr-2">
                <Text className="mb-1.5 text-lg font-bold text-primary">{item.title}</Text>
                <Text className="text-sm leading-5 text-text-muted" numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#A0AABF" />
            </TouchableOpacity>
          </Link>
        ))}
      </View>
    </SafeAreaView>
  );
}
