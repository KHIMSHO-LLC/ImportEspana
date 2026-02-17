import { Colors } from "@/constants/Colors";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Image, Pressable, Text, TouchableOpacity, View } from "react-native";

import { LanguageProvider } from "@/context/LanguageContext";
import { RevenueCatProvider, useRevenueCat } from "@/context/RevenueCatContext";
import { ClipboardList, Crown } from "lucide-react-native";

function ProButton() {
  const { isPro } = useRevenueCat();
  const router = useRouter();

  if (isPro) {
    // Show a "PRO ✓" badge for subscribers
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#FFD700",
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 20,
          gap: 4,
        }}
      >
        <Crown size={16} color="#000" />
        <Text style={{ fontWeight: "bold", color: "#000", fontSize: 12 }}>
          PRO ✓
        </Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={() => router.push("/paywall")}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFD700",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
      }}
    >
      <Crown size={16} color="#000" />
      <Text style={{ fontWeight: "bold", color: "#000", fontSize: 12 }}>
        PRO
      </Text>
    </Pressable>
  );
}

function HistoryButton() {
  const router = useRouter();
  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={() => {
        console.log("🔵 History button pressed!");
        router.navigate("/history");
      }}
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(255,255,255,0.15)",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 4,
      }}
    >
      <ClipboardList size={20} color={Colors.white} />
    </TouchableOpacity>
  );
}

export default function RootLayout() {
  return (
    <LanguageProvider>
      <RevenueCatProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: Colors.white,
            headerTitleStyle: { fontWeight: "bold" },
            contentStyle: { backgroundColor: Colors.background },
            headerRight: () => <ProButton />,
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
              headerLeft: () => <HistoryButton />,
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
          <Stack.Screen
            name="history"
            options={{
              headerTitle: "History",
            }}
          />
          <Stack.Screen
            name="paywall"
            options={{
              presentation: "modal",
              headerTitle: "ImportEspana Pro",
              headerRight: () => null,
            }}
          />
        </Stack>
      </RevenueCatProvider>
    </LanguageProvider>
  );
}
