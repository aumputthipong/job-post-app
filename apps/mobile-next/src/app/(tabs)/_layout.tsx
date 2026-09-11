import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#083C6B",
        tabBarInactiveTintColor: "#64748B",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "หน้าแรก",
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="keep"
        options={{
          title: "บันทึกไว้",
          tabBarIcon: ({ color, size }) => <Ionicons name="bookmark-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "โปรไฟล์",
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
