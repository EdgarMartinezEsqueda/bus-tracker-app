import { Flag } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../theme";
import { BusStop } from "../types";
import { StopAlongRoute } from "../utils/geo";

interface StopTimelineProps {
  stops: StopAlongRoute<BusStop>[];
  color: string;
  onFocusStop: (stop: BusStop) => void;
}

const distanceLabel = (km: number): string =>
  km < 0.05 ? "En el punto de salida" : `${km.toFixed(1)} km desde el inicio`;

/** Lista ordenada de paradas del recorrido, con distancia desde la salida. */
const StopTimeline: React.FC<StopTimelineProps> = ({
  stops,
  color,
  onFocusStop,
}) => {
  const theme = useTheme();

  return (
    <View>
      {/* Inicio del recorrido */}
      <View style={styles.row}>
        <View style={[styles.marker, { backgroundColor: color }]}>
          <Flag size={12} color="#FFFFFF" strokeWidth={2.5} />
        </View>
        <Text
          style={[
            theme.typography.subtitle,
            styles.rowText,
            { color: theme.colors.text },
          ]}
        >
          Inicio del recorrido
        </Text>
        <Text style={[styles.tag, { color: theme.colors.primary }]}>
          SALIDA
        </Text>
      </View>

      {stops.map(({ stop, kmFromStart }, index) => (
        <TouchableOpacity
          key={stop.id}
          style={styles.row}
          onPress={() => onFocusStop(stop)}
          accessibilityRole="button"
          accessibilityLabel={`Ver parada ${index + 1} en el mapa`}
        >
          <View
            style={[
              styles.marker,
              styles.markerOutline,
              { borderColor: color, backgroundColor: theme.colors.surface },
            ]}
          >
            <Text style={[styles.markerNumber, { color }]}>{index + 1}</Text>
          </View>
          <View style={styles.rowText}>
            <Text style={[theme.typography.body, { color: theme.colors.text }]}>
              {stop.name ?? `Parada ${index + 1}`}
            </Text>
            <Text
              style={[
                theme.typography.caption,
                { color: theme.colors.textMuted },
              ]}
            >
              {distanceLabel(kmFromStart)}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const MARKER_SIZE = 26;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 9,
  },
  marker: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
  },
  markerOutline: {
    borderWidth: 2,
  },
  markerNumber: {
    fontSize: 11,
    fontWeight: "800",
  },
  rowText: {
    flex: 1,
    gap: 1,
  },
  tag: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});

export default StopTimeline;
