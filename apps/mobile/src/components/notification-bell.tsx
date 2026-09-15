import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "@/lib/auth-context";
import { useNotifications } from "@/lib/data";
import { colors } from "@/lib/colors";

export function NotificationBell() {
  const { user } = useAuth();
  const { unread } = useNotifications(user?.uid);

  return (
    <Link href="/notifications" asChild>
      <TouchableOpacity
        className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-surface"
        style={{ elevation: 2 }}
        accessibilityLabel={unread ? `การแจ้งเตือน ยังไม่อ่าน ${unread} รายการ` : "การแจ้งเตือน"}
      >
        <Ionicons name={unread ? "notifications" : "notifications-outline"} size={24} color={colors.primary.DEFAULT} />
        {unread ? (
          <View className="absolute -right-1 -top-1 h-5 min-w-5 items-center justify-center rounded-full border-2 border-background bg-danger px-1">
            <Text className="text-[10px] font-bold text-surface">{unread > 99 ? "99+" : unread}</Text>
          </View>
        ) : null}
      </TouchableOpacity>
    </Link>
  );
}
