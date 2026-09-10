import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";

import {
  View,
  Text,
  Button,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Alert,
  FlatList,
  ScrollView
} from "react-native";
// import { ScrollView } from 'react-native-virtualized-view'
import * as ImagePicker from "expo-image-picker";
import firebase from "../../database/firebaseDB";
import { SelectList } from "react-native-dropdown-select-list";
import FontAwesome from 'react-native-vector-icons/FontAwesome';
// Now you can use Firebase services in your component

const CreateFind = ({ route, navigation }) => {
  const [jobTitle, setJobTitle] = useState("");
  const [position, setPosition] = useState("");
  const [agency, setAgency] = useState("");
  const [attributes, setAttributes] = useState([]);
  const [category, setCategory] = useState("");
  const [detail, setDetail] = useState("");
  const [email, setEmail] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [wage, setWage] = useState("");
  const [welfareBenefits, setWelfareBenefits] = useState([]);


  const [uploading, setUploading] = useState(false);
  const [image, setImage] = useState(null);
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "ต้องการสิทธิ์การเข้าถึง",
        "โปรดอนุญาติการเข้าถึงไฟล์รูปรูปภาพในเครื่องของคุณ."
      );
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
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
                  jobTitle,
                  position,
                  agency,
                  attributes,
                  welfareBenefits,
                  imageUrl: downloadURL,
                  wage,
                  detail,
                  category,
                  employmentType,
                  email,
                  phone,
                  postById,
                  createdAt: new Date(), 
                  // เพิ่มข้อมูลอื่น ๆ ที่คุณต้องการใน post object
                };
                const postRef = firebase.firestore().collection("JobPosts");
                const docRef = await postRef.add(post);
                console.log("Post created with ID: ", docRef.id);
                navigation.navigate("FindJobScreen");
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
  const emptypedata = [
    { key: "1", value: "รายเดือน" },
    { key: "2", value: "รายวัน" },
    { key: "3", value: "ต่อชิ้นงาน" },
  ];
  // สำหรับใส่attribute
  const [inputText, setInputText] = useState("");
  // welfareBenefit
  const [inputText2, setInputText2] = useState("");
  const attriAdd = () => {
    if (inputText.trim() !== "") {
      setAttributes([...attributes, inputText]);
      setInputText(""); // ล้าง TextInput
    }
  };
  const attriDel = (index) => {
    const newData = [...attributes];
    newData.splice(index, 1);
    setAttributes(newData);
  };

  const benefitAdd = () => {
    if (inputText2.trim() !== "") {
      setWelfareBenefits([...welfareBenefits, inputText2]);
      setInputText2(""); // ล้าง TextInput
    }
  };
  const BenefitDel = (index) => {
    const newData = [...welfareBenefits];
    newData.splice(index, 1);
    setWelfareBenefits(newData);
  };
