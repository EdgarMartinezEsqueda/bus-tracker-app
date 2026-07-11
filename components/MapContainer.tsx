import React, { useMemo } from "react";
import { StyleSheet } from "react-native";
import MapView, { Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { MAP_DEFAULT_REGION } from "../constants/map";
import { DARK_MAP_STYLE } from "../constants/mapStyles";
import { useTheme } from "../theme";
import { BusStop, MapRegion, Route } from "../types";
import StopMarker from "./StopMarker";

interface MapContainerProps {
  routes: Route[];
  selectedRoutes: string[];
  visibleStops: BusStop[];
  onRegionChangeComplete: (region: MapRegion) => void;
}

const MapContainer: React.FC<MapContainerProps> = ({
  routes,
  selectedRoutes,
  visibleStops,
  onRegionChangeComplete,
}) => {
  const theme = useTheme();

  // Color por código de ruta, solo de las rutas seleccionadas: cada parada
  // toma el color de la primera ruta visible que pasa por ella.
  const colorByCode = useMemo(() => {
    const map = new Map<string, string>();
    for (const route of routes) {
      if (selectedRoutes.includes(route.id) && !map.has(route.code)) {
        map.set(route.code, route.color);
      }
    }
    return map;
  }, [routes, selectedRoutes]);

  const stopColor = (stop: BusStop): string => {
    for (const code of stop.routeCodes) {
      const color = colorByCode.get(code);
      if (color) return color;
    }
    return theme.colors.primary;
  };

  return (
    <MapView
      style={styles.map}
      initialRegion={MAP_DEFAULT_REGION}
      showsUserLocation={true}
      onRegionChangeComplete={onRegionChangeComplete}
      provider={PROVIDER_GOOGLE}
      customMapStyle={theme.dark ? DARK_MAP_STYLE : []}
      toolbarEnabled={false}
    >
      {/* Draw routes */}
      {routes
        .filter((route) => selectedRoutes.includes(route.id))
        .map((route) => (
          <Polyline
            key={route.id}
            coordinates={route.coordinates}
            strokeColor={route.color}
            strokeWidth={3}
          />
        ))}

      {/* Show only visible stops */}
      {visibleStops.map((stop) => (
        <StopMarker key={stop.id} stop={stop} color={stopColor(stop)} />
      ))}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

export default MapContainer;
