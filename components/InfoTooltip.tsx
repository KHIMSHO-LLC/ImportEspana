import { Fonts } from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import React from "react";
import { Alert, Pressable, Text, View } from "react-native";

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
      <View
        style={{
          width: 18,
          height: 18,
          borderRadius: 9,
          borderWidth: 1,
          borderColor: theme.textTertiary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: theme.textTertiary,
            fontFamily: Fonts.sansBold,
            fontSize: 11,
            lineHeight: 13,
          }}
        >
          ?
        </Text>
      </View>
    </Pressable>
  );
}
