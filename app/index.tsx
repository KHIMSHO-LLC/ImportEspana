import { HistoryButton } from "@/components/HistoryButton";
import { InfoTooltip } from "@/components/InfoTooltip";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MonthYearPicker } from "@/components/MonthYearPicker";
import { VehicleAutocomplete } from "@/components/VehicleAutocomplete";
import {
  Badge,
  Caption,
  Chip,
  Divider,
  GlassCard,
  Input,
  Label,
  Pill,
  PillGroup,
  PrimaryButton,
  SecondaryButton,
  Tap,
} from "@/components/ui";
import { Fonts, Radius, Space } from "@/constants/Colors";
import { DEFAULT_ITP_RATE, SPANISH_REGIONS } from "@/constants/ItpRates";
import { useLanguage } from "@/context/LanguageContext";
import { useRevenueCat } from "@/context/RevenueCatContext";
import { useTheme } from "@/context/ThemeContext";
import { useCalculationLimit } from "@/hooks/useCalculationLimit";
import { Country, ImportType } from "@/types";
import { getDepreciationFactor } from "@/utils/taxCalculator";
import { Stack, useRouter } from "expo-router";
import {
  AlertCircle,
  CalendarDays,
  CheckSquare,
  Coins,
  Euro,
  Gauge,
  MapPin,
  RotateCcw,
  Shield,
  Ship,
  Square,
  User,
} from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function InputScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isPro, restorePurchases } = useRevenueCat();
  const { theme } = useTheme();
  const { remaining, hasReachedLimit, incrementCount, FREE_DAILY_LIMIT } =
    useCalculationLimit(isPro);

  // ─── State ────────────────────────────────────────────────────────────────
  const [importType, setImportType] = useState<ImportType>("EU");
  const [originCountry, setOriginCountry] = useState<Country>("Germany");
  const [price, setPrice] = useState("");
  const [transportCost, setTransportCost] = useState("");
  const [insuranceCost, setInsuranceCost] = useState("");
  const [needsHomologation, setNeedsHomologation] = useState(true);
  const [fiscalValue, setFiscalValue] = useState("");
  const [co2, setCo2] = useState("");
  const [registrationDate, setRegistrationDate] = useState("");
  const [isNewCondition, setIsNewCondition] = useState(false);
  const [sellerType, setSellerType] = useState<"dealer" | "private">("dealer");
  const [isElectric, setIsElectric] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("Madrid");
  const [resetKey, setResetKey] = useState(0);

  // ─── Validation ───────────────────────────────────────────────────────────
  const [touched, setTouched] = useState({
    price: false,
    transport: false,
    insurance: false,
    co2: false,
    fiscalValue: false,
  });

  const validatePrice = (v: string): string | null => {
    const n = parseFloat(v);
    if (!v || isNaN(n)) return t("priceError");
    if (n <= 0) return t("priceError");
    if (n > 10_000_000) return "Price too high";
    return null;
  };

  const validateCO2 = (v: string): string | null => {
    const n = parseFloat(v);
    if (!v || isNaN(n)) return t("co2Error");
    if (n < 0) return t("co2Error");
    if (n > 500) return "Max 500 g/km";
    return null;
  };

  const validateFiscalValue = (v: string): string | null => {
    const n = parseFloat(v);
    if (!v || isNaN(n)) return t("fiscalError");
    if (n <= 0) return t("fiscalError");
    return null;
  };

  const validateTransport = (v: string): string | null => {
    if (importType === "EU") return null;
    const n = parseFloat(v);
    if (!v || isNaN(n)) return "Enter transport cost";
    if (n < 0) return "Invalid cost";
    return null;
  };

  const validateInsurance = (v: string): string | null => {
    if (!v) return null; // optional — defaults to ~0.5% in calculator
    const n = parseFloat(v);
    if (isNaN(n) || n < 0) return "Invalid insurance";
    return null;
  };

  const errors = {
    price: touched.price ? validatePrice(price) : null,
    transport: touched.transport ? validateTransport(transportCost) : null,
    insurance: touched.insurance ? validateInsurance(insuranceCost) : null,
    co2: touched.co2 ? validateCO2(co2) : null,
    fiscalValue: touched.fiscalValue ? validateFiscalValue(fiscalValue) : null,
  };

  const isValid =
    !validatePrice(price) &&
    !validateTransport(transportCost) &&
    !validateInsurance(insuranceCost) &&
    !validateCO2(co2) &&
    !validateFiscalValue(fiscalValue);

  // Live depreciation preview — same logic the calculator uses
  const depreciationPct = useMemo(() => {
    if (!registrationDate || isNewCondition) return null;
    const factor = getDepreciationFactor(registrationDate);
    return Math.round((1 - factor) * 100);
  }, [registrationDate, isNewCondition]);

  const depreciatedValue = useMemo(() => {
    const fv = parseFloat(fiscalValue);
    if (!fv || isNaN(fv)) return null;
    const factor = isNewCondition
      ? 1
      : getDepreciationFactor(registrationDate);
    return Math.round(fv * factor);
  }, [fiscalValue, registrationDate, isNewCondition]);

  // Age in "X years Y months" — explains where the depreciation % comes from.
  const vehicleAgeText = useMemo(() => {
    if (!registrationDate) return null;
    const [yStr, mStr] = registrationDate.split("-");
    if (!yStr || !mStr) return null;
    const today = new Date();
    let months =
      (today.getFullYear() - parseInt(yStr, 10)) * 12 +
      (today.getMonth() + 1 - parseInt(mStr, 10));
    if (months < 0) months = 0;
    const years = Math.floor(months / 12);
    const rem = months % 12;
    if (years === 0) return `${rem} month${rem === 1 ? "" : "s"}`;
    if (rem === 0) return `${years} year${years === 1 ? "" : "s"}`;
    return `${years}y ${rem}mo`;
  }, [registrationDate]);

  // Effective tax base — what Hacienda actually uses to compute IEDMT/ITP.
  // New car: invoice price. Used car: BOE × depreciation factor.
  // Returns null until we have enough info (so the user sees a placeholder
  // instead of a misleading full-BOE figure when the registration date is
  // missing).
  const taxBase = useMemo(() => {
    const fv = parseFloat(fiscalValue);
    const cp = parseFloat(price);
    if (isNewCondition) {
      return !isNaN(cp) && cp > 0 ? cp : null;
    }
    if (!registrationDate) return null;
    if (isNaN(fv) || fv <= 0) return null;
    const factor = getDepreciationFactor(registrationDate);
    return Math.round(fv * factor);
  }, [fiscalValue, price, registrationDate, isNewCondition]);

  const handleCalculate = useCallback(() => {
    setTouched({
      price: true,
      transport: true,
      insurance: true,
      co2: true,
      fiscalValue: false,
    });

    if (!isValid) return;

    if (hasReachedLimit) {
      Alert.alert(
        t("limitReachedTitle") || "Daily Limit Reached",
        t("limitReachedMessage") ||
          `Free users can make ${FREE_DAILY_LIMIT} calculations per day. Upgrade to Pro for unlimited calculations!`,
        [
          { text: t("cancel") || "Cancel", style: "cancel" },
          { text: t("goPro") || "Go Pro", onPress: () => router.push("/paywall") },
        ],
      );
      return;
    }

    if (!isPro) incrementCount();

    router.push({
      pathname: "/result",
      params: {
        originCountry,
        importType,
        needsHomologation: needsHomologation ? "true" : "false",
        transportCost: transportCost ? parseFloat(transportCost) : undefined,
        insuranceCost: insuranceCost ? parseFloat(insuranceCost) : undefined,
        carPrice: parseFloat(price),
        officialFiscalValue: parseFloat(fiscalValue),
        registrationDate,
        isNewCondition: isNewCondition ? "true" : "false",
        co2Emissions: parseFloat(co2),
        sellerType,
        spanishRegion: selectedRegion,
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
    insuranceCost,
    price,
    fiscalValue,
    registrationDate,
    isNewCondition,
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
    setInsuranceCost("");
    setFiscalValue("");
    setCo2("");
    setRegistrationDate("");
    setIsNewCondition(false);
    setSellerType("dealer");
    setSelectedRegion("Madrid");
    setIsElectric(false);
    setNeedsHomologation(true);
    setTouched({
      price: false,
      transport: false,
      insurance: false,
      co2: false,
      fiscalValue: false,
    });
    setResetKey((p) => p + 1);
  };

  const handleVehicleSelected = (data: {
    value: number;
    brand?: string;
    model?: string;
    fuelType?: string;
    isManual: boolean;
    year?: number;
    co2?: number | null;
  }) => {
    setFiscalValue(data.value.toString());
    setTouched((p) => ({ ...p, fiscalValue: true }));
    if (data.fuelType === "Elc") {
      setCo2("0");
      setIsElectric(true);
      setTouched((p) => ({ ...p, co2: true }));
    } else {
      setIsElectric(false);
      if (typeof data.co2 === "number" && data.co2 > 0) {
        setCo2(data.co2.toString());
        setTouched((p) => ({ ...p, co2: true }));
      }
    }
    if (data.year) setRegistrationDate(`${data.year}-01`);
  };

  const euCountries: Country[] = [
    "Germany",
    "France",
    "Italy",
    "Belgium",
    "Netherlands",
  ];
  const nonEuCountries: Country[] = ["USA", "UAE", "Japan", "Korea"];
  const visibleCountries = importType === "EU" ? euCountries : nonEuCountries;

  const iconColor = theme.brandBlue;

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerLeft: () => <HistoryButton /> }} />

      <LanguageSwitcher />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Hero blurb ─────────────────────────────────────────── */}
          <View style={{ marginBottom: Space.md, paddingHorizontal: 4 }}>
            <Caption>CALCULATOR</Caption>
            <Text
              style={{
                color: theme.textPrimary,
                fontFamily: Fonts.sansExtraBold,
                fontSize: 28,
                letterSpacing: -0.7,
                lineHeight: 32,
                marginTop: 6,
              }}
            >
              ImportEspaña
            </Text>
            <Text
              style={{
                color: theme.textSecondary,
                fontFamily: Fonts.sansRegular,
                fontSize: 14,
                marginTop: 4,
                lineHeight: 20,
              }}
            >
              Estimate every cost of importing a car to Spain.
            </Text>
          </View>

          {/* ── Import Type Pill ───────────────────────────────────── */}
          <GlassCard style={styles.section}>
            <PillGroup>
              <Pill
                active={importType === "EU"}
                onPress={() => {
                  setImportType("EU");
                  setOriginCountry("Germany");
                }}
              >
                EU
              </Pill>
              <Pill
                active={importType === "NonEU"}
                onPress={() => {
                  setImportType("NonEU");
                  setOriginCountry("USA");
                  setNeedsHomologation(true);
                }}
              >
                Non-EU
              </Pill>
            </PillGroup>
          </GlassCard>

          {/* ── Origin Country ─────────────────────────────────────── */}
          <GlassCard style={styles.section}>
            <Label
              icon={<MapPin size={16} color={iconColor} />}
              trailing={<InfoTooltip text={t("originCountryInfo")} />}
            >
              {t("originCountry")}
            </Label>
            <View style={styles.chipRow}>
              {visibleCountries.map((c) => (
                <Chip
                  key={c}
                  active={originCountry === c}
                  onPress={() => setOriginCountry(c)}
                  style={{ flexBasis: "30%", flexGrow: 1 }}
                >
                  {c}
                </Chip>
              ))}
            </View>
          </GlassCard>

          {/* ── Region (always visible — affects IEDMT brackets too) ─ */}
          <GlassCard style={styles.section}>
            <Label icon={<MapPin size={16} color={iconColor} />}>
              {t("selectRegion") || "Spanish Region"}
            </Label>
            <Text
              style={{
                color: theme.textTertiary,
                fontFamily: Fonts.sansRegular,
                fontSize: 12,
                marginTop: -4,
                marginBottom: Space.sm,
              }}
            >
              ITP &amp; IEDMT regional rates
            </Text>
            <View style={styles.chipRow}>
              {SPANISH_REGIONS.map((r) => (
                <Chip
                  key={r.name}
                  active={selectedRegion === r.name}
                  onPress={() => setSelectedRegion(r.name)}
                  size="sm"
                >
                  {r.label}
                </Chip>
              ))}
            </View>
          </GlassCard>

          {/* ── Vehicle Autocomplete ───────────────────────────────── */}
          <GlassCard style={[styles.section, { zIndex: 50 }]}>
            <VehicleAutocomplete
              key={resetKey}
              onVehicleSelected={handleVehicleSelected}
            />
          </GlassCard>

          {/* ── Price ──────────────────────────────────────────────── */}
          <GlassCard style={styles.section}>
            <Label
              icon={<Euro size={16} color={iconColor} />}
              trailing={<InfoTooltip text={t("carPriceInfo")} />}
            >
              {importType === "NonEU" ? t("invoicePrice") : t("carPrice")}
            </Label>
            <Input
              testID="price-input"
              keyboardType="numeric"
              placeholder="25000"
              value={price}
              onChangeText={setPrice}
              onBlur={() => setTouched((p) => ({ ...p, price: true }))}
              error={!!errors.price}
            />
            {errors.price && <ErrorText text={errors.price} />}
          </GlassCard>

          {/* ── Non-EU: Transport / Insurance / Homologation ───────── */}
          {importType === "NonEU" && (
            <GlassCard style={styles.section}>
              <Label icon={<Ship size={16} color={iconColor} />}>
                {t("transportCost")}
              </Label>
              <Input
                testID="transport-input"
                keyboardType="numeric"
                placeholder="1500"
                value={transportCost}
                onChangeText={setTransportCost}
                onBlur={() =>
                  setTouched((p) => ({ ...p, transport: true }))
                }
                error={!!errors.transport}
              />
              {errors.transport && <ErrorText text={errors.transport} />}

              <View style={{ height: Space.md }} />

              <Label icon={<Shield size={16} color={iconColor} />}>
                Marine cargo insurance (€)
              </Label>
              <Input
                testID="insurance-input"
                keyboardType="numeric"
                placeholder={`~${Math.max(
                  Math.round((parseFloat(price) || 0) * 0.005),
                  100,
                )} (auto-estimate if blank)`}
                value={insuranceCost}
                onChangeText={setInsuranceCost}
                onBlur={() =>
                  setTouched((p) => ({ ...p, insurance: true }))
                }
                error={!!errors.insurance}
              />
              {errors.insurance && <ErrorText text={errors.insurance} />}

              <View style={{ height: Space.md }} />

              <Tap
                onPress={() => setNeedsHomologation(!needsHomologation)}
                style={[
                  styles.checkRow,
                  {
                    borderColor: needsHomologation
                      ? theme.pillActiveBorder
                      : theme.glassBorder,
                    backgroundColor: needsHomologation
                      ? theme.pillActiveBg
                      : theme.glassBg,
                  },
                ]}
              >
                {needsHomologation ? (
                  <CheckSquare size={22} color={theme.brandBlueLight} />
                ) : (
                  <Square size={22} color={theme.textTertiary} />
                )}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: theme.textPrimary,
                      fontFamily: Fonts.sansSemibold,
                      fontSize: 14,
                    }}
                  >
                    {t("homologation")}
                  </Text>
                  <Text
                    style={{
                      color: theme.textTertiary,
                      fontFamily: Fonts.sansRegular,
                      fontSize: 12,
                      marginTop: 2,
                    }}
                  >
                    ~1500€
                  </Text>
                </View>
                <InfoTooltip text={t("homologationInfo")} />
              </Tap>
            </GlassCard>
          )}

          {/* ── CO2 ────────────────────────────────────────────────── */}
          <GlassCard style={styles.section}>
            <Label
              icon={<Gauge size={16} color={iconColor} />}
              trailing={<InfoTooltip text={t("co2Info")} />}
            >
              {t("co2")}
            </Label>
            {isElectric && (
              <View style={{ marginBottom: Space.sm }}>
                <Badge tone="success">{t("evDetected")}</Badge>
              </View>
            )}
            <Input
              testID="co2-input"
              keyboardType="numeric"
              placeholder="145"
              value={co2}
              onChangeText={(v) => {
                setCo2(v);
                if (v !== "0") setIsElectric(false);
              }}
              onBlur={() => setTouched((p) => ({ ...p, co2: true }))}
              error={!!errors.co2}
            />
            {errors.co2 && <ErrorText text={errors.co2} />}
          </GlassCard>

          {/* ── First Registration / Condition ─────────────────────── */}
          <GlassCard style={styles.section}>
            <Label
              icon={<CalendarDays size={16} color={iconColor} />}
              trailing={<InfoTooltip text={t("ageInfo")} />}
            >
              {t("age") || "First Registration (Month/Year)"}
            </Label>
            <MonthYearPicker
              value={registrationDate}
              onChange={setRegistrationDate}
            />

            <View style={{ height: Space.md }} />

            <Tap
              onPress={() => setIsNewCondition(!isNewCondition)}
              style={[
                styles.checkRow,
                {
                  borderColor: isNewCondition
                    ? theme.pillActiveBorder
                    : theme.glassBorder,
                  backgroundColor: isNewCondition
                    ? theme.pillActiveBg
                    : theme.glassBg,
                },
              ]}
            >
              {isNewCondition ? (
                <CheckSquare size={22} color={theme.brandBlueLight} />
              ) : (
                <Square size={22} color={theme.textTertiary} />
              )}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: theme.textPrimary,
                    fontFamily: Fonts.sansSemibold,
                    fontSize: 14,
                  }}
                >
                  {t("isNew") || "Condition is completely new (0 km)"}
                </Text>
                <Text
                  style={{
                    color: theme.textTertiary,
                    fontFamily: Fonts.sansRegular,
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  {t("isNewInfo") || "Less than 6000km and 6 months old"}
                </Text>
              </View>
            </Tap>
          </GlassCard>

          {/* ── Vehicle Valuation (live: BOE × Depreciation = Tax Base) ─ */}
          {(fiscalValue || isNewCondition) && !errors.fiscalValue && (
            <GlassCard style={styles.section}>
              <View style={styles.valuationHeader}>
                <Coins size={16} color={iconColor} />
                <Text
                  style={{
                    color: theme.textPrimary,
                    fontFamily: Fonts.sansBold,
                    fontSize: 15,
                    flex: 1,
                  }}
                >
                  Vehicle Valuation
                </Text>
                <InfoTooltip text={t("fiscalInfo")} />
              </View>

              {/* BOE new value */}
              {fiscalValue && (
                <ValuationRow
                  label={t("boeNewValue")}
                  value={`€${parseFloat(fiscalValue).toLocaleString("de-DE")}`}
                  sublabel={
                    isNewCondition
                      ? "Not used — new car uses invoice price"
                      : "Original new-vehicle value (Hacienda BOE)"
                  }
                />
              )}

              {/* Depreciation — only shown for used cars */}
              {!isNewCondition && (
                <>
                  <Divider style={{ marginVertical: 10 }} />
                  <ValuationRow
                    label={t("depreciation")}
                    value={
                      depreciationPct !== null
                        ? `−${depreciationPct}%`
                        : "—"
                    }
                    sublabel={
                      vehicleAgeText
                        ? `${vehicleAgeText} old`
                        : "Set first registration date above"
                    }
                  />
                </>
              )}

              {/* The headline — tax base used by Hacienda */}
              <Divider style={{ marginVertical: 10 }} />
              <View style={styles.taxBaseBlock}>
                <Caption>{t("taxBase")} (Base Imponible)</Caption>
                <Text
                  style={{
                    color: taxBase ? theme.brandBlueLight : theme.textTertiary,
                    fontFamily: Fonts.monoBold,
                    fontSize: 36,
                    letterSpacing: -1,
                    marginTop: 6,
                    marginBottom: 6,
                  }}
                >
                  {taxBase != null
                    ? `€${taxBase.toLocaleString("de-DE")}`
                    : "—"}
                </Text>
                <Text
                  style={{
                    color: theme.textTertiary,
                    fontFamily: Fonts.sansRegular,
                    fontSize: 12,
                    textAlign: "center",
                    lineHeight: 17,
                  }}
                >
                  {isNewCondition
                    ? "New car — invoice price is used directly. IEDMT is calculated from this value."
                    : "Spain calculates IEDMT and ITP from this. It updates as you change the registration date above."}
                </Text>
              </View>
            </GlassCard>
          )}

          {/* ── Seller Type (EU + Used) ────────────────────────────── */}
          {importType === "EU" && !isNewCondition && (
            <GlassCard style={styles.section}>
              <Label
                icon={<User size={16} color={iconColor} />}
                trailing={<InfoTooltip text={t("sellerTypeInfo")} />}
              >
                {t("sellerType")}
              </Label>
              <PillGroup>
                <Pill
                  active={sellerType === "dealer"}
                  onPress={() => setSellerType("dealer")}
                >
                  {t("dealer")}
                </Pill>
                <Pill
                  active={sellerType === "private"}
                  onPress={() => setSellerType("private")}
                >
                  {t("private")}
                </Pill>
              </PillGroup>
              {sellerType === "private" && (
                <View style={{ marginTop: Space.sm }}>
                  <Badge tone="warning">{t("privateSaleWarning")}</Badge>
                </View>
              )}
            </GlassCard>
          )}

          {/* ── Footer Links ────────────────────────────────────────── */}
          <View style={styles.footerLinks}>
            <Tap
              onPress={() =>
                Linking.openURL("https://importespana.com/privacy")
              }
            >
              <Text style={[styles.linkText, { color: theme.textSecondary }]}>
                {t("privacyPolicy")}
              </Text>
            </Tap>
            <Text style={{ color: theme.textTertiary }}>·</Text>
            <Tap
              onPress={() => Linking.openURL("https://importespana.com/terms")}
            >
              <Text style={[styles.linkText, { color: theme.textSecondary }]}>
                {t("termsOfService")}
              </Text>
            </Tap>
            {!isPro && (
              <>
                <Text style={{ color: theme.textTertiary }}>·</Text>
                <Tap onPress={() => restorePurchases()}>
                  <Text style={[styles.linkText, { color: theme.textSecondary }]}>
                    {t("restorePurchases")}
                  </Text>
                </Tap>
              </>
            )}
          </View>

          <View style={{ height: 140 }} />
        </ScrollView>

        {/* ── Sticky Footer ─────────────────────────────────────────── */}
        <View
          style={[
            styles.footer,
            {
              backgroundColor: theme.background,
              borderTopColor: theme.glassBorder,
            },
          ]}
        >
          {!isPro && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                marginBottom: 8,
              }}
            >
              {hasReachedLimit && (
                <AlertCircle size={14} color={theme.error} />
              )}
              <Text
                style={{
                  textAlign: "center",
                  fontFamily: Fonts.sansSemibold,
                  fontSize: 12,
                  color: hasReachedLimit ? theme.error : theme.textSecondary,
                  letterSpacing: 0.4,
                }}
              >
                {hasReachedLimit
                  ? t("limitReachedTitle")
                  : `${remaining}/${FREE_DAILY_LIMIT} ${t("calculationsRemaining")}`}
              </Text>
            </View>
          )}
          <View style={{ flexDirection: "row", gap: 10 }}>
            <SecondaryButton
              testID="reset-button"
              onPress={handleReset}
              icon={<RotateCcw size={18} color={theme.textSecondary} />}
            />
            <View style={{ flex: 1 }}>
              <PrimaryButton
                testID="calculate-button"
                onPress={handleCalculate}
                disabled={!isValid}
                full
              >
                {t("calculate")}
              </PrimaryButton>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function ValuationRow({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string;
  sublabel?: string;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      }}
    >
      <View style={{ flex: 1 }}>
        <Caption>{label}</Caption>
        {sublabel && (
          <Text
            style={{
              color: theme.textTertiary,
              fontFamily: Fonts.sansRegular,
              fontSize: 11,
              marginTop: 2,
              lineHeight: 15,
            }}
          >
            {sublabel}
          </Text>
        )}
      </View>
      <Text
        style={{
          color: theme.textPrimary,
          fontFamily: Fonts.monoBold,
          fontSize: 18,
          letterSpacing: -0.3,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function ErrorText({ text }: { text: string }) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 6,
      }}
    >
      <AlertCircle size={14} color={theme.error} />
      <Text
        style={{
          color: theme.error,
          fontSize: 12,
          fontFamily: Fonts.sansMedium,
        }}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Space.md, paddingBottom: 32 },
  section: { marginBottom: Space.md },
  valuationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  taxBaseBlock: {
    alignItems: "center",
    paddingVertical: 6,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  footer: {
    paddingHorizontal: Space.md,
    paddingTop: Space.md,
    paddingBottom: Space.lg,
    borderTopWidth: 1,
  },
  footerLinks: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    paddingVertical: Space.md,
    gap: 8,
  },
  linkText: {
    fontSize: 12,
    fontFamily: Fonts.sansMedium,
    textDecorationLine: "underline",
  },
});
