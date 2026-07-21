import { BusStop, MapRegion, Route } from "../types";

export type LatLng = { latitude: number; longitude: number };

export interface EdgePadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Contrato imperativo común del mapa. `MapContainer.tsx` (nativo, Google Maps)
 * y `MapContainer.web.tsx` (Leaflet) lo implementan; App.tsx solo conoce esta
 * interfaz y nunca importa react-native-maps ni leaflet directamente.
 */
export interface MapHandle {
  animateToRegion: (region: MapRegion, durationMs?: number) => void;
  fitToCoordinates: (
    coordinates: LatLng[],
    options?: { edgePadding?: EdgePadding; animated?: boolean },
  ) => void;
}

export interface MapContainerProps {
  routes: Route[];
  selectedRoute: Route | null;
  visibleStops: BusStop[];
  onRegionChangeComplete: (region: MapRegion) => void;
  onSelectRoute: (routeId: string) => void;
}