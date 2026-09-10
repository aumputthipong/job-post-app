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
import { Ionicons } from '@expo/vector-icons';

const FindJobScreen = ({ navigation }) => {
  
  const [searchText, setSearchText] = useState("");

  const allJobs = useSelector((state) => state.jobs.filteredJobs || []);

const displayedJobs = useMemo(() => {
    const validJobs = allJobs.filter((job) => job && job.id);

    if (!searchText.trim()) return validJobs;
    
    const lowerSearchText = searchText.toLowerCase();
    return validJobs.filter((job) =>
      job?.jobTitle?.toLowerCase().includes(lowerSearchText)
    );
  }, [allJobs, searchText]);

 const renderJobItem = ({ item }) => {
    // ถ้าข้อมูลพังจนไม่มี item ให้ return null ไปเลยเพื่อไม่ให้เรนเดอร์การ์ดเปล่าๆ
    if (!item) return null; 

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate("FindJobDetailScreen", { id: item.id })}
        style={styles.cardContainer}
      >
        <Image
          source={{ uri: item?.imageUrl || "URL_รูปภาพสำรองหากต้องการ" }}
          style={styles.cardImage}
        />
        
        <View style={styles.cardContent}>
          <Text style={styles.titleText} numberOfLines={2}>
            {item?.jobTitle || "ไม่ระบุตำแหน่ง"}
          </Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="briefcase-outline" size={16} color="#666" />
            <Text style={styles.subText}>{item?.position || "-"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={16} color="#083C6B" />
            <Text style={styles.wageText}>
              {item?.wage || 0} บาท / {item?.employmentType || "-"}
            </Text>
          </View>

          {item?.attributes && item.attributes.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.attributes.map((attribute, index) => (
                <View key={index} style={styles.tagBadge}>
                  <Text style={styles.tagText}>{attribute}</Text>
                </View>
              ))}
            </View>
          )}
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
            placeholder="ค้นหาตำแหน่งงาน..."
            value={searchText}
            onChangeText={setSearchText}
            clearButtonMode="while-editing" // ให้มีปุ่มกากบาทลบข้อความได้ (iOS)
          />
        </View>

        {/* Job List */}
      <FlatList
          data={displayedJobs}
          renderItem={renderJobItem}
          // ใส่ ?. และ Fallback เพื่อไม่ให้แครช
          keyExtractor={(item, index) => item?.id ? item.id.toString() : index.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={60} color="#CBD5E1" />
              <Text style={styles.emptyText}>ไม่พบตำแหน่งงานที่คุณค้นหา</Text>
            </View>
          )}
        />

        {/* Floating Action Button (FAB) */}
        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => navigation.navigate("CreateFind", {})}
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
    backgroundColor: "#F5F7FA", // ใช้สีพื้นหลังให้เข้ากับหน้า Home
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
    // Shadow
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
    paddingBottom: 100, // สำคัญ: เว้นที่ไว้ให้ปุ่ม FAB ไม่บังเนื้อหา
  },
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden", // ป้องกันรูปภาพล้นขอบโค้ง
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  cardImage: {
    width: "100%",
    height: 160,
    resizeMode: "cover", // ให้ภาพเต็มกรอบโดยไม่เสียสัดส่วน
  },
  cardContent: {
    padding: 16,
  },
  titleText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#083C6B",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  subText: {
    fontSize: 15,
    color: "#4A5568",
    marginLeft: 8,
  },
  wageText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#083C6B",
    marginLeft: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  tagBadge: {
    backgroundColor: "#EBF8FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: "#2B6CB0",
    fontWeight: "600",
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
    // Shadow
    shadowColor: "#083C6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default FindJobScreen;