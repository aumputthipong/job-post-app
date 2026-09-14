import { Ionicons } from "@expo/vector-icons";
import type { Media } from "@jobapp-platform/shared";
import { Image } from "expo-image";
import { useState } from "react";
import {
  FlatList,
  Modal,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PostImage } from "./media";

const pageOf = (event: NativeSyntheticEvent<NativeScrollEvent>, width: number) =>
  width ? Math.round(event.nativeEvent.contentOffset.x / width) : 0;

/** Swipeable images with dots, like a feed post. Tap opens them full screen. */
export function ImageCarousel({ images, height, rounded }: { images: Media[]; height: number; rounded?: boolean }) {
  const [width, setWidth] = useState(0);
  const [page, setIndex] = useState(0);
  const [viewing, setViewing] = useState<number>();
  const radius = rounded ? 12 : 0;
  // The list can shrink under us when the owner removes images in an edit.
  const index = Math.min(page, Math.max(images.length - 1, 0));

  if (images.length === 0) {
    return <PostImage className={rounded ? "rounded-xl" : ""} style={{ height }} />;
  }

  return (
    <View style={{ height, borderRadius: radius, overflow: "hidden" }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width ? (
        <FlatList
          data={images}
          keyExtractor={(image, i) => `${i}-${image.url}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => setIndex(pageOf(e, width))}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          renderItem={({ item, index: i }) => (
            <Pressable onPress={() => setViewing(i)} style={{ width, height }}>
              <PostImage uri={item.url} style={{ width, height }} />
            </Pressable>
          )}
        />
      ) : null}

      {images.length > 1 ? (
        <>
          <View className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1">
            <Text className="text-xs text-surface">
              {index + 1}/{images.length}
            </Text>
          </View>
          <View className="absolute bottom-3 w-full flex-row justify-center">
            {images.map((image, i) => (
              <View
                key={`${i}-${image.url}`}
                className={`mx-1 h-2 rounded-full ${i === index ? "w-4 bg-surface" : "w-2 bg-white/60"}`}
              />
            ))}
          </View>
        </>
      ) : null}

      <ImageViewer images={images} start={viewing} onClose={() => setViewing(undefined)} />
    </View>
  );
}

function ImageViewer({ images, start, onClose }: { images: Media[]; start?: number; onClose: () => void }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);

  return (
    <Modal visible={start !== undefined} transparent animationType="fade" onRequestClose={onClose} onShow={() => setIndex(start ?? 0)}>
      <View className="flex-1 bg-black">
        {start !== undefined ? (
          <FlatList
            data={images}
            keyExtractor={(image, i) => `${i}-${image.url}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={start}
            getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
            onMomentumScrollEnd={(e) => setIndex(pageOf(e, width))}
            renderItem={({ item }) => (
              <Image source={{ uri: item.url }} contentFit="contain" style={{ width, height }} />
            )}
          />
        ) : null}
        <View className="absolute w-full flex-row items-center justify-between px-5" style={{ top: insets.top + 12 }}>
          <Text className="text-base text-surface">{images.length > 1 ? `${index + 1}/${images.length}` : ""}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={12} accessibilityLabel="ปิด">
            <Ionicons name="close" size={32} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
