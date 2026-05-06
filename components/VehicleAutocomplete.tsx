import { Badge, Input, Label } from "@/components/ui";
import { Fonts, Radius, Space } from "@/constants/Colors";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import {
  Calendar,
  Car,
  CheckCircle2,
  Coins,
  Wrench,
  Zap,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import boePrices from "../src/data/boe_prices.json";
import { InfoTooltip } from "./InfoTooltip";

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  startYear: string;
  endYear: string | null;
  cc: string;
  cylinders: string;
  fuelType: string;
  kw: string;
  cvf: string;
  cv: number;
  value: number;
  co2?: number | null;
}

interface VehicleAutocompleteProps {
  onVehicleSelected: (data: {
    value: number;
    brand?: string;
    model?: string;
    fuelType?: string;
    isManual: boolean;
    year?: number;
    co2?: number | null;
  }) => void;
  initialData?: {
    brand?: string;
    model?: string;
    value: number;
    fuelType?: string;
    isManual: boolean;
  } | null;
}

export function VehicleAutocomplete({
  onVehicleSelected,
  initialData,
}: VehicleAutocompleteProps) {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [brandQuery, setBrandQuery] = useState(initialData?.brand || "");
  const [modelQuery, setModelQuery] = useState(initialData?.model || "");
  const [yearFilter, setYearFilter] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(
    initialData?.brand || null,
  );
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(
    initialData && !initialData.isManual && initialData.brand
      ? {
          brand: initialData.brand,
          model: initialData.model,
          value: initialData.value,
          fuelType: initialData.fuelType,
        }
      : null,
  );

  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);
  const [showModelSuggestions, setShowModelSuggestions] = useState(false);
  const [isManualMode, setIsManualMode] = useState(
    initialData?.isManual || false,
  );
  const [manualValue, setManualValue] = useState(
    initialData?.isManual ? initialData.value.toString() : "",
  );

  const allBrands = useMemo(() => {
    const brandSet = new Set<string>();
    (boePrices as unknown as Vehicle[]).forEach((v) => brandSet.add(v.brand));
    return Array.from(brandSet).sort();
  }, []);

  const filteredBrands = useMemo(() => {
    if (!brandQuery.trim()) return [];
    const q = brandQuery.toLowerCase();
    return allBrands
      .filter((b) => b.toLowerCase().includes(q))
      .slice(0, 10);
  }, [brandQuery, allBrands]);

  const filteredModels = useMemo(() => {
    if (!selectedBrand || !modelQuery.trim()) return [];
    const q = modelQuery.toLowerCase();
    const year = yearFilter ? parseInt(yearFilter) : null;
    return (boePrices as unknown as Vehicle[])
      .filter((v) => {
        if (v.brand !== selectedBrand) return false;
        if (!v.model.toLowerCase().includes(q)) return false;
        if (year) {
          const sy = parseInt(v.startYear);
          const ey = v.endYear ? parseInt(v.endYear) : 2026;
          if (year < sy || year > ey) return false;
        }
        return true;
      })
      .slice(0, 15);
  }, [selectedBrand, modelQuery, yearFilter]);

  const handleBrandSelect = (brand: string) => {
    setSelectedBrand(brand);
    setBrandQuery(brand);
    setShowBrandSuggestions(false);
    setModelQuery("");
    setSelectedVehicle(null);
    Keyboard.dismiss();
  };

  const handleModelSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setModelQuery(vehicle.model);
    setShowModelSuggestions(false);
    const yearInput = yearFilter ? parseInt(yearFilter) : undefined;
    onVehicleSelected({
      value: vehicle.value,
      brand: vehicle.brand,
      model: vehicle.model,
      fuelType: vehicle.fuelType,
      isManual: false,
      year: yearInput,
      co2: vehicle.co2,
    });
    Keyboard.dismiss();
  };

  const handleManualSubmit = () => {
    const value = parseFloat(manualValue);
    if (!isNaN(value) && value > 0) {
      onVehicleSelected({ value, isManual: true });
      Keyboard.dismiss();
    }
  };

  const toggleManualMode = () => {
    setIsManualMode(!isManualMode);
    setSelectedVehicle(null);
    setSelectedBrand(null);
    setBrandQuery("");
    setModelQuery("");
    setManualValue("");
  };

  const suggestionsCardStyle = {
    backgroundColor: theme.surfacePopover,
    borderColor: theme.glassBorder,
  };

  if (isManualMode) {
    return (
      <View>
        <Label icon={<Coins size={16} color={theme.brandBlue} />}>
          {t("manualEntryLabel")}
        </Label>
        <Text
          style={{
            color: theme.textTertiary,
            fontSize: 12,
            fontFamily: Fonts.sansRegular,
            marginBottom: Space.sm,
          }}
        >
          {t("manualEntryHelp")}
        </Text>
        <Input
          testID="manual-value-input"
          keyboardType="numeric"
          placeholder="Ej: 45000"
          value={manualValue}
          // Commit live on every keystroke — numeric keyboard has no return
          // key on iOS, so blur/submit-based commits are unreliable.
          onChangeText={(v) => {
            setManualValue(v);
            const num = parseFloat(v);
            if (!isNaN(num) && num > 0) {
              onVehicleSelected({ value: num, isManual: true });
            }
          }}
          onSubmitEditing={handleManualSubmit}
          onEndEditing={handleManualSubmit}
        />
        {!!manualValue && parseFloat(manualValue) > 0 && (
          <Pressable
            testID="manual-value-confirm"
            style={[
              styles.confirmBtn,
              { backgroundColor: theme.brandBlue, borderColor: theme.brandBlueDeep },
            ]}
            onPress={handleManualSubmit}
          >
            <Text
              style={{
                color: "#fff",
                fontFamily: Fonts.sansBold,
                fontSize: 14,
              }}
            >
              {t("confirmValue")}
            </Text>
          </Pressable>
        )}
        <Pressable style={styles.switchLink} onPress={toggleManualMode}>
          <Text
            style={{
              color: theme.brandBlueLight,
              fontSize: 13,
              fontFamily: Fonts.sansMedium,
              textDecorationLine: "underline",
            }}
          >
            {t("backToSearch")}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View>
      {/* Brand */}
      <View style={{ zIndex: 10, marginBottom: Space.md }}>
        <Label
          icon={<Car size={16} color={theme.brandBlue} />}
          trailing={<InfoTooltip text={t("vehicleSearchInfo")} />}
        >
          {t("brand")}
        </Label>
        <Input
          placeholder="Mercedes, BMW…"
          value={brandQuery}
          onChangeText={(v) => {
            setBrandQuery(v);
            setShowBrandSuggestions(true);
            setSelectedBrand(null);
          }}
          onFocus={() => setShowBrandSuggestions(true)}
        />
        {showBrandSuggestions && filteredBrands.length > 0 && (
          <View style={[styles.suggestions, suggestionsCardStyle]}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              style={{ maxHeight: 200 }}
            >
              {filteredBrands.map((b) => (
                <Pressable
                  key={b}
                  style={[
                    styles.suggestionItem,
                    { borderBottomColor: theme.glassBorder },
                  ]}
                  onPress={() => handleBrandSelect(b)}
                >
                  <Text
                    style={{
                      color: theme.textPrimary,
                      fontSize: 15,
                      fontFamily: Fonts.sansMedium,
                    }}
                  >
                    {b}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Year */}
      {selectedBrand && (
        <View style={{ marginBottom: Space.md }}>
          <Label
            icon={<Calendar size={16} color={theme.brandBlue} />}
            trailing={<InfoTooltip text={t("yearInfo")} />}
          >
            {t("yearOptional")}
          </Label>
          <Input
            keyboardType="numeric"
            placeholder="Ej: 2020"
            maxLength={4}
            value={yearFilter}
            onChangeText={setYearFilter}
          />
        </View>
      )}

      {/* Model */}
      {selectedBrand && (
        <View style={{ zIndex: 5, marginBottom: Space.md }}>
          <Label
            icon={<Wrench size={16} color={theme.brandBlue} />}
            trailing={<InfoTooltip text={t("vehicleSearchInfo")} />}
          >
            {t("model")}
          </Label>
          <Input
            placeholder="X5, Clase C…"
            value={modelQuery}
            onChangeText={(v) => {
              setModelQuery(v);
              setShowModelSuggestions(true);
            }}
            onFocus={() => setShowModelSuggestions(true)}
          />
          {showModelSuggestions && filteredModels.length > 0 && (
            <View style={[styles.suggestions, suggestionsCardStyle]}>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                style={{ maxHeight: 220 }}
              >
                {filteredModels.map((v) => (
                  <Pressable
                    key={v.id}
                    style={[
                      styles.suggestionItem,
                      { borderBottomColor: theme.glassBorder },
                    ]}
                    onPress={() => handleModelSelect(v)}
                  >
                    <Text
                      style={{
                        color: theme.textPrimary,
                        fontSize: 15,
                        fontFamily: Fonts.sansSemibold,
                      }}
                    >
                      {v.model}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        marginTop: 2,
                      }}
                    >
                      <Text
                        style={{
                          color: theme.textTertiary,
                          fontSize: 12,
                          fontFamily: Fonts.sansRegular,
                        }}
                      >
                        {v.cv}cv · {v.startYear}
                        {v.endYear ? `-${v.endYear}` : "+"} · €
                        {v.value.toLocaleString("de-DE")}
                      </Text>
                      {v.fuelType === "Elc" && (
                        <Zap size={12} color={theme.success} />
                      )}
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      )}

      {/* Selected summary */}
      {selectedVehicle && (
        <View
          style={[
            styles.selectedBox,
            {
              backgroundColor: theme.pillActiveBg,
              borderColor: theme.pillActiveBorder,
            },
          ]}
        >
          <View
            style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
          >
            <CheckCircle2 size={14} color={theme.brandBlueLight} />
            <Text
              style={{
                color: theme.brandBlueLight,
                fontSize: 12,
                fontFamily: Fonts.sansSemibold,
                letterSpacing: 0.6,
                textTransform: "uppercase",
              }}
            >
              {t("vehicleSearch")}
            </Text>
          </View>
          <Text
            style={{
              color: theme.textPrimary,
              fontSize: 16,
              fontFamily: Fonts.sansSemibold,
              marginTop: 4,
            }}
          >
            {selectedVehicle.brand} {selectedVehicle.model}
          </Text>
          <Text
            style={{
              color: theme.brandBlueLight,
              fontSize: 20,
              fontFamily: Fonts.monoBold,
              letterSpacing: -0.3,
              marginTop: 4,
            }}
          >
            €{selectedVehicle.value.toLocaleString("de-DE")}
          </Text>
          {selectedVehicle.fuelType === "Elc" && (
            <View style={{ marginTop: 8 }}>
              <Badge tone="success">{t("evDetected")}</Badge>
            </View>
          )}
        </View>
      )}

      <Pressable
        testID="vehicle-manual-toggle"
        style={styles.switchLink}
        onPress={toggleManualMode}
      >
        <Text
          style={{
            color: theme.brandBlueLight,
            fontSize: 13,
            fontFamily: Fonts.sansMedium,
            textDecorationLine: "underline",
          }}
        >
          {t("manualEntryLink")}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  suggestions: {
    position: "absolute",
    top: 78,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: Radius.md,
    overflow: "hidden",
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
  },
  selectedBox: {
    padding: Space.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginTop: Space.sm,
  },
  confirmBtn: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: Radius.md,
    alignItems: "center",
    borderWidth: 1,
  },
  switchLink: {
    marginTop: Space.sm,
    paddingVertical: 6,
  },
});
