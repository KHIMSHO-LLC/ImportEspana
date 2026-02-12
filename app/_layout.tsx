import { Colors } from "@/constants/Colors";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Image } from "react-native";

import { LanguageProvider } from "@/context/LanguageContext";

export default function RootLayout() {
  return (
    <LanguageProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
          headerTitleStyle: { fontWeight: "bold" },
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerTitle: () => (
              <Image
                source={require("@/assets/images/icons/logo.png")}
                style={{ width: 140, height: 40, resizeMode: "contain" }}
              />
            ),
          }}
        />
        <Stack.Screen
          name="result"
          options={{
            headerTitle: () => (
              <Image
                source={require("@/assets/images/icons/logo.png")}
                style={{ width: 140, height: 40, resizeMode: "contain" }}
              />
            ),
          }}
        />
      </Stack>
    </LanguageProvider>
  );
}
