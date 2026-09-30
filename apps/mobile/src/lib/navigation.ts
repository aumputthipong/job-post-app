import type { ComponentProps } from "react";
import type { Stack } from "expo-router";
import { colors } from "@/lib/colors";

type StackOptions = NonNullable<ComponentProps<typeof Stack>["screenOptions"]>;

export const STACK_OPTIONS = {
  // A navy bar with a white title, as on the job boards; the tab roots draw the same navy band.
  headerTintColor: colors.onPrimary,
  headerTitleStyle: { fontWeight: "bold", color: colors.onPrimary },
  headerStyle: { backgroundColor: colors.secondary.DEFAULT },
  headerShadowVisible: false,
  headerBackButtonDisplayMode: "minimal",
  contentStyle: { backgroundColor: colors.background },
} satisfies StackOptions;
