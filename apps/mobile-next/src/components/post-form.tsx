import {
  type CreateHirePostInput,
  type CreateJobPostInput,
  createHirePostSchema,
  createJobPostSchema,
  type PostKind,
} from "@jobapp-platform/shared";
import { router } from "expo-router";
import { type ReactNode, useRef, useState } from "react";
import { Alert, View } from "react-native";
import type { ZodType, ZodTypeDef } from "zod";
import { api } from "@/lib/api";
import { CATEGORIES, EMPLOYMENT_TYPES } from "@/lib/post-options";
import {
  ChoiceChips,
  fieldErrors,
  FormScrollView,
  FormSection,
  ImageField,
  ListField,
  PrimaryButton,
  SubmitButton,
  TextField,
} from "./form";

type JobFields = Omit<CreateJobPostInput, "imageUrl" | "imagePublicId">;
type HireFields = Omit<CreateHirePostInput, "resumeUrl" | "resumePublicId">;

type FormProps<Fields, Input> = {
  initial?: Partial<Fields>;
  initialImage?: string;
  submitLabel: string;
  onSubmit: (data: Input) => Promise<void>;
  /** Extra controls under the submit button (the edit screen's delete). */
  footer?: ReactNode;
};

const EMPTY_JOB: JobFields = {
  jobTitle: "",
  position: "",
  agency: "",
  attributes: [],
  welfareBenefits: [],
  wage: "",
  detail: "",
  category: "",
  employmentType: "",
  email: "",
  phone: "",
};

const EMPTY_HIRE: HireFields = { hireTitle: "", category: "", detail: "", email: "", phone: "" };

// Legacy documents can hold null or lack a field; keep the empty default then.
const present = <T extends object>(values?: Partial<T>) =>
  Object.fromEntries(Object.entries(values ?? {}).filter(([, v]) => v != null)) as Partial<T>;

export function JobPostForm({ initial, ...props }: FormProps<JobFields, CreateJobPostInput>) {
  const form = usePostForm({ ...EMPTY_JOB, ...present(initial) }, createJobPostSchema, ["imageUrl", "imagePublicId"], props);
  const { values, errors, set } = form;

  return (
    <FormShell form={form} {...props}>
      <FormSection title="ข้อมูลพื้นฐาน">
        <TextField label="หัวข้องาน" placeholder="เช่น รับสมัคร Frontend Developer" value={values.jobTitle} onChangeText={set("jobTitle")} error={errors.jobTitle} autoCapitalize="sentences" />
        <TextField label="ตำแหน่งที่รับ" placeholder="เช่น โปรแกรมเมอร์" value={values.position} onChangeText={set("position")} error={errors.position} autoCapitalize="sentences" />
        <TextField label="บริษัท / หน่วยงาน" placeholder="ชื่อบริษัทของคุณ" value={values.agency} onChangeText={set("agency")} error={errors.agency} autoCapitalize="sentences" />
      </FormSection>

      <FormSection title="รายละเอียดงาน">
        <TextField label="รายละเอียด" placeholder="หน้าที่ความรับผิดชอบ เวลาทำงาน สถานที่..." value={values.detail} onChangeText={set("detail")} error={errors.detail} multiline autoCapitalize="sentences" />
        <ChoiceChips label="ประเภทงาน" options={CATEGORIES} value={values.category} onChange={set("category")} error={errors.category} />
        <ChoiceChips label="ประเภทการจ้าง" options={EMPLOYMENT_TYPES} value={values.employmentType} onChange={set("employmentType")} error={errors.employmentType} />
        <TextField label="ค่าจ้าง (บาท)" placeholder="เช่น 15000" value={values.wage} onChangeText={set("wage")} error={errors.wage} keyboardType="numeric" />
        <ImageField label="รูปภาพประกาศ" uri={form.image} onChange={form.setImage} />
      </FormSection>

      <FormSection title="คุณสมบัติและสวัสดิการ">
        <ListField label="คุณสมบัติผู้สมัคร" placeholder="เพิ่มคุณสมบัติ..." items={values.attributes} onChange={set("attributes")} />
        <ListField label="สวัสดิการ" placeholder="เพิ่มสวัสดิการ..." items={values.welfareBenefits} onChange={set("welfareBenefits")} />
      </FormSection>

      <ContactCard values={values} errors={errors} set={set} />
    </FormShell>
  );
}

