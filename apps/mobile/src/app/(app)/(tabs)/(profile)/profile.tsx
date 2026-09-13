import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { type Href, Link } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { pickImage } from "@/components/form";
import { ProfileCard, ProfileDetails } from "@/components/profile";
import { useHideTabBarOnScroll, useTabBarHeight } from "@/components/tab-bar";
import { EmptyState, ErrorState, Loading } from "@/components/ui";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useUser } from "@/lib/data";
import { auth } from "@/lib/firebase";
import { queryClient } from "@/lib/query-client";

export default function Profile() {
  const { user } = useAuth();
  const { data: profile, loading, error } = useUser(user?.uid);
  const [uploading, setUploading] = useState(false);
  const tabBarHeight = useTabBarHeight();
  const hideTabBar = useHideTabBarOnScroll();

  // Uploads as soon as a photo is picked, as the legacy screen did.
  const changePhoto = async () => {
    const uri = await pickImage([1, 1]);
    if (!uri) return;
    setUploading(true);
    try {
      const { url, publicId } = await api.uploadImage(uri, "profiles");
      await api.updateMe({ imageUrl: url, imagePublicId: publicId });
    } catch (e) {
      Alert.alert("อัปโหลดรูปไม่สำเร็จ", (e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const confirmSignOut = () =>
    Alert.alert("ออกจากระบบ?", undefined, [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ออกจากระบบ",
        style: "destructive",
        onPress: async () => {
          await signOut(auth);
          // Nothing cached for this account should show for the next one.
          queryClient.clear();
        },
      },
    ]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center justify-between px-6 pb-2 pt-5">
        <Text className="text-2xl font-bold text-primary">โปรไฟล์</Text>
        <TouchableOpacity onPress={confirmSignOut} className="flex-row items-center py-2" hitSlop={8}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text className="ml-1 font-semibold text-red-500">ออกจากระบบ</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <ErrorState error={error} />
      ) : loading ? (
        <Loading />
      ) : !profile ? (
        <EmptyState icon="person-outline" message="ไม่พบโปรไฟล์ของคุณ" />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }} {...hideTabBar}>
          <ProfileCard
            user={profile}
            avatarAction={
              <TouchableOpacity
                onPress={changePhoto}
                disabled={uploading}
                className="absolute bottom-0 right-0 h-9 w-9 items-center justify-center rounded-full border-2 border-surface bg-primary"
                accessibilityLabel="เปลี่ยนรูปโปรไฟล์"
              >
                {uploading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Ionicons name="camera" size={16} color="#FFFFFF" />}
              </TouchableOpacity>
            }
          >
            <Link href="/edit-profile" asChild>
              <TouchableOpacity className="mt-4 flex-row items-center rounded-full border border-primary px-5 py-2">
                <Ionicons name="create-outline" size={16} color="#083C6B" />
                <Text className="ml-2 font-semibold text-primary">แก้ไขโปรไฟล์</Text>
              </TouchableOpacity>
            </Link>
          </ProfileCard>
          <View className="mx-4 mb-4 overflow-hidden rounded-card bg-surface" style={{ elevation: 2 }}>
            <MenuRow href="/my-posts" icon="documents-outline" title="โพสต์ของฉัน" />
            <View className="ml-14 h-px bg-border" />
            <MenuRow href="/notification-settings" icon="notifications-outline" title="ตั้งค่าการแจ้งเตือน" />
          </View>
          <ProfileDetails user={profile} editable />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function MenuRow({ href, icon, title }: { href: Href; icon: React.ComponentProps<typeof Ionicons>["name"]; title: string }) {
  return (
    <Link href={href} asChild>
      <TouchableOpacity className="flex-row items-center p-4" activeOpacity={0.7}>
        <Ionicons name={icon} size={22} color="#083C6B" />
        <Text className="ml-3 flex-1 text-base font-semibold text-text">{title}</Text>
        <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
      </TouchableOpacity>
    </Link>
  );
}
