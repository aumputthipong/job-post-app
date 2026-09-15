import { postImages } from "@jobapp-platform/shared";
import { Link } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { fullName, type HirePostDoc, type UserDoc } from "@/lib/data";
import { isNew, timeAgo } from "@/lib/format";
import { Avatar, PostImage } from "./media";

// Same reading order as the job card: what's offered and by whom → a short description →
// when and in which category. The portfolio image is a thumbnail beside the title.
export function HireCard({ hire, author }: { hire: HirePostDoc; author?: UserDoc }) {
  const images = postImages(hire);
  return (
    <Link href={`/hires/${hire.id}`} asChild>
      <TouchableOpacity className="mx-4 mb-3 rounded-card border border-border bg-surface p-4" activeOpacity={0.8}>
        <View className="flex-row">
          <View className="flex-1">
            <Text className="text-lg font-bold leading-6 text-text" numberOfLines={2}>
              {hire.hireTitle}
            </Text>
            <View className="mt-2 flex-row items-center">
              <Avatar uri={author?.imageUrl} name={fullName(author)} size="sm" />
              <Text className="ml-2 flex-1 text-[15px] text-text-muted" numberOfLines={1}>
                {fullName(author)}
                {author?.job ? ` · ${author.job}` : ""}
              </Text>
            </View>
          </View>
          {images.length ? (
            <View className="ml-3">
              <PostImage uri={images[0]?.url} className="h-16 w-16 rounded-xl" />
              {images.length > 1 ? (
                <View className="absolute bottom-1 right-1 rounded-full bg-black/60 px-1.5">
                  <Text className="text-[10px] text-surface">+{images.length - 1}</Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>

        <Text className="mt-3 text-sm leading-5 text-text-muted" numberOfLines={2}>
          {hire.detail}
        </Text>

        <View className="mt-3 flex-row items-center border-t border-border pt-3">
          {isNew(hire.createdAt) ? (
            <View className="mr-2 rounded-md bg-success-soft px-2 py-0.5">
              <Text className="text-xs font-bold text-success">ใหม่</Text>
            </View>
          ) : null}
          <Text className="flex-1 text-xs text-text-subtle" numberOfLines={1}>
            {[hire.category, timeAgo(hire.createdAt)].filter(Boolean).join(" · ")}
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
}
