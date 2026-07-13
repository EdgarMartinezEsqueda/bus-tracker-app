import { useEffect, useMemo, useRef, useState } from "react";
import { BackHandler, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MapView from "react-native-maps";
import LocateButton from "./components/LocateButton";
import MapContainer from "./components/MapContainer";
import RouteSheet from "./components/RouteSheet";
import {
  LOCATE_REGION_DELTA,
  MAP_DEFAULT_REGION,
  STOPS_VISIBLE_MAX_DELTA,
} from "./constants/map";
import useBusData from "./hooks/useBusData";
import useLocation from "./hooks/useLocation";
import { useTheme } from "./theme";
import { MapRegion } from "./types";
import { getVisibleStops } from "./utils/mapUtils";

// Margen al encuadrar una ruta: el inferior deja espacio al bottom sheet
const FIT_ROUTE_PADDING = { top: 100, right: 60, bottom: 220, left: 60 };

export default function App() {
  const theme = useTheme();
  const { getPosition } = useLocation();
  const { data } = useBusData();

  const mapRef = useRef<MapView>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [mapRegion, setMapRegion] = useState<MapRegion>(MAP_DEFAULT_REGION);

  const selectedRoute = useMemo(
    () => data.routes.find((r) => r.id === selectedRouteId) ?? null,
    [data, selectedRouteId],
  );

  const stopsCountByCode = useMemo(() => {
    const counts = new Map<string, number>();
    for (const stop of data.stops) {
      for (const code of stop.routeCodes) {
        counts.set(code, (counts.get(code) ?? 0) + 1);
      }
    }
    return counts;
  }, [data]);

  // Paradas de la ruta seleccionada, visibles solo con zoom suficiente
  const visibleStops = useMemo(() => {
    if (!selectedRoute) return [];
    if (mapRegion.latitudeDelta > STOPS_VISIBLE_MAX_DELTA) return [];
    const routeStops = data.stops.filter((stop) =>
      stop.routeCodes.includes(selectedRoute.code),
    );
    return getVisibleStops(routeStops, mapRegion);
  }, [data, selectedRoute, mapRegion]);

  // Encuadrar la ruta seleccionada con animación
  useEffect(() => {
    if (selectedRoute) {
      mapRef.current?.fitToCoordinates(selectedRoute.coordinates, {
        edgePadding: FIT_ROUTE_PADDING,
        animated: true,
      });
    }
  }, [selectedRoute]);

  // Botón atrás de Android: primero cierra el detalle de ruta
  useEffect(() => {
    if (!selectedRouteId) return;
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        setSelectedRouteId(null);
        return true;
      },
    );
    return () => subscription.remove();
  }, [selectedRouteId]);

  const handleLocate = async () => {
    const coords = await getPosition();
    if (coords) {
      mapRef.current?.animateToRegion(
        {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: LOCATE_REGION_DELTA,
          longitudeDelta: LOCATE_REGION_DELTA,
        },
        600,
      );
    }
  };

  return (
    <GestureHandlerRootView style={styles.root}>
      <View
        style={[styles.root, { backgroundColor: theme.colors.background }]}
      >
        <MapContainer
          mapRef={mapRef}
          routes={data.routes}
          selectedRoute={selectedRoute}
          visibleStops={visibleStops}
          onRegionChangeComplete={setMapRegion}
          onSelectRoute={setSelectedRouteId}
        />

        <LocateButton onPress={handleLocate} />

        <RouteSheet
          routes={data.routes}
          selectedRoute={selectedRoute}
          stopsCountByCode={stopsCountByCode}
          onSelectRoute={setSelectedRouteId}
          onClose={() => setSelectedRouteId(null)}
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
