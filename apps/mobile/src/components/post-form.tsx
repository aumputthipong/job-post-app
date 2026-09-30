import { Ionicons } from "@expo/vector-icons";
import {
  type CreateHirePostInput,
  type CreateJobPostInput,
  createHirePostSchema,
  createJobPostSchema,
  type Media,
  type PostKind,
} from "@jobapp-platform/shared";
import { router, useNavigation } from "expo-router";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import type { ZodType, ZodTypeDef } from "zod";
import { api } from "@/lib/api";
import { formatWage } from "@/lib/format";
import {
  CATEGORIES,
  CATEGORY_ICONS,
  EMPLOYMENT_TYPES,
  JOB_TYPES,
  SUGGESTED_ATTRIBUTES,
  SUGGESTED_BENEFITS,
  WORK_MODELS,
} from "@/lib/post-options";
import {
  ChoiceChips,
  fieldErrors,
  FormScrollView,
  type FormImage,
  FormSection,
  ImagesField,
  ListField,
  PrimaryButton,
  type Step,
  StepFooter,
  StepHeader,
  SubmitButton,
  TextField,
} from "./form";
import { PostCover } from "./media";

type JobFields = Omit<CreateJobPostInput, "images">;
type HireFields = Omit<CreateHirePostInput, "images">;

type FormProps<Fields, Input> = {
  initial?: Partial<Fields>;
  initialImages?: Media[];
  submitLabel: string;
  onSubmit: (data: Input) => Promise<void>;
};

const EMPTY_JOB: JobFields = {
  jobTitle: "",
  position: "",
  agency: "",
  attributes: [],
  welfareBenefits: [],
  wage: "",
  wageMax: "",
  detail: "",
  category: "",
  employmentType: "",
  jobType: "",
  workModel: "",
  location: "",
  openings: 1,
  email: "",
  phone: "",
};

/** What most job posts pick, so a new post starts there. */
export const JOB_DEFAULTS: Partial<JobFields> = {
  jobType: JOB_TYPES[0],
  workModel: WORK_MODELS[0],
  employmentType: EMPLOYMENT_TYPES[0],
  openings: 1,
};

const EMPTY_HIRE: HireFields = { hireTitle: "", category: "", detail: "", email: "", phone: "" };

// Legacy documents can hold null or lack a field; keep the empty default then.
const present = <T extends object>(values?: Partial<T>) =>
  Object.fromEntries(Object.entries(values ?? {}).filter(([, v]) => v != null)) as Partial<T>;

const JOB_STEPS: (Step & { fields: (keyof JobFields | "images")[] })[] = [
  {
    short: "ตำแหน่ง",
    title: "ตำแหน่งที่เปิดรับ",
    hint: "ตั้งชื่อประกาศ เลือกหมวดหมู่และประเภทงาน",
    icon: "briefcase-outline",
    fields: ["jobTitle", "position", "category", "jobType"],
  },
  {
    short: "ค่าจ้าง",
    title: "ค่าตอบแทนและสถานที่",
    hint: "ระบุค่าจ้าง ที่ทำงาน และจำนวนที่รับ",
    icon: "cash-outline",
    fields: ["employmentType", "wage", "wageMax", "location", "workModel", "openings"],
  },
  {
    short: "เนื้องาน",
    title: "รายละเอียดงาน",
    hint: "อธิบายหน้าที่ คุณสมบัติ และสวัสดิการ",
    icon: "document-text-outline",
    fields: ["detail", "attributes", "welfareBenefits"],
  },
  {
    short: "บริษัท",
    title: "บริษัทและช่องทางติดต่อ",
    hint: "ข้อมูลบริษัทดึงจากโปรไฟล์ของคุณได้",
    icon: "business-outline",
    fields: ["agency", "email", "phone", "images"],
  },
  {
    short: "ตรวจสอบ",
    title: "ตรวจสอบก่อนลงประกาศ",
    hint: "แตะ \"แก้ไข\" เพื่อกลับไปแก้ส่วนนั้น",
    icon: "checkmark-done-outline",
    fields: [],
  },
];

