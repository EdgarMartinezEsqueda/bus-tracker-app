import React from "react";
import { StyleSheet } from "react-native";
import MapView, { Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { MAP_DEFAULT_REGION } from "../constants/map";
import { DARK_MAP_STYLE } from "../constants/mapStyles";
import { useTheme } from "../theme";
import { BusStop, MapRegion, Route } from "../types";
import DirectionArrows from "./DirectionArrows";
import StopMarker from "./StopMarker";

interface MapContainerProps {
  mapRef: React.RefObject<MapView | null>;
  routes: Route[];
  selectedRoute: Route | null;
  visibleStops: BusStop[];
  onRegionChangeComplete: (region: MapRegion) => void;
  onSelectRoute: (routeId: string) => void;
}

const MapContainer: React.FC<MapContainerProps> = ({
  mapRef,
  routes,
  selectedRoute,
  visibleStops,
  onRegionChangeComplete,
  onSelectRoute,
}) => {
  const theme = useTheme();

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={MAP_DEFAULT_REGION}
      showsUserLocation={true}
      showsMyLocationButton={false}
      onRegionChangeComplete={onRegionChangeComplete}
      provider={PROVIDER_GOOGLE}
      customMapStyle={theme.dark ? DARK_MAP_STYLE : []}
      toolbarEnabled={false}
      mapPadding={{ top: 0, right: 0, bottom: 96, left: 0 }}
    >
      {/* Modo enfoque: con una ruta seleccionada, SOLO se dibuja esa ruta.
          Sin selección, todas con su color (tocables para seleccionar). */}
      {selectedRoute ? (
        <Polyline
          coordinates={selectedRoute.coordinates}
          strokeColor={selectedRoute.color}
          strokeWidth={5}
          zIndex={1}
        />
      ) : (
        routes.map((route) => (
          <Polyline
            key={route.id}
            coordinates={route.coordinates}
            strokeColor={route.color}
            strokeWidth={3}
            tappable={true}
            onPress={() => onSelectRoute(route.id)}
          />
        ))
      )}

      {/* Sentido del recorrido de la ruta seleccionada */}
      {selectedRoute && <DirectionArrows route={selectedRoute} />}

      {/* Paradas de la ruta seleccionada (filtradas por zoom y viewport) */}
      {visibleStops.map((stop) => (
        <StopMarker
          key={stop.id}
          stop={stop}
          color={selectedRoute?.color ?? theme.colors.primary}
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