return (
    <ScrollView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView 
          style={styles.container} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* --- หัวข้อหน้าจอ --- */}
          <Text style={styles.pageHeader}>สร้างประกาศงาน</Text>

          {/* --- Section 1: ข้อมูลพื้นฐาน --- */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>ข้อมูลพื้นฐาน</Text>
            
            <Text style={styles.label}>หัวข้องาน</Text>
            <TextInput
              style={styles.input}
              value={jobTitle}
              onChangeText={setJobTitle}
              placeholder="เช่น รับสมัคร Frontend Developer"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.label}>ตำแหน่งที่รับ</Text>
            <TextInput
              style={styles.input}
              value={position}
              onChangeText={setPosition}
              placeholder="เช่น โปรแกรมเมอร์"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.label}>บริษัท / หน่วยงาน</Text>
            <TextInput
              style={styles.input}
              value={agency}
              onChangeText={setAgency}
              placeholder="ชื่อบริษัทของคุณ"
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* --- Section 2: รายละเอียดงาน & รูปภาพ --- */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>รายละเอียดงาน</Text>
            
            <Text style={styles.label}>รายละเอียด</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={detail}
              onChangeText={setDetail}
              placeholder="อธิบายรายละเอียดงาน หน้าที่ความรับผิดชอบ..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={6}
            />

            <Text style={styles.label}>ประเภทงาน</Text>
            {/* หมายเหตุ: อาจจะต้องปรับ boxStyles ตาม Library SelectList ที่คุณใช้ */}
            <SelectList
              setSelected={(val) => setCategory(val)}
              data={categorydata}
              placeholder="เลือกประเภทงาน"
              save="value"
              boxStyles={styles.selectBox}
              dropdownStyles={styles.dropdownBox}
            />

            <Text style={[styles.label, { marginTop: 16 }]}>ประเภทการจ้าง</Text>
            <SelectList
              setSelected={(val) => setEmploymentType(val)}
              data={emptypedata}
              placeholder="เลือกประเภทการจ้าง"
              save="value"
              boxStyles={styles.selectBox}
              dropdownStyles={styles.dropdownBox}
            />

            <Text style={[styles.label, { marginTop: 16 }]}>ค่าจ้าง (บาท)</Text>
            <TextInput
              style={styles.input}
              value={wage}
              onChangeText={setWage}
              placeholder="เช่น 15000"
              keyboardType="numeric"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.label}>รูปภาพประกาศงาน</Text>
            <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage} activeOpacity={0.8}>
              {image ? (
                <Image source={{ uri: image }} style={styles.previewImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="image-outline" size={32} color="#94A3B8" />
                  <Text style={styles.imagePlaceholderText}>แตะเพื่อเพิ่มรูปภาพ</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* --- Section 3: คุณสมบัติ & สวัสดิการ (Dynamic Lists) --- */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>คุณสมบัติผู้สมัคร</Text>
            {attributes.map((attribute, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listItemText} numberOfLines={2}>
                  {index + 1}. {attribute}
                </Text>
                <TouchableOpacity onPress={() => attriDel(index)} style={styles.deleteIconBtn}>
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.addRow}>
              <TextInput
                style={[styles.input, styles.flexInput]}
                placeholder="เพิ่มคุณสมบัติ..."
                value={inputText}
                onChangeText={setInputText}
                placeholderTextColor="#94A3B8"
              />
              <TouchableOpacity style={styles.addButton} onPress={attriAdd}>
                <Ionicons name="add" size={20} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>สวัสดิการ</Text>
            {welfareBenefits.map((welfare, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listItemText} numberOfLines={2}>
                  {index + 1}. {welfare}
                </Text>
                <TouchableOpacity onPress={() => BenefitDel(index)} style={styles.deleteIconBtn}>
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.addRow}>
              <TextInput
                style={[styles.input, styles.flexInput]}
                placeholder="เพิ่มสวัสดิการ..."
                value={inputText2}
                onChangeText={setInputText2}
                placeholderTextColor="#94A3B8"
              />
              <TouchableOpacity style={styles.addButton} onPress={benefitAdd}>
                <Ionicons name="add" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* --- Section 4: ช่องทางติดต่อ --- */}
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
            <Text style={styles.submitButtonText}>สร้างโพสต์ประกาศงาน</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </ScrollView>
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
    // Shadow
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
    paddingTop: 16, // จำเป็นสำหรับ multiline ใน iOS
    textAlignVertical: "top", // จำเป็นสำหรับ Android
  },
  selectBox: {
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    height: 50,
    alignItems: "center",
  },
  dropdownBox: {
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  // --- Image Picker ---
  imagePickerBtn: {
    width: "100%",
    height: 180,
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 16,
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
    resizeMode: "cover",
  },
  // --- Dynamic Lists (Attributes & Welfare) ---
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EBF8FF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  listItemText: {
    flex: 1,
    color: "#083C6B",
    fontSize: 14,
  },
  deleteIconBtn: {
    padding: 4,
    marginLeft: 8,
  },
  addRow: {
    flexDirection: "row",
    alignItems: "flex-start", // อิงตามความสูงของ Input
  },
  flexInput: {
    flex: 1,
    marginBottom: 0, // เอา Margin ล่างออกเพราะจะไปใช้ Margin ของ Card แทน
  },
  addButton: {
    backgroundColor: "#083C6B",
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 20,
  },
  // --- Submit Button ---
  submitButton: {
    backgroundColor: "#083C6B",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    // Shadow
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
export default CreateFind;
