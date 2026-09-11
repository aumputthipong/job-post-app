import { signOut } from "firebase/auth";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton } from "@/components/form";
import { useAuth } from "@/lib/auth-context";
import { auth } from "@/lib/firebase";

// Minimal until 4.6 (profile + avatar); sign-out is here now so the auth
// route guard can be exercised end to end.
export default function Profile() {
  const { user } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center px-8">
        <Text className="text-lg font-semibold text-primary">โปรไฟล์</Text>
        <Text className="mb-8 mt-1 text-text-subtle">{user?.email}</Text>
        <PrimaryButton title="ออกจากระบบ" onPress={() => signOut(auth)} />
      </View>
    </SafeAreaView>
  );
}
