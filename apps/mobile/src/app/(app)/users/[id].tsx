import { useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProfileCard, ProfileDetails } from "@/components/profile";
import { EmptyState, ErrorState, Loading } from "@/components/ui";
import { useUser } from "@/lib/data";

export default function UserProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: user, loading, error } = useUser(id);
  const insets = useSafeAreaInsets();

  if (error) return <ErrorState error={error} />;
  if (loading) return <Loading />;
  if (!user) return <EmptyState icon="person-outline" message="ไม่พบผู้ใช้นี้" />;

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingBottom: insets.bottom }}>
      <ProfileCard user={user} />
      <ProfileDetails user={user} />
    </ScrollView>
  );
}
