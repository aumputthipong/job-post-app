import { postImages } from "@jobapp-platform/shared";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import type { JobPostDoc } from "@/lib/data";
import { PostImage } from "./media";

export function JobCard({ job }: { job: JobPostDoc }) {
  return (
    <Link href={`/jobs/${job.id}`} asChild>
      <TouchableOpacity
        className="mx-4 mb-4 overflow-hidden rounded-card bg-surface"
        style={{ elevation: 4 }}
        activeOpacity={0.8}
      >
        <PostImage uri={postImages(job)[0]?.url} className="h-40 w-full" />
        <View className="p-4">
          <Text className="mb-2 text-xl font-bold text-primary" numberOfLines={2}>
            {job.jobTitle}
          </Text>
          <View className="mb-1.5 flex-row items-center">
            <Ionicons name="briefcase-outline" size={16} color="#666666" />
            <Text className="ml-2 flex-1 text-[15px] text-[#4A5568]">
              {job.position} · {job.agency}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="cash-outline" size={16} color="#083C6B" />
            <Text className="ml-2 flex-1 text-[15px] font-bold text-primary">
              {job.wage} บาท / {job.employmentType}
            </Text>
          </View>
          {job.attributes?.length ? (
            <View className="mt-2.5 flex-row flex-wrap">
              {job.attributes.map((attribute, i) => (
                <View key={i} className="mb-2 mr-2 rounded-lg bg-[#EBF8FF] px-2.5 py-1">
                  {/* numberOfLines: see "Thai label clipping" in MIGRATION.md 4.3 */}
                  <Text className="text-xs font-semibold text-primary-light" numberOfLines={1}>
                    {attribute}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    </Link>
  );
}
