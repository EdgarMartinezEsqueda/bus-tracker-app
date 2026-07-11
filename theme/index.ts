import { TextStyle, useColorScheme } from "react-native";

/**
 * Tokens de diseño. Toda pantalla/componente debe tomar colores, espaciado
 * y tipografía de aquí — nunca valores sueltos en los StyleSheet.
 */

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

const radii = {
  sm: 8,
  md: 12,
  lg: 20,
  full: 999,
} as const;

const typography = {
  title: { fontSize: 20, fontWeight: "700" } as TextStyle,
  subtitle: { fontSize: 16, fontWeight: "600" } as TextStyle,
  body: { fontSize: 15, fontWeight: "400" } as TextStyle,
  caption: { fontSize: 13, fontWeight: "400" } as TextStyle,
} as const;

export const lightTheme = {
  dark: false,
  colors: {
    background: "#FFFFFF",
    surface: "#FFFFFF",
    surfaceAlt: "#F3F4F6",
    text: "#111827",
    textMuted: "#6B7280",
    border: "#E5E7EB",
    primary: "#2563EB",
    success: "#16A34A",
    overlay: "rgba(0, 0, 0, 0.4)",
    stopFill: "#FFFFFF", // relleno del marcador de parada
  },
  spacing,
  radii,
  typography,
};

export const darkTheme: Theme = {
  dark: true,
  colors: {
    background: "#111827",
    surface: "#1F2937",
    surfaceAlt: "#374151",
    text: "#F9FAFB",
    textMuted: "#9CA3AF",
    border: "#374151",
    primary: "#60A5FA",
    success: "#4ADE80",
    overlay: "rgba(0, 0, 0, 0.6)",
    stopFill: "#1F2937",
  },
  spacing,
  radii,
  typography,
};

export type Theme = typeof lightTheme;

export const useTheme = (): Theme =>
  useColorScheme() === "dark" ? darkTheme : lightTheme;
