import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // เพิ่ม Icon ลูกศรเพื่อสื่อว่ากดได้
import firebase from '../database/firebaseDB'; // อย่าลืมเช็ค Path นี้ให้ถูกต้องตามที่คุณหาไฟล์เจอ

const HomeScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // เพิ่ม properties 'description' เข้ามาเพื่อให้การ์ดดูสมบูรณ์ขึ้น
  const menuItems = [
    {
      id: 1,
      name: "Find Job",
      description: "ค้นหาตำแหน่งงาน สมัครงานที่ต้องการ",
      route: "FindJobScreen",
      image: require("../assets/FindJobIcon.png"),
    },
    {
      id: 2,
      name: "Find Freelance",
      description: "ลงประกาศหา Freelance และรับงานFreelance",
      route: "HireJobScreen",
      image: require("../assets/HireJobIcon.png"),
    },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = firebase.auth().currentUser;
        if (currentUser) {
          const userDoc = await firebase.firestore()
            .collection("User Info")
            .doc(currentUser.uid)
            .get();
            
          if (userDoc.exists) {
            setUserData(userDoc.data());
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        
        {/* Header Section (คงไว้เหมือนเดิม) */}
        <View style={styles.headerContainer}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingText}>สวัสดี,</Text>
            {loading ? (
              <ActivityIndicator size="small" color="#083C6B" style={{ alignSelf: "flex-start" }} />
            ) : (
              <Text style={styles.nameText} numberOfLines={1}>
                คุณ {userData ? userData.firstName : "ผู้ใช้งาน"}
              </Text>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.profileImageContainer}
            onPress={() => console.log("Go to Profile")}
          >
            <Image
              source={{ 
              uri: userData?.imageUrl || "https://ui-avatars.com/api/?name=User&background=E4E9F2&color=666"

              }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>เลือกรูปแบบการใช้งาน</Text>
        
        {/* List Menu Section (ปรับปรุงใหม่เป็นแถวบน-ล่าง) */}
        <View style={styles.listContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => navigation.navigate(item.route)}
              activeOpacity={0.7}
            >
              <View style={styles.cardContent}>
                <View style={styles.imageContainer}>
                  <Image
                    source={item.image}
                    style={styles.image}
                  />
                </View>
                
                <View style={styles.textContainer}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                </View>
              </View>

              {/* ไอคอนลูกศรชี้ขวา เพื่อบอกทางสายตา (Visual Cue) ว่าสามารถกดเข้าไปได้ */}
              <Ionicons name="chevron-forward" size={24} color="#A0AABF" />
            </TouchableOpacity>
          ))}
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  // --- Header Styles ---
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  greetingContainer: {
    flex: 1,
    paddingRight: 15,
  },
  greetingText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  nameText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#083C6B",
  },
  profileImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E4E9F2",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
  },
  // --- List Menu Styles (อัปเดตใหม่) ---
  listContainer: {
    flex: 1,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "space-between", // ดันเนื้อหาไปซ้ายสุด และลูกศรไปขวาสุด
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, // ลดเงาลงนิดหน่อยให้ดูคลีนขึ้น
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1, // ให้เนื้อหากินพื้นที่ส่วนใหญ่
  },
  imageContainer: {
    width: 140,
    height: 140,
    marginRight: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F4F8", // เพิ่มกรอบพื้นหลังให้รูปไอคอนดูเด่นขึ้น
    borderRadius: 12,
    padding: 10,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  textContainer: {
    flex: 1,
    paddingRight: 10, // เว้นระยะห่างจากลูกศร
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#083C6B",
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20, // เพิ่มระยะห่างบรรทัดให้อ่านง่าย
  },
});

export default HomeScreen;