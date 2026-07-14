import * as FileSystem from "expo-file-system/legacy";
import { BusData, RouteCollection, RouteFeature, StopFeature } from "../types";

/**
 * Fuente de verdad de los datos: data/routes.geojson en GitHub.
 * Editar la ruta ahí (geojson.io) y hacer push actualiza a todos los usuarios
 * sin publicar una nueva versión de la app.
 */
const REMOTE_DATA_URL =
  "https://raw.githubusercontent.com/EdgarMartinezEsqueda/bus-tracker-app/main/data/routes.geojson";

const CACHE_FILE = `${FileSystem.documentDirectory}routes.geojson`;
const FETCH_TIMEOUT_MS = 8000;

export const parseBusData = (collection: RouteCollection): BusData => {
  const data: BusData = {
    routes: [],
    stops: [],
    generatedAt: collection.metadata.generatedAt,
  };

  const isRouteFeature = (
    f: RouteFeature | StopFeature,
  ): f is RouteFeature => f.properties.type === "route";

  for (const feature of collection.features) {
    if (isRouteFeature(feature)) {
      const { code, name, variant, direction, headsign, color, zone } =
        feature.properties;
      data.routes.push({
        id: feature.id,
        code,
        name,
        variant,
        direction,
        headsign,
        color,
        zone: zone ?? null,
        coordinates: feature.geometry.coordinates.map(([lng, lat]) => ({
          latitude: lat,
          longitude: lng,
        })),
      });
    } else {
      const [lng, lat] = feature.geometry.coordinates;
      data.stops.push({
        id: feature.id,
        name: feature.properties.name,
        routeCodes: feature.properties.routeCodes,
        latitude: lat,
        longitude: lng,
      });
    }
  }

  return data;
};

const isValidCollection = (value: unknown): value is RouteCollection => {
  const c = value as RouteCollection;
  return (
    c?.type === "FeatureCollection" &&
    typeof c.metadata?.generatedAt === "string" &&
    Array.isArray(c.features) &&
    c.features.length > 0
  );
};

export const readCachedData = async (): Promise<BusData | null> => {
  try {
    const info = await FileSystem.getInfoAsync(CACHE_FILE);
    if (!info.exists) return null;
    const parsed = JSON.parse(await FileSystem.readAsStringAsync(CACHE_FILE));
    return isValidCollection(parsed) ? parseBusData(parsed) : null;
  } catch {
    return null; // caché corrupta o ilegible: se ignora
  }
};

export const fetchRemoteData = async (): Promise<BusData | null> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(REMOTE_DATA_URL, {
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const text = await response.text();
    const parsed = JSON.parse(text);
    if (!isValidCollection(parsed)) return null;

    await FileSystem.writeAsStringAsync(CACHE_FILE, text);
    return parseBusData(parsed);
  } catch {
    return null; // sin conexión, timeout o respuesta inválida: se usa la copia local
  } finally {
    clearTimeout(timeout);
  }
};
