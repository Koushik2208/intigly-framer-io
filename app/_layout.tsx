import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";

export default function RootLayout() {
  return (
    <SafeAreaView className="flex-1 bg-transparent">
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="canvas" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaView>
  );
}
