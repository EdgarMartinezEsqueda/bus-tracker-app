import { BusStop, MapRegion, Route } from "../types";

const MAP_REGION_BUFFER = 1.5;

// Código de ruta tipo "C01", "T02" presente tanto en nombres de rutas
// ("Ruta C01 - Ida...") como en grupos de paradas ("Paradas Ruta C01 y C02").
// La relación por código evita depender del nombre completo, que no coincide
// entre rutas y paradas (p. ej. "Ruta T01 (La Villa) - Ida" ↔ "Paradas Ruta T01").
const ROUTE_CODE_REGEX = /[CT]\d{2}/g;

export const getRouteCodes = (name: string): string[] =>
  name.match(ROUTE_CODE_REGEX) ?? [];

export const getVisibleStops = (
  stops: BusStop[],
  selectedRoutes: string[],
  routes: Route[],
  mapRegion: MapRegion,
): BusStop[] => {
  const selectedCodes = new Set(
    routes
      .filter((r) => selectedRoutes.includes(r.id))
      .flatMap((r) => getRouteCodes(r.name)),
  );

  const latDelta = mapRegion.latitudeDelta * MAP_REGION_BUFFER;
  const lngDelta = mapRegion.longitudeDelta * MAP_REGION_BUFFER;

  return stops.filter((stop) => {
    const isRouteVisible = getRouteCodes(stop.route).some((code) =>
      selectedCodes.has(code),
    );

    // Only show stops within visible map area + buffer
    const inView =
      stop.latitude > mapRegion.latitude - latDelta &&
      stop.latitude < mapRegion.latitude + latDelta &&
      stop.longitude > mapRegion.longitude - lngDelta &&
      stop.longitude < mapRegion.longitude + lngDelta;

    return isRouteVisible && inView;
  });
};
