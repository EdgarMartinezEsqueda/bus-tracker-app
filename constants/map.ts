import { MapRegion } from "../types";

// Centro de Tepatitlán de Morelos, Jalisco
export const MAP_DEFAULT_REGION: MapRegion = {
  latitude: 20.805857,
  longitude: -102.748916,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

// Las paradas solo se muestran a partir de este nivel de zoom (delta menor =
// más cerca). Evita el amontonamiento de ~60 marcadores en zoom de ciudad.
export const STOPS_VISIBLE_MAX_DELTA = 0.09;

// Zoom al centrar en la ubicación del usuario
export const LOCATE_REGION_DELTA = 0.015;
