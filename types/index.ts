export type RouteDirection = "ida" | "vuelta";

export interface Route {
  id: string; // slug estable, p. ej. "c01-ida"
  code: string; // "C01" — vincula con BusStop.routeCodes
  name: string;
  variant: string | null; // ramal, p. ej. "La Villa"
  direction: RouteDirection | null;
  headsign: string | null; // destino, p. ej. "Hacienda Popotes"
  color: string;
  zone: string | null; // "Centro", "Norte"… para filtros
  coordinates: Array<{ latitude: number; longitude: number }>;
}

/** Rutas con el mismo código (ida/vuelta/ramales) presentadas como una sola. */
export interface RouteGroup {
  code: string;
  name: string; // "Central — Hacienda Popotes" o "Ruta C02"
  color: string;
  zone: string | null;
  variants: Route[];
  stopsCount: number;
}

export interface BusStop {
  id: string;
  name: string | null; // null = parada aún sin nombre propio
  routeCodes: string[];
  latitude: number;
  longitude: number;
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface BusData {
  routes: Route[];
  stops: BusStop[];
  generatedAt: string; // ISO — para decidir qué copia de datos es más reciente
}

// ---- Esquema del GeoJSON (data/routes.geojson) ----

export interface RouteFeature {
  type: "Feature";
  id: string;
  properties: {
    type: "route";
    code: string;
    name: string;
    variant: string | null;
    direction: RouteDirection | null;
    headsign: string | null;
    color: string;
    zone?: string | null;
  };
  geometry: { type: "LineString"; coordinates: [number, number][] };
}

export interface StopFeature {
  type: "Feature";
  id: string;
  properties: {
    type: "stop";
    name: string | null;
    routeCodes: string[];
  };
  geometry: { type: "Point"; coordinates: [number, number] };
}

export interface RouteCollection {
  type: "FeatureCollection";
  metadata: {
    name: string;
    generatedAt: string;
    schemaVersion: number;
  };
  features: Array<RouteFeature | StopFeature>;
}
