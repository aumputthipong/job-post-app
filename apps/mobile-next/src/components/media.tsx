import { Image } from "expo-image";
import { useState } from "react";
import { Text, View } from "react-native";

const PLACEHOLDER = require("@/assets/images/PostPlaceholder.png");

// Images older than the move to Cloudinary point at Firebase Storage, which
// answers 402 on this project — fall back to the placeholder instead of a gap.
// Sizing goes on the wrapping View: expo-image doesn't take className.
export function PostImage({ uri, className }: { uri?: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <View className={`overflow-hidden bg-border ${className ?? ""}`}>
      <Image
        source={uri && !failed ? { uri } : PLACEHOLDER}
        onError={() => setFailed(true)}
        contentFit="cover"
        transition={150}
        style={{ width: "100%", height: "100%" }}
      />
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
  const [failed, setFailed] = useState(false);
  const px = sizes[size];
  const initials =
    (name ?? "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "?";

  if (uri && !failed) {
    return (
      <Image
        source={{ uri }}
        onError={() => setFailed(true)}
        style={{ width: px, height: px, borderRadius: px / 2, backgroundColor: "#E4E9F2" }}
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
