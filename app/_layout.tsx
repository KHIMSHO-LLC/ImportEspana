import { PrivacyConsent } from "@/components/PrivacyConsent";
import { Fonts, Radius } from "@/constants/Colors";
import { LanguageProvider } from "@/context/LanguageContext";
import { RevenueCatProvider, useRevenueCat } from "@/context/RevenueCatContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
  Geist_800ExtraBold,
} from "@expo-google-fonts/geist";
import {
  GeistMono_400Regular,
  GeistMono_500Medium,
  GeistMono_700Bold,
} from "@expo-google-fonts/geist-mono";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

SplashScreen.preventAutoHideAsync().catch(() => {});

function ProButton() {
  const { isPro } = useRevenueCat();
  const { theme } = useTheme();
  const router = useRouter();

  const inner = (
    <Text
      style={{
        fontFamily: Fonts.sansBold,
        color: "#0A0F1E",
        fontSize: 11,
        letterSpacing: 0.4,
      }}
    >
      {isPro ? "PRO ✓" : "PRO"}
    </Text>
  );

  const baseStyle = {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: theme.brandGoldLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    gap: 5,
  };

  if (isPro) return <View style={baseStyle}>{inner}</View>;
  return (
    <Pressable
      onPress={() => router.push("/paywall")}
      style={({ pressed }) => [baseStyle, { opacity: pressed ? 0.85 : 1 }]}
    >
      {inner}
    </Pressable>
  );
}

function ThemedStack() {
  const { theme } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      {/* Radial spotlight overlay (mirrors web --background-gradient) */}
      <LinearGradient
        pointerEvents="none"
        colors={[theme.spotlight, "transparent"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.55 }}
        style={StyleSheet.absoluteFill}
      />

      <StatusBar style={theme.statusBarStyle} />

      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.background },
          headerShadowVisible: false,
          headerTintColor: theme.textPrimary,
          headerTitleStyle: {
            fontFamily: Fonts.sansBold,
            color: theme.textPrimary,
          },
          contentStyle: { backgroundColor: "transparent" },
          headerRight: () => <ProButton />,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerTitle: () => (
              <Image
                source={require("@/assets/images/icons/logo.png")}
                style={{ width: 130, height: 36, resizeMode: "contain" }}
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
                style={{ width: 130, height: 36, resizeMode: "contain" }}
              />
            ),
          }}
        />
        <Stack.Screen name="history" options={{ headerTitle: "History" }} />
        <Stack.Screen
          name="paywall"
          options={{ presentation: "modal", headerShown: false }}
        />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
    Geist_800ExtraBold,
    GeistMono_400Regular,
    GeistMono_500Medium,
    GeistMono_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider>
      <LanguageProvider>
        <RevenueCatProvider>
          <PrivacyConsent />
          <ThemedStack />
        </RevenueCatProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
