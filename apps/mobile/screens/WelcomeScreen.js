import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  SafeAreaView 
} from "react-native";

const WelcomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.imageContainer}>
          <Image 
            style={styles.logo}
            source={require("../assets/welcomelogo.png")}
          />
        </View>

        <View style={styles.headerTextContainer}>
          <Text style={styles.brandTitle}>Job Search</Text>
          <Text style={styles.brandSubtitle}>Application</Text>
        </View>

        {/* Action Section */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.primaryButtonText}>เข้าสู่ระบบ</Text>
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>ยังไม่มีบัญชีใช่ไหม? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.linkText}>สมัครสมาชิกที่นี่</Text>
            </TouchableOpacity>
          </View>
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
  imageContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 280,
    height: 280,
    resizeMode: "contain", // ปรับจาก stretch เป็น contain เพื่อไม่ให้ภาพเบี้ยว
  },
  headerTextContainer: {
    marginBottom: 50,
  },
  brandTitle: {
    fontSize: 42,
    fontWeight: "800",
    color: "#083C6B",
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 42,
    fontWeight: "300",
    color: "#083C6B",
    marginTop: -10,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#083C6B",
    width: "100%",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4, // Shadow สำหรับ Android
    shadowColor: "#000", // Shadow สำหรับ iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  footerRow: {
    flexDirection: "row",
    marginTop: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 15,
    color: "#666",
  },
  linkText: {
    fontSize: 15,
    color: "#083C6B",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});

export default WelcomeScreen;