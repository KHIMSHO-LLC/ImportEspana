import {
  Badge,
  Caption,
  Divider,
  GlassCard,
  HeroCard,
  PrimaryButton,
} from "@/components/ui";
import { Fonts, Radius, Space } from "@/constants/Colors";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { CalculationInput, CalculationResult } from "@/types";
import { calculateImportCost } from "@/utils/taxCalculator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function ResultScreen() {
  const params = useLocalSearchParams();
  const { t } = useLanguage();
  const { theme } = useTheme();

  const inputStr = JSON.stringify(params);
  const input: CalculationInput = useMemo(
    () => ({
      originCountry: params.originCountry as any,
      carPrice: parseFloat(params.carPrice as string),
      officialFiscalValue: parseFloat(params.officialFiscalValue as string),
      carAge: params.carAge as any,
      registrationDate: (params.registrationDate as string) || undefined,
      isNewCondition: params.isNewCondition === "true",
      co2Emissions: parseFloat(params.co2Emissions as string),
      sellerType: params.sellerType as any,
      needsHomologation: params.needsHomologation === "true",
      itpRate: params.itpRate ? parseFloat(params.itpRate as string) : undefined,
      importType: params.importType as any,
      customsAgentFee: params.customsAgentFee
        ? parseFloat(params.customsAgentFee as string)
        : undefined,
      transportCost: params.transportCost
        ? parseFloat(params.transportCost as string)
        : undefined,
      insuranceCost: params.insuranceCost
        ? parseFloat(params.insuranceCost as string)
        : undefined,
      spanishRegion: (params.spanishRegion as string) || undefined,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inputStr],
  );

  const result = useMemo(() => calculateImportCost(input), [input]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const saveToHistory = useCallback(
    async (i: CalculationInput, r: CalculationResult) => {
      try {
        const existing = await AsyncStorage.getItem("@import_history");
        const history = existing ? JSON.parse(existing) : [];
        history.unshift({
          id: Date.now().toString(),
          date: new Date().toISOString(),
          input: {
            originCountry: i.originCountry,
            carPrice: i.carPrice,
            officialFiscalValue: i.officialFiscalValue,
            carAge: i.carAge,
            co2Emissions: i.co2Emissions,
            sellerType: i.sellerType,
          },
          result: {
            totalCost: r.totalCost,
            registrationTax: r.registrationTax,
            itpTax: r.itpTax,
            duty: r.duty,
            vat: r.vat,
            totalImportTaxes: r.totalImportTaxes,
            taxRateApplied: r.taxRateApplied,
            depreciationPercentage: r.depreciationPercentage,
          },
        });
        if (history.length > 50) history.pop();
        await AsyncStorage.setItem("@import_history", JSON.stringify(history));
      } catch (e) {
        console.error("Failed to save", e);
      }
    },
    [],
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start();
    saveToHistory(input, result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const downloadPDF = useCallback(async () => {
    try {
      const { generateAndSharePDF } = await import("@/utils/generatePdf");
      await generateAndSharePDF(input, result);
      Alert.alert("Success!", t("saveDownload"));
    } catch (e) {
      console.error("PDF generation error:", e);
      Alert.alert("Error", "Could not generate PDF. Please try again.");
    }
  }, [input, result, t]);

  const isElectric = input.co2Emissions === 0;
  const grandTotal = result.totalCost;
  const taxesAndFees = grandTotal - input.carPrice - result.transportCost;

  const auditTone =
    result.auditRisk === "high"
      ? "warning"
      : result.auditRisk === "medium"
        ? "info"
        : "success";

  const formatCurrency = (n: number) =>
    n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

  const animStyle = {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: Space.md, paddingBottom: 40 }}
    >
      {/* ── Hero card with total ─────────────────────────────────── */}
      <Animated.View style={animStyle}>
        <HeroCard style={{ marginBottom: Space.md }}>
          <Caption style={{ color: "rgba(255,255,255,0.78)" }}>
            {t("estimatedTotal")}
          </Caption>
          <Text
            testID="result-total"
            style={{
              color: "#fff",
              fontFamily: Fonts.monoBold,
              fontSize: 44,
              letterSpacing: -1.4,
              marginTop: 6,
              marginBottom: 6,
            }}
          >
            {formatCurrency(grandTotal)}
          </Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.78)",
              fontFamily: Fonts.sansRegular,
              fontSize: 13,
            }}
          >
            {t("includes")}
          </Text>
          {isElectric && (
            <View style={{ marginTop: 12 }}>
              <Badge tone="success">{t("evDetected")}</Badge>
            </View>
          )}
        </HeroCard>
      </Animated.View>

      {/* ── Breakdown ────────────────────────────────────────────── */}
      <Animated.View style={animStyle}>
        <GlassCard style={{ marginBottom: Space.md }}>
          <View style={styles.cardTitleRow}>
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
              {t("breakdown")}
            </Text>
          </View>

          <Row label={t("carPrice")} value={input.carPrice} />
          <Row label={t("transportCost")} value={result.transportCost} />
          {input.insuranceCost ? (
            <Row label="Marine cargo insurance" value={input.insuranceCost} />
          ) : null}
          {(result.duty ?? 0) > 0 && (
            <Row label={t("duty")} value={result.duty ?? 0} />
          )}
          {(result.vat ?? 0) > 0 && (
            <Row label={t("vat")} value={result.vat ?? 0} />
          )}

          <Divider />
          <Caption style={{ marginBottom: 10 }}>{t("taxesFees")}</Caption>

          <Row
            label={t("registrationTax")}
            value={result.registrationTax}
            highlight
          />
          {result.itpTax > 0 && (
            <Row label={t("itp")} value={result.itpTax} highlight />
          )}
          <Row label={t("dgt")} value={result.dgtFee} />
          <Row label={t("itv")} value={result.itvFee} />
          <Row label={t("plates")} value={result.platesFee} />
          {result.customsAgentFee ? (
            <Row label={t("customsAgent")} value={result.customsAgentFee} />
          ) : null}
          {result.homologationFee ? (
            <Row label={t("homologation")} value={result.homologationFee} />
          ) : null}

          <Divider />
          <View style={styles.row}>
            <Text
              style={{
                color: theme.textSecondary,
                fontFamily: Fonts.sansMedium,
                fontSize: 14,
                flex: 1,
              }}
            >
              {t("totalImportCost")}
            </Text>
            <Text
              style={{
                color: theme.textPrimary,
                fontFamily: Fonts.monoMedium,
                fontSize: 14,
              }}
            >
              {formatCurrency(taxesAndFees)}
            </Text>
          </View>

          <Divider />
          <View style={styles.row}>
            <Text
              style={{
                color: theme.textPrimary,
                fontFamily: Fonts.sansBold,
                fontSize: 16,
                letterSpacing: 0.4,
                flex: 1,
              }}
            >
              {t("grandTotal")}
            </Text>
            <Text
              style={{
                color: theme.brandBlueLight,
                fontFamily: Fonts.monoBold,
                fontSize: 20,
                letterSpacing: -0.5,
              }}
            >
              {formatCurrency(grandTotal)}
            </Text>
          </View>
        </GlassCard>
      </Animated.View>

      {/* ── Calculation details ──────────────────────────────────── */}
      <Animated.View style={animStyle}>
        <GlassCard style={{ marginBottom: Space.md }}>
          <View style={styles.cardTitleRow}>
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
              {t("calculationDetails")}
            </Text>
          </View>

          <StatRow
            label={t("depreciation")}
            value={`${((1 - result.depreciationPercentage) * 100).toFixed(0)}%`}
          />
          <StatRow
            label={t("taxBase")}
            value={`€${result.taxBase.toLocaleString("de-DE", {
              maximumFractionDigits: 0,
            })}`}
          />
          <StatRow
            label={t("taxRate")}
            value={`${(result.taxRateApplied * 100).toFixed(2)}% · CO₂ ${input.co2Emissions}g/km`}
          />
          {input.spanishRegion ? (
            <StatRow label="Region" value={input.spanishRegion} />
          ) : null}
          {result.itpRateApplied > 0 ? (
            <StatRow
              label="ITP rate"
              value={`${(result.itpRateApplied * 100).toFixed(2)}%`}
            />
          ) : null}
        </GlassCard>
      </Animated.View>

      {/* ── Audit risk (only meaningful for EU when market value > 0) ── */}
      {input.importType !== "NonEU" && result.marketValue > 0 && (
        <Animated.View style={animStyle}>
          <GlassCard style={{ marginBottom: Space.md }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: Fonts.sansBold,
                  color: theme.textPrimary,
                  flex: 1,
                }}
              >
                Hacienda audit risk
              </Text>
              <Badge tone={auditTone}>{result.auditRisk.toUpperCase()}</Badge>
            </View>
            <Text
              style={{
                color: theme.textSecondary,
                fontFamily: Fonts.sansRegular,
                fontSize: 13,
                lineHeight: 19,
              }}
            >
              Declared price is{" "}
              <Text
                style={{
                  color: theme.textPrimary,
                  fontFamily: Fonts.monoBold,
                }}
              >
                {(result.auditRiskRatio * 100).toFixed(0)}%
              </Text>{" "}
              of estimated market value (€
              {result.marketValue.toLocaleString("de-DE", {
                maximumFractionDigits: 0,
              })}
              ). Hacienda may issue a complementary settlement if the gap is too
              large.
            </Text>
          </GlassCard>
        </Animated.View>
      )}

      {/* ── Action ───────────────────────────────────────────────── */}
      <Animated.View style={[animStyle, { alignItems: "stretch" }]}>
        <PrimaryButton onPress={downloadPDF} full>
          {t("saveDownload")}
        </PrimaryButton>
      </Animated.View>
    </ScrollView>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  const { theme } = useTheme();
  return (
    <View style={styles.row}>
      <Text
        style={{
          color: theme.textSecondary,
          fontFamily: Fonts.sansRegular,
          fontSize: 14,
          flex: 1,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: highlight ? theme.brandGoldLight : theme.textPrimary,
          fontFamily: Fonts.monoMedium,
          fontSize: 14,
        }}
      >
        {value.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
      </Text>
    </View>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.statRow,
        {
          backgroundColor: theme.surfaceDim,
          borderColor: theme.glassBorder,
        },
      ]}
    >
      <Text
        style={{
          color: theme.textSecondary,
          fontFamily: Fonts.sansMedium,
          fontSize: 13,
          flex: 1,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: theme.textPrimary,
          fontFamily: Fonts.monoBold,
          fontSize: 13,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cardTitle: {
    fontSize: 18,
    fontFamily: Fonts.sansBold,
    letterSpacing: -0.3,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: Space.md,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: 8,
  },
});
