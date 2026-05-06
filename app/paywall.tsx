import { useRevenueCat } from "@/context/RevenueCatContext";
import { Stack, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Alert, View } from "react-native";
import RevenueCatUI from "react-native-purchases-ui";

export default function PaywallScreen() {
  const { isPro } = useRevenueCat();
  const router = useRouter();

  // If user becomes Pro while on this screen, close it
  useEffect(() => {
    if (isPro) {
      router.back();
    }
  }, [isPro, router]);

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false, presentation: "modal" }} />
      <RevenueCatUI.Paywall
        onPurchaseCompleted={({ customerInfo }) => {
          console.log("Purchase completed:", customerInfo);
          // router.back() // Handled by useEffect
        }}
        onRestoreCompleted={({ customerInfo }) => {
          console.log("Restore completed:", customerInfo);
          Alert.alert("Success", "Purchases restored!");
        }}
        onDismiss={() => {
          router.back();
        }}
      />
    </View>
  );
}
