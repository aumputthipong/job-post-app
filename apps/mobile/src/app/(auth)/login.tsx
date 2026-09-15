import { loginSchema } from "@jobapp-platform/shared";
import { Link } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fieldErrors, PrimaryButton, TextField } from "@/components/form";
import { authErrorMessage } from "@/lib/auth-context";
import { auth } from "@/lib/firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const edit = (field: string, setter: (value: string) => void) => (value: string) => {
    setter(value);
    setErrors(({ [field]: _, ...rest }) => rest);
  };

  async function submit() {
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error.issues));
      return;
    }
    setErrors({});
    setFormError(null);
    setLoading(true);
    try {
      // On success the route guard in _layout.tsx moves us into the app.
      await signInWithEmailAndPassword(auth, parsed.data.email, parsed.data.password);
    } catch (error) {
      setFormError(authErrorMessage(error));
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerClassName="flex-grow justify-center px-8 py-10" keyboardShouldPersistTaps="handled">
          <Text className="text-3xl font-bold text-text">เข้าสู่ระบบ</Text>
          <Text className="mb-10 mt-1 text-base text-text-subtle">ยินดีต้อนรับกลับมา</Text>

          <TextField
            label="อีเมล"
            value={email}
            onChangeText={edit("email", setEmail)}
            keyboardType="email-address"
            placeholder="example@email.com"
            error={errors.email}
          />
          <TextField
            label="รหัสผ่าน"
            value={password}
            onChangeText={edit("password", setPassword)}
            placeholder="กรอกรหัสผ่านของคุณ"
            secret
            error={errors.password}
          />

          {formError ? <Text className="mb-4 text-center text-danger">{formError}</Text> : null}

          <View className="mt-2">
            <PrimaryButton title="เข้าสู่ระบบ" onPress={submit} loading={loading} />
          </View>

          <View className="mt-6 flex-row justify-center">
            <Text className="text-text-muted">ยังไม่มีบัญชีใช่ไหม? </Text>
            <Link href="/register" replace asChild>
              <TouchableOpacity>
                <Text className="font-bold text-primary underline">สมัครที่นี่</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
