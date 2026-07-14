import { MapPin, Navigation, Ruler, X } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../theme";
import { Route, RouteGroup } from "../types";
import { routeLengthKm } from "../utils/geo";

interface RouteDetailProps {
  group: RouteGroup;
  selectedRoute: Route;
  onSelectVariant: (routeId: string) => void;
  onClose: () => void;
}

const variantLabel = (route: Route): string => {
  const direction =
    route.direction === "ida"
      ? "Ida"
      : route.direction === "vuelta"
        ? "Vuelta"
        : null;
  const parts = [
    direction,
    route.variant ? `(${route.variant})` : null,
    route.headsign ? `→ ${route.headsign}` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(" ") : route.name;
};

const RouteDetail: React.FC<RouteDetailProps> = ({
  group,
  selectedRoute,
  onSelectVariant,
  onClose,
}) => {
  const theme = useTheme();
  const lengthKm = routeLengthKm(selectedRoute.coordinates);

  const stats = [
    {
      icon: <Ruler size={18} color={theme.colors.textMuted} />,
      value: `${lengthKm.toFixed(1)} km`,
      label: "Recorrido",
    },
    {
      icon: <MapPin size={18} color={theme.colors.textMuted} />,
      value: String(group.stopsCount),
      label: "Paradas",
    },
    ...(selectedRoute.direction
      ? [
          {
            icon: <Navigation size={18} color={theme.colors.textMuted} />,
            value: selectedRoute.direction === "ida" ? "Ida" : "Vuelta",
            label: "Sentido",
          },
        ]
      : []),
  ];

  return (
    <View style={{ paddingHorizontal: theme.spacing.lg }}>
      {/* Header */}
      <View style={styles.header}>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: `${group.color}22`,
              borderRadius: theme.radii.sm,
            },
          ]}
        >
          <Text style={[styles.badgeText, { color: group.color }]}>
            {group.code}
          </Text>
        </View>
        <View style={styles.headerTexts}>
          <Text
            style={[theme.typography.title, { color: theme.colors.text }]}
            numberOfLines={1}
          >
            {group.name}
          </Text>
          {group.zone && (
            <Text
              style={[
                theme.typography.caption,
                { color: theme.colors.textMuted },
              ]}
            >
              Zona {group.zone}
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Cerrar detalle de ruta"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={[
            styles.closeButton,
            { backgroundColor: theme.colors.surfaceAlt },
          ]}
        >
          <X size={18} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Variantes (ida/vuelta/ramales) */}
      {group.variants.length > 1 && (
        <View style={{ marginTop: theme.spacing.md, gap: 8 }}>
          {group.variants.map((variant) => {
            const isSelected = variant.id === selectedRoute.id;
            return (
              <TouchableOpacity
                key={variant.id}
                style={[
                  styles.variantRow,
                  {
                    borderColor: isSelected
                      ? theme.colors.primary
                      : theme.colors.border,
                    backgroundColor: isSelected
                      ? `${group.color}11`
                      : theme.colors.surface,
                    borderRadius: theme.radii.sm,
                  },
                ]}
                onPress={() => onSelectVariant(variant.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
              >
                <View
                  style={[
                    styles.radio,
                    {
                      borderColor: isSelected
                        ? theme.colors.primary
                        : theme.colors.textMuted,
                    },
                  ]}
                >
                  {isSelected && (
                    <View
                      style={[
                        styles.radioInner,
                        { backgroundColor: theme.colors.primary },
                      ]}
                    />
                  )}
                </View>
                <Text
                  style={[theme.typography.body, { color: theme.colors.text }]}
                  numberOfLines={1}
                >
                  {variantLabel(variant)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Stats */}
      <View
        style={[
          styles.statsRow,
          {
            backgroundColor: theme.colors.surfaceAlt,
            borderRadius: theme.radii.md,
            marginTop: theme.spacing.md,
            paddingVertical: theme.spacing.md,
          },
        ]}
      >
        {stats.map((stat) => (
          <View key={stat.label} style={styles.stat}>
            {stat.icon}
            <Text
              style={[theme.typography.subtitle, { color: theme.colors.text }]}
            >
              {stat.value}
            </Text>
            <Text
              style={[
                theme.typography.caption,
                { color: theme.colors.textMuted },
              ]}
            >
              {stat.label}
            </Text>
          </View>
        ))}
      </View>

      <Text
        style={[
          theme.typography.caption,
          { color: theme.colors.textMuted, marginTop: theme.spacing.md },
        ]}
      >
        Acércate al mapa para ver las paradas. Las flechas indican el sentido
        del recorrido.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
  headerTexts: {
    flex: 1,
    gap: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  variantRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderWidth: 1,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: "row",
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
});

export default RouteDetail;
