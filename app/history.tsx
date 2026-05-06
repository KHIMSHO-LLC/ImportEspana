import { Badge, Caption, GlassCard, PrimaryButton } from "@/components/ui";
import { Fonts, Space } from "@/constants/Colors";
import { useLanguage } from "@/context/LanguageContext";
import { useRevenueCat } from "@/context/RevenueCatContext";
import { useTheme } from "@/context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
  AlertTriangle,
  ClipboardList,
  Clock,
  Lock,
  MapPin,
  Trash2,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface HistoryEntry {
  id: string;
  date: string;
  input: {
    originCountry: string;
    carPrice: number;
    officialFiscalValue: number;
    carAge: string;
    co2Emissions: number;
    sellerType: string;
  };
  result: {
    totalCost: number;
    registrationTax: number;
    itpTax: number;
    totalImportTaxes: number;
    taxRateApplied: number;
    depreciationPercentage: number;
  };
}

const AGE_LABELS: Record<string, string> = {
  new: "New",
  "1_year": "1 yr",
  "2_years": "2 yrs",
  "3_years": "3 yrs",
  "4_years": "4 yrs",
  "5_years": "5 yrs",
  "6_years": "6 yrs",
  "7_years": "7 yrs",
  "8_years": "8 yrs",
  "9_years": "9 yrs",
  "10_years": "10 yrs",
  "11_years": "11 yrs",
  "12_plus_years": "12+ yrs",
};

