import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapContainer from "./components/MapContainer";
import MenuButton from "./components/MenuButton";
import RouteSelectionModal from "./components/RouteSelectionModal";
import { MAP_DEFAULT_REGION } from "./constants/map";
import useBusData from "./hooks/useBusData";
import useLocationPermission from "./hooks/useLocation";
import useRouteSelection from "./hooks/useRouteSelection";
import { MapRegion } from "./types";
import { getVisibleStops } from "./utils/mapUtils";

const busStopImage = require("./assets/busStop.jpg");

export default function App() {
  // Solicita el permiso de ubicación (showsUserLocation lo necesita en Android)
  useLocationPermission();
  const { data } = useBusData();

  const allRouteIds = useMemo(() => data.routes.map((r) => r.id), [data]);
  const { selectedRoutes, toggleRoute, toggleAll, selectAll } =
    useRouteSelection(allRouteIds);

  // Si llegan datos más frescos con rutas nuevas, se seleccionan todas de nuevo
  useEffect(() => {
    selectAll(allRouteIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRouteIds]);

  // State
  const [showMenu, setShowMenu] = useState(false);
  const [mapRegion, setMapRegion] = useState<MapRegion>(MAP_DEFAULT_REGION);

  // Get visible stops based on selected routes and map region
  const visibleStops = useMemo(
    () => getVisibleStops(data.stops, selectedRoutes, data.routes, mapRegion),
    [data, selectedRoutes, mapRegion],
  );

  return (
    <View style={styles.container}>
      <MapContainer
        routes={data.routes}
        selectedRoutes={selectedRoutes}
        visibleStops={visibleStops}
        onRegionChangeComplete={setMapRegion}
        busStopImage={busStopImage}
      />

      <MenuButton onPress={() => setShowMenu(true)} />

      <RouteSelectionModal
        visible={showMenu}
        routes={data.routes}
        selectedRoutes={selectedRoutes}
        onRouteToggle={toggleRoute}
        onToggleAll={() => toggleAll(allRouteIds)}
        onClose={() => setShowMenu(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});
