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
    background: "#F2F4F7", // fondo de pantallas (gris suave, las cards resaltan)
    surface: "#FFFFFF",
    surfaceAlt: "#F3F4F6",
    text: "#111827",
    textMuted: "#6B7280",
    border: "#E5E7EB",
    primary: "#2563EB",
    textOnPrimary: "#FFFFFF",
    success: "#16A34A",
    star: "#F59E0B",
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
    background: "#0F172A",
    surface: "#1E293B",
    surfaceAlt: "#334155",
    text: "#F9FAFB",
    textMuted: "#94A3B8",
    border: "#334155",
    primary: "#60A5FA",
    textOnPrimary: "#0F172A",
    success: "#4ADE80",
    star: "#FBBF24",
    overlay: "rgba(0, 0, 0, 0.6)",
    stopFill: "#1E293B",
  },
  spacing,
  radii,
  typography,
};

export type Theme = typeof lightTheme;

export const useTheme = (): Theme =>
  useColorScheme() === "dark" ? darkTheme : lightTheme;
