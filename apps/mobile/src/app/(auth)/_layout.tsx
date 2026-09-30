import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export const unstable_settings = { initialRouteName: "welcome" };

export default function AuthLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
