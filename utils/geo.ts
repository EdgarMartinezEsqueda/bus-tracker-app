type LatLng = { latitude: number; longitude: number };

const EARTH_RADIUS_KM = 6371;
const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

export const haversineKm = (a: LatLng, b: LatLng): number => {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

export const routeLengthKm = (coordinates: LatLng[]): number => {
  let total = 0;
  for (let i = 1; i < coordinates.length; i++) {
    total += haversineKm(coordinates[i - 1], coordinates[i]);
  }
  return total;
};

const KM_PER_DEG_LAT = 110.574;

export interface StopAlongRoute<S extends LatLng> {
  stop: S;
  kmFromStart: number;
}

/**
 * Proyecta paradas sobre la línea de la ruta: devuelve solo las que están a
 * menos de `maxDistanceKm` del trazo (las de la variante contraria quedan
 * fuera), ordenadas por su distancia desde el inicio del recorrido.
 */
export const stopsAlongRoute = <S extends LatLng>(
  coordinates: LatLng[],
  stops: S[],
  maxDistanceKm = 0.08,
): StopAlongRoute<S>[] => {
  if (coordinates.length < 2) return [];
  const kmPerDegLng =
    111.32 * Math.cos(toRad(coordinates[0].latitude));

  // Coordenadas planas locales (km) + km acumulados por vértice
  const points = coordinates.map((c) => ({
    x: c.longitude * kmPerDegLng,
    y: c.latitude * KM_PER_DEG_LAT,
  }));
  const cumKm: number[] = [0];
  for (let i = 1; i < points.length; i++) {
    cumKm.push(cumKm[i - 1] + Math.hypot(
      points[i].x - points[i - 1].x,
      points[i].y - points[i - 1].y,
    ));
  }

  const result: StopAlongRoute<S>[] = [];
  for (const stop of stops) {
    const sx = stop.longitude * kmPerDegLng;
    const sy = stop.latitude * KM_PER_DEG_LAT;
    let best = Infinity;
    let bestKm = 0;

    for (let i = 0; i < points.length - 1; i++) {
      const ax = points[i].x;
      const ay = points[i].y;
      const dx = points[i + 1].x - ax;
      const dy = points[i + 1].y - ay;
      const lenSq = dx * dx + dy * dy;
      const t = lenSq === 0
        ? 0
        : Math.max(0, Math.min(1, ((sx - ax) * dx + (sy - ay) * dy) / lenSq));
      const dist = Math.hypot(sx - (ax + t * dx), sy - (ay + t * dy));
      if (dist < best) {
        best = dist;
        bestKm = cumKm[i] + Math.sqrt(lenSq) * t;
      }
    }

    if (best <= maxDistanceKm) {
      result.push({ stop, kmFromStart: bestKm });
    }
  }

  return result.sort((a, b) => a.kmFromStart - b.kmFromStart);
};

/** Rumbo en grados (0 = norte, sentido horario) de `a` hacia `b`. */
export const bearingDeg = (a: LatLng, b: LatLng): number => {
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const dLon = toRad(b.longitude - a.longitude);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
};
