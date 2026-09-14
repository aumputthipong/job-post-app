import { Ionicons } from "@expo/vector-icons";
import { MAX_POST_IMAGES, type Media } from "@jobapp-platform/shared";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { type ReactNode, useState } from "react";
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

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  secret?: boolean;
};

export function TextField({ label, error, secret, multiline, ...inputProps }: TextFieldProps) {
  const [hidden, setHidden] = useState(true);

  return (
    <View className="mb-5">
      <Text className="mb-2 font-medium text-text">{label}</Text>
      <View
        className={`flex-row rounded-xl border bg-background ${multiline ? "min-h-[120px]" : "h-[50px] items-center"} ${
          error ? "border-red-500" : "border-border"
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
      <FieldError message={error} />
    </View>
  );
}

const FieldError = ({ message }: { message?: string }) =>
  message ? <Text className="mt-1 text-sm text-red-500">{message}</Text> : null;

/** Pick one of a few fixed values — replaces the legacy dropdowns. */
export function ChoiceChips({
  label,
  options,
  value,
  onChange,
  error,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <View className="mb-5">
      <Text className="mb-2 font-medium text-text">{label}</Text>
      <View className="flex-row flex-wrap">
        {options.map((option) => {
          const selected = option === value;
          return (
            <TouchableOpacity
              key={option}
              onPress={() => onChange(option)}
              className={`mb-2 mr-2 rounded-full border px-4 py-2 ${
                selected ? "border-primary bg-primary" : "border-border bg-background"
              }`}
            >
              <Text className={selected ? "text-surface" : "text-text"} numberOfLines={1}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <FieldError message={error} />
    </View>
  );
}

/** A list of short strings (qualifications, benefits) with add and remove. */
export function ListField({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const item = draft.trim();
    if (!item) return;
    onChange([...items, item]);
    setDraft("");
  };

  return (
    <View className="mb-5">
      <Text className="mb-2 font-medium text-text">{label}</Text>
      {items.map((item, i) => (
        <View key={`${i}-${item}`} className="mb-2 flex-row items-center rounded-xl bg-background px-4 py-3">
          <Text className="flex-1 text-base text-text">{item}</Text>
          <TouchableOpacity
            onPress={() => onChange(items.filter((_, j) => j !== i))}
            hitSlop={8}
            accessibilityLabel={`ลบ ${item}`}
          >
            <Ionicons name="close-circle" size={20} color="#EF4444" />
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
          onSubmitEditing={add}
          returnKeyType="done"
          submitBehavior="submit"
        />
        <TouchableOpacity
          className="h-[50px] w-[50px] items-center justify-center rounded-xl bg-primary"
          style={{ opacity: draft.trim() ? 1 : 0.4 }}
          onPress={add}
          disabled={!draft.trim()}
          accessibilityLabel={`เพิ่ม${label}`}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
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
        <Text className="font-medium text-text">{label}</Text>
        <Text className="text-sm text-text-subtle">
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
            className="h-24 w-24 items-center justify-center rounded-xl border border-dashed border-border bg-background"
            accessibilityLabel="เพิ่มรูป"
          >
            <Ionicons name="images-outline" size={28} color="#94A3B8" />
            <Text className="mt-1 text-xs text-text-subtle">เพิ่มรูป</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
      <Text className="mt-2 text-xs text-text-subtle">รูปแรกจะเป็นรูปปก · ไม่บังคับ</Text>
    </View>
  );
}

/** Scrolling page for a long form; keeps the focused field above the keyboard. */
export function FormScrollView({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: "#F5F7FA" }}
      contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}
      keyboardShouldPersistTaps="handled"
      bottomOffset={24}
    >
      {/* One element child: this package is root-hoisted and types children
          with the older @types/react (see providers.tsx). */}
      <View>{children}</View>
    </KeyboardAwareScrollView>
  );
}

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="mb-4 rounded-card bg-surface p-5" style={{ elevation: 2 }}>
      <Text className="mb-4 text-lg font-bold text-primary">{title}</Text>
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
      {hasErrors ? <Text className="mb-3 text-center text-red-500">กรุณากรอกข้อมูลที่ยังขาดให้ครบ</Text> : null}
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
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: "primary" | "danger";
}) {
  const danger = variant === "danger";
  return (
    <TouchableOpacity
      className={`h-14 items-center justify-center rounded-2xl ${
        danger ? "border border-red-500 bg-surface" : "bg-primary"
      } ${loading ? "opacity-70" : ""}`}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={danger ? "#EF4444" : "#FFFFFF"} />
      ) : (
        <Text className={`text-lg font-bold ${danger ? "text-red-500" : "text-surface"}`}>{title}</Text>
      )}
    </TouchableOpacity>
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
