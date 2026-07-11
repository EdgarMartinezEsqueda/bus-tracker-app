import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import busData from "./assets/busDataProcessed.json";
import MapContainer from "./components/MapContainer";
import MenuButton from "./components/MenuButton";
import RouteSelectionModal from "./components/RouteSelectionModal";
import { MAP_DEFAULT_REGION } from "./constants/map";
import useLocationPermission from "./hooks/useLocation";
import useRouteSelection from "./hooks/useRouteSelection";
import { BusData, MapRegion } from "./types";
import { getVisibleStops } from "./utils/mapUtils";

const typedBusData: BusData = busData as BusData;
const busStopImage = require("./assets/busStop.jpg");
const allRouteIds = typedBusData.routes.map((r) => r.id);

export default function App() {
  // Solicita el permiso de ubicación (showsUserLocation lo necesita en Android)
  useLocationPermission();
  const { selectedRoutes, toggleRoute, toggleAll } =
    useRouteSelection(allRouteIds);

  // State
  const [showMenu, setShowMenu] = useState(false);
  const [mapRegion, setMapRegion] = useState<MapRegion>(MAP_DEFAULT_REGION);

  // Get visible stops based on selected routes and map region
  const visibleStops = useMemo(
    () =>
      getVisibleStops(
        typedBusData.stops,
        selectedRoutes,
        typedBusData.routes,
        mapRegion,
      ),
    [selectedRoutes, mapRegion],
  );

  return (
    <View style={styles.container}>
      <MapContainer
        routes={typedBusData.routes}
        selectedRoutes={selectedRoutes}
        visibleStops={visibleStops}
        onRegionChangeComplete={setMapRegion}
        busStopImage={busStopImage}
      />

      <MenuButton onPress={() => setShowMenu(true)} />

      <RouteSelectionModal
        visible={showMenu}
        routes={typedBusData.routes}
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
