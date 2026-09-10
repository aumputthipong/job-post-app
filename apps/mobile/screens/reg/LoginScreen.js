import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  Alert 
} from "react-native";
import firebase from '../../database/firebaseDB';
import { Ionicons } from "@expo/vector-icons";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    // Basic Validation
    if (!email || !password) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน");
      return;
    }

    try {
      await firebase.auth().signInWithEmailAndPassword(email.trim(), password);
      navigation.navigate("BottomTabNav");
    } catch (error) {
      console.error("Login Error:", error);
      Alert.alert("เข้าสู่ระบบไม่สำเร็จ", "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.headerTitle}>เข้าสู่ระบบ</Text>

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
              placeholder="กรอกรหัสผ่านของคุณ"
            />
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={22} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
          <Text style={styles.primaryButtonText}>เข้าสู่ระบบ</Text>
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>ยังไม่มีบัญชีใช่ไหม? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.linkText}>สมัครที่นี่</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#083C6B",
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
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
    marginTop: 20,
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

export default LoginScreen;