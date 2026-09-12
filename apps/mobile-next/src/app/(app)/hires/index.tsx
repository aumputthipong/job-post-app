import { Link, Stack } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/media";
import { EmptyState, ErrorState, Fab, Loading, SearchBar } from "@/components/ui";
import { fullName, type HirePostDoc, type UserDoc, useHirePosts, useUsers } from "@/lib/data";

export default function Hires() {
  const { data: hires, loading, error } = useHirePosts();
  const { byId } = useUsers();
  const [search, setSearch] = useState("");
  const insets = useSafeAreaInsets();

  const shown = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return hires ?? [];
    return (hires ?? []).filter((hire) =>
      [hire.hireTitle, hire.category, fullName(byId.get(hire.postById))].some((field) =>
        field?.toLowerCase().includes(term),
      ),
    );
  }, [hires, search, byId]);

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: "Find Freelance" }} />
      {error ? (
        <ErrorState error={error} />
      ) : loading ? (
        <Loading />
      ) : (
        <FlatList
          data={shown}
          keyExtractor={(hire) => hire.id}
          renderItem={({ item }) => <HireCard hire={item} author={byId.get(item.postById)} />}
          ListHeaderComponent={
            <SearchBar value={search} onChangeText={setSearch} placeholder="ค้นหางาน หรือ ฟรีแลนซ์..." />
          }
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              message={search ? "ไม่พบประกาศที่คุณค้นหา" : "ยังไม่มีประกาศฟรีแลนซ์"}
            />
          }
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          keyboardShouldPersistTaps="handled"
        />
      )}
      <Fab href="/hires/new" />
    </View>
  );
}

function HireCard({ hire, author }: { hire: HirePostDoc; author?: UserDoc }) {
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
