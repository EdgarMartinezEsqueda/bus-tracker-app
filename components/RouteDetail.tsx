import { MapPin, Navigation, Ruler, X } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../theme";
import { Route } from "../types";
import { routeLengthKm } from "../utils/geo";
import { routeSubtitle, routeTitle } from "../utils/routeLabel";

interface RouteDetailProps {
  route: Route;
  stopsCount: number;
  onClose: () => void;
}

const RouteDetail: React.FC<RouteDetailProps> = ({
  route,
  stopsCount,
  onClose,
}) => {
  const theme = useTheme();
  const subtitle = routeSubtitle(route);
  const lengthKm = routeLengthKm(route.coordinates);

  const stats = [
    {
      icon: <Ruler size={18} color={theme.colors.textMuted} />,
      value: `${lengthKm.toFixed(1)} km`,
      label: "Recorrido",
    },
    {
      icon: <MapPin size={18} color={theme.colors.textMuted} />,
      value: String(stopsCount),
      label: "Paradas",
    },
    ...(route.direction
      ? [
          {
            icon: <Navigation size={18} color={theme.colors.textMuted} />,
            value: route.direction === "ida" ? "Ida" : "Vuelta",
            label: "Sentido",
          },
        ]
      : []),
  ];

  return (
    <View style={{ paddingHorizontal: theme.spacing.lg }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.colorBar, { backgroundColor: route.color }]} />
        <View style={styles.headerTexts}>
          <Text style={[theme.typography.title, { color: theme.colors.text }]}>
            {routeTitle(route)}
          </Text>
          {subtitle !== "" && (
            <Text
              style={[theme.typography.body, { color: theme.colors.textMuted }]}
            >
              {subtitle}
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
        Acércate al mapa para ver las paradas de esta ruta. Las flechas indican
        el sentido del recorrido.
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
  colorBar: {
    width: 5,
    height: 40,
    borderRadius: 3,
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
