import { Fonts, Radius } from "@/constants/Colors";
import { Language } from "@/constants/translations";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const { theme } = useTheme();

  const languages: { code: Language; label: string }[] = [
    { code: "en", label: "English" },
    { code: "es", label: "Español" },
    { code: "fr", label: "Français" },
    { code: "de", label: "Deutsch" },
    { code: "ru", label: "Русский" },
  ];

  return (
    <View
      style={[
        styles.container,
        { borderBottomColor: theme.glassBorder, backgroundColor: theme.background },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {languages.map((lang) => {
          const active = language === lang.code;
          return (
            <Pressable
              key={lang.code}
              onPress={() => setLanguage(lang.code)}
              style={({ pressed }) => [
                styles.item,
                {
                  backgroundColor: active ? theme.pillActiveBg : theme.glassBg,
                  borderColor: active ? theme.pillActiveBorder : theme.glassBorder,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text
                style={{
                  color: active ? theme.brandBlueLight : theme.textSecondary,
                  fontFamily: active ? Fonts.sansBold : Fonts.sansSemibold,
                  fontSize: 12,
                  letterSpacing: 0.6,
                }}
              >
                {lang.code.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  item: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1,
    minWidth: 56,
    alignItems: "center",
    justifyContent: "center",
  },
});
