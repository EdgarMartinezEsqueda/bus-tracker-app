import { ChevronRight } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../theme";
import { RouteGroup } from "../types";

interface RouteGroupCardProps {
  group: RouteGroup;
  onPress: (code: string) => void;
}

/** Tarjeta "C01 · Central — Hacienda Popotes · 2 variantes · Centro · 67 paradas" */
const RouteGroupCard: React.FC<RouteGroupCardProps> = ({ group, onPress }) => {
  const theme = useTheme();

  const meta = [
    `${group.variants.length} ${group.variants.length === 1 ? "variante" : "variantes"}`,
    group.zone,
    `${group.stopsCount} paradas`,
  ]
    .filter(Boolean)
    .join("  ·  ");

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.md,
        },
      ]}
      onPress={() => onPress(group.code)}
      accessibilityRole="button"
    >
      <View
        style={[
          styles.badge,
          { backgroundColor: `${group.color}22`, borderRadius: theme.radii.sm },
        ]}
      >
        <Text style={[styles.badgeText, { color: group.color }]}>
          {group.code}
        </Text>
      </View>
      <View style={styles.texts}>
        <Text
          style={[theme.typography.subtitle, { color: theme.colors.text }]}
          numberOfLines={1}
        >
          {group.name}
        </Text>
        <Text
          style={[theme.typography.caption, { color: theme.colors.textMuted }]}
          numberOfLines={1}
        >
          {meta}
        </Text>
      </View>
      <View style={[styles.dot, { backgroundColor: group.color }]} />
      <ChevronRight size={18} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  badge: {
    width: 44,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "800",
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default RouteGroupCard;
