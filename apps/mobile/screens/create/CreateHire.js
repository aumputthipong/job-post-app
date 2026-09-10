import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import firebase from "../../database/firebaseDB";
import { SelectList } from "react-native-dropdown-select-list";
import { Ionicons } from "@expo/vector-icons";

const CreateHire = ({ route, navigation }) => {
  const [hireTitle, setHireTitle] = useState("");
  const [category, setCategory] = useState("");
  const [detail, setDetail] = useState("");
  const [email, setEmail] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [phone, setPhone] = useState("");


  const [uploading, setUploading] = useState(false);

  const [image, setImage] = useState(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please allow access to your media library to pick an image."
      );
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [210, 297], // สัดส่วนของ A4
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    }
  };

  const submitPost = async () => {
    const uploadUri = image;
    if (uploadUri) {
      let filename = uploadUri.substring(uploadUri.lastIndexOf("/") + 1);

      try {
        const response = await fetch(uploadUri);
        const blob = await response.blob();
        const uploadTask = firebase
          .storage()
          .ref()
          .child(`images/${filename}`)
          .put(blob);
        // abcdes
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Handle upload progress if needed
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload is ${progress}% done`);
          },
          (error) => {
            // Handle upload error
            console.error("Upload Error: ", error);
          },
          () => {
            // Upload completed successfully, get the download URL
            uploadTask.snapshot.ref
              .getDownloadURL()
              .then(async (downloadURL) => {
                // Save the download URL to Firestore or use it as needed
                const postById = firebase.auth().currentUser.uid;
                console.log("File available at", downloadURL);
                const post = {
                  hireTitle,
                  resumeUrl: downloadURL,
                  category,
                  detail,
                  postById,
                  phone,
                  email,
                  createdAt: new Date(), 
                  // เพิ่มข้อมูลอื่น ๆ ที่คุณต้องการใน post object
                };
                const postRef = firebase.firestore().collection("HirePosts");
                const docRef = await postRef.add(post);
                console.log("Post created with ID: ", docRef.id);
                navigation.navigate("HireJobScreen");
              });
          }
        );
      } catch (e) {
        console.log(e);
      }
    } else {
      console.log("No image to upload");
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
          <Text style={styles.pageHeader}>ลงประกาศรับจ้าง / ฟรีแลนซ์</Text>

          {/* --- Section 1: ข้อมูลโพสต์ --- */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>ข้อมูลทั่วไป</Text>

            <Text style={styles.label}>หัวข้อโพสต์หางาน</Text>
            <TextInput
              style={styles.input}
              value={hireTitle}
              onChangeText={setHireTitle}
              placeholder="เช่น รับทำเว็บไซต์ Frontend"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.label}>รายละเอียด</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={detail}
              onChangeText={setDetail}
              placeholder="อธิบายทักษะ ประสบการณ์ และรายละเอียดการรับงาน..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={5}
            />

            <Text style={styles.label}>ประเภทงาน</Text>
            <SelectList
              setSelected={(val) => setCategory(val)}
              data={categorydata}
              placeholder="เลือกประเภทงาน"
              save="value"
              boxStyles={styles.selectBox}
              dropdownStyles={styles.dropdownBox}
            />
          </View>

          {/* --- Section 2: เรซูเม่ / ผลงาน --- */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>เรซูเม่ / ภาพผลงาน</Text>
            
            <TouchableOpacity 
              style={styles.imagePickerBtn} 
              onPress={pickImage} 
              activeOpacity={0.8}
            >
              {image ? (
                <Image source={{ uri: image }} style={styles.previewImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="document-text-outline" size={32} color="#94A3B8" />
                  <Text style={styles.imagePlaceholderText}>แตะเพื่ออัปโหลดรูปเรซูเม่</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* --- Section 3: ช่องทางติดต่อ --- */}
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

          {/* --- Submit Button --- */}
          <TouchableOpacity style={styles.submitButton} onPress={submitPost}>
            <Text style={styles.submitButtonText}>สร้างโพสต์</Text>
          </TouchableOpacity>

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
    height: 100,
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
  // --- Image Picker ---
  imagePickerBtn: {
    width: "100%",
    height: 200, // ปรับให้สูงขึ้นเล็กน้อยสำหรับสัดส่วนเรซูเม่ (A4 แนวตั้ง)
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  imagePlaceholder: {
    alignItems: "center",
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: "#94A3B8",
    fontSize: 14,
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover", // เปลี่ยนจาก stretch เป็น cover เพื่อไม่ให้ภาพเสียสัดส่วน
  },
  // --- Submit Button ---
  submitButton: {
    backgroundColor: "#083C6B",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#083C6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
export default CreateHire;
