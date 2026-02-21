import { Colors } from "@/constants/Colors";
import { useLanguage } from "@/context/LanguageContext";
import { useRevenueCat } from "@/context/RevenueCatContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Clock, MapPin, Trash2 } from "lucide-react-native";
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

const FLAG_MAP: Record<string, string> = {
  Germany: "🇩🇪",
  France: "🇫🇷",
  Italy: "🇮🇹",
  Belgium: "🇧🇪",
  Netherlands: "🇳🇱",
};

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
        // Filter out corrupted entries
        const valid = parsed.filter(
          (item: any) => item && item.input && item.result,
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
        "This will delete all saved calculations. This action cannot be undone.\n\n⚠️ Note: If you delete the app, all history data will also be permanently removed.",
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (n: number) =>
    `€${n.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const renderItem = ({ item }: { item: HistoryEntry }) => {
    if (!item?.result || !item?.input) return null;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.totalCost}>
              {formatCurrency(item.result.totalCost)}
            </Text>
            <Text style={styles.dateText}>
              <Clock size={12} color={Colors.textLight} />{" "}
              {formatDate(item.date)}
            </Text>
          </View>
          <Pressable
            onPress={() => deleteEntry(item.id)}
            hitSlop={10}
            style={styles.deleteButton}
          >
            <Trash2 size={18} color="#DC2626" />
          </Pressable>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              <MapPin size={14} color={Colors.textLight} />{" "}
              {FLAG_MAP[item.input.originCountry] || "🌍"}{" "}
              {item.input.originCountry}
            </Text>
            <Text style={styles.detailValue}>
              {formatCurrency(item.input.carPrice)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              {t("registrationTax") || "Registration Tax"}
            </Text>
            <Text style={styles.detailValue}>
              {formatCurrency(item.result.registrationTax)}
            </Text>
          </View>

          {item.result.itpTax > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t("itp") || "ITP"}</Text>
              <Text style={styles.detailValue}>
                {formatCurrency(item.result.itpTax)}
              </Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              {t("totalImportCost") || "Import Taxes"}
            </Text>
            <Text style={[styles.detailValue, { fontWeight: "700" }]}>
              {formatCurrency(item.result.totalImportTaxes)}
            </Text>
          </View>

          <View style={styles.tagRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>
                {AGE_LABELS[item.input.carAge] || item.input.carAge}
              </Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>
                CO₂: {item.input.co2Emissions} g/km
              </Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>
                {item.input.sellerType === "dealer" ? "🏢" : "🧑"}{" "}
                {item.input.sellerType === "dealer"
                  ? t("dealer") || "Dealer"
                  : t("private") || "Private"}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };
  if (!isPro) {
    return (
      <View style={styles.proGate}>
        <Text style={styles.proGateIcon}>🔒</Text>
        <Text style={styles.proGateTitle}>
          {t("historyProTitle") || "Pro Feature"}
        </Text>
        <Text style={styles.proGateText}>
          {t("historyProMessage") ||
            "Calculation history is available for Pro users. Upgrade to save and review your past calculations."}
        </Text>
        <Pressable
          style={styles.proButton}
          onPress={() => router.push("/paywall")}
        >
          <Text style={styles.proButtonText}>{t("goPro") || "Go Pro"}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Data Loss Warning Banner */}
      <View style={styles.warningBanner}>
        <Text style={styles.warningText}>
          ⚠️{" "}
          {t("historyDataWarning") ||
            "History is stored locally. Deleting the app will remove all data."}
        </Text>
      </View>

      {history.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>
            {t("noHistory") || "No calculations yet"}
          </Text>
          <Text style={styles.emptyText}>
            {t("noHistoryMessage") ||
              "Your calculations will appear here automatically."}
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={history}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
            showsVerticalScrollIndicator={false}
          />
          <View style={styles.footerBar}>
            <Pressable onPress={clearAllHistory} style={styles.clearButton}>
              <Trash2 size={16} color="#DC2626" />
              <Text style={styles.clearButtonText}>
                {t("clearAll") || "Clear All"}
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  warningBanner: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#FDE68A",
  },
  warningText: {
    fontSize: 12,
    color: "#92400E",
    textAlign: "center",
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: "#F8FAFC",
  },
  cardHeaderLeft: {
    flex: 1,
  },
  totalCost: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.primary,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
  cardBody: {
    padding: 16,
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500",
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  tag: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: "600",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: "center",
  },
  footerBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: 12,
    alignItems: "center",
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  clearButtonText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "600",
  },
  proGate: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: Colors.background,
  },
  proGateIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  proGateTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 8,
  },
  proGateText: {
    fontSize: 15,
    color: Colors.textLight,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  proButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  proButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
});
