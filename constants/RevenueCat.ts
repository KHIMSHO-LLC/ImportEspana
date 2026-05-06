import { Platform } from "react-native";

const API_KEYS = {
  apple: "appl_DkBSCBeUXidSjMoMMLcVDSjKvAg", // Added correct key
  google: "goog_...", // Replace with your actual Google API Key
  test: "appl_DkBSCBeUXidSjMoMMLcVDSjKvAg", // Using real key for testing
};

export const REVENUECAT_API_KEY = Platform.select({
  ios: API_KEYS.test, // Using test key for now as requested
  android: API_KEYS.test,
  default: API_KEYS.test,
});

export const ENTITLEMENT_ID = "pro"; // or "importespana_pro" based on your setup

export const PACKAGES = {
  MONTHLY: "monthly",
  YEARLY: "yearly",
  LIFETIME: "lifetime",
};
