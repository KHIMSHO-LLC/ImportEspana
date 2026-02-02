import { Colors } from "@/constants/Colors";
import { Language } from "@/constants/translations";
import { useLanguage } from "@/context/LanguageContext";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "es", label: "Español", flag: "🇪🇸" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "de", label: "Deutsch", flag: "🇩🇪" },
    { code: "ru", label: "Русский", flag: "🇷🇺" },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {languages.map((lang) => (
          <Pressable
            key={lang.code}
            style={[styles.item, language === lang.code && styles.itemSelected]}
            onPress={() => setLanguage(lang.code)}
          >
            <Text style={styles.flag}>{lang.flag}</Text>
            <Text
              style={[
                styles.label,
                language === lang.code && styles.labelSelected,
              ]}
            >
              {lang.code.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "transparent",
    gap: 6,
  },
  itemSelected: {
    backgroundColor: "#E6F4FE",
    borderColor: Colors.primary,
  },
  flag: {
    fontSize: 16,
  },
  label: {
    fontSize: 13,
    color: Colors.textLight,
    fontWeight: "600",
  },
  labelSelected: {
    color: Colors.primary,
    fontWeight: "bold",
  },
});
