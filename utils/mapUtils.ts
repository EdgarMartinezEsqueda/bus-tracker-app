import { BusStop, MapRegion, Route } from "../types";

const MAP_REGION_BUFFER = 1.5;

export const getVisibleStops = (
  stops: BusStop[],
  selectedRoutes: string[],
  routes: Route[],
  mapRegion: MapRegion,
): BusStop[] => {
  // Get route names from selected route IDs
  const selectedRouteNames = routes
    .filter((r) => selectedRoutes.includes(r.id))
    .map((r) => r.name);

  // Filter stops that belong to visible routes
  return stops.filter((stop) => {
    const isRouteVisible = selectedRouteNames.some((routeName) =>
      stop.route.includes(routeName.split(" - ")[0]),
    );

    // Only show stops within visible map area + buffer
    const latDelta = mapRegion.latitudeDelta * MAP_REGION_BUFFER;
    const lngDelta = mapRegion.longitudeDelta * MAP_REGION_BUFFER;
    const inView =
      stop.latitude > mapRegion.latitude - latDelta &&
      stop.latitude < mapRegion.latitude + latDelta &&
      stop.longitude > mapRegion.longitude - lngDelta &&
      stop.longitude < mapRegion.longitude + lngDelta;

    return isRouteVisible && inView;
  });
};
