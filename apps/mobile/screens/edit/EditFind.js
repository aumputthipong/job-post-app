import React, { useState, useEffect } from "react";
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
  ScrollView
  ,KeyboardAvoidingView,
  SafeAreaView,
  
} from "react-native";
import { useSelector } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import firebase from "../../database/firebaseDB";
import { SelectList } from "react-native-dropdown-select-list";
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Ionicons } from "@expo/vector-icons";

const EditFind = ({ route, navigation }) => {
  const postId = route.params.id;
  const availableJob = useSelector((state) => state.jobs.filteredJobs);
  const displayedJob = availableJob.find(job => job.id == postId);
console.log(imageUrl)
  const [jobTitle, setJobTitle] = useState("");
  const [position, setPosition] = useState("");
  const [agency, setAgency] = useState("");
  const [attributes, setAttributes] = useState([]);
  const [category, setCategory] = useState("");
  const [detail, setDetail] = useState("");
  const [email, setEmail] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [phone, setPhone] = useState("");
  const [wage, setWage] = useState("");
  const [welfareBenefits, setWelfareBenefits] = useState([]);
  const [imageUrl, setImageUrl] = useState([]);


  useEffect(() => {
    if (displayedJob) {
      setJobTitle(displayedJob.jobTitle);
      setPosition(displayedJob.position);
      setAgency(displayedJob.agency);
      setAttributes(displayedJob.attributes);
      setCategory(displayedJob.category);
      setDetail(displayedJob.detail);
      setEmail(displayedJob.email);
      setEmploymentType(displayedJob.employmentType);
      setPhone(displayedJob.phone);
      setWage(displayedJob.wage);
      setWelfareBenefits(displayedJob.welfareBenefits);
      setImageUrl(displayedJob.imageUrl)
      
    }
  }, [displayedJob]);
 
  const submitPost = async () => {
  // สร้างอ็อบเจกต์ที่เก็บข้อมูลที่คุณต้องการแก้ไข
  const updatedData = {
    jobTitle,
    position,
    agency,
    attributes,
    welfareBenefits,
    wage,
    category,
    employmentType,
    email,
    detail,
    phone,
    // เพิ่มข้อมูลอื่น ๆ ที่คุณต้องการแก้ไข
  };

  try {
    // อัปเดตข้อมูลใน Firestore โดยใช้ `docId` ของโพสต์ที่คุณต้องการแก้ไข
    const postRef = firebase.firestore().collection("JobPosts").doc(postId);
    await postRef.update(updatedData);

    console.log("Post updated successfully");
    navigation.navigate("FindJobDetailScreen",{id:postId});
  } catch (e) {
    console.error("Error updating data: ", e);
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
  const deletePost = async () => {
    try {
      // Delete the post document from Firestore
      await firebase.firestore().collection("JobPosts").doc(postId).delete();
  
      // If there is an image associated with the post, delete it from storage
      if (imageUrl) {
        const imageRef = firebase.storage().refFromURL(imageUrl);
        await imageRef.delete();
      }
  
      console.log("Post deleted");
      navigation.navigate("FindJobScreen");
    } catch (error) {
      console.error("Error deleting post:", error);
    }
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
          <Text style={styles.pageHeader}>แก้ไขประกาศงาน</Text>

          {/* --- Section 1: ข้อมูลพื้นฐาน --- */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>ข้อมูลพื้นฐาน</Text>
            
            <Text style={styles.label}>หัวข้องาน</Text>
            <TextInput
              style={styles.input}
              value={jobTitle}
              onChangeText={setJobTitle}
              placeholder="หัวข้องาน"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.label}>ตำแหน่งที่รับ</Text>
            <TextInput
              style={styles.input}
              value={position}
              onChangeText={setPosition}
              placeholder="ตำแหน่ง/อาชีพ"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.label}>บริษัท / หน่วยงาน</Text>
            <TextInput
              style={styles.input}
              value={agency}
              onChangeText={setAgency}
              placeholder="บริษัท"
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* --- Section 2: รายละเอียดงาน --- */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>รายละเอียดงาน</Text>
            
            <Text style={styles.label}>รายละเอียด</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={detail}
              onChangeText={setDetail}
              placeholder="รายละเอียดงานที่ต้องการแก้ไข"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={8}
              maxLength={500}
            />

            <Text style={styles.label}>ประเภทงาน</Text>
            <SelectList
              setSelected={(val) => setCategory(val)}
              data={categorydata}
              placeholder="ประเภทของงาน"
              save="value"
              boxStyles={styles.selectBox}
              dropdownStyles={styles.dropdownBox}
            />

            <Text style={[styles.label, { marginTop: 16 }]}>ประเภทการจ้าง</Text>
            <SelectList
              setSelected={(val) => setEmploymentType(val)}
              data={emptypedata}
              placeholder="ประเภทการจ้าง"
              save="value"
              boxStyles={styles.selectBox}
              dropdownStyles={styles.dropdownBox}
            />

            <Text style={[styles.label, { marginTop: 16 }]}>ค่าจ้าง (บาท)</Text>
            <TextInput
              style={styles.input}
              value={wage}
              onChangeText={setWage}
              placeholder="บาท"
              keyboardType="numeric"
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* --- Section 3: คุณสมบัติ & สวัสดิการ --- */}
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
              placeholder="อีเมล"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.label}>เบอร์โทรศัพท์</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="เบอร์โทร"
              keyboardType="numeric"
              maxLength={10}
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* --- Section 5: Action Buttons --- */}
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
    height: 140,
    paddingTop: 16,
    textAlignVertical: "top",
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
    alignItems: "flex-start",
  },
  flexInput: {
    flex: 1,
    marginBottom: 0, 
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
  // --- Button Styles ---
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  submitButton: {
    flex: 2, 
    backgroundColor: "#083C6B",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#083C6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  deleteButton: {
    flex: 1, 
    backgroundColor: "#EF4444", 
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
export default EditFind;
