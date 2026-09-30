import { postImages } from "@jobapp-platform/shared";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import type { JobPostDoc } from "@/lib/data";
import { formatWage, isNew, timeAgo } from "@/lib/format";
import { PostImage } from "./media";
import { FavoriteButton } from "./post-actions";

// Reading order on the card: what job and who (title, company) → pay → where and how →
// qualifications → when it was posted. The image is a thumbnail so it doesn't outrank the title.
export function JobCard({ job }: { job: JobPostDoc }) {
  const images = postImages(job);
  const facts = [job.jobType, job.location, job.workModel].filter(Boolean);
  const tags = job.attributes ?? [];

  return (
    <Link href={`/jobs/${job.id}`} asChild>
      <TouchableOpacity className="mx-4 mb-3 rounded-card border border-border bg-surface p-4" activeOpacity={0.8}>
        <View className="flex-row">
          <View>
            <PostImage uri={images[0]?.url} className="h-16 w-16 rounded-xl" />
            {images.length > 1 ? (
              <View className="absolute bottom-1 right-1 rounded-full bg-black/60 px-1.5">
                <Text className="text-[10px] text-surface">+{images.length - 1}</Text>
              </View>
            ) : null}
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-lg font-bold leading-6 text-text" numberOfLines={2}>
              {job.jobTitle}
            </Text>
            <Text className="mt-0.5 text-[15px] text-text-muted" numberOfLines={1}>
              {job.agency}
            </Text>
          </View>
          {isNew(job.createdAt) ? (
            <View className="ml-2 self-start rounded-md bg-success-soft px-2 py-0.5">
              <Text className="text-xs font-bold text-success">ใหม่</Text>
            </View>
          ) : null}
        </View>

        <Text className="mt-3 text-base font-bold text-primary" numberOfLines={1}>
          {formatWage(job)}
        </Text>

        {facts.length ? (
          <View className="mt-1.5 flex-row items-center">
            <Ionicons name="location-outline" size={15} color="#64748B" />
            <Text className="ml-1.5 flex-1 text-sm text-text-subtle" numberOfLines={1}>
              {facts.join(" · ")}
            </Text>
          </View>
        ) : (
          <View className="mt-1.5 flex-row items-center">
            <Ionicons name="briefcase-outline" size={15} color="#64748B" />
            <Text className="ml-1.5 flex-1 text-sm text-text-subtle" numberOfLines={1}>
              {job.position}
            </Text>
          </View>
        )}

        {tags.length ? (
          <View className="mt-3 flex-row flex-wrap">
            {tags.slice(0, 3).map((tag, i) => (
              <View key={i} className="mb-1.5 mr-1.5 rounded-md bg-primary-soft px-2 py-1">
                {/* numberOfLines: see "Thai label clipping" in MIGRATION.md 4.3 */}
                <Text className="text-xs font-semibold text-primary-light" numberOfLines={1}>
                  {tag}
                </Text>
              </View>
            ))}
            {tags.length > 3 ? <Text className="ml-1 self-center text-xs text-text-subtle">+{tags.length - 3}</Text> : null}
          </View>
        ) : null}

        <View className="mt-3 flex-row items-center border-t border-border pt-3">
          <Text className="flex-1 text-xs text-text-subtle" numberOfLines={1}>
            {[timeAgo(job.createdAt), job.category].filter(Boolean).join(" · ")}
          </Text>
          <FavoriteButton postId={job.id} />
        </View>
      </TouchableOpacity>
    </Link>
  );
}
