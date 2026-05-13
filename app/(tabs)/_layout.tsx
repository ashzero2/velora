import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSettingsStore } from "@src/stores/useSettingsStore";

export default function TabLayout() {
  const settings = useSettingsStore((s) => s.settings);
  const fertilityEnabled = settings.fertilityTrackingEnabled;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#6b9080",
        tabBarInactiveTintColor: "#a8a29e",
        tabBarStyle: {
          backgroundColor: "#fafaf9",
          borderTopColor: "#e7e5e4",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Cycle",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flower-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="fertility"
        options={{
          title: "Fertility",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="leaf-outline" size={size} color={color} />
          ),
          href: fertilityEnabled ? "/fertility" : null,
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: "Log",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="water-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cog-outline" size={size} color={color} />
          ),
        }}
      />
      {/* Calendar tab hidden — kept for routing but not shown in tab bar */}
      <Tabs.Screen
        name="calendar"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
