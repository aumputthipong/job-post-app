import { Ionicons } from "@expo/vector-icons";
import { MAX_POST_IMAGES, type Media } from "@jobapp-platform/shared";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { type ComponentProps, Fragment, type ReactNode, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  type TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

/*
 * Form hierarchy, top to bottom:
 *   step header  (post form only) — what this page is for
 *   FormSection  — a card: icon tile + title, optional one-line description
 *   field label  — semibold, "*" when required, "(ไม่บังคับ)" when optional
 *   helper/error — small text under the input; an error replaces the helper
 */

type LabelProps = { label?: string; required?: boolean; optional?: boolean };

function FieldLabel({ label, required, optional }: LabelProps) {
  if (!label) return null;
  return (
    <Text className="mb-2 text-[15px] font-semibold text-text">
      {label}
      {required ? <Text className="text-danger"> *</Text> : null}
      {optional ? <Text className="text-sm font-normal text-text-subtle"> (ไม่บังคับ)</Text> : null}
    </Text>
  );
}

function FieldNote({ error, helper }: { error?: string; helper?: string }) {
  if (error) return <Text className="mt-1.5 text-sm text-danger">{error}</Text>;
  if (helper) return <Text className="mt-1.5 text-xs text-text-subtle">{helper}</Text>;
  return null;
}

type TextFieldProps = TextInputProps &
  LabelProps & {
    error?: string;
    helper?: string;
    secret?: boolean;
  };

export function TextField({ label, required, optional, error, helper, secret, multiline, ...inputProps }: TextFieldProps) {
  const [hidden, setHidden] = useState(true);

  return (
    <View className="mb-5">
      <FieldLabel label={label} required={required} optional={optional} />
      <View
        className={`flex-row rounded-xl border ${multiline ? "min-h-[120px]" : "h-[50px] items-center"} ${
          error ? "border-danger bg-danger-soft" : "border-border bg-background"
        }`}
      >
        <TextInput
          className={`flex-1 px-4 text-base text-text ${multiline ? "py-3" : ""}`}
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={secret && hidden}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          {...inputProps}
        />
        {secret ? (
          <TouchableOpacity className="p-3" onPress={() => setHidden((h) => !h)}>
            <Ionicons name={hidden ? "eye-off" : "eye"} size={22} color="#666666" />
          </TouchableOpacity>
        ) : null}
      </View>
      <FieldNote error={error} helper={helper} />
    </View>
  );
}

/** Pick one of a few fixed values — replaces the legacy dropdowns. */
export function ChoiceChips({
  label,
  required,
  optional,
  options,
  icons,
  value,
  onChange,
  error,
}: LabelProps & {
  options: string[];
  icons?: Record<string, IconName>;
  value: string | undefined;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <View className="mb-5">
      <FieldLabel label={label} required={required} optional={optional} />
      <View className="flex-row flex-wrap">
        {options.map((option) => {
          const selected = option === value;
          const icon = icons?.[option];
          return (
            <TouchableOpacity
              key={option}
              onPress={() => onChange(option)}
              className={`mb-2 mr-2 flex-row items-center rounded-full border px-4 py-2 ${
                selected ? "border-primary bg-primary" : "border-border bg-surface"
              }`}
              accessibilityState={{ selected }}
            >
              {icon ? <Ionicons name={icon} size={15} color={selected ? "#FFFFFF" : "#64748B"} style={{ marginRight: 6 }} /> : null}
              <Text className={selected ? "font-semibold text-surface" : "text-text"} numberOfLines={1}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <FieldNote error={error} />
    </View>
  );
}

/** A list of short strings (qualifications, benefits) with add, remove and one-tap suggestions. */
export function ListField({
  label,
  optional,
  items,
  onChange,
  placeholder,
  suggestions = [],
}: LabelProps & {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
  suggestions?: string[];
}) {
  const [draft, setDraft] = useState("");
  const add = (value: string) => {
    const item = value.trim();
    if (!item || items.includes(item)) return;
    onChange([...items, item]);
    setDraft("");
  };
  const remaining = suggestions.filter((s) => !items.includes(s));

  return (
    <View className="mb-5">
      <FieldLabel label={label} optional={optional} />
      {items.map((item, i) => (
        <View key={`${i}-${item}`} className="mb-2 flex-row items-center rounded-xl bg-primary-soft px-4 py-3">
          <Ionicons name="checkmark-circle" size={18} color="#083C6B" />
          <Text className="mx-2 flex-1 text-base text-text">{item}</Text>
          <TouchableOpacity
            onPress={() => onChange(items.filter((_, j) => j !== i))}
            hitSlop={8}
            accessibilityLabel={`ลบ ${item}`}
          >
            <Ionicons name="close" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>
      ))}
      <View className="flex-row items-center">
        <TextInput
          className="mr-2 h-[50px] flex-1 rounded-xl border border-border bg-background px-4 text-base text-text"
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={() => add(draft)}
          returnKeyType="done"
          submitBehavior="submit"
        />
        <TouchableOpacity
          className="h-[50px] w-[50px] items-center justify-center rounded-xl bg-primary"
          style={{ opacity: draft.trim() ? 1 : 0.4 }}
          onPress={() => add(draft)}
          disabled={!draft.trim()}
          accessibilityLabel={`เพิ่ม${label ?? ""}`}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      {remaining.length ? (
        <>
          <Text className="mb-2 mt-3 text-xs text-text-subtle">แตะเพื่อเพิ่มอย่างรวดเร็ว</Text>
          <View className="flex-row flex-wrap">
            {remaining.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => add(s)}
                className="mb-2 mr-2 rounded-full border border-dashed border-border-strong px-3 py-1.5"
              >
                <Text className="text-sm text-text-muted" numberOfLines={1}>
                  + {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

/** Opens the system photo picker with a crop step; resolves to a local URI, or undefined if cancelled. */
export async function pickImage(aspect: [number, number]) {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect,
    quality: 0.8,
  });
  return result.canceled ? undefined : result.assets[0].uri;
}

/** An image in a form: already stored (`media` set) or just picked, still to upload. */
export type FormImage = { uri: string; media?: Media };

/**
 * Several images, first one the cover. The system picker can't crop a
 * multi-selection, so none of them are cropped; screens crop to fill instead.
 */
export function ImagesField({
  label,
  images,
  onChange,
}: {
  label: string;
  images: FormImage[];
  onChange: (images: FormImage[]) => void;
}) {
  const room = MAX_POST_IMAGES - images.length;

  const add = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: room,
      orderedSelection: true,
      quality: 0.8,
    });
    if (result.canceled) return;
    const known = new Set(images.map((image) => image.uri));
    const picked = result.assets.map((asset) => ({ uri: asset.uri })).filter((image) => !known.has(image.uri));
    onChange([...images, ...picked].slice(0, MAX_POST_IMAGES));
  };

  return (
    <View className="mb-5">
      <View className="mb-2 flex-row items-center justify-between">
        <FieldLabel label={label} optional />
        <Text className="mb-2 text-sm text-text-subtle">
          {images.length}/{MAX_POST_IMAGES}
        </Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingTop: 8 }}>
        {images.map((image, i) => (
          <View key={image.uri} className="mr-3">
            <Image source={{ uri: image.uri }} contentFit="cover" style={{ width: 96, height: 96, borderRadius: 12 }} />
            {i === 0 ? (
              <View className="absolute bottom-1.5 left-1.5 rounded-full bg-black/60 px-2 py-0.5">
                <Text className="text-xs text-surface">ปก</Text>
              </View>
            ) : null}
            <TouchableOpacity
              className="absolute -right-2 -top-2 rounded-full bg-surface"
              onPress={() => onChange(images.filter((_, j) => j !== i))}
              hitSlop={8}
              accessibilityLabel={`ลบรูปที่ ${i + 1}`}
            >
              <Ionicons name="close-circle" size={24} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))}
        {room > 0 ? (
          <TouchableOpacity
            onPress={add}
            activeOpacity={0.8}
            className="h-24 w-24 items-center justify-center rounded-xl border border-dashed border-border-strong bg-background"
            accessibilityLabel="เพิ่มรูป"
          >
            <Ionicons name="images-outline" size={28} color="#94A3B8" />
            <Text className="mt-1 text-xs text-text-subtle">เพิ่มรูป</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
      <Text className="mt-2 text-xs text-text-subtle">รูปแรกจะเป็นรูปปก</Text>
    </View>
  );
}

/**
 * Scrolling page for a form; keeps the focused field above the keyboard.
 * `footerBelow`: a sticky footer sits under the scroll view and takes the bottom inset itself.
 */
export function FormScrollView({ children, footerBelow }: { children: ReactNode; footerBelow?: boolean }) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: "#F5F7FA" }}
      contentContainerStyle={{ padding: 16, paddingBottom: (footerBelow ? 0 : insets.bottom) + 24 }}
      keyboardShouldPersistTaps="handled"
      bottomOffset={24}
    >
      {/* One element child: this package is root-hoisted and types children
          with the older @types/react (see providers.tsx). */}
      <View>{children}</View>
    </KeyboardAwareScrollView>
  );
}

export function FormSection({
  title,
  icon,
  description,
  action,
  children,
}: {
  title: string;
  icon?: IconName;
  description?: string;
  /** Right side of the title row, e.g. an "แก้ไข" link on the review step. */
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <View className="mb-4 rounded-card border border-border bg-surface p-5">
      <View className={`flex-row items-center ${description ? "mb-1" : "mb-4"}`}>
        {icon ? (
          <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl bg-primary-soft">
            <Ionicons name={icon} size={18} color="#083C6B" />
          </View>
        ) : null}
        <Text className="flex-1 text-lg font-bold text-text" numberOfLines={1}>
          {title}
        </Text>
        {action}
      </View>
      {description ? (
        <Text className={`mb-4 text-sm text-text-subtle ${icon ? "ml-12" : ""}`}>{description}</Text>
      ) : null}
      {children}
    </View>
  );
}

/** Submit button, with a summary line above it while any field has an error. */
export function SubmitButton({
  title,
  onPress,
  loading,
  hasErrors,
  status,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  hasErrors?: boolean;
  /** What a long save is doing, e.g. upload progress. */
  status?: string;
}) {
  return (
    <>
      {hasErrors ? <Text className="mb-3 text-center text-danger">กรุณากรอกข้อมูลที่ยังขาดให้ครบ</Text> : null}
      {status ? <Text className="mb-3 text-center text-text-subtle">{status}</Text> : null}
      <PrimaryButton title={title} onPress={onPress} loading={loading} />
    </>
  );
}

export function PrimaryButton({
  title,
  onPress,
  loading,
  variant = "primary",
  icon,
  className = "",
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  /** primary: the one main action · secondary: its alternative · danger: destructive, kept apart. */
  variant?: "primary" | "secondary" | "danger";
  icon?: IconName;
  className?: string;
}) {
  const styles = {
    primary: { box: "bg-primary", text: "text-surface", color: "#FFFFFF" },
    secondary: { box: "border border-border bg-surface", text: "text-primary", color: "#083C6B" },
    danger: { box: "border border-danger bg-surface", text: "text-danger", color: "#EF4444" },
  }[variant];
  return (
    <TouchableOpacity
      className={`h-14 flex-row items-center justify-center rounded-2xl px-4 ${styles.box} ${loading ? "opacity-70" : ""} ${className}`}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={styles.color} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={20} color={styles.color} style={{ marginRight: 6 }} /> : null}
          <Text className={`text-lg font-bold ${styles.text}`} numberOfLines={1}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

export type Step = { title: string; short: string; hint: string; icon: IconName };

/** Numbered dots with short labels; tapping a dot asks the form to go there. */
export function StepHeader({ steps, current, onStepPress }: { steps: Step[]; current: number; onStepPress: (index: number) => void }) {
  const step = steps[current]!;
  return (
    <View className="border-b border-border bg-surface px-4 pb-4 pt-3">
      <View className="flex-row items-start">
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <Fragment key={s.short}>
              {i > 0 ? <View className={`mt-[13px] h-0.5 flex-1 ${i <= current ? "bg-primary" : "bg-border"}`} /> : null}
              <TouchableOpacity
                className="w-14 items-center"
                onPress={() => onStepPress(i)}
                accessibilityLabel={`ขั้นตอนที่ ${i + 1} ${s.title}`}
                accessibilityState={{ selected: active }}
              >
                <View
                  className={`h-7 w-7 items-center justify-center rounded-full border-2 ${
                    done || active ? "border-primary bg-primary" : "border-border bg-surface"
                  }`}
                >
                  {done ? (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  ) : (
                    <Text className={`text-xs font-bold ${active ? "text-surface" : "text-text-subtle"}`}>{i + 1}</Text>
                  )}
                </View>
                <Text
                  className={`mt-1 text-[11px] ${active || done ? "font-semibold text-primary" : "text-text-subtle"}`}
                  numberOfLines={1}
                >
                  {s.short}
                </Text>
              </TouchableOpacity>
            </Fragment>
          );
        })}
      </View>

      <View className="mt-3 flex-row items-center">
        <Text className="mr-2 rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-bold text-primary">
          {current + 1}/{steps.length}
        </Text>
        <Text className="flex-1 text-xl font-bold text-text" numberOfLines={1}>
          {step.title}
        </Text>
      </View>
      <Text className="mt-1 text-sm text-text-subtle">{step.hint}</Text>
    </View>
  );
}

/** Back and next, pinned under the form. */
export function StepFooter({
  backLabel,
  nextLabel,
  onBack,
  onNext,
  loading,
  status,
}: {
  backLabel: string;
  nextLabel: string;
  onBack: () => void;
  onNext: () => void;
  loading?: boolean;
  status?: string;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View className="border-t border-border bg-surface px-4 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
      {status ? <Text className="mb-2 text-center text-sm text-text-subtle">{status}</Text> : null}
      <View className="flex-row">
        <PrimaryButton title={backLabel} variant="secondary" onPress={onBack} className="mr-3 flex-1" />
        <View className="flex-[2]">
          <PrimaryButton title={nextLabel} onPress={onNext} loading={loading} />
        </View>
      </View>
    </View>
  );
}

/** Zod issues → { field: first message } for showing under each input. */
export function fieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const field = String(issue.path[0]);
    errors[field] ??= issue.message;
  }
  return errors;
}
