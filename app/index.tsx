import { Colors } from "@/constants/Colors";
import { CarAge, Country } from "@/types";
import { useRouter } from "expo-router";
import { Euro, Gauge, GraduationCap, MapPin, User } from "lucide-react-native";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";

export default function InputScreen() {
  const router = useRouter();

  // State
  const [originCountry, setOriginCountry] = useState<Country>("Germany");
  const [price, setPrice] = useState("25000"); // Test Data
  const [fiscalValue, setFiscalValue] = useState("42000"); // Test Data
  const [co2, setCo2] = useState("135"); // Test Data
  const [age, setAge] = useState<CarAge>("3_years");
  const [sellerType, setSellerType] = useState<"dealer" | "private">("dealer");

  const isValid = price.length > 0 && co2.length > 0 && fiscalValue.length > 0;

  const handleCalculate = () => {
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

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Origin Country */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            <MapPin size={16} color={Colors.primary} /> Origin Country
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
                  {c}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Price */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            <Euro size={16} color={Colors.primary} /> Car Price (€)
          </Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="25000"
            value={price}
            onChangeText={setPrice}
          />
        </View>

        {/* Fiscal Value */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            <Euro size={16} color={Colors.primary} /> Official Fiscal Value
            (BOE)
          </Text>
          <Text style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
            The "New Value" of this car model according to Hacienda.
          </Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="e.g. 45000"
            value={fiscalValue}
            onChangeText={setFiscalValue}
          />
        </View>

        {/* CO2 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            <Gauge size={16} color={Colors.primary} /> CO2 Emissions (g/km)
          </Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="145"
            value={co2}
            onChangeText={setCo2}
          />
        </View>

        {/* Age */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            <GraduationCap size={16} color={Colors.primary} /> Car Age
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
                  {a.replace(/_/g, " ").replace("years", "yrs")}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Seller Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            <User size={16} color={Colors.primary} /> Seller Type
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
                Dealer
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
                Private
              </Text>
            </Pressable>
          </View>
          {sellerType === "private" && (
            <Text style={styles.infoText}>
              ⚠️ Private sales may incur 4% ITP tax.
            </Text>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Button */}
      <View style={styles.footer}>
        <Pressable
          style={[styles.button, !isValid && styles.buttonDisabled]}
          onPress={handleCalculate}
          disabled={!isValid}
        >
          <Text style={styles.buttonText}>Calculate Total Cost</Text>
        </Pressable>
      </View>

      {/* AdBanner */}
      <View style={{ alignItems: "center", backgroundColor: "#fff" }}>
        <BannerAd
          unitId={TestIds.BANNER}
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
  footer: {
    position: "absolute",
    bottom: 60, // Above Ad
    left: 0,
    right: 0,
    padding: 20,
    // backgroundColor: "rgba(255,255,255,0.9)",
  },
  button: {
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
  buttonDisabled: { backgroundColor: "#CBD5E1", opacity: 0.6 },
  buttonText: { fontSize: 18, fontWeight: "bold", color: Colors.white },
});
