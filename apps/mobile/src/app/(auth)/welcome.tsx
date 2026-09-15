import { Link } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Same brand asset and copy as apps/mobile's WelcomeScreen — this app is a
// continuation of that redesign, not a different product.
export default function Welcome() {
  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="flex-1 justify-center px-8">
        <View className="items-center">
          <Image
            source={require("@/assets/images/welcomelogo.png")}
            className="h-40 w-40"
            resizeMode="contain"
          />
        </View>

        <View className="mt-6 items-center">
          <Text className="text-3xl font-bold text-text">Job Search</Text>
          <Text className="text-lg text-text-subtle">Application</Text>
        </View>

        <View className="mt-12 gap-4">
          <Link href="/login" asChild>
            <TouchableOpacity className="h-14 items-center justify-center rounded-2xl bg-primary">
              <Text className="text-lg font-bold text-surface">เข้าสู่ระบบ</Text>
            </TouchableOpacity>
          </Link>

          <View className="flex-row justify-center">
            <Text className="text-text-muted">ยังไม่มีบัญชีใช่ไหม? </Text>
            <Link href="/register" asChild>
              <TouchableOpacity>
                <Text className="font-bold text-primary underline">สมัครสมาชิกที่นี่</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
