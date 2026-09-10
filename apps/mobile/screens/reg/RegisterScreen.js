import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  Alert,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import firebase from '../../database/firebaseDB';
import { Ionicons } from "@expo/vector-icons";

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegistration = async () => {
    // 1. Validation ก่อนส่งข้อมูลไป Firebase
    if (!email || !firstName || !lastName || !password || !confirmPassword) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("แจ้งเตือน", "รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    if (password.length < 6) {
      Alert.alert("แจ้งเตือน", "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    try {
      // 2. เมื่อผ่านการตรวจสอบทั้งหมด ค่อยสร้าง User
      const response = await firebase.auth().createUserWithEmailAndPassword(email.trim(), password);
      
      if (response.user) {
        const userRef = {
          email: email.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        };
        
        await firebase.firestore().collection("User Info").doc(response.user.uid).set(userRef);
        Alert.alert("สำเร็จ", "สมัครสมาชิกเรียบร้อยแล้ว", [
          { text: "ตกลง", onPress: () => navigation.navigate("Login") }
        ]);
      }
    } catch (error) {
      console.error("Registration Error:", error);
      Alert.alert("เกิดข้อผิดพลาด", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.headerTitle}>สร้างบัญชีใหม่</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ชื่อจริง</Text>
            <TextInput
              style={styles.input}
              autoCorrect={false}
              onChangeText={setFirstName}
              value={firstName}
              placeholder="ชื่อจริง"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>นามสกุล</Text>
            <TextInput
              style={styles.input}
              autoCorrect={false}
              onChangeText={setLastName}
              value={lastName}
              placeholder="นามสกุล"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>อีเมล</Text>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={setEmail}
              value={email}
              placeholder="example@email.com"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>รหัสผ่าน</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={!showPassword}
                onChangeText={setPassword}
                value={password}
                placeholder="อย่างน้อย 6 ตัวอักษร"
              />
              <TouchableOpacity style={styles.iconButton} onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={22} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ยืนยันรหัสผ่าน</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={!showConfirmPassword}
                onChangeText={setConfirmPassword}
                value={confirmPassword}
                placeholder="กรอกรหัสผ่านอีกครั้ง"
              />
              <TouchableOpacity style={styles.iconButton} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons name={showConfirmPassword ? 'eye' : 'eye-off'} size={22} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleRegistration}>
            <Text style={styles.primaryButtonText}>ลงทะเบียน</Text>
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>มีบัญชีอยู่แล้ว? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.linkText}>เข้าสู่ระบบ</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingVertical: 40,
    flexGrow: 1,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#083C6B",
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    height: 50,
    backgroundColor: "#F5F7FA",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E4E9F2",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E4E9F2",
    height: 50,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  iconButton: {
    padding: 12,
  },
  primaryButton: {
    backgroundColor: "#083C6B",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 20,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  footerText: {
    fontSize: 15,
    color: "#666",
  },
  linkText: {
    fontSize: 15,
    color: "#083C6B",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});

export default RegisterScreen;