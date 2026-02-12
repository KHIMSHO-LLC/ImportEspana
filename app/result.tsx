import { AdUnits } from "@/constants/Ads";
import { Colors } from "@/constants/Colors";
import { useLanguage } from "@/context/LanguageContext";
import { CalculationInput } from "@/types";
import { calculateImportCost } from "@/utils/taxCalculator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Save } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
} from "react-native-google-mobile-ads";

const screenWidth = Dimensions.get("window").width;

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useLanguage();

  // Transform params back to typed input
  const input: CalculationInput = {
    originCountry: params.originCountry as any,
    carPrice: parseFloat(params.carPrice as string),
    officialFiscalValue: parseFloat(params.officialFiscalValue as string),
    carAge: params.carAge as any,
    co2Emissions: parseFloat(params.co2Emissions as string),
    sellerType: params.sellerType as any,
    itpRate: params.itpRate ? parseFloat(params.itpRate as string) : undefined,
  };

  const result = calculateImportCost(input);

  const [adLoaded, setAdLoaded] = useState(false);
  const [rewardedAd, setRewardedAd] = useState<RewardedAd | null>(null);
  const rewardEarned = useRef(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const ad = RewardedAd.createForAdRequest(AdUnits.REWARDED, {
      requestNonPersonalizedAdsOnly: true,
    });

    const unsubscribeLoaded = ad.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        setAdLoaded(true);
      },
    );

    const unsubscribeEarned = ad.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        rewardEarned.current = true;
      },
    );

    const unsubscribeClosed = ad.addAdEventListener(
      AdEventType.CLOSED,
      async () => {
        // Load a new ad for next time
        setAdLoaded(false);
        ad.load();

        if (rewardEarned.current) {
          try {
            // Generate and share PDF
            const { generateAndSharePDF } = await import("@/utils/generatePdf");
            await generateAndSharePDF(input, result);

            // Also save to history
            await saveToHistory(result);

            Alert.alert("Success!", t("saveDownload"));
          } catch (error) {
            console.error("PDF generation error:", error);
            Alert.alert("Error", "Could not generate PDF. Please try again.");
          }
          rewardEarned.current = false; // Reset
        }
      },
    );

    ad.load();
    setRewardedAd(ad);

    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeClosed();
    };
  }, []);

  const saveToHistory = async (item: any) => {
    try {
      const existing = await AsyncStorage.getItem("@import_history");
      const history = existing ? JSON.parse(existing) : [];
      history.push({ ...item, date: new Date().toISOString() });
      await AsyncStorage.setItem("@import_history", JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save", e);
    }
  };

  const handleSave = () => {
    if (adLoaded && rewardedAd) {
      rewardedAd.show();
    } else {
      Alert.alert(t("loadingAd"), "Please wait for ad.");
    }
  };

  // Check if electric vehicle (CO2 = 0)
  const isElectric = input.co2Emissions === 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Gradient Header with Total */}
      <LinearGradient
        colors={[Colors.primary, "#0055CC"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            alignItems: "center",
          }}
        >
          <Text style={styles.headerLabel}>{t("estimatedTotal")}</Text>
          <Text style={styles.totalAmount}>
            {result.totalCost.toLocaleString("de-DE", {
              style: "currency",
              currency: "EUR",
            })}
          </Text>
          <Text style={styles.subDetail}>{t("includes")}</Text>
          {isElectric && (
            <View style={styles.evBadge}>
              <Text style={styles.evBadgeText}>{t("evDetected")}</Text>
            </View>
          )}
        </Animated.View>
      </LinearGradient>

      {/* Breakdown Card */}
      <Animated.View
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.cardTitle}>💶 {t("breakdown")}</Text>

        <Row label={t("carPrice")} value={input.carPrice} color={Colors.text} />
        <Row
          label="Transport" // TODO: Translate if needed or keep generic
          value={result.transportCost}
          color={Colors.text}
        />

        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>{t("taxesFees")}</Text>

        <Row
          label={t("registrationTax")}
          value={result.registrationTax}
          color={Colors.secondary}
          bold
        />
        {result.itpTax > 0 && (
          <Row
            label={t("itp")}
            value={result.itpTax}
            color={Colors.secondary}
          />
        )}

        <Row label={t("dgt")} value={result.dgtFee} color={Colors.text} />
        <Row label={t("itv")} value={result.itvFee} color={Colors.text} />
        <Row label={t("plates")} value={result.platesFee} color={Colors.text} />

        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.labelBold}>{t("totalImportCost")}</Text>
          <Text
            style={[
              styles.value,
              { color: Colors.primary, fontSize: 18, fontWeight: "bold" },
            ]}
          >
            {(result.totalCost - input.carPrice).toLocaleString("de-DE", {
              style: "currency",
              currency: "EUR",
            })}
          </Text>
        </View>
      </Animated.View>

      {/* Stats Card */}
      <Animated.View
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.cardTitle}>📊 {t("calculationDetails")}</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>{t("depreciation")}</Text>
          <Text style={styles.statValue}>
            {((1 - result.depreciationPercentage) * 100).toFixed(0)}%
          </Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>{t("taxBase")}</Text>
          <Text style={styles.statValue}>{result.taxBase.toFixed(0)}€</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>{t("taxRate")}</Text>
          <Text style={styles.statValue}>
            {(result.taxRateApplied * 100).toFixed(2)}% (CO2:{" "}
            {input.co2Emissions}g/km)
          </Text>
        </View>
      </Animated.View>

      {/* Action Button */}
      <Animated.View
        style={[
          styles.actionContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            pressed && { transform: [{ scale: 0.97 }] },
          ]}
          onPress={handleSave}
        >
          <LinearGradient
            colors={[Colors.secondary, "#FFD700"]}
            style={styles.saveButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Save color="#000" size={20} />
            <Text style={styles.saveButtonText}>{t("saveDownload")}</Text>
            {!adLoaded && (
              <Text style={{ fontSize: 10, color: "#444" }}>
                {t("loadingAd")}
              </Text>
            )}
          </LinearGradient>
        </Pressable>
        <Text style={styles.adHint}>{t("watchAd")}</Text>
      </Animated.View>
    </ScrollView>
  );
}

