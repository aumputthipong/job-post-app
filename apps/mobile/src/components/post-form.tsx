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
import { type ReactNode, type RefObject, useEffect, useRef, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import type { ZodType, ZodTypeDef } from "zod";
import { api } from "@/lib/api";
import { colors } from "@/lib/colors";
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
  /** Extra controls on the review page (the edit screen's delete); call `allowLeave` before navigating away. */
  footer?: (allowLeave: () => void) => ReactNode;
};

type PostStep<Fields> = Step & { fields: (keyof Fields | "images")[] };

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

const REVIEW_STEP = {
  short: "ตรวจสอบ",
  title: "ตรวจสอบก่อนลงประกาศ",
  hint: "แตะ \"แก้ไข\" เพื่อกลับไปแก้ส่วนนั้น",
  icon: "checkmark-done-outline",
  fields: [],
} as const;

const JOB_STEPS: PostStep<JobFields>[] = [
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
  { ...REVIEW_STEP, fields: [] },
];

const HIRE_STEPS: PostStep<HireFields>[] = [
  {
    short: "บริการ",
    title: "รับงานอะไร",
    hint: "ตั้งหัวข้อให้ผู้จ้างรู้ทันทีว่าคุณทำอะไรได้",
    icon: "megaphone-outline",
    fields: ["hireTitle", "category"],
  },
  {
    short: "ผลงาน",
    title: "รายละเอียดและผลงาน",
    hint: "ทักษะ ประสบการณ์ ขอบเขตงาน และรูปผลงาน",
    icon: "images-outline",
    fields: ["detail", "images"],
  },
  {
    short: "ติดต่อ",
    title: "ช่องทางติดต่อ",
    hint: "ดึงจากโปรไฟล์ของคุณ แก้ได้ถ้าต้องการ",
    icon: "call-outline",
    fields: ["email", "phone"],
  },
  { ...REVIEW_STEP, fields: [] },
];

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
}) {
  const start = useRef({ ...EMPTY_JOB, ...present(initial) }).current;
  const [useRange, setUseRange] = useState(!!start.wageMax);
  const leaving = useRef(false);
  const form = usePostForm(start, createJobPostSchema, {
    ...props,
    onSubmit: guardedSubmit(leaving, (data) => props.onSubmit({ ...data, wageMax: useRange ? data.wageMax : "" })),
  });
  const flow = useStepFlow(form, start, createJobPostSchema, JOB_STEPS, leaving, () => extraJobErrors(form.values, useRange));
  const { values, errors, set } = form;

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
          <Ionicons name={useRange ? "checkbox" : "square-outline"} size={22} color={useRange ? colors.primary.DEFAULT : colors.placeholder} />
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
              <Ionicons name="remove" size={20} color={colors.primary.DEFAULT} />
            </TouchableOpacity>
            <Text className="min-w-[48px] text-center text-base font-bold text-text">{values.openings ?? 1} อัตรา</Text>
            <TouchableOpacity className="h-11 w-11 items-center justify-center" onPress={() => set("openings")(Math.min(999, (values.openings ?? 1) + 1))} accessibilityLabel="เพิ่มจำนวน">
              <Ionicons name="add" size={20} color={colors.primary.DEFAULT} />
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
        <ProfileBanner icon="business" title={company.name} subtitle="แตะเพื่อใช้ข้อมูลบริษัทจากโปรไฟล์" onPress={applyCompany} />
      ) : (
        <ProfileBanner muted icon="bulb-outline" title="ตั้งค่าข้อมูลบริษัทในโปรไฟล์" subtitle="ครั้งหน้าระบบจะกรอกส่วนนี้ให้อัตโนมัติ" onPress={() => router.push("/edit-profile")} />
      )}
      <FormSection title="บริษัท" icon="business-outline">
        <TextField label="บริษัท / หน่วยงาน" required placeholder="ชื่อบริษัทของคุณ" value={values.agency} onChangeText={set("agency")} error={errors.agency} autoCapitalize="sentences" />
        <ImagesField label="รูปภาพประกาศ / โลโก้" images={form.images} onChange={form.setImages} />
      </FormSection>
      <ContactCard values={values} errors={errors} set={set} description="ผู้สมัครจะติดต่อคุณผ่านช่องทางนี้" />
    </>,

    <>
      <ReviewHero images={form.images} title={values.jobTitle} subtitle={values.agency}>
        <Text className="mt-3 text-lg font-bold text-primary-dark">{formatWage({ ...values, wageMax: useRange ? values.wageMax : "" })}</Text>
      </ReviewHero>
      <FormSection title="ตำแหน่ง" icon={JOB_STEPS[0]!.icon} action={<EditLink onPress={() => flow.goTo(0)} />}>
        <ReviewRow label="ชื่อตำแหน่ง" value={values.position} />
        <ReviewRow label="หมวดหมู่" value={values.category} />
        <ReviewRow label="ประเภทงาน" value={values.jobType} last />
      </FormSection>
      <FormSection title="ค่าตอบแทนและสถานที่" icon={JOB_STEPS[1]!.icon} action={<EditLink onPress={() => flow.goTo(1)} />}>
        <ReviewRow label="สถานที่" value={[values.location, values.workModel].filter(Boolean).join(" · ")} />
        <ReviewRow label="จำนวนที่รับ" value={`${values.openings ?? 1} อัตรา`} last />
      </FormSection>
      <FormSection title="รายละเอียด" icon={JOB_STEPS[2]!.icon} action={<EditLink onPress={() => flow.goTo(2)} />}>
        <Text className="mb-3 text-base leading-6 text-text" numberOfLines={5}>{values.detail}</Text>
        <ReviewRow label="คุณสมบัติ" value={values.attributes.join(", ")} />
        <ReviewRow label="สวัสดิการ" value={values.welfareBenefits.join(", ")} last />
      </FormSection>
      <FormSection title="บริษัทและติดต่อ" icon="call-outline" action={<EditLink onPress={() => flow.goTo(3)} />}>
        <ReviewRow label="อีเมล" value={values.email} />
        <ReviewRow label="เบอร์โทรศัพท์" value={values.phone} last />
      </FormSection>
      {footer ? <View className="mt-4">{footer(flow.allowLeave)}</View> : null}
    </>,
  ];

  return <StepLayout steps={JOB_STEPS} flow={flow} form={form} submitLabel={props.submitLabel} page={pages[flow.step]} />;
}