export function HirePostForm({ initial, ...props }: FormProps<HireFields, CreateHirePostInput>) {
  const form = usePostForm({ ...EMPTY_HIRE, ...present(initial) }, createHirePostSchema, ["resumeUrl", "resumePublicId"], props);
  const { values, errors, set } = form;

  return (
    <FormShell form={form} {...props}>
      <FormSection title="ข้อมูลประกาศ">
        <TextField label="หัวข้อ" placeholder="เช่น รับออกแบบโลโก้" value={values.hireTitle} onChangeText={set("hireTitle")} error={errors.hireTitle} autoCapitalize="sentences" />
        <ChoiceChips label="ประเภทงาน" options={CATEGORIES} value={values.category} onChange={set("category")} error={errors.category} />
        <TextField label="รายละเอียด" placeholder="ทักษะ ประสบการณ์ ขอบเขตงานที่รับ..." value={values.detail} onChangeText={set("detail")} error={errors.detail} multiline autoCapitalize="sentences" />
        <ImageField label="เรซูเม่ / ผลงาน" uri={form.image} onChange={form.setImage} />
      </FormSection>

      <ContactCard values={values} errors={errors} set={set} />
    </FormShell>
  );
}

type Form = ReturnType<typeof usePostForm<any, any>>;

function usePostForm<Fields extends Record<string, unknown>, Input>(
  initial: Fields,
  schema: ZodType<Input, ZodTypeDef, unknown>,
  [urlKey, idKey]: [string, string],
  { initialImage, onSubmit }: Pick<FormProps<Fields, Input>, "initialImage" | "onSubmit">,
) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [picked, setPicked] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const uploaded = useRef<{ uri: string; url: string; publicId: string }>(undefined);

  const set =
    <K extends keyof Fields>(key: K) =>
    (value: Fields[K]) => {
      setValues((v) => ({ ...v, [key]: value }));
      setErrors(({ [key as string]: _, ...rest }) => rest);
    };

  const submit = async () => {
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error.issues));
      return;
    }
    setSubmitting(true);
    try {
      // Only a newly picked image is uploaded; an unchanged one stays as it is.
      // A retry after a failed save reuses the upload instead of orphaning it.
      if (picked && uploaded.current?.uri !== picked) {
        uploaded.current = { uri: picked, ...(await api.uploadImage(picked, "posts")) };
      }
      const media = picked ? uploaded.current : undefined;
      await onSubmit({ ...parsed.data, ...(media && { [urlKey]: media.url, [idKey]: media.publicId }) });
    } catch (error) {
      Alert.alert("บันทึกไม่สำเร็จ", (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return { values, errors, set, image: picked ?? initialImage, setImage: setPicked, submit, submitting };
}

function FormShell({
  form,
  submitLabel,
  footer,
  children,
}: { form: Form; submitLabel: string; footer?: ReactNode; children: ReactNode }) {
  return (
    <FormScrollView>
      {children}
      <SubmitButton
        title={submitLabel}
        onPress={form.submit}
        loading={form.submitting}
        hasErrors={Object.keys(form.errors).length > 0}
      />
      {footer ? <View className="mt-3">{footer}</View> : null}
    </FormScrollView>
  );
}

export function DeletePostButton({ kind, id }: { kind: PostKind; id: string }) {
  const [deleting, setDeleting] = useState(false);

  const remove = async () => {
    setDeleting(true);
    try {
      await api.deletePost(kind, id);
      // The detail screen underneath now points at nothing; go back past it.
      router.dismissTo(kind === "find" ? "/jobs" : "/hires");
    } catch (error) {
      setDeleting(false);
      Alert.alert("ลบไม่สำเร็จ", (error as Error).message);
    }
  };

  const confirm = () =>
    Alert.alert("ลบประกาศนี้?", "ความคิดเห็น คะแนน และการบันทึกของประกาศนี้จะถูกลบด้วย ย้อนกลับไม่ได้", [
      { text: "ยกเลิก", style: "cancel" },
      { text: "ลบ", style: "destructive", onPress: remove },
    ]);

  return <PrimaryButton title="ลบประกาศ" variant="danger" onPress={confirm} loading={deleting} />;
}

function ContactCard({ values, errors, set }: Pick<Form, "values" | "errors" | "set">) {
  return (
    <FormSection title="ช่องทางติดต่อ">
      <TextField label="อีเมล" placeholder="example@email.com" value={values.email} onChangeText={set("email")} error={errors.email} keyboardType="email-address" />
      <TextField label="เบอร์โทรศัพท์" placeholder="08X-XXX-XXXX" value={values.phone} onChangeText={set("phone")} error={errors.phone} keyboardType="phone-pad" maxLength={10} />
    </FormSection>
  );
}
