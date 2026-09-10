import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  SafeAreaView,
} from "react-native";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";

const HireJobScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState("");

  // 1. ดึงข้อมูลเพียวๆ จาก Redux Store
  const allHires = useSelector((state) => state.hires.filteredHires || []);
  const allUsers = useSelector((state) => state.users.users || []);

  // 2. ใช้ useMemo จัดการเรื่องการค้นหา
  const displayedHires = useMemo(() => {
    if (!searchText.trim()) return allHires;
    const lowerSearchText = searchText.toLowerCase();
    return allHires.filter((job) =>
      job.hireTitle?.toLowerCase().includes(lowerSearchText)
    );
  }, [allHires, searchText]);

  const renderHireItem = ({ item }) => {
    // ป้องกันแอปพังกรณีหา User ไม่เจอ
    const user = allUsers.find((u) => u.id === item.postById);
    
    // ตั้งค่ารูปโปรไฟล์เริ่มต้นหากไม่มีรูป
    const defaultAvatar = user 
      ? `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=083C6B&color=fff`
      : `https://ui-avatars.com/api/?name=User&background=CBD5E1&color=fff`;
      
    const avatarUrl = user?.imageUrl || defaultAvatar;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate("HireJobDetailScreen", { id: item.id })}
        style={styles.cardContainer}
      >
        {/* ส่วนหัวของการ์ด: ข้อมูลผู้โพสต์ (ผู้ว่าจ้าง หรือ ฟรีแลนซ์) */}
        <View style={styles.userInfoRow}>
          <Image source={{ uri: avatarUrl }} style={styles.profileImg} />
          <View style={styles.userInfoText}>
            <Text style={styles.userNameText} numberOfLines={1}>
              {user ? `${user.firstName} ${user.lastName}` : "ผู้ใช้งานทั่วไป"}
            </Text>
            <Text style={styles.userRoleText} numberOfLines={1}>
              {user?.job || "ไม่ระบุตำแหน่ง"}
            </Text>
          </View>
        </View>

        {/* ส่วนเนื้อหา: หัวข้องานและรายละเอียด */}
        <View style={styles.contentSection}>
          <Text style={styles.hireTitleText} numberOfLines={2}>
            {item.hireTitle}
          </Text>
          <Text style={styles.detailText} numberOfLines={3}>
            {item.detail}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="ค้นหางาน หรือ ฟรีแลนซ์..."
            value={searchText}
            onChangeText={setSearchText}
            clearButtonMode="while-editing"
          />
        </View>

        {/* List Section */}
        <FlatList
          data={displayedHires}
          renderItem={renderHireItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={60} color="#CBD5E1" />
              <Text style={styles.emptyText}>ไม่พบข้อมูลประกาศงาน/ฟรีแลนซ์</Text>
            </View>
          )}
        />

        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("CreateHire", {})}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={32} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    height: 50,
    borderWidth: 1,
    borderColor: "#E4E9F2",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100, // เว้นพื้นที่ให้ FAB
  },
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F4F8", // สร้างเส้นคั่นบางๆ ระหว่างผู้โพสต์กับเนื้องาน
  },
  profileImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E4E9F2",
  },
  userInfoText: {
    flex: 1,
    marginLeft: 12,
  },
  userNameText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  userRoleText: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  contentSection: {
    marginTop: 4,
  },
  hireTitleText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#083C6B",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#4A5568",
    lineHeight: 22,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748B",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#083C6B",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#083C6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default HireJobScreen;