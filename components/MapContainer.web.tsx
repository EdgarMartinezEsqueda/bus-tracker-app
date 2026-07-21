import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { StyleSheet, View } from "react-native";
import {
  CircleMarker,
  MapContainer as LeafletMap,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  useMapEvents,
} from "react-leaflet";
import { MAP_DEFAULT_REGION } from "../constants/map";
import { useTheme } from "../theme";
import { MapRegion, Route } from "../types";
import { bearingDeg } from "../utils/geo";
import { LatLng, MapContainerProps, MapHandle } from "./MapContainer.types";

/**
 * Implementación web del mapa con Leaflet + OpenStreetMap (sin API key).
 * Expone el mismo `MapHandle` que la versión nativa: App.tsx no distingue
 * entre plataformas.
 */

// Tiles gratuitos: OSM estándar en claro, CARTO dark matter en oscuro
const LIGHT_TILES = {
  url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};
const DARK_TILES = {
  url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
};

const MAX_ARROWS = 7;
const STOP_DOT_RADIUS = 7;

// Conversión región (centro + deltas, modelo de react-native-maps) ↔ zoom web
const zoomFromRegion = (region: MapRegion): number =>
  Math.log2(360 / region.longitudeDelta);

const regionFromMap = (map: L.Map): MapRegion => {
  const center = map.getCenter();
  const bounds = map.getBounds();
  return {
    latitude: center.lat,
    longitude: center.lng,
    latitudeDelta: bounds.getNorth() - bounds.getSouth(),
    longitudeDelta: bounds.getEast() - bounds.getWest(),
  };
};

const toLatLngs = (coordinates: LatLng[]): [number, number][] =>
  coordinates.map((c) => [c.latitude, c.longitude]);

/** Puente entre eventos de Leaflet y el callback estilo react-native-maps. */
const RegionWatcher: React.FC<{
  onRegionChangeComplete: (region: MapRegion) => void;
}> = ({ onRegionChangeComplete }) => {
  const map = useMapEvents({
    moveend: () => onRegionChangeComplete(regionFromMap(map)),
    zoomend: () => onRegionChangeComplete(regionFromMap(map)),
  });

  // Región inicial: sin esto, visibleStops queda con la región por defecto
  useEffect(() => {
    onRegionChangeComplete(regionFromMap(map));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  return null;
};

// Flecha de sentido: mismo badge circular con chevron que la versión nativa,
// como divIcon HTML rotado según el rumbo del trazo.
const arrowIcon = (rotation: number, color: string, background: string) =>
  L.divIcon({
    className: "",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    html:
      `<div style="width:18px;height:18px;border-radius:9px;background:${background};` +
      `display:flex;align-items:center;justify-content:center;` +
      `box-shadow:0 1px 3px rgba(0,0,0,0.3);transform:rotate(${rotation}deg)">` +
      `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${color}" ` +
      `stroke-width="4" stroke-linecap="round" stroke-linejoin="round">` +
      `<path d="m18 15-6-6-6 6"/></svg></div>`,
  });

const DirectionArrowsWeb: React.FC<{ route: Route; background: string }> = ({
  route,
  background,
}) => {
  const arrows = useMemo(() => {
    const coords = route.coordinates;
    if (coords.length < 3) return [];
    const step = Math.max(2, Math.floor(coords.length / MAX_ARROWS));
    const result: Array<{ key: string; coordinate: LatLng; rotation: number }> =
      [];
    for (let i = step; i < coords.length - 1; i += step) {
      result.push({
        key: `${route.id}-arrow-${i}`,
        coordinate: coords[i],
        rotation: bearingDeg(coords[i - 1], coords[i + 1]),
      });
    }
    return result;
  }, [route]);

  return (
    <>
      {arrows.map((arrow) => (
        <Marker
          key={arrow.key}
          position={[arrow.coordinate.latitude, arrow.coordinate.longitude]}
          icon={arrowIcon(arrow.rotation, route.color, background)}
          interactive={false}
        />
      ))}
    </>
  );
};

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
    const mapRef = useRef<L.Map>(null);
    const tiles = theme.dark ? DARK_TILES : LIGHT_TILES;

    useImperativeHandle(ref, () => ({
      animateToRegion: (region, durationMs = 500) => {
        mapRef.current?.flyTo(
          [region.latitude, region.longitude],
          zoomFromRegion(region),
          { duration: durationMs / 1000 },
        );
      },
      fitToCoordinates: (coordinates, options) => {
        const map = mapRef.current;
        if (!map || coordinates.length === 0) return;
        const bounds = L.latLngBounds(toLatLngs(coordinates));
        const padding = options?.edgePadding;
        const fitOptions: L.FitBoundsOptions = padding
          ? {
              paddingTopLeft: [padding.left, padding.top],
              paddingBottomRight: [padding.right, padding.bottom],
            }
          : {};
        if (options?.animated ?? true) {
          map.flyToBounds(bounds, { ...fitOptions, duration: 0.5 });
        } else {
          map.fitBounds(bounds, fitOptions);
        }
      },
    }));

    return (
      <View style={styles.map}>
        <LeafletMap
          ref={mapRef}
          center={[MAP_DEFAULT_REGION.latitude, MAP_DEFAULT_REGION.longitude]}
          zoom={zoomFromRegion(MAP_DEFAULT_REGION)}
          zoomControl={false}
          style={leafletStyle}
        >
          {/* key fuerza el remount de los tiles al cambiar el tema */}
          <TileLayer
            key={theme.dark ? "dark" : "light"}
            url={tiles.url}
            attribution={tiles.attribution}
          />
          <RegionWatcher onRegionChangeComplete={onRegionChangeComplete} />

          {/* Mismo modo enfoque que la versión nativa */}
          {selectedRoute ? (
            <Polyline
              positions={toLatLngs(selectedRoute.coordinates)}
              pathOptions={{ color: selectedRoute.color, weight: 5 }}
            />
          ) : (
            routes.map((route) => (
              <Polyline
                key={route.id}
                positions={toLatLngs(route.coordinates)}
                pathOptions={{ color: route.color, weight: 3 }}
                eventHandlers={{ click: () => onSelectRoute(route.id) }}
              />
            ))
          )}

          {selectedRoute && (
            <DirectionArrowsWeb
              route={selectedRoute}
              background={theme.colors.surface}
            />
          )}

          {/* Paradas: mismo círculo con borde del color de la ruta */}
          {visibleStops.map((stop) => (
            <CircleMarker
              key={stop.id}
              center={[stop.latitude, stop.longitude]}
              radius={STOP_DOT_RADIUS}
              pathOptions={{
                color: selectedRoute?.color ?? theme.colors.primary,
                weight: 3,
                fillColor: theme.colors.stopFill,
                fillOpacity: 1,
              }}
            >
              <Tooltip direction="top" offset={[0, -STOP_DOT_RADIUS]}>
                {stop.name ?? "Parada de autobús"}
                {` · Rutas: ${stop.routeCodes.join(", ")}`}
              </Tooltip>
            </CircleMarker>
          ))}
        </LeafletMap>
      </View>
    );
  },
);

MapContainer.displayName = "MapContainer";

// Estilo DOM del contenedor Leaflet (no pasa por StyleSheet de RN)
const leafletStyle: React.CSSProperties = { width: "100%", height: "100%" };

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

export default MapContainer;
