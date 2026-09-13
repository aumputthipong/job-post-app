import type { ComponentProps } from "react";
import type { Stack } from "expo-router";

type StackOptions = NonNullable<ComponentProps<typeof Stack>["screenOptions"]>;

export const STACK_OPTIONS = {
  headerTintColor: "#083C6B",
  headerTitleStyle: { fontWeight: "bold" },
  headerStyle: { backgroundColor: "#F5F7FA" },
  headerShadowVisible: false,
  headerBackButtonDisplayMode: "minimal",
  contentStyle: { backgroundColor: "#F5F7FA" },
} satisfies StackOptions;
