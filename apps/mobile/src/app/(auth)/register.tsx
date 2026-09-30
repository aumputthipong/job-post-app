import { registerSchema } from "@jobapp-platform/shared";
import { Link } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fieldErrors, PrimaryButton, TextField } from "@/components/form";
import { api, ApiError } from "@/lib/api";
import { authErrorMessage } from "@/lib/auth-context";
import { auth } from "@/lib/firebase";

const initialForm = { firstName: "", lastName: "", email: "", password: "", confirmPassword: "" };

export default function Register() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (field: keyof typeof initialForm) => (value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors(({ [field]: _, ...rest }) => rest);
  };

  async function submit() {
    const { confirmPassword, ...input } = form;
    const parsed = registerSchema.safeParse(input);
    const nextErrors = parsed.success ? {} : fieldErrors(parsed.error.issues);
    if (confirmPassword !== form.password) nextErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
    setErrors(nextErrors);
    if (!parsed.success || nextErrors.confirmPassword) return;

    setFormError(null);
    setLoading(true);
    try {
      // The API creates the account and its profile together (see apps/api
      // routes/auth.ts); signing in afterwards lets the route guard take over.
      await api.register(parsed.data);
      await signInWithEmailAndPassword(auth, parsed.data.email, parsed.data.password);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setErrors({ email: error.message });
      } else {
        setFormError(error instanceof ApiError ? error.message : authErrorMessage(error));
      }
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerClassName="px-8 py-10" keyboardShouldPersistTaps="handled">
          <Text className="text-3xl font-bold text-text">สร้างบัญชีใหม่</Text>
          <Text className="mb-8 mt-1 text-base text-text-subtle">ใช้เวลาไม่ถึงนาที กรอกให้ครบทุกช่อง</Text>

          <TextField label="ชื่อ" value={form.firstName} onChangeText={set("firstName")} autoCapitalize="words" error={errors.firstName} />
          <TextField label="นามสกุล" value={form.lastName} onChangeText={set("lastName")} autoCapitalize="words" error={errors.lastName} />
          <TextField
            label="อีเมล"
            value={form.email}
            onChangeText={set("email")}
            keyboardType="email-address"
            placeholder="example@email.com"
            error={errors.email}
          />
          <TextField
            label="รหัสผ่าน"
            value={form.password}
            onChangeText={set("password")}
            placeholder="อย่างน้อย 6 ตัวอักษร"
            secret
            error={errors.password}
          />
          <TextField
            label="ยืนยันรหัสผ่าน"
            value={form.confirmPassword}
            onChangeText={set("confirmPassword")}
            secret
            error={errors.confirmPassword}
          />

          {formError ? <Text className="mb-4 text-center text-danger">{formError}</Text> : null}

          <View className="mt-2">
            <PrimaryButton title="สมัครสมาชิก" onPress={submit} loading={loading} />
          </View>

          <View className="mt-6 flex-row justify-center">
            <Text className="text-text-muted">มีบัญชีอยู่แล้ว? </Text>
            <Link href="/login" replace asChild>
              <TouchableOpacity>
                <Text className="font-bold text-primary-dark underline">เข้าสู่ระบบ</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
