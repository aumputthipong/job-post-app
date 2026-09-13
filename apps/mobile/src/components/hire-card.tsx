import { Link } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { fullName, type HirePostDoc, type UserDoc } from "@/lib/data";
import { Avatar } from "./media";

export function HireCard({ hire, author }: { hire: HirePostDoc; author?: UserDoc }) {
  return (
    <Link href={`/hires/${hire.id}`} asChild>
      <TouchableOpacity className="mx-4 mb-4 rounded-card bg-surface p-4" style={{ elevation: 3 }} activeOpacity={0.8}>
        <View className="mb-3 flex-row items-center">
          <Avatar uri={author?.imageUrl} name={fullName(author)} />
          <View className="ml-3 flex-1">
            <Text className="text-base font-bold text-text" numberOfLines={1}>
              {fullName(author)}
            </Text>
            <Text className="text-sm text-text-subtle" numberOfLines={1}>
              {author?.job || "ไม่ระบุตำแหน่ง"}
            </Text>
          </View>
        </View>
        <Text className="mb-1 text-lg font-bold text-primary" numberOfLines={2}>
          {hire.hireTitle}
        </Text>
        <Text className="text-sm leading-5 text-text-muted" numberOfLines={3}>
          {hire.detail}
        </Text>
      </TouchableOpacity>
    </Link>
  );
}
