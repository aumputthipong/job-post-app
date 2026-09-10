import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import { useSelector } from "react-redux";
import firebase from "../../database/firebaseDB";
import { Ionicons } from "@expo/vector-icons";

const KeepScreen = ({ navigation }) => {
  // 1. ดึง ID ของ User ปัจจุบัน (ใส่ ?. เผื่อกรณีจังหวะที่ Firebase ยังโหลดไม่เสร็จ)
  const currentUserId = firebase.auth().currentUser?.uid;

  // 2. ดึงข้อมูลจาก Redux แบบป้องกัน undefined
  const allJobs = useSelector((state) => state.jobs.filteredJobs || []);
  const allFavs = useSelector((state) => state.jobs.favoriteJobs || []);

  // 3. ใช้ useMemo เพื่อช่วยเรื่อง Performance ให้คำนวณใหม่เฉพาะเมื่อข้อมูลเปลี่ยน
  const displayedJobs = useMemo(() => {
    if (!currentUserId) return [];

    // หาเฉพาะ Favorite ที่เป็นของ User ปัจจุบัน
    const myFavs = allFavs.filter((fav) => fav?.userId === currentUserId);
    
    // กรองเอางานที่มี id ตรงกับ postId ใน myFavs
    return allJobs.filter((job) => 
      job && myFavs.some((fav) => fav?.postId === job.id)
    );
  }, [allJobs, allFavs, currentUserId]);

  const renderJobItem = ({ item }) => {
    if (!item) return null;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate("FindJobDetailScreen", { id: item.id })}
        style={styles.cardContainer}
      >
        {/* ส่วนรูปภาพ */}
        <Image
          source={{ uri: item?.imageUrl }}
          style={styles.cardImage}
        />
        
        {/* ส่วนเนื้อหา */}
        <View style={styles.cardContent}>
          <Text style={styles.titleText} numberOfLines={2}>
            {item?.jobTitle || "ไม่ระบุชื่องาน"}
          </Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="briefcase-outline" size={16} color="#666" />
            <Text style={styles.subText}>{item?.position || "-"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={16} color="#083C6B" />
            <Text style={styles.wageText}>
              {/* โค้ดเดิมคุณใช้ itemData.wages แต่หน้าอื่นใช้ wage ผมเผื่อไว้ให้ทั้งคู่ครับ */}
              {item?.wage || item?.wages || 0} บาท / {item?.employmentType || "-"}
            </Text>
          </View>

          {/* ส่วนเงื่อนไข/คุณสมบัติ (Tags) */}
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
        <FlatList
          data={displayedJobs}
          renderItem={renderJobItem}
          keyExtractor={(item, index) => item?.id ? item.id.toString() : index.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          // Component ที่จะแสดงเมื่อ "ไม่มีงานที่บันทึกไว้"
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="bookmark-outline" size={60} color="#CBD5E1" />
              <Text style={styles.emptyText}>คุณยังไม่ได้บันทึกงานใดๆ ไว้</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FA", // สีพื้นหลังเดียวกับ FindJobScreen
  },
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden", // ป้องกันรูปภาพล้นขอบโค้ง
    // Shadow สำหรับให้การ์ดดูลอยขึ้นมา
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
    marginTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748B",
  },
});

export default KeepScreen;