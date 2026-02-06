import "dotenv/config";

export default () => ({
  expo: {
    name: "Tepa Buses",
    slug: "Tepa-Buses",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/logoFlat.png",
      resizeMode: "contain",
      backgroundColor: "#427df1",
    },
    ios: {
      supportsTablet: true,
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/logoFlat.png",
        backgroundColor: "#427df1",
      },
      permissions: ["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION"],
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.tepaBuses",
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
    },
    web: {
      favicon: "./assets/icon.png",
    },
    extra: {
      eas: {
        projectId: "903cd519-59d0-408c-8e95-c17f68329756",
      },
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    },
    assetBundlePatterns: ["**/*"],
  },
});
