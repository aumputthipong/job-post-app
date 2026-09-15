import { Ionicons } from "@expo/vector-icons";
import type { Media } from "@jobapp-platform/shared";
import { Image } from "expo-image";
import { useState } from "react";
import { Text, View, type ViewStyle } from "react-native";
import { colors } from "@/lib/colors";

const PLACEHOLDER = require("@/assets/images/PostPlaceholder.png");

// Images older than the move to Cloudinary point at Firebase Storage, which
// answers 402 on this project — fall back to the placeholder instead of a gap.
// Sizing goes on the wrapping View: expo-image doesn't take className.
export function PostImage({ uri, className, style }: { uri?: string; className?: string; style?: ViewStyle }) {
  // The URI that failed, not a flag: a replaced image must be tried again.
  const [failedUri, setFailedUri] = useState<string>();
  return (
    <View className={`overflow-hidden bg-border ${className ?? ""}`} style={style}>
      <Image
        source={uri && failedUri !== uri ? { uri } : PLACEHOLDER}
        onError={() => setFailedUri(uri)}
        contentFit="cover"
        transition={150}
        style={{ width: "100%", height: "100%" }}
      />
    </View>
  );
}

/** A post's cover for lists, marked with how many images there are to swipe through. */
export function PostCover({ images, className }: { images: Media[]; className?: string }) {
  return (
    <View>
      <PostImage uri={images[0]?.url} className={className} />
      {images.length > 1 ? (
        <View className="absolute right-3 top-3 flex-row items-center rounded-full bg-black/60 px-2.5 py-1">
          <Ionicons name="images-outline" size={14} color={colors.onPrimary} />
          <Text className="ml-1 text-xs text-surface">{images.length}</Text>
        </View>
      ) : null}
    </View>
  );
}

const sizes = { sm: 36, md: 48, lg: 96 } as const;

/** Profile photo, or the user's initials when there isn't one (or it fails). */
export function Avatar({
  uri,
  name,
  size = "md",
}: {
  uri?: string;
  name?: string;
  size?: keyof typeof sizes;
}) {
  const [failedUri, setFailedUri] = useState<string>();
  const px = sizes[size];
  const initials =
    (name ?? "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "?";

  if (uri && failedUri !== uri) {
    return (
      <Image
        source={{ uri }}
        onError={() => setFailedUri(uri)}
        style={{ width: px, height: px, borderRadius: px / 2, backgroundColor: colors.border.DEFAULT }}
      />
    );
  }
  return (
    <View
      className="items-center justify-center bg-primary"
      style={{ width: px, height: px, borderRadius: px / 2 }}
    >
      <Text className="font-bold text-surface" style={{ fontSize: px * 0.38 }}>
        {initials}
      </Text>
    </View>
  );
}
