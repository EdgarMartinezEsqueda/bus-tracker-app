import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BackHandler,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import LocateButton from "./components/LocateButton";
import MapContainer from "./components/MapContainer";
import { MapHandle } from "./components/MapContainer.types";
import RouteHeaderPill from "./components/RouteHeaderPill";
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
import { BusStop, MapRegion } from "./types";
import { stopsAlongRoute } from "./utils/geo";
import { getVisibleStops } from "./utils/mapUtils";
import { buildRouteGroups } from "./utils/routeGroups";

// Margen al encuadrar una ruta: el inferior deja espacio al sheet a media altura
const FIT_ROUTE_PADDING = { top: 110, right: 60, bottom: 330, left: 60 };

// Desde aquí el layout pasa de bottom sheet a panel lateral fijo (escritorio/web)
const WIDE_LAYOUT_MIN_WIDTH = 900;

export default function App() {
  const theme = useTheme();
  const { getPosition } = useLocation();
  const { data } = useBusData();
  const { favorites, toggleFavorite } = useFavorites();
  const { width } = useWindowDimensions();
  const isWideLayout = width >= WIDE_LAYOUT_MIN_WIDTH;

  const mapRef = useRef<MapHandle>(null);
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

  // Paradas de la variante seleccionada, ordenadas a lo largo del recorrido
  // (excluye las de la variante contraria, que quedan lejos del trazo)
  const stopsAlong = useMemo(() => {
    if (!selectedRoute) return [];
    const familyStops = data.stops.filter((stop) =>
      stop.routeCodes.includes(selectedRoute.code),
    );
    return stopsAlongRoute(selectedRoute.coordinates, familyStops);
  }, [data, selectedRoute]);

  // En el mapa, visibles solo con zoom suficiente y dentro del viewport
  const visibleStops = useMemo(() => {
    if (mapRegion.latitudeDelta > STOPS_VISIBLE_MAX_DELTA) return [];
    return getVisibleStops(
      stopsAlong.map((s) => s.stop),
      mapRegion,
    );
  }, [stopsAlong, mapRegion]);

  const handleFocusStop = useCallback((stop: BusStop) => {
    mapRef.current?.animateToRegion(
      {
        latitude: stop.latitude,
        longitude: stop.longitude,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      },
      500,
    );
  }, []);

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
            <View style={[styles.body, isWideLayout && styles.bodyRow]}>
              {/* Mapa + overlays flotantes: aquí anclan los "position: absolute" */}
              <View style={styles.mapArea}>
                <MapContainer
                  ref={mapRef}
                  routes={data.routes}
                  selectedRoute={selectedRoute}
                  visibleStops={visibleStops}
                  onRegionChangeComplete={setMapRegion}
                  onSelectRoute={handleSelectRouteFromMap}
                />

                {selectedGroup ? (
                  <RouteHeaderPill
                    group={selectedGroup}
                    onBack={clearSelection}
                  />
                ) : (
                  <SearchPill onPress={() => setActiveTab("buscar")} />
                )}
                <LocateButton onPress={handleLocate} />

                {/* Móvil: hoja arrastrable superpuesta al mapa */}
                {!isWideLayout && (
                  <RouteSheet
                    variant="sheet"
                    groups={groups}
                    selectedGroup={selectedGroup}
                    selectedRoute={selectedRoute}
                    stopsAlong={stopsAlong}
                    favorites={favorites}
                    onToggleFavorite={toggleFavorite}
                    onSelectGroup={handleSelectGroup}
                    onSelectVariant={setSelectedRouteId}
                    onFocusStop={handleFocusStop}
                  />
                )}
              </View>

              {/* Escritorio/web ancho: panel fijo a la derecha, mapa a la izquierda */}
              {isWideLayout && (
                <View
                  style={[
                    styles.sidePanel,
                    { borderLeftColor: theme.colors.border },
                  ]}
                >
                  <RouteSheet
                    variant="panel"
                    groups={groups}
                    selectedGroup={selectedGroup}
                    selectedRoute={selectedRoute}
                    stopsAlong={stopsAlong}
                    favorites={favorites}
                    onToggleFavorite={toggleFavorite}
                    onSelectGroup={handleSelectGroup}
                    onSelectVariant={setSelectedRouteId}
                    onFocusStop={handleFocusStop}
                  />
                </View>
              )}
            </View>

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

const SIDE_PANEL_WIDTH = 400;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  bodyRow: {
    flexDirection: "row",
  },
  mapArea: {
    flex: 1,
  },
  sidePanel: {
    width: SIDE_PANEL_WIDTH,
    borderLeftWidth: StyleSheet.hairlineWidth,
  },
});
