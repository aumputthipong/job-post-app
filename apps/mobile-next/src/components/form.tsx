import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  type TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  secret?: boolean;
};

export function TextField({ label, error, secret, ...inputProps }: TextFieldProps) {
  const [hidden, setHidden] = useState(true);

  return (
    <View className="mb-5">
      <Text className="mb-2 font-medium text-text">{label}</Text>
      <View
        className={`h-[50px] flex-row items-center rounded-xl border bg-background ${
          error ? "border-red-500" : "border-border"
        }`}
      >
        <TextInput
          className="flex-1 px-4 text-base text-text"
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={secret && hidden}
          {...inputProps}
        />
        {secret ? (
          <TouchableOpacity className="p-3" onPress={() => setHidden((h) => !h)}>
            <Ionicons name={hidden ? "eye-off" : "eye"} size={22} color="#666666" />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text className="mt-1 text-sm text-red-500">{error}</Text> : null}
    </View>
  );
}

export function PrimaryButton({
  title,
  onPress,
  loading,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
}) {
  return (
    <TouchableOpacity
      className={`h-14 items-center justify-center rounded-2xl bg-primary ${loading ? "opacity-70" : ""}`}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text className="text-lg font-bold text-surface">{title}</Text>
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
