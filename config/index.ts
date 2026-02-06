import Constants from "expo-constants";

/**
 * Get Google Maps API Key from various sources
 * Priority: expo-constants > process.env > error
 */
export const getGoogleMapsApiKey = (): string => {
    // Try to get from Constants.expoConfig (loaded from app.config.ts)
    const apiKeyFromConstants =
        Constants.expoConfig?.extra?.googleMapsApiKey ||
        (Constants.expoConfig?.android?.config?.googleMaps as any)?.apiKey;

    // Fallback to process.env if Constants not available
    const apiKey = apiKeyFromConstants || process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey || apiKey === "undefined" || apiKey === "") {
        console.error(
            "Google Maps API Key Error:",
            "GOOGLE_MAPS_API_KEY environment variable is missing or empty",
        );
        throw new Error(
            "Google Maps API Key is not configured. Please ensure GOOGLE_MAPS_API_KEY is set in your .env file and app.config.ts is being used.",
        );
    }

    return apiKey;
};

export const config = {
    googleMapsApiKey: getGoogleMapsApiKey(),
};

export default config;