export function HirePostForm({
  initial,
  footer,
  ...props
}: FormProps<HireFields, CreateHirePostInput> & {
  /** Email and phone from the poster's profile. */
  contact?: { email: string; phone: string };
}) {
  const start = useRef({ ...EMPTY_HIRE, ...present(initial) }).current;
  const leaving = useRef(false);
  const form = usePostForm(start, createHirePostSchema, { ...props, onSubmit: guardedSubmit(leaving, props.onSubmit) });
  const flow = useStepFlow(form, start, createHirePostSchema, HIRE_STEPS, leaving);
  const { values, errors, set } = form;
  const { contact } = props;

  const pages = [
    <>
      <FormSection title="บริการที่รับ" icon="megaphone-outline">
        <TextField label="หัวข้อประกาศ" required helper="เช่น บริการที่ถนัด หรือสิ่งที่ผู้จ้างจะได้" placeholder="เช่น รับออกแบบโลโก้และสื่อสิ่งพิมพ์" value={values.hireTitle} onChangeText={set("hireTitle")} error={errors.hireTitle} autoCapitalize="sentences" maxLength={80} />
        <ChoiceChips label="หมวดหมู่" required options={CATEGORIES} icons={CATEGORY_ICONS} value={values.category} onChange={set("category")} error={errors.category} />
      </FormSection>
    </>,

    <>
      <FormSection title="รายละเอียด" icon="document-text-outline" description="ทักษะ ประสบการณ์ ขอบเขตและระยะเวลางาน">
        <TextField required placeholder={"• ทักษะและเครื่องมือที่ใช้\n• ประสบการณ์\n• ขอบเขตงานที่รับ"} value={values.detail} onChangeText={set("detail")} error={errors.detail} helper={`${values.detail.trim().length} ตัวอักษร`} multiline autoCapitalize="sentences" maxLength={3000} />
      </FormSection>
      <FormSection title="ผลงาน" icon="images-outline" description="รูปผลงานช่วยให้ผู้จ้างตัดสินใจง่ายขึ้น">
        <ImagesField label="รูปผลงาน" images={form.images} onChange={form.setImages} />
      </FormSection>
    </>,

    <>
      {contact?.email || contact?.phone ? (
        <ProfileBanner
          icon="person-circle-outline"
          title="ใช้ช่องทางติดต่อจากโปรไฟล์"
          subtitle={[contact.email, contact.phone].filter(Boolean).join(" · ")}
          onPress={() => {
            if (contact.email) set("email")(contact.email);
            if (contact.phone) set("phone")(contact.phone);
          }}
        />
      ) : null}
      <ContactCard values={values} errors={errors} set={set} description="ผู้จ้างจะติดต่อคุณผ่านช่องทางนี้" />
    </>,

    <>
      <ReviewHero images={form.images} title={values.hireTitle} subtitle={values.category} />
      <FormSection title="รายละเอียดและผลงาน" icon={HIRE_STEPS[1]!.icon} action={<EditLink onPress={() => flow.goTo(1)} />}>
        <Text className="mb-3 text-base leading-6 text-text" numberOfLines={6}>{values.detail}</Text>
        <ReviewRow label="รูปผลงาน" value={form.images.length ? `${form.images.length} รูป` : ""} last />
      </FormSection>
      <FormSection title="ช่องทางติดต่อ" icon={HIRE_STEPS[2]!.icon} action={<EditLink onPress={() => flow.goTo(2)} />}>
        <ReviewRow label="อีเมล" value={values.email} />
        <ReviewRow label="เบอร์โทรศัพท์" value={values.phone} last />
      </FormSection>
      {footer ? <View className="mt-4">{footer(flow.allowLeave)}</View> : null}
    </>,
  ];

  return <StepLayout steps={HIRE_STEPS} flow={flow} form={form} submitLabel={props.submitLabel} page={pages[flow.step]} />;
}

