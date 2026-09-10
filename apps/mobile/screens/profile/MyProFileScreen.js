import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ImageBackground,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import firebase from '../../database/firebaseDB';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Ionicons } from "@expo/vector-icons";


const MyProfileScreen = ({ route, navigation }) => {
  //   const {step, title} = route.params;
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null);

  const initialEditData = {
    firstName: '',
    lastName: '',
    job: '',
    aboutme: '',
    email: '',
    phone: '',
    line: '',
    facebook: '',
    bachelor: '',
    master: '',
    doctoral: '',
    
  };

  const [editData, setEditData] = useState(initialEditData);
  const [image, setImage] = useState(null);
  const userId = firebase.auth().currentUser.uid;

  const pickImageAndUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your media library to pick an image.');
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      submitImg(result.assets[0].uri);

      }
    }
  };

  const submitImg = async (uploadUri) => {
    if (uploadUri) {
      let filename = uploadUri.substring(uploadUri.lastIndexOf('/') + 1);

      try {
        const response = await fetch(uploadUri);
        const blob = await response.blob();
        const uploadTask = firebase.storage().ref().child(`profiles/${filename}`).put(blob);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload is ${progress}% done`);
          },
          (error) => {
            console.error('Upload Error: ', error);
          },
          () => {
            uploadTask.snapshot.ref.getDownloadURL().then(async (downloadURL) => {
              const img = {
                imageUrl: downloadURL,
              };
              const userRef = firebase.firestore().collection('User Info').doc(userId);
              await userRef.update(img)
              .then(() => {
                console.log('อัพเดทข้อมูลสำเร็จ');
                getUserData();
              })
              .catch((error) => {
                console.error('เกิดข้อผิดพลาดในการอัพเดทข้อมูล:', error);
              });
            });
          }
        );
      } catch (e) {
        console.log(e);
      }
    } else {
      console.log('No image to upload');
    }
  };


  const startEditing = () => {
    setIsEditing(true);
    setEditData(userData || initialEditData);
  };

  const finishEditing = () => {
    setIsEditing(false);
    const updatedData = { ...editData };

    for (const key in updatedData) {
      if (!updatedData[key]) {
        updatedData[key] = "";
      }
    }

    firebase.firestore().collection('User Info').doc(userId).update(updatedData)
      .then(() => {
        console.log('อัพเดทข้อมูลสำเร็จ');
        getUserData();
      })
      .catch((error) => {
        console.error('เกิดข้อผิดพลาดในการอัพเดทข้อมูล:', error);
      });
  };

  const getUserData = () => {
    const userRef = firebase.firestore().collection("User Info").doc(userId);

    userRef.get()
      .then((doc) => {
        if (doc.exists) {
          setUserData(doc.data());
        } else {
          console.log("ไม่พบข้อมูลผู้ใช้");
        }
      })
      .catch((error) => {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้", error);
      });
  };

  useEffect(() => {
    getUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await firebase.auth().signOut();
      navigation.navigate("Login");
      // ออกจากระบบสำเร็จ
    } catch (error) {
      // ออกจากระบบไม่สำเร็จ
      console.error(error);
    }
  };

  

return (
    <ScrollView style={styles.safeArea}>
      {userData ? (
        <ScrollView 
          style={styles.container} 
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          
          <View style={styles.headerBackground}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileMainContainer}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: userData?.imageUrl || "https://ui-avatars.com/api/?name=User&background=E4E9F2&color=666"
                }}
                style={styles.avatarImage}
              />
              <TouchableOpacity style={styles.cameraButton} onPress={pickImageAndUpload}>
                <Ionicons name="camera" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.nameText}>{userData.firstName} {userData.lastName}</Text>
            <Text style={styles.jobText}>{userData.job || "ไม่ระบุอาชีพ"}</Text>

            <TouchableOpacity style={styles.editProfileBtn} onPress={startEditing}>
              <FontAwesome5 name="edit" size={14} color="#083C6B" />
              <Text style={styles.editProfileBtnText}>แก้ไขโปรไฟล์</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>เกี่ยวกับฉัน</Text>
            <Text style={styles.aboutMeText}>
              {userData.aboutme || "ยังไม่มีข้อมูลแนะนำตัว"}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>ช่องทางติดต่อ</Text>
            
            <View style={styles.infoRow}>
              <View style={styles.iconBox}><Ionicons name="mail" size={18} color="#083C6B" /></View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{userData.email || "-"}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.iconBox}><Ionicons name="call" size={18} color="#083C6B" /></View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{userData.phone || "-"}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.iconBox}><FontAwesome5 name="line" size={18} color="#083C6B" /></View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Line</Text>
                <Text style={styles.infoValue}>{userData.line || "-"}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.iconBox}><FontAwesome5 name="facebook-f" size={18} color="#083C6B" /></View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Facebook</Text>
                <Text style={styles.infoValue}>{userData.facebook || "-"}</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>การศึกษา</Text>
            
            <View style={styles.infoRow}>
              <View style={styles.iconBox}><Ionicons name="school" size={18} color="#083C6B" /></View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>ปริญญาตรี</Text>
                <Text style={styles.infoValue}>{userData.bachelor || "-"}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.iconBox}><Ionicons name="school" size={18} color="#083C6B" /></View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>ปริญญาโท</Text>
                <Text style={styles.infoValue}>{userData.master || "-"}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.iconBox}><Ionicons name="school" size={18} color="#083C6B" /></View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>ปริญญาเอก</Text>
                <Text style={styles.infoValue}>{userData.doctoral || "-"}</Text>
              </View>
            </View>
          </View>

        </ScrollView>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={{ color: "#666" }}>กำลังโหลดข้อมูล...</Text>
        </View>
      )}

      <Modal animationType="slide" transparent={true} visible={isEditing}>
        <View style={styles.modalBackground}>
          <View style={styles.modalView}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>แก้ไขโปรไฟล์</Text>
              <TouchableOpacity onPress={() => setIsEditing(false)}>
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              
              <Text style={styles.inputLabel}>ชื่อจริง</Text>
              <TextInput style={styles.textInput} placeholder="First Name" value={editData?.firstName} onChangeText={(text) => setEditData({ ...editData, firstName: text })} />

              <Text style={styles.inputLabel}>นามสกุล</Text>
              <TextInput style={styles.textInput} placeholder="Last Name" value={editData?.lastName} onChangeText={(text) => setEditData({ ...editData, lastName: text })} />

              <Text style={styles.inputLabel}>อาชีพ</Text>
              <TextInput style={styles.textInput} placeholder="Job" value={editData?.job} onChangeText={(text) => setEditData({ ...editData, job: text })} />

              <Text style={styles.inputLabel}>เกี่ยวกับฉัน (About Me)</Text>
              <TextInput style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]} multiline placeholder="About Me" value={editData?.aboutme} onChangeText={(text) => setEditData({ ...editData, aboutme: text })} />

              <Text style={styles.inputLabel}>Email</Text>
              <TextInput style={styles.textInput} placeholder="Email" value={editData?.email} onChangeText={(text) => setEditData({ ...editData, email: text })} />

              <Text style={styles.inputLabel}>เบอร์โทร</Text>
              <TextInput style={styles.textInput} placeholder="Phone" keyboardType="phone-pad" value={editData?.phone} onChangeText={(text) => setEditData({ ...editData, phone: text })} />

              <Text style={styles.inputLabel}>Line ID</Text>
              <TextInput style={styles.textInput} placeholder="Line ID" value={editData?.line} onChangeText={(text) => setEditData({ ...editData, line: text })} />

              <Text style={styles.inputLabel}>Facebook</Text>
              <TextInput style={styles.textInput} placeholder="Facebook URL/Name" value={editData?.facebook} onChangeText={(text) => setEditData({ ...editData, facebook: text })} />

              <Text style={styles.inputLabel}>ปริญญาตรี</Text>
              <TextInput style={styles.textInput} placeholder="Bachelor" value={editData?.bachelor} onChangeText={(text) => setEditData({ ...editData, bachelor: text })} />

              <Text style={styles.inputLabel}>ปริญญาโท</Text>
              <TextInput style={styles.textInput} placeholder="Master" value={editData?.master} onChangeText={(text) => setEditData({ ...editData, master: text })} />

              <Text style={styles.inputLabel}>ปริญญาเอก</Text>
              <TextInput style={styles.textInput} placeholder="Doctoral" value={editData?.doctoral} onChangeText={(text) => setEditData({ ...editData, doctoral: text })} />

              <TouchableOpacity style={styles.saveButton} onPress={finishEditing}>
                <Text style={styles.saveButtonText}>บันทึกข้อมูล</Text>
              </TouchableOpacity>
              
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // --- Header & Profile ---
  headerBackground: {
    backgroundColor: "#083C6B",
    height: 120,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 20,
    paddingRight: 20,
  },
  logoutButton: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
  },
  profileMainContainer: {
    alignItems: "center",
    marginTop: -60, // ดึงโปรไฟล์ให้ไปทับกับ Header ครึ่งนึง
    marginBottom: 20,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    backgroundColor: "#E4E9F2",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FF9800",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  nameText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  jobText: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 4,
  },
  editProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EBF8FF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  editProfileBtnText: {
    color: "#083C6B",
    fontWeight: "bold",
    marginLeft: 8,
  },
  // --- Cards ---
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#083C6B",
    marginBottom: 16,
  },
  aboutMeText: {
    fontSize: 15,
    color: "#4A5568",
    lineHeight: 24,
  },
  // --- Info Rows ---
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F0F4F8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  // --- Modal Styles ---
  modalBackground: {
    flex: 1,
    justifyContent: "flex-end", // ให้ Modal ดันขึ้นมาจากข้างล่าง
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "85%", // ไม่ให้เต็มจอ 100%
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A5568",
    marginBottom: 6,
    marginTop: 12,
  },
  textInput: {
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#E4E9F2",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  saveButton: {
    backgroundColor: "#083C6B",
    height: 54,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default MyProfileScreen;