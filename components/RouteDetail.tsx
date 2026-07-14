import { Clock, Flag, MapPin, Ruler, Star } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../theme";
import { BusStop, Route, RouteGroup } from "../types";
import { routeLengthKm, StopAlongRoute } from "../utils/geo";
import StopTimeline from "./StopTimeline";

interface RouteDetailProps {
  group: RouteGroup;
  selectedRoute: Route;
  stopsAlong: StopAlongRoute<BusStop>[];
  isFavorite: boolean;
  onToggleFavorite: (code: string) => void;
  onSelectVariant: (routeId: string) => void;
  onFocusStop: (stop: BusStop) => void;
}

const AVG_BUS_SPEED_KMH = 17; // urbano con paradas

const variantChipLabel = (route: Route): string => {
  const direction =
    route.direction === "ida"
      ? "Ida"
      : route.direction === "vuelta"
        ? "Vuelta"
        : null;
  if (route.variant && direction) return `${route.variant} · ${direction}`;
  if (direction) return direction;
  return route.headsign ?? route.name;
};

const buildDescription = (group: RouteGroup, zone: string | null): string => {
  const parts = group.name.split(" — ");
  if (parts.length === 2) {
    return `Conecta ${parts[0]} con ${parts[1]}${
      zone ? ` por la zona ${zone}` : ""
    } de Tepatitlán.`;
  }
  return `Recorrido por la zona ${zone ?? "urbana"} de Tepatitlán.`;
};

const RouteDetail: React.FC<RouteDetailProps> = ({
  group,
  selectedRoute,
  stopsAlong,
  isFavorite,
  onToggleFavorite,
  onSelectVariant,
  onFocusStop,
}) => {
  const theme = useTheme();
  const lengthKm = routeLengthKm(selectedRoute.coordinates);
  const minutes = Math.max(5, Math.round((lengthKm / AVG_BUS_SPEED_KMH) * 60));

  const metaChips = [
    {
      icon: <Clock size={14} color={theme.colors.textMuted} />,
      label: `~${minutes} min`,
    },
    {
      icon: <MapPin size={14} color={theme.colors.textMuted} />,
      label: `${stopsAlong.length} paradas`,
    },
    {
      icon: <Ruler size={14} color={theme.colors.textMuted} />,
      label: `${lengthKm.toFixed(1)} km`,
    },
    ...(group.zone
      ? [
          {
            icon: <Flag size={14} color={theme.colors.textMuted} />,
            label: group.zone,
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
            numberOfLines={2}
          >
            {group.name}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => onToggleFavorite(group.code)}
          accessibilityRole="button"
          accessibilityLabel={
            isFavorite ? "Quitar de favoritas" : "Agregar a favoritas"
          }
          accessibilityState={{ selected: isFavorite }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={[
            styles.starButton,
            { backgroundColor: theme.colors.surfaceAlt },
          ]}
        >
          <Star
            size={18}
            color={theme.colors.star}
            fill={isFavorite ? theme.colors.star : "transparent"}
          />
        </TouchableOpacity>
      </View>

      <Text
        style={[
          theme.typography.caption,
          { color: theme.colors.textMuted, marginTop: 4 },
        ]}
      >
        {buildDescription(group, group.zone)}
      </Text>

      {/* Meta chips */}
      <View style={styles.metaRow}>
        {metaChips.map((chip) => (
          <View
            key={chip.label}
            style={[styles.metaChip, { backgroundColor: theme.colors.surfaceAlt }]}
          >
            {chip.icon}
            <Text
              style={[theme.typography.caption, { color: theme.colors.text }]}
            >
              {chip.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Variantes */}
      {group.variants.length > 1 && (
        <>
          <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>
            VARIANTE
          </Text>
          <View style={styles.variantRow}>
            {group.variants.map((variant) => {
              const isSelected = variant.id === selectedRoute.id;
              return (
                <TouchableOpacity
                  key={variant.id}
                  style={[
                    styles.variantChip,
                    {
                      backgroundColor: isSelected
                        ? theme.colors.primary
                        : theme.colors.surface,
                      borderColor: isSelected
                        ? theme.colors.primary
                        : theme.colors.border,
                    },
                  ]}
                  onPress={() => onSelectVariant(variant.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    style={[
                      styles.variantChipText,
                      {
                        color: isSelected
                          ? theme.colors.textOnPrimary
                          : theme.colors.text,
                      },
                    ]}
                  >
                    {variantChipLabel(variant)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

      {/* Paradas */}
      <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>
        PARADAS · {stopsAlong.length} EN TOTAL
      </Text>
      <StopTimeline
        stops={stopsAlong}
        color={group.color}
        onFocusStop={onFocusStop}
      />
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
  },
  starButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginTop: 18,
    marginBottom: 10,
  },
  variantRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  variantChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  variantChipText: {
    fontSize: 13,
    fontWeight: "700",
  },
});

export default RouteDetail;