type Form = ReturnType<typeof usePostForm<any, any>>;
type Flow = ReturnType<typeof useStepFlow>;

/** Marks the screen as leaving before saving, so the unsaved-changes prompt stays quiet. */
const guardedSubmit =
  <Input,>(leaving: RefObject<boolean>, submit: (data: Input) => Promise<void>) =>
  async (data: Input) => {
    leaving.current = true;
    try {
      await submit(data);
    } catch (error) {
      leaving.current = false;
      throw error;
    }
  };

/**
 * Page-by-page navigation for a post form: each page checks only its own fields (the
 * schema's issues filtered by page, plus `extraErrors`), a later dot jumps to the first
 * page with a problem, and leaving with unsaved changes asks first.
 */
function useStepFlow<Fields extends Record<string, unknown>>(
  form: Form,
  start: Fields,
  schema: ZodType<unknown, ZodTypeDef, unknown>,
  steps: PostStep<Fields>[],
  leaving: RefObject<boolean>,
  extraErrors: () => Record<string, string> = () => ({}),
) {
  const [step, setStep] = useState(0);
  const last = steps.length - 1;

  const navigation = useNavigation();
  const dirty = JSON.stringify(form.values) !== JSON.stringify(start) || form.images.some((image) => !image.media);
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
    [navigation, dirty, leaving],
  );

  const errorsFor = (index: number) => {
    const fields = new Set<string>(steps[index]!.fields as string[]);
    const parsed = schema.safeParse(form.values);
    const all = { ...(parsed.success ? {} : fieldErrors(parsed.error.issues)), ...extraErrors() };
    return Object.fromEntries(Object.entries(all).filter(([field]) => fields.has(field)));
  };
  const firstInvalid = (before: number) => {
    for (let i = 0; i < before; i++) if (Object.keys(errorsFor(i)).length) return i;
    return -1;
  };

  const goTo = (index: number) => {
    setStep(index);
    form.setErrors({});
  };
  const showStepErrors = (index: number) => {
    setStep(index);
    form.setErrors(errorsFor(index));
  };

  return {
    step,
    isLast: step === last,
    goTo,
    next: () => {
      const found = errorsFor(step);
      if (Object.keys(found).length) form.setErrors(found);
      else goTo(step + 1);
    },
    back: () => (step === 0 ? router.back() : goTo(step - 1)),
    onStepPress: (index: number) => {
      if (index <= step) return goTo(index);
      const invalid = firstInvalid(index);
      if (invalid === -1) goTo(index);
      else showStepErrors(invalid);
    },
    submit: () => {
      const invalid = firstInvalid(last);
      if (invalid !== -1) showStepErrors(invalid);
      else form.submit();
    },
    allowLeave: () => {
      leaving.current = true;
    },
  };
}