const LAST_STEP = JOB_STEPS.length - 1;

/** Checks the step-by-step form adds on top of the schema, which old posts must still pass. */
function extraJobErrors(values: JobFields, useRange: boolean) {
  const errors: Record<string, string> = {};
  if (values.wage.trim() && !/^\d+$/.test(values.wage.trim())) errors.wage = "กรุณากรอกค่าจ้างเป็นตัวเลข";
  if (useRange) {
    if (!values.wageMax?.trim()) errors.wageMax = "กรุณากรอกค่าจ้างสูงสุด";
    else if (Number(values.wageMax) < Number(values.wage)) errors.wageMax = "ต้องไม่น้อยกว่าค่าจ้างเริ่มต้น";
  }
  if (!values.location?.trim()) errors.location = "กรุณาระบุสถานที่ทำงาน";
  return errors;
}

export type CompanyProfile = { name: string; location: string; email: string; phone: string };

export function JobPostForm({
  initial,
  company,
  footer,
  ...props
}: FormProps<JobFields, CreateJobPostInput> & {
  /** From the poster's profile, offered on the company step. */
  company?: CompanyProfile;
  /** Extra controls on the review step (the edit screen's delete); call `allowLeave` before navigating away. */
  footer?: (allowLeave: () => void) => ReactNode;
}) {
  const start = useRef({ ...EMPTY_JOB, ...present(initial) }).current;
  const [useRange, setUseRange] = useState(!!start.wageMax);
  const [step, setStep] = useState(0);
  const leaving = useRef(false);

  const form = usePostForm(start, createJobPostSchema, {
    ...props,
    onSubmit: async (data) => {
      leaving.current = true;
      try {
        await props.onSubmit({ ...data, wageMax: useRange ? data.wageMax : "" });
      } catch (error) {
        leaving.current = false;
        throw error;
      }
    },
  });
  const { values, errors, set, setErrors } = form;

  // Asks before throwing away what was typed. Saving or deleting sets `leaving` first.
  const navigation = useNavigation();
  const dirty = JSON.stringify(values) !== JSON.stringify(start) || form.images.some((image) => !image.media);
  useEffect(
    () =>
      navigation.addListener("beforeRemove", (event) => {
        if (leaving.current || !dirty) return;
        event.preventDefault();
        Alert.alert("ยังไม่ได้บันทึก", "ข้อมูลที่กรอกไว้จะหายไป ต้องการออกจากหน้านี้หรือไม่?", [
          { text: "อยู่ต่อ", style: "cancel" },
          { text: "ออก", style: "destructive", onPress: () => navigation.dispatch(event.data.action) },
        ]);
      }),
    [navigation, dirty],
  );

  const errorsFor = (index: number) => {
    const fields = new Set<string>(JOB_STEPS[index]!.fields);
    const parsed = createJobPostSchema.safeParse(values);
    const all = { ...(parsed.success ? {} : fieldErrors(parsed.error.issues)), ...extraJobErrors(values, useRange) };
    return Object.fromEntries(Object.entries(all).filter(([field]) => fields.has(field)));
  };
  const firstInvalid = (before: number) => {
    for (let i = 0; i < before; i++) if (Object.keys(errorsFor(i)).length) return i;
    return -1;
  };

  const goTo = (index: number) => {
    setStep(index);
    setErrors({});
  };
  const showStepErrors = (index: number) => {
    setStep(index);
    setErrors(errorsFor(index));
  };

  const next = () => {
    const found = errorsFor(step);
    if (Object.keys(found).length) setErrors(found);
    else goTo(step + 1);
  };

  const onStepPress = (index: number) => {
    if (index <= step) return goTo(index);
    const invalid = firstInvalid(index);
    if (invalid === -1) goTo(index);
    else showStepErrors(invalid);
  };

  const submit = () => {
    const invalid = firstInvalid(LAST_STEP);
    if (invalid !== -1) showStepErrors(invalid);
    else form.submit();
  };

  const applyCompany = () => {
    if (!company) return;
    set("agency")(company.name || values.agency);
    set("email")(company.email || values.email);
    set("phone")(company.phone || values.phone);
  };

  const pages = [
    <>
      <FormSection title="ประกาศนี้รับตำแหน่งอะไร" icon="create-outline">
        <TextField label="หัวข้อประกาศ" required helper="ผู้หางานเห็นหัวข้อนี้เป็นอย่างแรก" placeholder="เช่น รับสมัคร Frontend Developer" value={values.jobTitle} onChangeText={set("jobTitle")} error={errors.jobTitle} autoCapitalize="sentences" maxLength={80} />
        <TextField label="ชื่อตำแหน่ง" required placeholder="เช่น โปรแกรมเมอร์" value={values.position} onChangeText={set("position")} error={errors.position} autoCapitalize="sentences" />
      </FormSection>
      <FormSection title="หมวดหมู่และประเภทงาน" icon="grid-outline">
        <ChoiceChips label="หมวดหมู่" required options={CATEGORIES} icons={CATEGORY_ICONS} value={values.category} onChange={set("category")} error={errors.category} />
        <ChoiceChips label="ประเภทงาน" options={JOB_TYPES} value={values.jobType} onChange={set("jobType")} />
      </FormSection>
    </>,

    <>
      <FormSection title="ค่าตอบแทน" icon="cash-outline">
        <ChoiceChips label="จ่ายแบบ" required options={EMPLOYMENT_TYPES} value={values.employmentType} onChange={set("employmentType")} error={errors.employmentType} />
        <View className="flex-row">
          <View className="flex-1">
            <TextField label={useRange ? "เริ่มต้น (บาท)" : "ค่าจ้าง (บาท)"} required placeholder="15000" value={values.wage} onChangeText={(v) => set("wage")(v.replace(/\D/g, ""))} error={errors.wage} keyboardType="number-pad" />
          </View>
          {useRange ? (
            <View className="ml-3 flex-1">
              <TextField label="สูงสุด (บาท)" required placeholder="25000" value={values.wageMax} onChangeText={(v) => set("wageMax")(v.replace(/\D/g, ""))} error={errors.wageMax} keyboardType="number-pad" />
            </View>
          ) : null}
        </View>
        <TouchableOpacity className="-mt-2 flex-row items-center" onPress={() => setUseRange((r) => !r)} accessibilityState={{ checked: useRange }}>
          <Ionicons name={useRange ? "checkbox" : "square-outline"} size={22} color={useRange ? "#083C6B" : "#94A3B8"} />
          <Text className="ml-2 text-base text-text">ระบุเป็นช่วงค่าจ้าง</Text>
        </TouchableOpacity>
      </FormSection>

      <FormSection title="สถานที่และรูปแบบการทำงาน" icon="location-outline">
        <TextField label="สถานที่ทำงาน" required helper={company?.location ? "ค่าเริ่มต้นมาจากที่ตั้งบริษัทในโปรไฟล์" : undefined} placeholder="เช่น สาทร กรุงเทพมหานคร" value={values.location} onChangeText={set("location")} error={errors.location} autoCapitalize="sentences" />
        <ChoiceChips label="รูปแบบการทำงาน" options={WORK_MODELS} value={values.workModel} onChange={set("workModel")} />
        <View className="flex-row items-center justify-between">
          <Text className="text-[15px] font-semibold text-text">จำนวนที่รับ</Text>
          <View className="flex-row items-center rounded-xl border border-border">
            <TouchableOpacity className="h-11 w-11 items-center justify-center" onPress={() => set("openings")(Math.max(1, (values.openings ?? 1) - 1))} accessibilityLabel="ลดจำนวน">
              <Ionicons name="remove" size={20} color="#083C6B" />
            </TouchableOpacity>
            <Text className="min-w-[48px] text-center text-base font-bold text-text">{values.openings ?? 1} อัตรา</Text>
            <TouchableOpacity className="h-11 w-11 items-center justify-center" onPress={() => set("openings")(Math.min(999, (values.openings ?? 1) + 1))} accessibilityLabel="เพิ่มจำนวน">
              <Ionicons name="add" size={20} color="#083C6B" />
            </TouchableOpacity>
          </View>
        </View>
      </FormSection>
    </>,

    <>
      <FormSection title="รายละเอียดงาน" icon="document-text-outline" description="หน้าที่ความรับผิดชอบ เวลาทำงาน ทีมที่จะได้ร่วมงาน">
        <TextField required placeholder={"• หน้าที่หลักของตำแหน่งนี้\n• เวลาทำงาน\n• สิ่งที่จะได้เรียนรู้"} value={values.detail} onChangeText={set("detail")} error={errors.detail} helper={`${values.detail.trim().length} ตัวอักษร`} multiline autoCapitalize="sentences" maxLength={3000} />
      </FormSection>
      <FormSection title="คุณสมบัติผู้สมัคร" icon="ribbon-outline">
        <ListField optional placeholder="พิมพ์คุณสมบัติแล้วกด +" items={values.attributes} onChange={set("attributes")} suggestions={SUGGESTED_ATTRIBUTES} />
      </FormSection>
      <FormSection title="สวัสดิการ" icon="gift-outline">
        <ListField optional placeholder="พิมพ์สวัสดิการแล้วกด +" items={values.welfareBenefits} onChange={set("welfareBenefits")} suggestions={SUGGESTED_BENEFITS} />
      </FormSection>
    </>,

    <>
      {company?.name ? (
        <TouchableOpacity className="mb-4 flex-row items-center rounded-card border border-primary-light bg-primary-soft p-4" onPress={applyCompany} activeOpacity={0.85}>
          <Ionicons name="business" size={22} color="#083C6B" />
          <View className="mx-3 flex-1">
            <Text className="text-base font-bold text-text" numberOfLines={1}>{company.name}</Text>
            <Text className="text-sm text-text-subtle">แตะเพื่อใช้ข้อมูลบริษัทจากโปรไฟล์</Text>
          </View>
          <Ionicons name="refresh" size={20} color="#083C6B" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity className="mb-4 flex-row items-center rounded-card border border-dashed border-border-strong bg-surface p-4" onPress={() => router.push("/edit-profile")} activeOpacity={0.85}>
          <Ionicons name="bulb-outline" size={22} color="#083C6B" />
          <View className="mx-3 flex-1">
            <Text className="text-base font-bold text-text">ตั้งค่าข้อมูลบริษัทในโปรไฟล์</Text>
            <Text className="text-sm text-text-subtle">ครั้งหน้าระบบจะกรอกส่วนนี้ให้อัตโนมัติ</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#64748B" />
        </TouchableOpacity>
      )}
      <FormSection title="บริษัท" icon="business-outline">
        <TextField label="บริษัท / หน่วยงาน" required placeholder="ชื่อบริษัทของคุณ" value={values.agency} onChangeText={set("agency")} error={errors.agency} autoCapitalize="sentences" />
        <ImagesField label="รูปภาพประกาศ / โลโก้" images={form.images} onChange={form.setImages} />
      </FormSection>
      <ContactCard values={values} errors={errors} set={set} />
    </>,

    <>
      <View className="mb-4 overflow-hidden rounded-card border border-border bg-surface">
        {form.images.length ? <PostCover images={form.images.map((image) => ({ url: image.uri }))} className="h-40 w-full" /> : null}
        <View className="p-5">
          <Text className="text-2xl font-bold text-text">{values.jobTitle}</Text>
          <Text className="mt-1 text-base text-text-muted">{values.agency}</Text>
          <Text className="mt-3 text-lg font-bold text-primary">
            {formatWage({ ...values, wageMax: useRange ? values.wageMax : "" })}
          </Text>
        </View>
      </View>

      <FormSection title="ตำแหน่ง" icon={JOB_STEPS[0]!.icon} action={<EditLink onPress={() => goTo(0)} />}>
        <ReviewRow label="ชื่อตำแหน่ง" value={values.position} />
        <ReviewRow label="หมวดหมู่" value={values.category} />
        <ReviewRow label="ประเภทงาน" value={values.jobType} last />
      </FormSection>
      <FormSection title="ค่าตอบแทนและสถานที่" icon={JOB_STEPS[1]!.icon} action={<EditLink onPress={() => goTo(1)} />}>
        <ReviewRow label="สถานที่" value={[values.location, values.workModel].filter(Boolean).join(" · ")} />
        <ReviewRow label="จำนวนที่รับ" value={`${values.openings ?? 1} อัตรา`} last />
      </FormSection>
      <FormSection title="รายละเอียด" icon={JOB_STEPS[2]!.icon} action={<EditLink onPress={() => goTo(2)} />}>
        <Text className="mb-3 text-base leading-6 text-text" numberOfLines={5}>{values.detail}</Text>
        <ReviewRow label="คุณสมบัติ" value={values.attributes.join(", ")} />
        <ReviewRow label="สวัสดิการ" value={values.welfareBenefits.join(", ")} last />
      </FormSection>
      <FormSection title="บริษัทและติดต่อ" icon="call-outline" action={<EditLink onPress={() => goTo(3)} />}>
        <ReviewRow label="อีเมล" value={values.email} />
        <ReviewRow label="เบอร์โทรศัพท์" value={values.phone} last />
      </FormSection>

      {footer ? <View className="mt-4">{footer(() => (leaving.current = true))}</View> : null}
    </>,
  ];

  const isLast = step === LAST_STEP;
  return (
    <View className="flex-1 bg-background">
      <StepHeader steps={JOB_STEPS} current={step} onStepPress={onStepPress} />
      {/* Keyed by step, so every page opens at its top. */}
      <FormScrollView key={step} footerBelow>
        {pages[step]}
        {Object.keys(errors).length ? (
          <Text className="text-center text-danger">กรุณากรอกข้อมูลที่ยังขาดให้ครบ</Text>
        ) : null}
      </FormScrollView>
      <StepFooter
        backLabel={step === 0 ? "ยกเลิก" : "ย้อนกลับ"}
        nextLabel={isLast ? props.submitLabel : `ถัดไป: ${JOB_STEPS[step + 1]!.short}`}
        onBack={() => (step === 0 ? router.back() : goTo(step - 1))}
        onNext={isLast ? submit : next}
        loading={form.submitting}
        status={form.status}
      />
    </View>
  );
}

