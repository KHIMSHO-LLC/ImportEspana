import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import { ClipboardList } from "lucide-react-native";
import React from "react";
import { TouchableOpacity, View } from "react-native";

export function HistoryButton() {
  const router = useRouter();

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={() => {
        console.log("🔵 History button pressed (Component)!");
        router.push("/history");
      }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View pointerEvents="none">
        <ClipboardList size={20} color={Colors.white} />
      </View>
    </TouchableOpacity>
  );
}
