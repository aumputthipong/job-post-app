import React from "react";
import { View, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import { useDispatch } from "react-redux";

import CustomHeaderButton from "../components/CustomHeaderButton";
import { toggleFavorite } from "../store/actions/jobAction";

// ── Screens ───────────────────────────────────────────────────────────────────
import HomeScreen           from "../screens/HomeScreen";
import WelcomeScreen        from "../screens/WelcomeScreen";
import LoginScreen          from "../screens/reg/LoginScreen";
import RegisterScreen       from "../screens/reg/RegisterScreen";
import FindJobScreen        from "../screens/jobpost/FindJobScreen";
import HireJobScreen        from "../screens/jobpost/HireJobScreen";
import FindJobDetailScreen  from "../screens/detail/FindJobDetailScreen";
import HireJobDetailScreen  from "../screens/detail/HireJobDetailScreen";
import NotificationScreen   from "../screens/notification/NotificationScreen";
import MyProfileScreen      from "../screens/profile/MyProFileScreen";
import OtherProfileScreen   from "../screens/profile/OtherProfileScreen";
import KeepScreen           from "../screens/keep/KeepScreen";
import CreateFind           from "../screens/create/CreateFind";
import CreateHire           from "../screens/create/CreateHire";
import EditFind             from "../screens/edit/EditFind";
import EditHire             from "../screens/edit/EditHire";
import EditNoti             from "../screens/edit/EditNoti";

// ── Design tokens (match HomeScreen) ─────────────────────────────────────────
const C = {
  bg:          "#F7F6F2",
  dark:        "#1C1C1E",
  white:       "#FFFFFF",
  accent:      "#534AB7",
  accentLight: "#EAE9FF",
  textPrimary: "#1a1a1a",
  textMuted:   "#999",
  border:      "#ECEAE3",
  tab:"#083C6B",
};

const HEADER_OPTIONS = {
  headerStyle:           { backgroundColor: C.tab },
  headerTintColor:       C.textPrimary,
  headerTitle:           "",
  headerShadowVisible:   false,
  headerBackTitleVisible: false,
};

// ── Stack Navigators ──────────────────────────────────────────────────────────
const HomeStack = createNativeStackNavigator();
const NotiStack = createNativeStackNavigator();
const BottomTab = createBottomTabNavigator();
const MainStack = createNativeStackNavigator();

function HomeNavigator() {
  const dispatch = useDispatch();
  const toggleFavoriteHandler = (id) => dispatch(toggleFavorite(id));

  return (
    <HomeStack.Navigator
      initialRouteName="HomeScreen"
      screenOptions={HEADER_OPTIONS}
    >
      <HomeStack.Screen name="HomeScreen"        component={HomeScreen} />
      <HomeStack.Screen name="FindJobScreen"     component={FindJobScreen} />
      <HomeStack.Screen name="HireJobScreen"     component={HireJobScreen} />
      <HomeStack.Screen name="FindJobDetailScreen" component={FindJobDetailScreen}
        options={({ route }) => ({
          headerRight: () => (
            <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
              <Item
                title="Favorite"
                iconName="ios-star"
                onPress={() => toggleFavoriteHandler(route.params.id)}
              />
            </HeaderButtons>
          ),
        })}
      />
      <HomeStack.Screen name="HireJobDetailScreen" component={HireJobDetailScreen} />
      <HomeStack.Screen name="CreateFind"        component={CreateFind} />
      <HomeStack.Screen name="CreateHire"        component={CreateHire} />
      <HomeStack.Screen name="EditFind"          component={EditFind} />
      <HomeStack.Screen name="EditHire"          component={EditHire} />
      <HomeStack.Screen name="OtherProfile"      component={OtherProfileScreen} />
    </HomeStack.Navigator>
  );
}

function NotiNavigator() {
  return (
    <NotiStack.Navigator
      initialRouteName="NotificationScreen"
      screenOptions={HEADER_OPTIONS}
    >
      <NotiStack.Screen name="NotificationScreen" component={NotificationScreen} />
      <NotiStack.Screen name="EditNoti"            component={EditNoti} />
    </NotiStack.Navigator>
  );
}

// ── Tab Icon ──────────────────────────────────────────────────────────────────
function TabIcon({ name, focused }) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
      <Ionicons
        name={name}
        size={22}
        color={focused ? C.accent : C.textMuted}
      />
    </View>
  );
}

// ── Bottom Tab Navigator ──────────────────────────────────────────────────────
function BottomTabNav() {
  return (
    <BottomTab.Navigator
      screenOptions={{
        headerShown:           false,
        tabBarShowLabel:       false,
        tabBarStyle:           styles.tabBar,
      }}
    >
      <BottomTab.Screen
        name="Home"
        component={HomeNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? "home" : "home-outline"} focused={focused} />
          ),
        }}
      />
      <BottomTab.Screen
        name="MyKeep"
        component={KeepScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? "bookmark" : "bookmark-outline"} focused={focused} />
          ),
        }}
      />
      <BottomTab.Screen
        name="Notification"
        component={NotiNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? "notifications" : "notifications-outline"} focused={focused} />
          ),
        }}
      />
      <BottomTab.Screen
        name="MyProfile"
        component={MyProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? "person" : "person-outline"} focused={focused} />
          ),
        }}
      />
    </BottomTab.Navigator>
  );
}

// ── Main Navigator ────────────────────────────────────────────────────────────
export default function MyNavigator() {
  return (
    <NavigationContainer>
      <MainStack.Navigator
        initialRouteName="Welcome"
        screenOptions={{ headerShown: false }}
      >
        <MainStack.Screen name="BottomTabNav" component={BottomTabNav} />
        <MainStack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ ...HEADER_OPTIONS, headerShown: true }}
        />
        <MainStack.Screen
          name="Login"
          component={LoginScreen}
          options={{ ...HEADER_OPTIONS, headerShown: true }}
        />
        <MainStack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ ...HEADER_OPTIONS, headerShown: true }}
        />
      </MainStack.Navigator>
    </NavigationContainer>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor:  C.white,
    borderTopColor:   C.border,
    borderTopWidth:   0.5,
    height:           64,
    paddingBottom:    8,
    paddingTop:       8,
    elevation:        0,
    shadowOpacity:    0,
  },
  tabIcon: {
    width:          44,
    height:         44,
    borderRadius:   12,
    alignItems:     "center",
    justifyContent: "center",
  },
  tabIconActive: {
    backgroundColor: C.accentLight,
  },
});