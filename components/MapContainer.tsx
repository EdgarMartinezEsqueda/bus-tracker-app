import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { StyleSheet } from "react-native";
import MapView, { Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { MAP_DEFAULT_REGION } from "../constants/map";
import { DARK_MAP_STYLE } from "../constants/mapStyles";
import { useTheme } from "../theme";
import DirectionArrows from "./DirectionArrows";
import { MapContainerProps, MapHandle } from "./MapContainer.types";
import StopMarker from "./StopMarker";

// Implementación nativa con react-native-maps.
// En web, Metro resuelve MapContainer.web.tsx (Leaflet) en su lugar.
const MapContainer = forwardRef<MapHandle, MapContainerProps>(
  (
    {
      routes,
      selectedRoute,
      visibleStops,
      onRegionChangeComplete,
      onSelectRoute,
    },
    ref,
  ) => {
    const theme = useTheme();
    const mapRef = useRef<MapView>(null);

    useImperativeHandle(ref, () => ({
      animateToRegion: (region, durationMs = 500) => {
        mapRef.current?.animateToRegion(region, durationMs);
      },
      fitToCoordinates: (coordinates, options) => {
        mapRef.current?.fitToCoordinates(coordinates, {
          edgePadding: options?.edgePadding,
          animated: options?.animated ?? true,
        });
      },
    }));

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
  },
);

MapContainer.displayName = "MapContainer";

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

export default MapContainer;