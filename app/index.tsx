import { HistoryButton } from "@/components/HistoryButton";
import { InfoTooltip } from "@/components/InfoTooltip";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { VehicleAutocomplete } from "@/components/VehicleAutocomplete";
import { AdUnits } from "@/constants/Ads";
import { Colors } from "@/constants/Colors";
import { DEFAULT_ITP_RATE, SPANISH_REGIONS } from "@/constants/ItpRates";
import { useLanguage } from "@/context/LanguageContext";
import { useRevenueCat } from "@/context/RevenueCatContext";
import { useCalculationLimit } from "@/hooks/useCalculationLimit";
import { CarAge, Country, ImportType } from "@/types";
import { Stack, useRouter } from "expo-router";
import {
  AlertCircle,
  CheckSquare,
  Euro,
  Gauge,
  GraduationCap,
  MapPin,
  RotateCcw,
  Ship,
  Square,
  User,
} from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
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
  const { isPro } = useRevenueCat();
  const { remaining, hasReachedLimit, incrementCount, FREE_DAILY_LIMIT } =
    useCalculationLimit(isPro);

  // State
  const [importType, setImportType] = useState<ImportType>("EU");
  const [originCountry, setOriginCountry] = useState<Country>("Germany");
  const [price, setPrice] = useState("");
  const [transportCost, setTransportCost] = useState("");
  const [needsHomologation, setNeedsHomologation] = useState(true);
  const [fiscalValue, setFiscalValue] = useState("");
  const [co2, setCo2] = useState("");
  const [age, setAge] = useState<CarAge>("3_years");
  const [sellerType, setSellerType] = useState<"dealer" | "private">("dealer");
  const [isElectric, setIsElectric] = useState(false);

  const [selectedRegion, setSelectedRegion] = useState("Madrid");
  const [resetKey, setResetKey] = useState(0); // To force remount of autocomplete

  const switchAnim = useRef(new Animated.Value(0)).current;

  // Animate switch when importType changes
  useEffect(() => {
    Animated.spring(switchAnim, {
      toValue: importType === "EU" ? 0 : 1,
      useNativeDriver: false, // animating layout property 'left'
      friction: 8,
      tension: 40,
    }).start();
  }, [importType, switchAnim]);

  // Validation state
  const [touched, setTouched] = useState({
    price: false,
    transport: false,
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

  const validateTransport = (value: string): string | null => {
    if (importType === "EU") return null; // Optional for EU
    const num = parseFloat(value);
    if (!value || isNaN(num)) return "Enter transport cost";
    if (num < 0) return "Invalid cost";
    return null;
  };

  // Validation errors
  const errors = {
    price: touched.price ? validatePrice(price) : null,
    transport: touched.transport ? validateTransport(transportCost) : null,
    co2: touched.co2 ? validateCO2(co2) : null,
    fiscalValue: touched.fiscalValue ? validateFiscalValue(fiscalValue) : null,
  };

  const isValid =
    !validatePrice(price) &&
    !validateTransport(transportCost) &&
    !validateCO2(co2) &&
    !validateFiscalValue(fiscalValue);

  const handleCalculate = useCallback(() => {
    // Mark all as touched to show errors
    setTouched({ price: true, transport: true, co2: true, fiscalValue: false });

    if (!isValid) return;

    // Check daily limit for free users
    if (hasReachedLimit) {
      Alert.alert(
        t("limitReachedTitle") || "Daily Limit Reached",
        t("limitReachedMessage") ||
          `Free users can make ${FREE_DAILY_LIMIT} calculations per day. Upgrade to Pro for unlimited calculations!`,
        [
          { text: t("cancel") || "Cancel", style: "cancel" },
          {
            text: t("goPro") || "Go Pro",
            onPress: () => router.push("/paywall"),
          },
        ],
      );
      return;
    }

    // Increment counter for free users
    if (!isPro) {
      incrementCount();
    }

    router.push({
      pathname: "/result",
      params: {
        originCountry,
        importType,
        needsHomologation: needsHomologation ? "true" : "false",
        transportCost: transportCost ? parseFloat(transportCost) : undefined,
        carPrice: parseFloat(price),
        officialFiscalValue: parseFloat(fiscalValue),
        carAge: age,
        co2Emissions: parseFloat(co2),
        sellerType,
        itpRate:
          sellerType === "private"
            ? (SPANISH_REGIONS.find((r) => r.name === selectedRegion)?.rate ??
              DEFAULT_ITP_RATE)
            : undefined,
      },
    });
  }, [
    isValid,
    hasReachedLimit,
    isPro,
    incrementCount,
    originCountry,
    importType,
    needsHomologation,
    transportCost,
    price,
    fiscalValue,
    age,
    co2,
    sellerType,
    selectedRegion,
    router,
    t,
    FREE_DAILY_LIMIT,
  ]);

  const handleReset = () => {
    setImportType("EU");
    setOriginCountry("Germany");
    setPrice("");
    setTransportCost("");
    setFiscalValue("");
    setCo2("");
    setAge("new");
    setSellerType("dealer");
    setSelectedRegion("Madrid");
    setIsElectric(false);
    setNeedsHomologation(true);
    setTouched({
      price: false,
      transport: false,
      co2: false,
      fiscalValue: false,
    });
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
    USA: "🇺🇸",
    UAE: "🇦🇪",
    Japan: "🇯🇵",
    Korea: "🇰🇷",
  };

  const euCountries: Country[] = [
    "Germany",
    "France",
    "Italy",
    "Belgium",
    "Netherlands",
  ];
  const nonEuCountries: Country[] = ["USA", "UAE", "Japan", "Korea"];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerLeft: () => <HistoryButton /> }} />
      {/* Language Switcher */}
      <LanguageSwitcher />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Import Type Toggle */}
          <View style={styles.inputGroup}>
            <View style={styles.segmentContainer}>
              <Animated.View
                style={[
                  styles.segmentIndicator,
                  {
                    left: switchAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["1%", "51%"],
                    }),
                  },
                ]}
              />
              <Pressable
                style={styles.segment}
                onPress={() => {
                  setImportType("EU");
                  setOriginCountry("Germany");
                }}
              >
                <Text
                  style={[
                    styles.segmentText,
                    importType === "EU" && styles.segmentTextSelected,
                  ]}
                >
                  {t("tabEU")}
                </Text>
              </Pressable>
              <Pressable
                style={styles.segment}
                onPress={() => {
                  setImportType("NonEU");
                  setOriginCountry("USA");
                  setNeedsHomologation(true);
                }}
              >
                <Text
                  style={[
                    styles.segmentText,
                    importType === "NonEU" && styles.segmentTextSelected,
                  ]}
                >
                  {t("tabNonEU")}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Origin Country */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <MapPin size={16} color={Colors.primary} /> {t("originCountry")}
              <InfoTooltip text={t("originCountryInfo")} />
            </Text>
            <View style={styles.row}>
              {(importType === "EU" ? euCountries : nonEuCountries).map((c) => (
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
              <Euro size={16} color={Colors.primary} />{" "}
              {importType === "NonEU" ? t("invoicePrice") : t("carPrice")}
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

          {/* Transport Cost (Non-EU) */}
          {importType === "NonEU" && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Ship size={16} color={Colors.primary} /> {t("transportCost")}
              </Text>
              <TextInput
                style={[styles.input, errors.transport && styles.inputError]}
                keyboardType="numeric"
                placeholder="1500"
                value={transportCost}
                onChangeText={setTransportCost}
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, transport: true }))
                }
              />
              {errors.transport && (
                <View style={styles.errorContainer}>
                  <AlertCircle size={14} color="#DC2626" />
                  <Text style={styles.errorText}>{errors.transport}</Text>
                </View>
              )}
            </View>
          )}

          {/* Homologation Checkbox (Non-EU) */}
          {importType === "NonEU" && (
            <Pressable
              style={styles.checkboxContainer}
              onPress={() => setNeedsHomologation(!needsHomologation)}
            >
              <View style={{ marginRight: 12 }}>
                {needsHomologation ? (
                  <CheckSquare size={24} color={Colors.primary} />
                ) : (
                  <Square size={24} color={Colors.textLight} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.checkboxLabel}>
                  {t("homologation")}
                  <InfoTooltip text={t("homologationInfo")} />
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: Colors.textLight,
                    marginTop: 2,
                  }}
                >
                  ~1500€
                </Text>
              </View>
            </Pressable>
          )}

          {/* Vehicle Search - Auto-fills Fiscal Value */}
          <View style={{ zIndex: 10, marginBottom: 24 }}>
            <VehicleAutocomplete
              key={resetKey}
              onVehicleSelected={handleVehicleSelected}
            />
          </View>

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

          {/* Seller Type (Only for EU) */}
          {importType === "EU" && (
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
              {sellerType === "private" && (
                <View style={{ marginTop: 12 }}>
                  <Text style={[styles.label, { marginBottom: 8 }]}>
                    📍 {t("selectRegion") || "Region (Comunidad Autónoma)"}
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginHorizontal: -4 }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: 6,
                        paddingHorizontal: 4,
                      }}
                    >
                      {SPANISH_REGIONS.map((region) => (
                        <Pressable
                          key={region.name}
                          onPress={() => setSelectedRegion(region.name)}
                          style={[
                            {
                              paddingHorizontal: 12,
                              paddingVertical: 8,
                              borderRadius: 8,
                              borderWidth: 1,
                              borderColor:
                                selectedRegion === region.name
                                  ? Colors.primary
                                  : Colors.border,
                              backgroundColor:
                                selectedRegion === region.name
                                  ? "#E6F0FF"
                                  : Colors.white,
                            },
                          ]}
                        >
                          <Text
                            style={{
                              fontSize: 13,
                              fontWeight:
                                selectedRegion === region.name ? "700" : "500",
                              color:
                                selectedRegion === region.name
                                  ? Colors.primary
                                  : Colors.text,
                            }}
                          >
                            {region.label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          {!isPro && (
            <Text
              style={{
                textAlign: "center",
                fontSize: 12,
                color: hasReachedLimit ? "#DC2626" : Colors.textLight,
                marginBottom: 6,
                fontWeight: hasReachedLimit ? "600" : "400",
              }}
            >
              {hasReachedLimit
                ? `⚠️ ${t("limitReachedTitle")}`
                : `${remaining}/${FREE_DAILY_LIMIT} ${t("calculationsRemaining")}`}
            </Text>
          )}
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
      {!isPro && (
        <View style={{ alignItems: "center", backgroundColor: "#fff" }}>
          <BannerAd
            unitId={AdUnits.BANNER}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  checkboxLabel: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
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
    position: "relative",
    height: 48,
  },
  segmentIndicator: {
    position: "absolute",
    top: 2,
    bottom: 2,
    width: "48%",
    backgroundColor: Colors.white,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  segment: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
    zIndex: 1,
  },
  segmentSelected: { backgroundColor: "transparent" },
  segmentText: { color: Colors.text },
  segmentTextSelected: { fontWeight: "bold", color: Colors.primary },
  infoText: { marginTop: 8, color: "#D97706", fontSize: 12 },
  fiscalValueDisplay: {
    backgroundColor: "#E6F4FE",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    zIndex: 1,
    elevation: 2,
  },
  fiscalValueLabel: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
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
