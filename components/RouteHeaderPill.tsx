import { ArrowLeft } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme";
import { RouteGroup } from "../types";

interface RouteHeaderPillProps {
  group: RouteGroup;
  onBack: () => void;
}

/** Encabezado flotante sobre el mapa con la ruta activa y botón de regreso. */
const RouteHeaderPill: React.FC<RouteHeaderPillProps> = ({ group, onBack }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.row, { top: insets.top + 12 }]}>
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: theme.colors.surface }]}
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Volver a todas las rutas"
      >
        <ArrowLeft size={20} color={theme.colors.text} />
      </TouchableOpacity>
      <View style={[styles.pill, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.code, { color: group.color }]}>{group.code}</Text>
        <Text
          style={[theme.typography.subtitle, { color: theme.colors.text }]}
          numberOfLines={1}
        >
          {group.name}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  pill: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    gap: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  code: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});

export default RouteHeaderPill;