const EditLink = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} hitSlop={8}>
    <Text className="text-base font-bold text-primary-light">แก้ไข</Text>
  </TouchableOpacity>
);

const ReviewRow = ({ label, value, last }: { label: string; value?: string; last?: boolean }) => (
  <View className={`flex-row py-2 ${last ? "" : "border-b border-border"}`}>
    <Text className="w-28 text-sm text-text-subtle">{label}</Text>
    <Text className="flex-1 text-base text-text">{value?.trim() || "-"}</Text>
  </View>
);

export function HirePostForm({ initial, footer, ...props }: FormProps<HireFields, CreateHirePostInput> & { footer?: ReactNode }) {
  const form = usePostForm({ ...EMPTY_HIRE, ...present(initial) }, createHirePostSchema, props);
  const { values, errors, set } = form;

  return (
    <FormScrollView>
      <FormSection title="ข้อมูลประกาศ" icon="megaphone-outline">
        <TextField label="หัวข้อ" required placeholder="เช่น รับออกแบบโลโก้" value={values.hireTitle} onChangeText={set("hireTitle")} error={errors.hireTitle} autoCapitalize="sentences" />
        <ChoiceChips label="ประเภทงาน" required options={CATEGORIES} icons={CATEGORY_ICONS} value={values.category} onChange={set("category")} error={errors.category} />
        <TextField label="รายละเอียด" required placeholder="ทักษะ ประสบการณ์ ขอบเขตงานที่รับ..." value={values.detail} onChangeText={set("detail")} error={errors.detail} multiline autoCapitalize="sentences" />
        <ImagesField label="รูปผลงาน" images={form.images} onChange={form.setImages} />
      </FormSection>

      <ContactCard values={values} errors={errors} set={set} />

      <SubmitButton
        title={props.submitLabel}
        onPress={form.submit}
        loading={form.submitting}
        status={form.status}
        hasErrors={Object.keys(errors).length > 0}
      />
      {footer ? <View className="mt-3">{footer}</View> : null}
    </FormScrollView>
  );
}

