import { Fonts } from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity } from "react-native";

export function HistoryButton() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={() => router.push("/history")}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={{
        height: 36,
        paddingHorizontal: 4,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color: theme.textPrimary,
          fontFamily: Fonts.sansMedium,
          fontSize: 14,
        }}
      >
        History
      </Text>
    </TouchableOpacity>
  );
}
