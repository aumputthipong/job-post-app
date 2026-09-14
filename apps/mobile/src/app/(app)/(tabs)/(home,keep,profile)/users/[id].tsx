import { useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";
import { ProfileCard, ProfileDetails } from "@/components/profile";
import { useTabBarHeight } from "@/components/tab-bar";
import { EmptyState, ErrorState, Loading } from "@/components/ui";
import { useUser } from "@/lib/data";

export default function UserProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: user, loading, error } = useUser(id);
  const tabBarHeight = useTabBarHeight();

  if (error) return <ErrorState error={error} />;
  if (loading) return <Loading />;
  if (!user) return <EmptyState icon="person-outline" message="ไม่พบผู้ใช้นี้" />;

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingBottom: tabBarHeight }}>
      <ProfileCard user={user} />
      <ProfileDetails user={user} />
    </ScrollView>
  );
}
