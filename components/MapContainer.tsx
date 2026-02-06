import React from "react";
import { StyleSheet } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { BusStop, MapRegion, Route } from "../types";

interface MapContainerProps {
  routes: Route[];
  selectedRoutes: string[];
  visibleStops: BusStop[];
  userLocation?: { latitude: number; longitude: number };
  onRegionChangeComplete: (region: MapRegion) => void;
  busStopImage: any;
}

const TEPA_COORDS = {
  latitude: 20.805857,
  longitude: -102.748916,
};

const MapContainer: React.FC<MapContainerProps> = ({
  routes,
  selectedRoutes,
  visibleStops,
  userLocation,
  onRegionChangeComplete,
  busStopImage,
}) => {
  const initialLatitude = userLocation?.latitude || TEPA_COORDS.latitude;
  const initialLongitude = userLocation?.longitude || TEPA_COORDS.longitude;

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: initialLatitude,
        longitude: initialLongitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }}
      showsUserLocation={true}
      onRegionChangeComplete={onRegionChangeComplete}
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
          coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
          title={stop.name}
          description={stop.route}
          image={busStopImage}
          style={styles.busIcon}
        />
      ))}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  busIcon: {
    width: 30,
    height: 30,
  },
});

export default MapContainer;
