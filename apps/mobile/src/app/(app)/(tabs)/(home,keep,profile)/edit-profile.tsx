import { updateUserProfileSchema } from "@jobapp-platform/shared";
import { router } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Alert, Text, View } from "react-native";
import { fieldErrors, FormScrollView, FormSection, PrimaryButton, TextField } from "@/components/form";
import { ActionBar, EmptyState, ErrorState, Loading } from "@/components/ui";
import { colors } from "@/lib/colors";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { type UserDoc, useUser } from "@/lib/data";

const FIELDS = [
  "firstName",
  "lastName",
  "job",
  "aboutme",
  "phone",
  "line",
  "facebook",
  "bachelor",
  "master",
  "doctoral",
  "companyName",
  "companyLocation",
  "companyEmail",
  "companyPhone",
] as const;
type Field = (typeof FIELDS)[number];

export default function EditProfile() {
  const { user } = useAuth();
  const { data: profile, loading, error } = useUser(user?.uid);

  if (error) return <ErrorState error={error} />;
  if (loading) return <Loading />;
  if (!profile) return <EmptyState icon="person-outline" message="ไม่พบโปรไฟล์ของคุณ" />;
  return <ProfileForm profile={profile} />;
}

function ProfileForm({ profile }: { profile: UserDoc }) {
  const [values, setValues] = useState(
    () => Object.fromEntries(FIELDS.map((f) => [f, profile[f] ?? ""])) as Record<Field, string>,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const field = (name: Field) => ({
    value: values[name],
    error: errors[name],
    onChangeText: (text: string) => {
      setValues((v) => ({ ...v, [name]: text }));
      setErrors(({ [name]: _, ...rest }) => rest);
    },
  });

  const save = async () => {
    const parsed = updateUserProfileSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error.issues));
      return;
    }
    setSaving(true);
    try {
      await api.updateMe(parsed.data);
      router.back();
    } catch (e) {
      Alert.alert("บันทึกไม่สำเร็จ", (e as Error).message);
      setSaving(false);
    }
  };

  // One page rather than steps: people come here to change a field or two, not to fill it all in.
  // Sections run from what everyone fills to what only posters need; save stays in reach below.
  return (
    <View className="flex-1 bg-background">
      <FormScrollView footerBelow>
        <FormSection title="ข้อมูลทั่วไป" icon="person-outline">
          <TextField label="ชื่อจริง" required {...field("firstName")} autoCapitalize="words" />
          <TextField label="นามสกุล" required {...field("lastName")} autoCapitalize="words" />
          <TextField label="อาชีพ / ตำแหน่ง" placeholder="เช่น Graphic Designer" {...field("job")} autoCapitalize="words" />
          <TextField label="เกี่ยวกับฉัน" placeholder="แนะนำตัวสั้นๆ" {...field("aboutme")} multiline autoCapitalize="sentences" />
        </FormSection>

        <FormSection title="ช่องทางติดต่อ" icon="call-outline">
          <View className="mb-5">
            <Text className="mb-2 text-[15px] font-semibold text-text">อีเมล</Text>
            <View className="h-[50px] flex-row items-center rounded-xl border border-border bg-border/40 px-4">
              <Text className="flex-1 text-base text-text-muted" numberOfLines={1}>{profile.email}</Text>
              <Ionicons name="lock-closed-outline" size={16} color={colors.text.subtle} />
            </View>
            <Text className="mt-1.5 text-xs text-text-subtle">ใช้เข้าสู่ระบบ แก้ไขที่นี่ไม่ได้</Text>
          </View>
          <TextField label="เบอร์โทรศัพท์" placeholder="08X-XXX-XXXX" {...field("phone")} keyboardType="phone-pad" maxLength={10} />
          <TextField label="Line ID" {...field("line")} />
          <TextField label="Facebook" placeholder="ชื่อหรือลิงก์" {...field("facebook")} />
        </FormSection>

        <FormSection title="การศึกษา" icon="school-outline">
          <TextField label="ปริญญาตรี" placeholder="สาขา / มหาวิทยาลัย" {...field("bachelor")} autoCapitalize="words" />
          <TextField label="ปริญญาโท" {...field("master")} autoCapitalize="words" />
          <TextField label="ปริญญาเอก" {...field("doctoral")} autoCapitalize="words" />
        </FormSection>

        <FormSection title="ข้อมูลบริษัท" icon="business-outline" description="สำหรับผู้ลงประกาศงาน · ระบบจะกรอกให้อัตโนมัติตอนสร้างประกาศ">
          <TextField label="ชื่อบริษัท / หน่วยงาน" placeholder="เช่น บริษัท ไทยเทค จำกัด" {...field("companyName")} autoCapitalize="words" />
          <TextField label="ที่ตั้ง" placeholder="เช่น สาทร กรุงเทพมหานคร" {...field("companyLocation")} autoCapitalize="sentences" />
          <TextField label="อีเมลฝ่ายบุคคล" placeholder="hr@company.com" {...field("companyEmail")} keyboardType="email-address" />
          <TextField label="เบอร์ติดต่อบริษัท" placeholder="02X-XXX-XXXX" {...field("companyPhone")} keyboardType="phone-pad" maxLength={10} />
        </FormSection>

        {Object.keys(errors).length ? <Text className="text-center text-danger">กรุณาแก้ข้อมูลที่ไม่ถูกต้อง</Text> : null}
      </FormScrollView>
      <ActionBar>
        <View className="flex-1">
          <PrimaryButton title="บันทึก" icon="checkmark" onPress={save} loading={saving} />
        </View>
      </ActionBar>
    </View>
  );
}
