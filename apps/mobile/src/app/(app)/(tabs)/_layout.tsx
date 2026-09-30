import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { type ColorValue, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HidingTabBar, TabBarVisibilityProvider } from "@/components/tab-bar";
import { colors } from "@/lib/colors";

type IconName = ComponentProps<typeof Ionicons>["name"];

/** The current tab: a solid orange pill with a white icon, so it reads at a glance. */
function TabIcon({ name, focused, color }: { name: string; focused: boolean; color: ColorValue }) {
  return (
    <View className={`h-8 w-14 items-center justify-center rounded-full ${focused ? "bg-primary" : ""}`}>
      <Ionicons name={(focused ? name : `${name}-outline`) as IconName} color={focused ? colors.onPrimary : color} size={22} />
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <TabBarVisibilityProvider>
      <Tabs
        tabBar={(props) => <HidingTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary.dark,
          tabBarInactiveTintColor: colors.text.subtle,
          // Thai vowels above and below the line need the extra line height, or the label clips
          // (see "Thai label clipping" in MIGRATION.md 4.3); the bar grows to fit the pill.
          tabBarLabelStyle: { fontSize: 12, fontWeight: "600", lineHeight: 18 },
          tabBarStyle: { borderTopColor: colors.border.DEFAULT, paddingTop: 8, height: 68 + insets.bottom },
          tabBarHideOnKeyboard: true,
        }}
      >
        <Tabs.Screen
          name="(home)"
          options={{
            title: "หน้าแรก",
            tabBarIcon: ({ color, focused }) => <TabIcon name="home" focused={focused} color={color} />,
          }}
        />
        <Tabs.Screen
          name="(keep)"
          options={{
            title: "บันทึกไว้",
            tabBarIcon: ({ color, focused }) => <TabIcon name="bookmark" focused={focused} color={color} />,
          }}
        />
        <Tabs.Screen
          name="(profile)"
          options={{
            title: "โปรไฟล์",
            tabBarIcon: ({ color, focused }) => <TabIcon name="person" focused={focused} color={color} />,
          }}
        />
      </Tabs>
    </TabBarVisibilityProvider>
  );
}