export default function HistoryScreen() {
  const { t } = useLanguage();
  const { isPro } = useRevenueCat();
  const { theme } = useTheme();
  const router = useRouter();
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const raw = await AsyncStorage.getItem("@import_history");
      if (raw) {
        const parsed = JSON.parse(raw);
        const valid = parsed.filter(
          (it: any) => it && it.input && it.result,
        );
        setHistory(valid);
      }
    } catch (e) {
      console.error("Failed to load history:", e);
    }
  };

  const deleteEntry = useCallback(
    (id: string) => {
      Alert.alert(
        t("deleteEntryTitle") || "Delete Entry",
        t("deleteEntryMessage") ||
          "Are you sure you want to delete this calculation?",
        [
          { text: t("cancel") || "Cancel", style: "cancel" },
          {
            text: t("delete") || "Delete",
            style: "destructive",
            onPress: async () => {
              const updated = history.filter((item) => item.id !== id);
              setHistory(updated);
              await AsyncStorage.setItem(
                "@import_history",
                JSON.stringify(updated),
              );
            },
          },
        ],
      );
    },
    [history, t],
  );

  const clearAllHistory = useCallback(() => {
    Alert.alert(
      t("clearHistoryTitle") || "Clear All History",
      t("clearHistoryMessage") ||
        "This will delete all saved calculations. This action cannot be undone.",
      [
        { text: t("cancel") || "Cancel", style: "cancel" },
        {
          text: t("clearAll") || "Clear All",
          style: "destructive",
          onPress: async () => {
            setHistory([]);
            await AsyncStorage.removeItem("@import_history");
          },
        },
      ],
    );
  }, [t]);

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatCurrency = (n: number) =>
    `€${n.toLocaleString("de-DE", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;

  const renderItem = ({ item }: { item: HistoryEntry }) => {
    if (!item?.result || !item?.input) return null;
    return (
      <GlassCard style={{ marginBottom: Space.md }}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: Fonts.monoBold,
                fontSize: 22,
                color: theme.brandBlueLight,
                letterSpacing: -0.4,
              }}
            >
              {formatCurrency(item.result.totalCost)}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginTop: 4,
              }}
            >
              <Clock size={12} color={theme.textTertiary} />
              <Text
                style={{
                  color: theme.textTertiary,
                  fontFamily: Fonts.sansMedium,
                  fontSize: 12,
                }}
              >
                {formatDate(item.date)}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => deleteEntry(item.id)}
            hitSlop={10}
            style={{ padding: 8 }}
          >
            <Trash2 size={18} color={theme.error} />
          </Pressable>
        </View>

        <View style={{ height: 1, backgroundColor: theme.glassBorder, marginVertical: 12 }} />

        <DetailRow
          label={
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                flex: 1,
              }}
            >
              <MapPin size={12} color={theme.textTertiary} />
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 13,
                  fontFamily: Fonts.sansMedium,
                }}
              >
                {item.input.originCountry}
              </Text>
            </View>
          }
          value={formatCurrency(item.input.carPrice)}
        />
        <DetailRow
          label={t("registrationTax") || "Registration Tax"}
          value={formatCurrency(item.result.registrationTax)}
        />
        {item.result.itpTax > 0 && (
          <DetailRow
            label={t("itp") || "ITP"}
            value={formatCurrency(item.result.itpTax)}
          />
        )}
        <DetailRow
          label={t("totalImportCost") || "Import Taxes"}
          value={formatCurrency(item.result.totalImportTaxes)}
          bold
        />

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 6,
            marginTop: 10,
          }}
        >
          <Badge tone="info">
            {AGE_LABELS[item.input.carAge] || item.input.carAge}
          </Badge>
          <Badge tone="neutral">CO₂ {item.input.co2Emissions} g/km</Badge>
          <Badge tone="neutral">
            {item.input.sellerType === "dealer" ? "Dealer" : "Private"}
          </Badge>
        </View>
      </GlassCard>
    );
  };

  if (!isPro) {
    return (
      <View
        style={[
          styles.proGate,
          { backgroundColor: theme.background },
        ]}
      >
        <Lock size={56} color={theme.brandGoldLight} style={{ marginBottom: 16 }} />
        <Text
          style={{
            fontFamily: Fonts.sansExtraBold,
            fontSize: 22,
            color: theme.textPrimary,
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          {t("historyProTitle") || "Pro Feature"}
        </Text>
        <Text
          style={{
            fontFamily: Fonts.sansRegular,
            fontSize: 14,
            color: theme.textSecondary,
            textAlign: "center",
            lineHeight: 22,
            marginBottom: 24,
          }}
        >
          {t("historyProMessage") ||
            "Calculation history is available for Pro users."}
        </Text>
        <PrimaryButton onPress={() => router.push("/paywall")}>
          {t("goPro") || "Go Pro"}
        </PrimaryButton>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View
        style={[
          styles.warningBanner,
          {
            backgroundColor: "rgba(251,185,36,0.10)",
            borderBottomColor: "rgba(251,185,36,0.32)",
          },
        ]}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <AlertTriangle size={12} color={theme.warning} />
          <Text
            style={{
              color: theme.warning,
              fontSize: 12,
              fontFamily: Fonts.sansMedium,
            }}
          >
            {t("historyDataWarning") ||
              "History is stored locally. Deleting the app will remove all data."}
          </Text>
        </View>
      </View>

      {history.length === 0 ? (
        <View style={styles.empty}>
          <ClipboardList size={48} color={theme.textTertiary} style={{ marginBottom: 16 }} />
          <Caption style={{ marginBottom: 6 }}>
            {t("noHistory") || "No calculations yet"}
          </Caption>
          <Text
            style={{
              fontFamily: Fonts.sansRegular,
              color: theme.textSecondary,
              fontSize: 14,
              textAlign: "center",
            }}
          >
            {t("noHistoryMessage") ||
              "Your calculations will appear here automatically."}
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={history}
            renderItem={renderItem}
            keyExtractor={(it) => it.id}
            contentContainerStyle={{ padding: Space.md, paddingBottom: 80 }}
            showsVerticalScrollIndicator={false}
          />
          <View
            style={[
              styles.footerBar,
              {
                backgroundColor: theme.background,
                borderTopColor: theme.glassBorder,
              },
            ]}
          >
            <Pressable
              onPress={clearAllHistory}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingVertical: 8,
                paddingHorizontal: 16,
              }}
            >
              <Trash2 size={16} color={theme.error} />
              <Text
                style={{
                  color: theme.error,
                  fontSize: 14,
                  fontFamily: Fonts.sansBold,
                }}
              >
                {t("clearAll") || "Clear All"}
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

function DetailRow({
  label,
  value,
  bold,
}: {
  label: React.ReactNode;
  value: string;
  bold?: boolean;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
      }}
    >
      {typeof label === "string" ? (
        <Text
          style={{
            color: theme.textSecondary,
            fontSize: 13,
            fontFamily: Fonts.sansMedium,
            flex: 1,
          }}
        >
          {label}
        </Text>
      ) : (
        label
      )}
      <Text
        style={{
          color: theme.textPrimary,
          fontSize: 14,
          fontFamily: bold ? Fonts.monoBold : Fonts.monoMedium,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  warningBanner: {
    paddingHorizontal: Space.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  footerBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    padding: 12,
    alignItems: "center",
  },
  proGate: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
});
