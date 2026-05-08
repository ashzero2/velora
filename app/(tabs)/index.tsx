import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-secondary-50">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-2xl font-bold text-secondary-900">Luna</Text>
        <Text className="text-base text-secondary-500 mt-2">
          Your period tracker
        </Text>
      </View>
    </SafeAreaView>
  );
}