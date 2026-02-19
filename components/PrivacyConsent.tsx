import { useEffect, useState } from "react";
import mobileAds, {
  AdsConsent,
  AdsConsentDebugGeography,
  AdsConsentStatus,
} from "react-native-google-mobile-ads";

export function PrivacyConsent() {
  const [isMobileAdsStartCalled, setIsMobileAdsStartCalled] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // 1. Request Consent Info
        const consentInfo = await AdsConsent.requestInfoUpdate({
          debugGeography: __DEV__
            ? AdsConsentDebugGeography.EEA
            : AdsConsentDebugGeography.DISABLED,
        });

        // 2. Load and Show Form if Required
        if (
          consentInfo.isConsentFormAvailable &&
          consentInfo.status === AdsConsentStatus.REQUIRED
        ) {
          const { status } =
            await AdsConsent.loadAndShowConsentFormIfRequired();
          console.log("Consent Status:", status);
        }

        // 3. Initialize Mobile Ads SDK (Only after consent)
        if (!isMobileAdsStartCalled) {
          await mobileAds().initialize();
          setIsMobileAdsStartCalled(true);
        }
      } catch (error) {
        console.warn("Consent Error:", error);
        // Fallback: Initialize anyway so non-EU users still see ads
        if (!isMobileAdsStartCalled) {
          mobileAds().initialize();
          setIsMobileAdsStartCalled(true);
        }
      }
    })();
  }, []); // Run once on mount

  return null;
}
