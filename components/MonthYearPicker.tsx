import { Fonts, Radius, Space } from "@/constants/Colors";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { ChevronDown, X } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface MonthYearPickerProps {
  value: string; // YYYY-MM
  onChange: (value: string) => void;
  style?: any;
}

export function MonthYearPicker({
  value,
  onChange,
  style,
}: MonthYearPickerProps) {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const lang = language === "es" ? "es" : "en";

  const [year, month] = value ? value.split("-") : ["", ""];

  const currentYear = new Date().getFullYear();
  const years = useMemo(() => {
    const arr: string[] = [];
    for (let y = currentYear; y >= 1990; y--) arr.push(y.toString());
    return arr;
  }, [currentYear]);

  const months = useMemo(
    () => [
      { value: "01", label: lang === "es" ? "Enero" : "January" },
      { value: "02", label: lang === "es" ? "Febrero" : "February" },
      { value: "03", label: lang === "es" ? "Marzo" : "March" },
      { value: "04", label: lang === "es" ? "Abril" : "April" },
      { value: "05", label: lang === "es" ? "Mayo" : "May" },
      { value: "06", label: lang === "es" ? "Junio" : "June" },
      { value: "07", label: lang === "es" ? "Julio" : "July" },
      { value: "08", label: lang === "es" ? "Agosto" : "August" },
      { value: "09", label: lang === "es" ? "Septiembre" : "September" },
      { value: "10", label: lang === "es" ? "Octubre" : "October" },
      { value: "11", label: lang === "es" ? "Noviembre" : "November" },
      { value: "12", label: lang === "es" ? "Diciembre" : "December" },
    ],
    [lang],
  );

  const [activeModal, setActiveModal] = useState<"month" | "year" | null>(null);

  const handleMonthChange = (newMonth: string) => {
    const y = year || currentYear.toString();
    onChange(`${y}-${newMonth}`);
    setActiveModal(null);
  };

  const handleYearChange = (newYear: string) => {
    const m = month || "01";
    onChange(`${newYear}-${m}`);
    setActiveModal(null);
  };

  const selectedMonthLabel = useMemo(() => {
    if (!month) return lang === "es" ? "Mes" : "Month";
    const m = months.find((mo) => mo.value === month);
    return m ? m.label : month;
  }, [month, months, lang]);

  const dropdownStyle = {
    backgroundColor: theme.inputBg,
    borderColor: theme.inputBorder,
  };

  return (
    <View style={[styles.row, style]}>
      <Pressable
        style={[styles.dropdown, dropdownStyle]}
        onPress={() => setActiveModal("month")}
      >
        <Text
          style={{
            color: month ? theme.textPrimary : theme.textTertiary,
            fontFamily: Fonts.sansMedium,
            fontSize: 15,
          }}
        >
          {selectedMonthLabel}
        </Text>
        <ChevronDown size={16} color={theme.textTertiary} />
      </Pressable>

      <Pressable
        style={[styles.dropdown, dropdownStyle, { flex: 0.7 }]}
        onPress={() => setActiveModal("year")}
      >
        <Text
          style={{
            color: year ? theme.textPrimary : theme.textTertiary,
            fontFamily: Fonts.sansMedium,
            fontSize: 15,
          }}
        >
          {year || (lang === "es" ? "Año" : "Year")}
        </Text>
        <ChevronDown size={16} color={theme.textTertiary} />
      </Pressable>

      <Modal
        visible={activeModal !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.overlay}>
          <View
            style={[
              styles.sheet,
              { backgroundColor: theme.surfacePopover },
            ]}
          >
            <View
              style={[
                styles.sheetHeader,
                { borderBottomColor: theme.glassBorder },
              ]}
            >
              <Text
                style={{
                  color: theme.textPrimary,
                  fontFamily: Fonts.sansBold,
                  fontSize: 17,
                }}
              >
                {activeModal === "month"
                  ? lang === "es"
                    ? "Seleccionar Mes"
                    : "Select Month"
                  : lang === "es"
                    ? "Seleccionar Año"
                    : "Select Year"}
              </Text>
              <Pressable
                onPress={() => setActiveModal(null)}
                hitSlop={10}
                style={{ padding: 4 }}
              >
                <X size={22} color={theme.textPrimary} />
              </Pressable>
            </View>
            <ScrollView style={{ paddingHorizontal: 8 }}>
              {activeModal === "month"
                ? months.map((m) => (
                    <SheetItem
                      key={m.value}
                      label={m.label}
                      selected={month === m.value}
                      onPress={() => handleMonthChange(m.value)}
                    />
                  ))
                : years.map((y) => (
                    <SheetItem
                      key={y}
                      label={y}
                      selected={year === y}
                      onPress={() => handleYearChange(y)}
                    />
                  ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SheetItem({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.glassBorder,
        borderRadius: Radius.sm,
        backgroundColor: selected ? theme.pillActiveBg : "transparent",
      }}
    >
      <Text
        style={{
          color: selected ? theme.brandBlueLight : theme.textPrimary,
          fontFamily: selected ? Fonts.sansBold : Fonts.sansMedium,
          fontSize: 16,
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 12 },
  dropdown: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderRadius: Radius.md,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    maxHeight: "65%",
    paddingBottom: Space.lg,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Space.md + 4,
    borderBottomWidth: 1,
  },
});
