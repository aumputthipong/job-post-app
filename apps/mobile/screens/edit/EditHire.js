import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  View,
  Text,
  Button,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
  ScrollView,
    KeyboardAvoidingView,
    SafeAreaView,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import firebase from "../../database/firebaseDB";
import { SelectList } from "react-native-dropdown-select-list";
import { updateHireData } from "../../store/actions/hireAction";
import { Ionicons } from "@expo/vector-icons";

const EditHire = ({ route, navigation }) => {
  const hireid = route.params.id;
  const availableHire = useSelector((state) => state.hires.filteredHires);
  const displayedHire = availableHire.find((hire) => hire.id == hireid);

  const displayedUsers = useSelector((state) => state.users.users);

  const [hireTitle, setHireTitle] = useState("");
  const [category, setCategory] = useState("");
  const [detail, setDetail] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [postData, setPostData] = useState(null);

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (displayedHire) {
      setHireTitle(displayedHire.hireTitle);
      setCategory(displayedHire.category);
      setDetail(displayedHire.detail);
      setEmail(displayedHire.email);
      setPhone(displayedHire.phone);
    }
  }, [displayedHire]);
  // console.log(displayedHire)
  const submitPost = async () => {
    // สร้างอ็อบเจกต์ที่เก็บข้อมูลที่คุณต้องการแก้ไข
    const updatedData = {
      hireTitle,
      detail,
      email,
      phone,
      category,
      // เพิ่มข้อมูลอื่น ๆ ที่คุณต้องการแก้ไข
    };

    try {
      // อัปเดตข้อมูลใน Firestore โดยใช้ `hireid` ของโพสต์ที่คุณต้องการแก้ไข
      const postRef = firebase.firestore().collection("HirePosts").doc(hireid);
      await postRef.update(updatedData);

      console.log("Post updated successfully");
      navigation.navigate("HireJobDetailScreen", { id: hireid });
    } catch (e) {
      console.error("Error updating data: ", e);
    }
  };
  const deletePost = async () => {
    try {
      // Delete the post document from Firestore
      await firebase.firestore().collection("HirePosts").doc(hireid).delete();

      // If there is an image associated with the post, delete it from storage
      if (imageUrl) {
        const imageRef = firebase.storage().refFromURL(imageUrl);
        await imageRef.delete();
      }

      console.log("Post deleted");
      navigation.navigate("HireJobScreen");
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const categorydata = [
    { key: "1", value: "งานบัญชี" },
    { key: "2", value: "งานทรัพยากรบุคคล" },
    { key: "3", value: "งานธนาคาร" },
    { key: "4", value: "งานสุขภาพ" },
    { key: "5", value: "งานก่อสร้าง" },
    { key: "6", value: "งานออกแบบ" },
    { key: "7", value: "งานไอที" },
    { key: "8", value: "งานการศึกษา" },
    { key: "9", value: "งานอาหาร" },
    { key: "10", value: "งานธรรมชาติ" },
    { key: "12", value: "งานทั่วไป" },
    { key: "12", value: "อื่นๆ" },
  ];
  // สร้างฟังก์ชันที่จะใช้ในการอัปเดตค่า category
  const handleCategoryChange = (selectedValue) => {
    setCategory(selectedValue);
  };
return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView 
          style={styles.container} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageHeader}>แก้ไขโพสต์หางาน</Text>

          {/* --- Section 1: ข้อมูลทั่วไป --- */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>ข้อมูลทั่วไป</Text>

            <Text style={styles.label}>หัวข้อโพสต์หางาน</Text>
            <TextInput
              style={styles.input}
              value={hireTitle}
              onChangeText={setHireTitle}
              placeholder="หัวข้องาน"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.label}>รายละเอียด</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={detail}
              onChangeText={setDetail}
              placeholder="รายละเอียดที่ต้องการแก้ไข..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={6}
            />

            <Text style={styles.label}>ประเภทงาน</Text>
            <SelectList
              setSelected={(val) => {
                const index = val; 
                if (index >= 0 && index < categorydata.length) {
                  setCategory(categorydata[index].value);
                }
              }}
              data={categorydata}
              placeholder="ประเภทของงาน"
              selectedValue={category}
              onValueChange={handleCategoryChange}
              boxStyles={styles.selectBox}
              dropdownStyles={styles.dropdownBox}
            />
          </View>

          {/* --- Section 2: ช่องทางติดต่อ --- */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>ช่องทางติดต่อ</Text>

            <Text style={styles.label}>อีเมล</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="example@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.label}>เบอร์โทรศัพท์</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="08X-XXX-XXXX"
              keyboardType="numeric"
              maxLength={10}
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* --- Section 3: Action Buttons (แก้ไข / ลบ) --- */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.submitButton} onPress={submitPost}>
              <Text style={styles.buttonText}>บันทึกการแก้ไข</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={deletePost}>
              <Text style={styles.buttonText}>ลบโพสต์</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  pageHeader: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#083C6B",
    marginBottom: 16,
    marginLeft: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A5568",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 15,
    color: "#333",
    marginBottom: 16,
  },
  textArea: {
    height: 120,
    paddingTop: 16,
    textAlignVertical: "top",
  },
  selectBox: {
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    height: 50,
    alignItems: "center",
    marginBottom: 8,
  },
  dropdownBox: {
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  // --- Button Styles ---
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  submitButton: {
    flex: 2, // กินพื้นที่ 2 ส่วน (ประมาณ 65%)
    backgroundColor: "#083C6B",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12, // เว้นระยะห่างระหว่างปุ่ม
    shadowColor: "#083C6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  deleteButton: {
    flex: 1, // กินพื้นที่ 1 ส่วน (ประมาณ 35%)
    backgroundColor: "#EF4444", // สีแดงแจ้งเตือน (Danger Red)
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EditHire;
