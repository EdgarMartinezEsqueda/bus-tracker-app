import "dotenv/config";

export default () => ({
  expo: {
    name: "Tepa Buses",
    slug: "Tepa-Buses",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
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
      bundler: "metro",
      // SPA: un solo index.html; suficiente porque la app no usa rutas de URL
      output: "single",
    },
    experiments: {
      // Subruta para GitHub Pages (https://<usuario>.github.io/bus-tracker-app).
      // Vacío en desarrollo local; el workflow de deploy exporta con
      // EXPO_BASE_URL=/bus-tracker-app
      baseUrl: process.env.EXPO_BASE_URL ?? "",
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
