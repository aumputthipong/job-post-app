import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  SafeAreaView,
} from "react-native";
import { useSelector } from "react-redux";
import firebase from "../../database/firebaseDB";
import { Ionicons } from "@expo/vector-icons";

const NotificationScreen = ({ navigation }) => {
  const notiData = useSelector((state) => state.jobs.notiData || []);
  const jobs = useSelector((state) => state.jobs.filterJob || []);
  
  // ป้องกันแครชกรณีดึง uid ไม่ทัน
  const currentUserId = firebase.auth().currentUser?.uid;

  // ใช้ useMemo ในการคำนวณผลลัพธ์การกรองข้อมูล เพื่อประสิทธิภาพที่ดีขึ้น
  const filteredJobs = useMemo(() => {
    if (!currentUserId) return [];

    const currentUserNoti = notiData.filter((noti) => noti?.notiBy === currentUserId);

    return jobs.filter(job => 
      job && currentUserNoti.some(noti => 
        noti?.category?.includes(job.category) && noti?.notiBy !== job.postById
      )
    );
  }, [notiData, jobs, currentUserId]);

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
          source={{ uri: item.imageUrl }}
          style={styles.cardImage}
        />
        
        {/* ส่วนเนื้อหา */}
        <View style={styles.cardContent}>
          <Text style={styles.titleText} numberOfLines={2}>
            {item.jobTitle || "ไม่ระบุชื่องาน"}
          </Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="briefcase-outline" size={16} color="#666" />
            <Text style={styles.subText}>{item.position || "-"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={16} color="#083C6B" />
            <Text style={styles.wageText}>
              {item.wage || 0} บาท / {item.employmentType || "-"}
            </Text>
          </View>

          {/* ส่วนคุณสมบัติ (Tags) */}
          {item.attributes && item.attributes.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.attributes.map((attribute, index) => (
                <View key={index} style={styles.tagBadge}>
                  <Text style={styles.tagText}>{attribute}</Text>
                </View>
              ))}
            </View>
          )}

          {/* วันที่ (ดึงลงมาไว้มุมขวาล่าง) */}
          <Text style={styles.dateText}>
            29 ก.พ. 64 {/* คุณสามารถเปลี่ยนเป็นข้อมูลแบบ Dynamic ได้ภายหลัง */}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header และปุ่มกรองข้อมูล */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>งานที่ตรงกับคุณ</Text>
          <TouchableOpacity 
            style={styles.filterButton} 
            onPress={() => navigation.navigate("EditNoti", {})}
            activeOpacity={0.8}
          >
            <Ionicons name="filter" size={16} color="#FFFFFF" />
            <Text style={styles.filterButtonText}>ตัวกรอง</Text>
          </TouchableOpacity>
        </View>

        {/* รายการงาน */}
        <FlatList
          data={filteredJobs}
          renderItem={renderJobItem}
          keyExtractor={(item, index) => item?.id ? item.id.toString() : index.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={60} color="#CBD5E1" />
              <Text style={styles.emptyText}>ยังไม่มีงานที่ตรงกับเงื่อนไขของคุณ</Text>
              <Text style={styles.emptySubText}>ลองตั้งค่าตัวกรองใหม่อีกครั้ง</Text>
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
    backgroundColor: "#F5F7FA",
  },
  container: {
    flex: 1,
  },
  // --- Header ---
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#083C6B",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#083C6B",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#083C6B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    marginLeft: 6,
    fontSize: 14,
  },
  // --- List & Empty State ---
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#4A5568",
    fontWeight: "600",
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    color: "#94A3B8",
  },
  // --- Card Item ---
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  cardImage: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
  },
  cardContent: {
    padding: 16,
  },
  titleText: {
    fontSize: 18,
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
    fontSize: 14,
    color: "#4A5568",
    marginLeft: 8,
  },
  wageText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#083C6B",
    marginLeft: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    marginBottom: 12,
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
  dateText: {
    fontSize: 12,
    color: "#94A3B8",
    position: "absolute",
    bottom: 16,
    right: 16,
  },
});

export default NotificationScreen;