type Form = ReturnType<typeof usePostForm<any, any>>;

function usePostForm<Fields extends Record<string, unknown>, Input>(
  initial: Fields,
  schema: ZodType<Input, ZodTypeDef, unknown>,
  { initialImages = [], onSubmit }: Pick<FormProps<Fields, Input>, "initialImages" | "onSubmit">,
) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [images, setImages] = useState<FormImage[]>(() => initialImages.map((media) => ({ uri: media.url, media })));
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string>();
  // Uploads by local uri: a retry after a failed save reuses them instead of
  // uploading (and orphaning) the same photo again.
  const uploads = useRef(new Map<string, Media>());

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
      const pending = images.filter((image) => !image.media && !uploads.current.has(image.uri));
      let done = 0;
      const progress = () => setStatus(`กำลังอัปโหลดรูป ${done}/${pending.length}`);
      if (pending.length) progress();
      await Promise.all(
        pending.map(async ({ uri }) => {
          uploads.current.set(uri, await api.uploadImage(uri, "posts"));
          done += 1;
          progress();
        }),
      );
      setStatus(undefined);
      // The whole list, in order: the API keeps what's still there and deletes the rest.
      const media = images.map((image) => image.media ?? uploads.current.get(image.uri)!);
      await onSubmit({ ...parsed.data, images: media });
    } catch (error) {
      setStatus(undefined);
      Alert.alert("บันทึกไม่สำเร็จ", (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return { values, errors, set, setErrors, images, setImages, submit, submitting, status };
}

export function DeletePostButton({ kind, id, onBeforeLeave }: { kind: PostKind; id: string; onBeforeLeave?: () => void }) {
  const [deleting, setDeleting] = useState(false);

  const remove = async () => {
    setDeleting(true);
    try {
      await api.deletePost(kind, id);
      onBeforeLeave?.();
      // Close the form and the detail screen under it, which now points at
      // nothing — back to whichever list the post was opened from.
      router.dismiss(2);
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

  return <PrimaryButton title="ลบประกาศ" icon="trash-outline" variant="danger" onPress={confirm} loading={deleting} />;
}

function ContactCard({ values, errors, set }: Pick<Form, "values" | "errors" | "set">) {
  return (
    <FormSection title="ช่องทางติดต่อ" icon="call-outline" description="ผู้สมัครจะติดต่อคุณผ่านช่องทางนี้">
      <TextField label="อีเมล" required placeholder="example@email.com" value={values.email} onChangeText={set("email")} error={errors.email} keyboardType="email-address" />
      <TextField label="เบอร์โทรศัพท์" required placeholder="08X-XXX-XXXX" value={values.phone} onChangeText={set("phone")} error={errors.phone} keyboardType="phone-pad" maxLength={10} />
    </FormSection>
  );
}
