import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BackHandler, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MapView from "react-native-maps";
import { SafeAreaProvider } from "react-native-safe-area-context";
import LocateButton from "./components/LocateButton";
import MapContainer from "./components/MapContainer";
import RouteSheet from "./components/RouteSheet";
import SearchPill from "./components/SearchPill";
import TabBar, { TabKey } from "./components/TabBar";
import {
  LOCATE_REGION_DELTA,
  MAP_DEFAULT_REGION,
  STOPS_VISIBLE_MAX_DELTA,
} from "./constants/map";
import useBusData from "./hooks/useBusData";
import useFavorites from "./hooks/useFavorites";
import useLocation from "./hooks/useLocation";
import AboutScreen from "./screens/AboutScreen";
import ReportScreen from "./screens/ReportScreen";
import SearchScreen from "./screens/SearchScreen";
import { useTheme } from "./theme";
import { MapRegion } from "./types";
import { getVisibleStops } from "./utils/mapUtils";
import { buildRouteGroups } from "./utils/routeGroups";

// Margen al encuadrar una ruta: el inferior deja espacio al bottom sheet
const FIT_ROUTE_PADDING = { top: 100, right: 60, bottom: 220, left: 60 };

export default function App() {
  const theme = useTheme();
  const { getPosition } = useLocation();
  const { data } = useBusData();
  const { favorites, toggleFavorite } = useFavorites();

  const mapRef = useRef<MapView>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("inicio");
  const [selectedGroupCode, setSelectedGroupCode] = useState<string | null>(
    null,
  );
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [mapRegion, setMapRegion] = useState<MapRegion>(MAP_DEFAULT_REGION);

  const groups = useMemo(
    () => buildRouteGroups(data.routes, data.stops),
    [data],
  );

  const selectedGroup = useMemo(
    () => groups.find((g) => g.code === selectedGroupCode) ?? null,
    [groups, selectedGroupCode],
  );

  const selectedRoute = useMemo(
    () => data.routes.find((r) => r.id === selectedRouteId) ?? null,
    [data, selectedRouteId],
  );

  // Elegir grupo = elegir su primera variante; también desde Buscar
  const handleSelectGroup = useCallback(
    (code: string) => {
      const group = groups.find((g) => g.code === code);
      if (!group) return;
      setSelectedGroupCode(code);
      setSelectedRouteId(group.variants[0].id);
      setActiveTab("inicio");
    },
    [groups],
  );

  const clearSelection = useCallback(() => {
    setSelectedGroupCode(null);
    setSelectedRouteId(null);
  }, []);

  // Tocar una línea del mapa selecciona su grupo y esa variante exacta
  const handleSelectRouteFromMap = useCallback(
    (routeId: string) => {
      const route = data.routes.find((r) => r.id === routeId);
      if (!route) return;
      setSelectedGroupCode(route.code);
      setSelectedRouteId(route.id);
    },
    [data],
  );

  // Paradas de la ruta seleccionada, visibles solo con zoom suficiente
  const visibleStops = useMemo(() => {
    if (!selectedRoute) return [];
    if (mapRegion.latitudeDelta > STOPS_VISIBLE_MAX_DELTA) return [];
    const routeStops = data.stops.filter((stop) =>
      stop.routeCodes.includes(selectedRoute.code),
    );
    return getVisibleStops(routeStops, mapRegion);
  }, [data, selectedRoute, mapRegion]);

  // Encuadrar la variante seleccionada con animación
  useEffect(() => {
    if (selectedRoute && activeTab === "inicio") {
      mapRef.current?.fitToCoordinates(selectedRoute.coordinates, {
        edgePadding: FIT_ROUTE_PADDING,
        animated: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoute?.id, activeTab]);

  // Botón atrás: sale de la pestaña actual, luego cierra el detalle
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (activeTab !== "inicio") {
          setActiveTab("inicio");
          return true;
        }
        if (selectedGroupCode) {
          clearSelection();
          return true;
        }
        return false;
      },
    );
    return () => subscription.remove();
  }, [activeTab, selectedGroupCode, clearSelection]);

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
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.root}>
        <View
          style={[styles.root, { backgroundColor: theme.colors.background }]}
        >
          {/* Área de contenido (mapa + sheet, con overlays por pestaña) */}
          <View style={styles.content}>
            <MapContainer
              mapRef={mapRef}
              routes={data.routes}
              selectedRoute={selectedRoute}
              visibleStops={visibleStops}
              onRegionChangeComplete={setMapRegion}
              onSelectRoute={handleSelectRouteFromMap}
            />

            <SearchPill onPress={() => setActiveTab("buscar")} />
            <LocateButton onPress={handleLocate} />

            <RouteSheet
              groups={groups}
              selectedGroup={selectedGroup}
              selectedRoute={selectedRoute}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onSelectGroup={handleSelectGroup}
              onSelectVariant={setSelectedRouteId}
              onClose={clearSelection}
            />

            {activeTab !== "inicio" && (
              <View
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: theme.colors.background },
                ]}
              >
                {activeTab === "buscar" && (
                  <SearchScreen
                    groups={groups}
                    onSelectGroup={handleSelectGroup}
                    onBack={() => setActiveTab("inicio")}
                  />
                )}
                {activeTab === "reportar" && (
                  <ReportScreen
                    groups={groups}
                    onBack={() => setActiveTab("inicio")}
                  />
                )}
                {activeTab === "acerca" && (
                  <AboutScreen onGoToReport={() => setActiveTab("reportar")} />
                )}
              </View>
            )}
          </View>

          <TabBar active={activeTab} onChange={setActiveTab} />
        </View>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
