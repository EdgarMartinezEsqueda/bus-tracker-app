import { BusStop, MapRegion, Route } from "../types";

const MAP_REGION_BUFFER = 1.5;

export const getVisibleStops = (
  stops: BusStop[],
  selectedRouteIds: string[],
  routes: Route[],
  mapRegion: MapRegion,
): BusStop[] => {
  const selectedCodes = new Set(
    routes.filter((r) => selectedRouteIds.includes(r.id)).map((r) => r.code),
  );

  const latDelta = mapRegion.latitudeDelta * MAP_REGION_BUFFER;
  const lngDelta = mapRegion.longitudeDelta * MAP_REGION_BUFFER;

  return stops.filter((stop) => {
    const isRouteVisible = stop.routeCodes.some((code) =>
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
