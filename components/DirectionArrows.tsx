import { ChevronUp } from "lucide-react-native";
import React, { memo, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Marker } from "react-native-maps";
import { useTheme } from "../theme";
import { bearingDeg } from "../utils/geo";
import { Route } from "../types";

interface DirectionArrowsProps {
  route: Route;
}

const MAX_ARROWS = 7;

/**
 * Flechas sobre la línea de la ruta indicando el sentido del recorrido.
 * `flat` + `rotation` las mantiene alineadas al trazo aunque gire el mapa.
 */
const DirectionArrows: React.FC<DirectionArrowsProps> = ({ route }) => {
  const theme = useTheme();

  // Mismo workaround que StopMarker: rastrear brevemente y congelar.
  const [tracksChanges, setTracksChanges] = useState(true);
  useEffect(() => {
    setTracksChanges(true);
    const timer = setTimeout(() => setTracksChanges(false), 800);
    return () => clearTimeout(timer);
  }, [route.id]);

  const arrows = useMemo(() => {
    const coords = route.coordinates;
    if (coords.length < 3) return [];
    const step = Math.max(2, Math.floor(coords.length / MAX_ARROWS));
    const result: Array<{
      key: string;
      coordinate: (typeof coords)[number];
      rotation: number;
    }> = [];
    for (let i = step; i < coords.length - 1; i += step) {
      result.push({
        key: `${route.id}-arrow-${i}`,
        coordinate: coords[i],
        rotation: bearingDeg(coords[i - 1], coords[i + 1]),
      });
    }
    return result;
  }, [route]);

  return (
    <>
      {arrows.map((arrow) => (
        <Marker
          key={arrow.key}
          coordinate={arrow.coordinate}
          anchor={{ x: 0.5, y: 0.5 }}
          rotation={arrow.rotation}
          flat={true}
          zIndex={2}
          tracksViewChanges={tracksChanges}
        >
          <View
            style={[styles.badge, { backgroundColor: theme.colors.surface }]}
          >
            <ChevronUp size={13} color={route.color} strokeWidth={4} />
          </View>
        </Marker>
      ))}
    </>
  );
};

const ARROW_BADGE_SIZE = 18;

const styles = StyleSheet.create({
  badge: {
    width: ARROW_BADGE_SIZE,
    height: ARROW_BADGE_SIZE,
    borderRadius: ARROW_BADGE_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
});

export default memo(DirectionArrows);
