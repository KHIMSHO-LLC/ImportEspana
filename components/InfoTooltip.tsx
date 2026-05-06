import { useTheme } from "@/context/ThemeContext";
import { Info } from "lucide-react-native";
import React from "react";
import { Alert, Pressable } from "react-native";

interface InfoTooltipProps {
  text: string;
  title?: string;
}

export function InfoTooltip({ text, title = "Info" }: InfoTooltipProps) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={() => Alert.alert(title, text)}
      style={({ pressed }) => [
        {
          padding: 4,
          marginLeft: 6,
          opacity: pressed ? 0.6 : 1,
        },
      ]}
      hitSlop={12}
    >
      <Info size={16} color={theme.textTertiary} />
    </Pressable>
  );
}
