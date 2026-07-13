import { BusStop, MapRegion } from "../types";

const MAP_REGION_BUFFER = 1.5;

/** Paradas dentro del área visible del mapa (con margen). */
export const getVisibleStops = (
  stops: BusStop[],
  mapRegion: MapRegion,
): BusStop[] => {
  const latDelta = mapRegion.latitudeDelta * MAP_REGION_BUFFER;
  const lngDelta = mapRegion.longitudeDelta * MAP_REGION_BUFFER;

  return stops.filter(
    (stop) =>
      stop.latitude > mapRegion.latitude - latDelta &&
      stop.latitude < mapRegion.latitude + latDelta &&
      stop.longitude > mapRegion.longitude - lngDelta &&
      stop.longitude < mapRegion.longitude + lngDelta,
  );
};
