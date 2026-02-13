import { InfoTooltip } from "@/components/InfoTooltip";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { VehicleAutocomplete } from "@/components/VehicleAutocomplete";
import { AdUnits } from "@/constants/Ads";
import { Colors } from "@/constants/Colors";
import { useLanguage } from "@/context/LanguageContext";
import { CarAge, Country } from "@/types";
import { useRouter } from "expo-router";
import {
  AlertCircle,
  Euro,
  Gauge,
  GraduationCap,
  MapPin,
  RotateCcw,
  User,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";

export default function InputScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  // State
  const [originCountry, setOriginCountry] = useState<Country>("Germany");
  const [price, setPrice] = useState("");
  const [fiscalValue, setFiscalValue] = useState("");
  const [co2, setCo2] = useState("");
  const [age, setAge] = useState<CarAge>("3_years");
  const [sellerType, setSellerType] = useState<"dealer" | "private">("dealer");
  const [isElectric, setIsElectric] = useState(false);
  const [resetKey, setResetKey] = useState(0); // To force remount of autocomplete

  // Validation state
  const [touched, setTouched] = useState({
    price: false,
    co2: false,
    fiscalValue: false,
  });

  // Validation helpers
  const validatePrice = (value: string): string | null => {
    const num = parseFloat(value);
    if (!value || isNaN(num)) return t("priceError");
    if (num <= 0) return t("priceError");
    if (num > 10000000) return "Price too high";
    return null;
  };

  const validateCO2 = (value: string): string | null => {
    const num = parseFloat(value);
    if (!value || isNaN(num)) return t("co2Error");
    if (num < 0) return t("co2Error");
    if (num > 500) return "Max 500 g/km";
    return null;
  };

  const validateFiscalValue = (value: string): string | null => {
    const num = parseFloat(value);
    if (!value || isNaN(num)) return t("fiscalError");
    if (num <= 0) return t("fiscalError");
    return null;
  };

  // Validation errors
  const errors = {
    price: touched.price ? validatePrice(price) : null,
    co2: touched.co2 ? validateCO2(co2) : null,
    fiscalValue: touched.fiscalValue ? validateFiscalValue(fiscalValue) : null,
  };

  const isValid =
    !validatePrice(price) &&
    !validateCO2(co2) &&
    !validateFiscalValue(fiscalValue);

  const handleCalculate = () => {
    // Mark all as touched to show errors
    setTouched({ price: true, co2: true, fiscalValue: true });

    if (!isValid) return;

    router.push({
      pathname: "/result",
      params: {
        originCountry,
        carPrice: parseFloat(price),
        officialFiscalValue: parseFloat(fiscalValue),
        carAge: age,
        co2Emissions: parseFloat(co2),
        sellerType,
      },
    });
  };

  const handleReset = () => {
    setOriginCountry("Germany");
    setPrice("");
    setFiscalValue("");
    setCo2("");
    setAge("new");
    setSellerType("dealer");
    setIsElectric(false);
    setTouched({ price: false, co2: false, fiscalValue: false });
    setResetKey((prev) => prev + 1); // Force autocomplete reset
  };

  const handleVehicleSelected = (data: {
    value: number;
    brand?: string;
    model?: string;
    fuelType?: string;
    isManual: boolean;
    year?: number;
  }) => {
    setFiscalValue(data.value.toString());
    setTouched((prev) => ({ ...prev, fiscalValue: true }));

    // Auto-set CO2 to 0 for electric vehicles
    if (data.fuelType === "Elc") {
      setCo2("0");
      setIsElectric(true);
      setTouched((prev) => ({ ...prev, co2: true }));
    } else {
      setIsElectric(false);
    }

    // Auto-calculate age if year is provided
    if (data.year) {
      const currentYear = new Date().getFullYear();
      const carYear = data.year;
      const diff = currentYear - carYear;

      let calculatedAge: CarAge = "new";
      if (diff < 1) calculatedAge = "new";
      else if (diff >= 1 && diff < 2) calculatedAge = "1_year";
      else if (diff >= 2 && diff < 3) calculatedAge = "2_years";
      else if (diff >= 3 && diff < 4) calculatedAge = "3_years";
      else if (diff >= 4 && diff < 5) calculatedAge = "4_years";
      else if (diff >= 5 && diff < 6) calculatedAge = "5_years";
      else if (diff >= 6 && diff < 7) calculatedAge = "6_years";
      else if (diff >= 7 && diff < 8) calculatedAge = "7_years";
      else if (diff >= 8 && diff < 9) calculatedAge = "8_years";
      else if (diff >= 9 && diff < 10) calculatedAge = "9_years";
      else if (diff >= 10 && diff < 11) calculatedAge = "10_years";
      else if (diff >= 11 && diff < 12) calculatedAge = "11_years";
      else calculatedAge = "12_plus_years";

      setAge(calculatedAge);
    }
  };

  // Country flags
  const countryFlags: Record<Country, string> = {
    Germany: "🇩🇪",
    France: "🇫🇷",
    Italy: "🇮🇹",
    Belgium: "🇧🇪",
    Netherlands: "🇳🇱",
  };

  return (
    <View style={styles.container}>
      {/* Language Switcher */}
      <LanguageSwitcher />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Origin Country */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <MapPin size={16} color={Colors.primary} /> {t("originCountry")}
              <InfoTooltip text={t("originCountryInfo")} />
            </Text>
            <View style={styles.row}>
              {(
                [
                  "Germany",
                  "France",
                  "Italy",
                  "Belgium",
                  "Netherlands",
                ] as Country[]
              ).map((c) => (
                <Pressable
                  key={c}
                  style={[
                    styles.chip,
                    originCountry === c && styles.chipSelected,
                  ]}
                  onPress={() => setOriginCountry(c)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      originCountry === c && styles.chipTextSelected,
                    ]}
                  >
                    {countryFlags[c]} {c}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Price */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Euro size={16} color={Colors.primary} /> {t("carPrice")}
              <InfoTooltip text={t("carPriceInfo")} />
            </Text>
            <TextInput
              style={[styles.input, errors.price && styles.inputError]}
              keyboardType="numeric"
              placeholder="25000"
              value={price}
              onChangeText={setPrice}
              onBlur={() => setTouched((prev) => ({ ...prev, price: true }))}
            />
            {errors.price && (
              <View style={styles.errorContainer}>
                <AlertCircle size={14} color="#DC2626" />
                <Text style={styles.errorText}>{errors.price}</Text>
              </View>
            )}
          </View>

          {/* Vehicle Search - Auto-fills Fiscal Value */}
          <VehicleAutocomplete
            key={resetKey}
            onVehicleSelected={handleVehicleSelected}
          />

          {/* Show fiscal value if set */}
          {fiscalValue && !errors.fiscalValue && (
            <View style={styles.fiscalValueDisplay}>
              <Text style={styles.fiscalValueLabel}>
                💰 {t("manualEntryLabel")}
                <InfoTooltip text={t("fiscalInfo")} />
              </Text>
              <Text style={styles.fiscalValueAmount}>
                €{parseFloat(fiscalValue).toLocaleString("de-DE")}
              </Text>
            </View>
          )}

          {/* CO2 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Gauge size={16} color={Colors.primary} /> {t("co2")}
              <InfoTooltip text={t("co2Info")} />
            </Text>
            {isElectric && (
              <View style={styles.evHint}>
                <Text style={styles.evHintText}>{t("evDetected")}</Text>
              </View>
            )}
            <TextInput
              style={[styles.input, errors.co2 && styles.inputError]}
              keyboardType="numeric"
              placeholder="145"
              value={co2}
              onChangeText={(text) => {
                setCo2(text);
                if (text !== "0") setIsElectric(false);
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, co2: true }))}
            />
            {errors.co2 && (
              <View style={styles.errorContainer}>
                <AlertCircle size={14} color="#DC2626" />
                <Text style={styles.errorText}>{errors.co2}</Text>
              </View>
            )}
          </View>

          {/* Age */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <GraduationCap size={16} color={Colors.primary} /> {t("age")}
              <InfoTooltip text={t("ageInfo")} />
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {(
                [
                  "new",
                  "1_year",
                  "2_years",
                  "3_years",
                  "4_years",
                  "5_years",
                  "6_years",
                  "7_years",
                  "8_years",
                  "9_years",
                  "10_years",
                  "11_years",
                  "12_plus_years",
                ] as CarAge[]
              ).map((a) => (
                <Pressable
                  key={a}
                  style={[styles.chip, age === a && styles.chipSelected]}
                  onPress={() => setAge(a)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      age === a && styles.chipTextSelected,
                    ]}
                  >
                    {a === "new"
                      ? t("age").split(" ")[0] || "New"
                      : a
                          .replace(/_/g, " ")
                          .replace("years", "yrs")
                          .replace("plus", "+")}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Seller Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <User size={16} color={Colors.primary} /> {t("sellerType")}
              <InfoTooltip text={t("sellerTypeInfo")} />
            </Text>
            <View style={styles.segmentContainer}>
              <Pressable
                style={[
                  styles.segment,
                  sellerType === "dealer" && styles.segmentSelected,
                ]}
                onPress={() => setSellerType("dealer")}
              >
                <Text
                  style={[
                    styles.segmentText,
                    sellerType === "dealer" && styles.segmentTextSelected,
                  ]}
                >
                  {t("dealer")}
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.segment,
                  sellerType === "private" && styles.segmentSelected,
                ]}
                onPress={() => setSellerType("private")}
              >
                <Text
                  style={[
                    styles.segmentText,
                    sellerType === "private" && styles.segmentTextSelected,
                  ]}
                >
                  {t("private")}
                </Text>
              </Pressable>
            </View>
            {sellerType === "private" && (
              <Text style={styles.infoText}>{t("privateSaleWarning")}</Text>
            )}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <View style={styles.buttonRow}>
            <Pressable
              style={styles.resetButton}
              onPress={handleReset}
              hitSlop={10}
            >
              <RotateCcw size={20} color={Colors.textLight} />
            </Pressable>
            <Pressable
              style={[styles.button, !isValid && styles.buttonDisabled]}
              onPress={handleCalculate}
            >
              <Text style={styles.buttonText}>{t("calculate")}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* AdBanner */}
      <View style={{ alignItems: "center", backgroundColor: "#fff" }}>
        <BannerAd
          unitId={AdUnits.BANNER}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  inputGroup: { marginBottom: 24 },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
  },
  inputError: {
    borderColor: "#DC2626",
    borderWidth: 2,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 13,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 4,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: { color: Colors.text },
  chipTextSelected: { color: Colors.white, fontWeight: "bold" },
  segmentContainer: {
    flexDirection: "row",
    backgroundColor: Colors.border,
    borderRadius: 8,
    padding: 2,
  },
  segment: { flex: 1, padding: 10, alignItems: "center", borderRadius: 6 },
  segmentSelected: { backgroundColor: Colors.white },
  segmentText: { color: Colors.text },
  segmentTextSelected: { fontWeight: "bold", color: Colors.primary },
  infoText: { marginTop: 8, color: "#D97706", fontSize: 12 },
  fiscalValueDisplay: {
    backgroundColor: "#E6F4FE",
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: "center",
  },
  fiscalValueLabel: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
    elevation: 2,
  },
  fiscalValueAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
  },
  evHint: {
    backgroundColor: "#D1FAE5",
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  evHintText: {
    color: "#065F46",
    fontSize: 13,
    fontWeight: "500",
  },
  footer: {
    position: "absolute",
    bottom: 0, // Increased from 60 to avoid ad overlap
    left: 0,
    right: 0,
    padding: 20,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  resetButton: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    width: 56,
  },
  buttonDisabled: { backgroundColor: "#CBD5E1", opacity: 0.6 },
  buttonText: { fontSize: 18, fontWeight: "bold", color: Colors.white },
});
