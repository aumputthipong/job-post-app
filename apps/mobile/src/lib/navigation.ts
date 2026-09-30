import type { ComponentProps } from "react";
import type { Stack } from "expo-router";
import { colors } from "@/lib/colors";

type StackOptions = NonNullable<ComponentProps<typeof Stack>["screenOptions"]>;

export const STACK_OPTIONS = {
  // Orange back arrow, dark title: the title names the page, the arrow is the action.
  headerTintColor: colors.primary.DEFAULT,
  headerTitleStyle: { fontWeight: "bold", color: colors.text.DEFAULT },
  headerStyle: { backgroundColor: colors.background },
  headerShadowVisible: false,
  headerBackButtonDisplayMode: "minimal",
  contentStyle: { backgroundColor: colors.background },
} satisfies StackOptions;
