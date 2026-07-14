import { Search } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme";

interface SearchPillProps {
  onPress: () => void;
}

/** Barra de búsqueda flotante sobre el mapa; abre la pestaña Buscar. */
const SearchPill: React.FC<SearchPillProps> = ({ onPress }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <TouchableOpacity
      style={[
        styles.pill,
        { top: insets.top + 12, backgroundColor: theme.colors.surface },
      ]}
      onPress={onPress}
      accessibilityRole="search"
    >
      <Search size={18} color={theme.colors.textMuted} />
      <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>
        ¿A dónde quieres ir?
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pill: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
});

export default SearchPill;
