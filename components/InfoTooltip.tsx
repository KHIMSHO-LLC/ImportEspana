import { Info } from "lucide-react-native";
import React from "react";
import { Alert, Pressable, StyleSheet } from "react-native";

interface InfoTooltipProps {
  text: string;
  title?: string;
}

export function InfoTooltip({ text, title = "Info" }: InfoTooltipProps) {
  return (
    <Pressable
      onPress={() => Alert.alert(title, text)}
      style={({ pressed }) => [
        styles.container,
        { padding: 4 },
        pressed && { opacity: 0.7 },
      ]}
      hitSlop={12}
    >
      <Info size={18} color="#9CA3AF" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 6,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    elevation: 2,
  },
});
