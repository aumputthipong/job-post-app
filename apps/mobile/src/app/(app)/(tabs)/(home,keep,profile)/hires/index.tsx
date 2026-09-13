import { useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { HireCard } from "@/components/hire-card";
import { useHideTabBarOnScroll, useTabBarHeight } from "@/components/tab-bar";
import { EmptyState, ErrorState, Fab, Loading, SearchBar } from "@/components/ui";
import { fullName, useHirePosts, useUsers } from "@/lib/data";

export default function Hires() {
  const { data: hires, loading, error } = useHirePosts();
  const { byId } = useUsers();
  const [search, setSearch] = useState("");
  const tabBarHeight = useTabBarHeight();
  const hideTabBar = useHideTabBarOnScroll();

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
          contentContainerStyle={{ paddingBottom: tabBarHeight + 100 }}
          keyboardShouldPersistTaps="handled"
          {...hideTabBar}
        />
      )}
      <Fab href="/hires/new" label="สร้างประกาศฟรีแลนซ์" />
    </View>
  );
}
