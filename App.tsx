import { useState } from "react";
import { StyleSheet, View } from "react-native";
import busData from "./assets/busDataProcessed.json";
import MapContainer from "./components/MapContainer";
import MenuButton from "./components/MenuButton";
import RouteSelectionModal from "./components/RouteSelectionModal";
import useLocation from "./hooks/useLocation";
import useRouteSelection from "./hooks/useRouteSelection";
import { BusData, MapRegion } from "./types";
import { getVisibleStops } from "./utils/mapUtils";

const typedBusData: BusData = busData as BusData;
const busStopImage = require("./assets/busStop.jpg");
const MAP_DEFAULT_REGION = {
  latitude: 20.805857, // Tepatitlán, Jalisco
  longitude: -102.748916,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

export default function App() {
  // Hooks
  const userLocation = useLocation();
  const { selectedRoutes, toggleRoute, toggleAll } = useRouteSelection(
    typedBusData.routes.map((r) => r.id),
  );

  // State
  const [showMenu, setShowMenu] = useState(false);
  const [mapRegion, setMapRegion] = useState<MapRegion>(MAP_DEFAULT_REGION);

  // Get visible stops based on selected routes and map region
  const visibleStops = getVisibleStops(
    typedBusData.stops,
    selectedRoutes,
    typedBusData.routes,
    mapRegion,
  );

  return (
    <View style={styles.container}>
      <MapContainer
        routes={typedBusData.routes}
        selectedRoutes={selectedRoutes}
        visibleStops={visibleStops}
        userLocation={
          userLocation
            ? {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              }
            : undefined
        }
        onRegionChangeComplete={setMapRegion}
        busStopImage={busStopImage}
      />

      <MenuButton onPress={() => setShowMenu(true)} />

      <RouteSelectionModal
        visible={showMenu}
        routes={typedBusData.routes}
        selectedRoutes={selectedRoutes}
        onRouteToggle={toggleRoute}
        onToggleAll={() => toggleAll(typedBusData.routes.map((r) => r.id))}
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
