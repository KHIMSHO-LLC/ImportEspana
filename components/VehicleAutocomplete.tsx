import { Colors } from "@/constants/Colors";
import { useLanguage } from "@/context/LanguageContext";
import React, { useMemo, useState } from "react";
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
}

interface VehicleAutocompleteProps {
  onVehicleSelected: (data: {
    value: number;
    brand?: string;
    model?: string;
    fuelType?: string;
    isManual: boolean;
    year?: number;
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
  const [brandQuery, setBrandQuery] = useState(initialData?.brand || "");
  const [modelQuery, setModelQuery] = useState(initialData?.model || "");
  const [yearFilter, setYearFilter] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(
    initialData?.brand || null,
  );

  // Initialize selected vehicle if we have specific data, otherwise null
  // Note: We don't have the full object from initialData, so we construct a partial or just rely on state
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

  // Get unique brands
  const allBrands = useMemo(() => {
    const brandSet = new Set<string>();
    (boePrices as unknown as Vehicle[]).forEach((vehicle) =>
      brandSet.add(vehicle.brand),
    );
    return Array.from(brandSet).sort();
  }, []);

  // Filter brands based on query
  const filteredBrands = useMemo(() => {
    if (!brandQuery.trim()) return [];

    const query = brandQuery.toLowerCase();
    return allBrands
      .filter((brand) => brand.toLowerCase().includes(query))
      .slice(0, 10);
  }, [brandQuery, allBrands]);

  // Filter models based on selected brand, model query, and year
  const filteredModels = useMemo(() => {
    if (!selectedBrand || !modelQuery.trim()) return [];

    const query = modelQuery.toLowerCase();
    const year = yearFilter ? parseInt(yearFilter) : null;

    return (boePrices as unknown as Vehicle[])
      .filter((vehicle) => {
        // Brand match
        if (vehicle.brand !== selectedBrand) return false;

        // Model match
        if (!vehicle.model.toLowerCase().includes(query)) return false;

        // Year filter (if provided)
        if (year) {
          const startYear = parseInt(vehicle.startYear);
          const endYear = vehicle.endYear ? parseInt(vehicle.endYear) : 2026;
          // Updated Logic: Ensure the model availability overlaps with the requested year
          if (year < startYear || year > endYear) return false;
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

    // Determine the year to pass.
    const yearInput = yearFilter ? parseInt(yearFilter) : undefined;

    onVehicleSelected({
      value: vehicle.value,
      brand: vehicle.brand,
      model: vehicle.model,
      fuelType: vehicle.fuelType,
      isManual: false,
      year: yearInput,
    });
    Keyboard.dismiss();
  };

  const handleManualSubmit = () => {
    const value = parseFloat(manualValue);
    if (!isNaN(value) && value > 0) {
      onVehicleSelected({
        value: value,
        isManual: true,
      });
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

  // Manual entry mode
  if (isManualMode) {
    return (
      <View style={styles.container}>
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>💰 {t("manualEntryLabel")}</Text>
          </View>
          <Text style={styles.helpText}>{t("manualEntryHelp")}</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Ej: 45000"
            value={manualValue}
            onChangeText={setManualValue}
            onSubmitEditing={handleManualSubmit}
          />

          {manualValue && parseFloat(manualValue) > 0 && (
            <Pressable
              style={styles.confirmButton}
              onPress={handleManualSubmit}
            >
              <Text style={styles.confirmButtonText}>{t("confirmValue")}</Text>
            </Pressable>
          )}
        </View>

        <Pressable style={styles.switchLink} onPress={toggleManualMode}>
          <Text style={styles.switchLinkText}>{t("backToSearch")}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Brand Search */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>🚗 {t("brand")}</Text>
          <InfoTooltip text={t("vehicleSearchInfo")} />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Escribe la marca (ej: Mercedes, BMW)"
          value={brandQuery}
          onChangeText={(text) => {
            setBrandQuery(text);
            setShowBrandSuggestions(true);
            setSelectedBrand(null);
          }}
          onFocus={() => setShowBrandSuggestions(true)}
        />

        {showBrandSuggestions && filteredBrands.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <ScrollView
              style={styles.suggestionsList}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
            >
              {filteredBrands.map((item) => (
                <Pressable
                  key={item}
                  style={styles.suggestionItem}
                  onPress={() => handleBrandSelect(item)}
                >
                  <Text style={styles.suggestionText}>{item}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Year Filter (optional) */}
      {selectedBrand && (
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>📅 {t("yearOptional")}</Text>
            <InfoTooltip text={t("yearInfo")} />
          </View>
          <TextInput
            style={[styles.input, styles.yearInput]}
            keyboardType="numeric"
            placeholder="Ej: 2020"
            maxLength={4}
            value={yearFilter}
            onChangeText={setYearFilter}
          />
        </View>
      )}

      {/* Model Search */}
      {selectedBrand && (
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>🔧 {t("model")}</Text>
            <InfoTooltip text={t("vehicleSearchInfo")} />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Escribe el modelo (ej: X5, Clase C)"
            value={modelQuery}
            onChangeText={(text) => {
              setModelQuery(text);
              setShowModelSuggestions(true);
            }}
            onFocus={() => setShowModelSuggestions(true)}
          />

          {showModelSuggestions && filteredModels.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <ScrollView
                style={styles.suggestionsList}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true}
              >
                {filteredModels.map((item) => (
                  <Pressable
                    key={item.id}
                    style={styles.suggestionItem}
                    onPress={() => handleModelSelect(item)}
                  >
                    <View>
                      <Text style={styles.suggestionText}>{item.model}</Text>
                      <Text style={styles.suggestionSubtext}>
                        {item.cv}cv • {item.startYear}
                        {item.endYear ? `-${item.endYear}` : "+"} • €
                        {item.value.toLocaleString("de-DE")}
                        {item.fuelType === "Elc" && " ⚡"}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      )}

      {/* Selected Vehicle Info */}
      {selectedVehicle && (
        <View style={styles.selectedInfo}>
          <Text style={styles.selectedTitle}>✅ {t("vehicleSearch")}</Text>
          <Text style={styles.selectedText}>
            {selectedVehicle.brand} {selectedVehicle.model}
          </Text>
          <Text style={styles.selectedValue}>
            €{selectedVehicle.value.toLocaleString("de-DE")}
          </Text>
          {selectedVehicle.fuelType === "Elc" && (
            <View style={styles.evBadge}>
              <Text style={styles.evBadgeText}>{t("evDetected")}</Text>
            </View>
          )}
        </View>
      )}

      {/* Manual Entry Link */}
      <Pressable style={styles.switchLink} onPress={toggleManualMode}>
        <Text style={styles.switchLinkText}>{t("manualEntryLink")}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
    position: "relative",
    zIndex: 1,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  helpText: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  yearInput: {
    width: 120,
  },
  suggestionsContainer: {
    position: "absolute",
    top: 80, // Adjusted for labelRow
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    maxHeight: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  suggestionText: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: "500",
  },
  suggestionSubtext: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  selectedInfo: {
    backgroundColor: "#E6F4FE",
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  selectedTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
    marginBottom: 4,
  },
  selectedText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  selectedValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
  },
  evBadge: {
    marginTop: 8,
    backgroundColor: "#10B981",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  evBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  switchLink: {
    marginTop: 8,
    paddingVertical: 8,
  },
  switchLinkText: {
    color: Colors.primary,
    fontSize: 14,
    textDecorationLine: "underline",
  },
  confirmButton: {
    marginTop: 12,
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
