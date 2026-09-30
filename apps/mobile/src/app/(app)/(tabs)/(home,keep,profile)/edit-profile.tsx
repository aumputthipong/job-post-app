import { updateUserProfileSchema } from "@jobapp-platform/shared";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Text } from "react-native";
import { fieldErrors, FormScrollView, FormSection, SubmitButton, TextField } from "@/components/form";
import { EmptyState, ErrorState, Loading } from "@/components/ui";
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

  return (
    <FormScrollView>
      <FormSection title="ข้อมูลทั่วไป" icon="person-outline">
        <TextField label="ชื่อจริง" required {...field("firstName")} autoCapitalize="words" />
        <TextField label="นามสกุล" required {...field("lastName")} autoCapitalize="words" />
        <TextField label="อาชีพ / ตำแหน่ง" placeholder="เช่น Graphic Designer" {...field("job")} autoCapitalize="words" />
        <TextField label="เกี่ยวกับฉัน" placeholder="แนะนำตัวสั้นๆ" {...field("aboutme")} multiline autoCapitalize="sentences" />
      </FormSection>

      <FormSection title="ข้อมูลบริษัท" icon="business-outline" description="ไม่บังคับ · ใช้กรอกให้อัตโนมัติเมื่อลงประกาศงาน">
        <TextField label="ชื่อบริษัท / หน่วยงาน" placeholder="เช่น บริษัท ไทยเทค จำกัด" {...field("companyName")} autoCapitalize="words" />
        <TextField label="ที่ตั้ง" placeholder="เช่น สาทร กรุงเทพมหานคร" {...field("companyLocation")} autoCapitalize="sentences" />
        <TextField label="อีเมลฝ่ายบุคคล" placeholder="hr@company.com" {...field("companyEmail")} keyboardType="email-address" />
        <TextField label="เบอร์ติดต่อบริษัท" placeholder="02X-XXX-XXXX" {...field("companyPhone")} keyboardType="phone-pad" maxLength={10} />
      </FormSection>

      <FormSection title="ช่องทางติดต่อ" icon="call-outline">
        <Text className="mb-2 font-medium text-text">อีเมล</Text>
        <Text className="mb-5 text-base text-text-subtle">{profile.email} (ใช้เข้าสู่ระบบ แก้ไขที่นี่ไม่ได้)</Text>
        <TextField label="เบอร์โทรศัพท์" placeholder="08X-XXX-XXXX" {...field("phone")} keyboardType="phone-pad" maxLength={10} />
        <TextField label="Line ID" {...field("line")} />
        <TextField label="Facebook" placeholder="ชื่อหรือลิงก์" {...field("facebook")} />
      </FormSection>

      <FormSection title="การศึกษา" icon="school-outline">
        <TextField label="ปริญญาตรี" placeholder="สาขา / มหาวิทยาลัย" {...field("bachelor")} autoCapitalize="words" />
        <TextField label="ปริญญาโท" {...field("master")} autoCapitalize="words" />
        <TextField label="ปริญญาเอก" {...field("doctoral")} autoCapitalize="words" />
      </FormSection>

      <SubmitButton title="บันทึก" onPress={save} loading={saving} hasErrors={Object.keys(errors).length > 0} />
    </FormScrollView>
  );
}
