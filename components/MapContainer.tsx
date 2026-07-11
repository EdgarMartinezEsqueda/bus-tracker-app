import React from "react";
import { StyleSheet } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { MAP_DEFAULT_REGION } from "../constants/map";
import { BusStop, MapRegion, Route } from "../types";

interface MapContainerProps {
  routes: Route[];
  selectedRoutes: string[];
  visibleStops: BusStop[];
  onRegionChangeComplete: (region: MapRegion) => void;
  busStopImage: any;
}

const MapContainer: React.FC<MapContainerProps> = ({
  routes,
  selectedRoutes,
  visibleStops,
  onRegionChangeComplete,
  busStopImage,
}) => {
  return (
    <MapView
      style={styles.map}
      initialRegion={MAP_DEFAULT_REGION}
      showsUserLocation={true}
      onRegionChangeComplete={onRegionChangeComplete}
      provider={PROVIDER_GOOGLE}
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
        <Marker
          key={stop.id}
          coordinate={{
            latitude: stop.latitude,
            longitude: stop.longitude,
          }}
          title={stop.name ?? "Parada de autobús"}
          description={`Rutas: ${stop.routeCodes.join(", ")}`}
          image={busStopImage}
          tracksViewChanges={false}
        />
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
