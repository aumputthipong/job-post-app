import { postImages } from "@jobapp-platform/shared";
import { Link } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { fullName, type HirePostDoc, type UserDoc } from "@/lib/data";
import { isNew, timeAgo } from "@/lib/format";
import { Avatar, PostImage } from "./media";

// The job row's layout with a person in the logo's place: what's offered and by whom → a short
// description → how fresh it is. The portfolio's first image sits at the end of the row.
export function HireCard({ hire, author }: { hire: HirePostDoc; author?: UserDoc }) {
  const images = postImages(hire);
  const posted = [hire.category, timeAgo(hire.createdAt)].filter(Boolean);
  return (
    <Link href={`/hires/${hire.id}`} asChild>
      <TouchableOpacity className="mb-2 bg-surface px-4 py-4" activeOpacity={0.7}>
        <View className="flex-row">
          <Avatar uri={author?.imageUrl} name={fullName(author)} />
          <View className="ml-3 flex-1">
            <Text className="text-[17px] font-bold leading-6 text-secondary" numberOfLines={2}>
              {hire.hireTitle}
            </Text>
            <Text className="mt-0.5 text-[15px] text-text-muted" numberOfLines={1}>
              {fullName(author)}
              {author?.job ? `, ${author.job}` : ""}
            </Text>
          </View>
          {images.length ? (
            <View className="ml-3">
              <PostImage uri={images[0]?.url} className="h-14 w-14 rounded-xl border border-border" />
              {images.length > 1 ? (
                <View className="absolute bottom-1 right-1 rounded-full bg-black/60 px-1.5">
                  <Text className="text-[10px] text-surface">+{images.length - 1}</Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>

        <Text className="ml-[60px] mt-2 text-sm leading-5 text-text-muted" numberOfLines={2}>
          {hire.detail}
        </Text>

        <View className="ml-[60px] mt-3 flex-row items-center">
          {isNew(hire.createdAt) ? (
            <View className="mr-2 rounded bg-fresh-soft px-2 py-0.5">
              <Text className="text-xs font-bold text-fresh">ใหม่</Text>
            </View>
          ) : null}
          <Text className="flex-1 text-[13px] text-text-subtle" numberOfLines={1}>
            {posted.join(", ")}
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
}
