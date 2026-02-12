import { Platform } from "react-native";
import { TestIds } from "react-native-google-mobile-ads";

const productionIds = {
  ios: {
    banner: "ca-app-pub-8296385442547902/9886772188",
    rewarded: "ca-app-pub-8296385442547902/8114633313",
  },
  android: {
    banner: "ca-app-pub-8296385442547902/5352738606",
    rewarded: "ca-app-pub-8296385442547902/4574833816",
  },
};

export const AdUnits = {
  BANNER: __DEV__
    ? TestIds.BANNER
    : Platform.OS === "ios"
      ? productionIds.ios.banner
      : productionIds.android.banner,
  REWARDED: __DEV__
    ? TestIds.REWARDED
    : Platform.OS === "ios"
      ? productionIds.ios.rewarded
      : productionIds.android.rewarded,
};