function StepLayout({ steps, flow, form, submitLabel, page }: { steps: Step[]; flow: Flow; form: Form; submitLabel: string; page: ReactNode }) {
  return (
    <View className="flex-1 bg-background">
      <StepHeader steps={steps} current={flow.step} onStepPress={flow.onStepPress} />
      {/* Keyed by step, so every page opens at its top. */}
      <FormScrollView key={flow.step} footerBelow>
        {page}
        {Object.keys(form.errors).length ? <Text className="text-center text-danger">กรุณากรอกข้อมูลที่ยังขาดให้ครบ</Text> : null}
      </FormScrollView>
      <StepFooter
        backLabel={flow.step === 0 ? "ยกเลิก" : "ย้อนกลับ"}
        nextLabel={flow.isLast ? submitLabel : `ถัดไป: ${steps[flow.step + 1]!.short}`}
        onBack={flow.back}
        onNext={flow.isLast ? flow.submit : flow.next}
        loading={form.submitting}
        status={form.status}
      />
    </View>
  );
}

function ProfileBanner({
  icon,
  title,
  subtitle,
  onPress,
  muted,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  subtitle: string;
  onPress: () => void;
  /** Nothing to apply yet — an invitation rather than an action. */
  muted?: boolean;
}) {
  return (
    <TouchableOpacity
      className={`mb-4 flex-row items-center rounded-card p-4 ${muted ? "border border-dashed border-border-strong bg-surface" : "border border-primary bg-primary-soft"}`}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Ionicons name={icon} size={22} color={colors.primary.DEFAULT} />
      <View className="mx-3 flex-1">
        <Text className="text-base font-bold text-text" numberOfLines={1}>{title}</Text>
        <Text className="text-sm text-text-subtle" numberOfLines={1}>{subtitle}</Text>
      </View>
      <Ionicons name={muted ? "chevron-forward" : "refresh"} size={20} color={muted ? colors.text.subtle : colors.primary.DEFAULT} />
    </TouchableOpacity>
  );
}

function ReviewHero({ images, title, subtitle, children }: { images: FormImage[]; title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <View className="mb-4 overflow-hidden rounded-card border border-border bg-surface">
      {images.length ? <PostCover images={images.map((image) => ({ url: image.uri }))} className="h-40 w-full" /> : null}
      <View className="p-5">
        <Text className="text-2xl font-bold text-text">{title}</Text>
        {subtitle ? <Text className="mt-1 text-base text-text-muted">{subtitle}</Text> : null}
        {children}
      </View>
    </View>
  );
}

const EditLink = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} hitSlop={8}>
    <Text className="text-base font-bold text-primary-dark">แก้ไข</Text>
  </TouchableOpacity>
);

const ReviewRow = ({ label, value, last }: { label: string; value?: string; last?: boolean }) => (
  <View className={`flex-row py-2 ${last ? "" : "border-b border-border"}`}>
    <Text className="w-28 text-sm text-text-subtle">{label}</Text>
    <Text className="flex-1 text-base text-text">{value?.trim() || "-"}</Text>
  </View>
);

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

function ContactCard({ values, errors, set, description }: Pick<Form, "values" | "errors" | "set"> & { description: string }) {
  return (
    <FormSection title="ช่องทางติดต่อ" icon="call-outline" description={description}>
      <TextField label="อีเมล" required placeholder="example@email.com" value={values.email} onChangeText={set("email")} error={errors.email} keyboardType="email-address" />
      <TextField label="เบอร์โทรศัพท์" required placeholder="08X-XXX-XXXX" value={values.phone} onChangeText={set("phone")} error={errors.phone} keyboardType="phone-pad" maxLength={10} />
    </FormSection>
  );
}
