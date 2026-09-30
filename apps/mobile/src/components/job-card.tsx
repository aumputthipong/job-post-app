import { postImages } from "@jobapp-platform/shared";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import type { ComponentProps, ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import type { JobPostDoc } from "@/lib/data";
import { formatWage, isNew, timeAgo } from "@/lib/format";
import { CATEGORY_ICONS } from "@/lib/post-options";
import { PostImage } from "./media";
import { FavoriteButton } from "./post-actions";
import { colors } from "@/lib/colors";

type IconName = ComponentProps<typeof Ionicons>["name"];

/**
 * Where a job board shows the company logo: the post's first photo, or its category's icon
 * on navy when there's none (a placeholder picture would say nothing).
 */
export function JobMark({ job, size = 56 }: { job: JobPostDoc; size?: number }) {
  const images = postImages(job);
  const box = { width: size, height: size };
  if (!images.length) {
    return (
      <View className="items-center justify-center rounded-xl bg-secondary-soft" style={box}>
        <Ionicons name={CATEGORY_ICONS[job.category] ?? "briefcase-outline"} size={size * 0.46} color={colors.secondary.DEFAULT} />
      </View>
    );
  }
  return (
    <View>
      <PostImage uri={images[0].url} className="rounded-xl border border-border" style={box} />
      {images.length > 1 ? (
        <View className="absolute bottom-1 right-1 rounded-full bg-black/60 px-1.5">
          <Text className="text-[10px] text-surface">+{images.length - 1}</Text>
        </View>
      ) : null}
    </View>
  );
}

// A job board row, full width: title and company beside the mark, then pay (always the
// second thing read), place and kind of work, and how fresh the post is.
export function JobCard({ job }: { job: JobPostDoc }) {
  const kind = [job.jobType, job.workModel].filter(Boolean).join(", ") || job.position;
  const posted = timeAgo(job.createdAt);

  return (
    <Link href={`/jobs/${job.id}`} asChild>
      <TouchableOpacity className="mb-2 bg-surface px-4 py-4" activeOpacity={0.7}>
        <View className="flex-row">
          <JobMark job={job} />
          <View className="ml-3 flex-1">
            <Text className="text-[17px] font-bold leading-6 text-secondary" numberOfLines={2}>
              {job.jobTitle}
            </Text>
            <Text className="mt-0.5 text-[15px] text-text-muted" numberOfLines={1}>
              {job.agency}
            </Text>
          </View>
          <View className="ml-2">
            <FavoriteButton postId={job.id} />
          </View>
        </View>

        <View className="ml-[68px] mt-2.5 gap-1">
          <Line icon="cash-outline" strong>
            {formatWage(job)}
          </Line>
          {job.location ? <Line icon="location-outline">{job.location}</Line> : null}
          {kind ? <Line icon="time-outline">{kind}</Line> : null}
        </View>

        {posted || isNew(job.createdAt) ? (
          <View className="ml-[68px] mt-3 flex-row items-center">
            {isNew(job.createdAt) ? (
              <View className="mr-2 rounded bg-fresh-soft px-2 py-0.5">
                <Text className="text-xs font-bold text-fresh">ใหม่</Text>
              </View>
            ) : null}
            <Text className="text-[13px] text-text-subtle">{posted}</Text>
          </View>
        ) : null}
      </TouchableOpacity>
    </Link>
  );
}

function Line({ icon, strong, children }: { icon: IconName; strong?: boolean; children: ReactNode }) {
  return (
    <View className="flex-row items-center">
      <Ionicons name={icon} size={15} color={strong ? colors.primary.DEFAULT : colors.text.subtle} />
      <Text className={`ml-2 flex-1 ${strong ? "text-[15px] font-bold text-primary-dark" : "text-sm text-text-muted"}`} numberOfLines={1}>
        {children}
      </Text>
    </View>
  );
}
