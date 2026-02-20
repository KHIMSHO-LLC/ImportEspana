import { ENTITLEMENT_ID, REVENUECAT_API_KEY } from "@/constants/RevenueCat";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from "react-native-purchases";

interface RevenueCatContextType {
  isPro: boolean;
  currentOffering: PurchasesOffering | null;
  customerInfo: CustomerInfo | null;
  purchasePackage: (pack: PurchasesPackage) => Promise<void>;
  restorePurchases: () => Promise<void>;
  isLoading: boolean;
}

const RevenueCatContext = createContext<RevenueCatContextType | undefined>(
  undefined,
);

// ⚠️ TEMPORARY: Set to `true` to preview Pro mode. REVERT TO `false` BEFORE RELEASE!
const FORCE_PRO_MODE = false;

export const RevenueCatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isPro, setIsPro] = useState(FORCE_PRO_MODE);
  const [currentOffering, setCurrentOffering] =
    useState<PurchasesOffering | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initRevenueCat();
  }, []);

  const initRevenueCat = async () => {
    try {
      if (Platform.OS === "ios") {
        await Purchases.configure({ apiKey: REVENUECAT_API_KEY });

        // Get initial customer info
        const info = await Purchases.getCustomerInfo();
        setCustomerInfo(info);
        if (!FORCE_PRO_MODE) {
          checkEntitlement(info);
        }

        // Load Offerings
        loadOfferings();
      }
    } catch (e) {
      console.error("RevenueCat Init Error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOfferings = async () => {
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current) {
        setCurrentOffering(offerings.current);
      }
    } catch (e) {
      console.error("Error loading offerings:", e);
    }
  };

  const checkEntitlement = (info: CustomerInfo) => {
    if (info.entitlements.active[ENTITLEMENT_ID]) {
      setIsPro(true);
    } else {
      setIsPro(false);
    }
  };

  const purchasePackage = async (pack: PurchasesPackage) => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pack);
      setCustomerInfo(customerInfo);
      checkEntitlement(customerInfo);
    } catch (e: any) {
      if (!e.userCancelled) {
        Alert.alert("Purchase Error", e.message);
      }
    }
  };

  const restorePurchases = async () => {
    try {
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);
      checkEntitlement(info);

      if (info.entitlements.active[ENTITLEMENT_ID]) {
        Alert.alert("Success", "Your purchases have been restored!");
      } else {
        Alert.alert("Info", "No active subscriptions found to restore.");
      }
    } catch (e: any) {
      Alert.alert("Restore Error", e.message);
    }
  };

  return (
    <RevenueCatContext.Provider
      value={{
        isPro,
        currentOffering,
        customerInfo,
        purchasePackage,
        restorePurchases,
        isLoading,
      }}
    >
      {children}
    </RevenueCatContext.Provider>
  );
};

export const useRevenueCat = () => {
  const context = useContext(RevenueCatContext);
  if (!context) {
    throw new Error("useRevenueCat must be used within a RevenueCatProvider");
  }
  return context;
};