function Row({
  label,
  value,
  color,
  bold,
}: {
  label: string;
  value: number;
  color: string;
  bold?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, { fontWeight: bold ? "bold" : "400" }]}>
        {label}
      </Text>
      <Text
        style={[styles.value, { color, fontWeight: bold ? "bold" : "400" }]}
      >
        {value.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  header: {
    padding: 35,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  totalAmount: {
    color: Colors.white,
    fontSize: 48,
    fontWeight: "900",
    marginVertical: 8,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subDetail: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    textAlign: "center",
  },
  evBadge: {
    marginTop: 12,
    backgroundColor: "#10B981",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  evBadgeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },

  card: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginBottom: 18,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 18,
    color: Colors.text,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
    marginBottom: 10,
    marginTop: 6,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    alignItems: "center",
  },
  label: { fontSize: 15, color: "#4B5563", flex: 1 },
  labelBold: { fontSize: 17, fontWeight: "700", color: Colors.text, flex: 1 },
  value: { fontSize: 15, fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 14 },

  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
  },
  statLabel: { fontSize: 14, color: "#6B7280", flex: 1 },
  statValue: { fontSize: 14, fontWeight: "700", color: Colors.text },

  actionContainer: { alignItems: "center", marginTop: 12, marginBottom: 20 },
  saveButton: {
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonGradient: {
    flexDirection: "row",
    paddingHorizontal: 28,
    paddingVertical: 16,
    alignItems: "center",
    gap: 10,
  },
  saveButtonText: { fontWeight: "800", color: "#000", fontSize: 16 },
  adHint: { marginTop: 10, color: "#9CA3AF", fontSize: 13 },
});
