/**
 * One-off: agrega properties.zone a cada ruta de data/routes.geojson,
 * calculada con el centroide del grupo (mismo code) respecto al centro:
 * a menos de ~1.3 km es "Centro"; si no, el punto cardinal del centroide.
 * La zona queda como dato editable a mano después (geojson.io / editor).
 * Correr: node scripts/addZones.js && npm run data:update
 */
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "data", "routes.geojson");
const CENTER = { lat: 20.805857, lng: -102.748916 };
const CENTRO_RADIUS_KM = 1.3;

const collection = JSON.parse(fs.readFileSync(file, "utf8"));
const routes = collection.features.filter((f) => f.properties.type === "route");

// centroide por grupo de código
const byCode = new Map();
for (const r of routes) {
  const list = byCode.get(r.properties.code) ?? [];
  list.push(r);
  byCode.set(r.properties.code, list);
}

const zoneOf = (lat, lng) => {
  const dLat = lat - CENTER.lat;
  const dLng = lng - CENTER.lng;
  const km = Math.hypot(dLat * 110.57, dLng * 104.65); // km por grado aprox a esta latitud
  if (km < CENTRO_RADIUS_KM) return "Centro";
  const angle = (Math.atan2(dLng, dLat) * 180) / Math.PI; // 0=N, 90=E
  const norm = (angle + 360) % 360;
  if (norm >= 315 || norm < 45) return "Norte";
  if (norm < 135) return "Oriente";
  if (norm < 225) return "Sur";
  return "Poniente";
};

for (const [code, group] of byCode) {
  let lat = 0;
  let lng = 0;
  let n = 0;
  for (const r of group) {
    for (const [x, y] of r.geometry.coordinates) {
      lat += y;
      lng += x;
      n++;
    }
  }
  const zone = zoneOf(lat / n, lng / n);
  for (const r of group) r.properties.zone = zone;
  console.log(`${code}: ${zone}`);
}

fs.writeFileSync(file, JSON.stringify(collection, null, 2) + "\n", "utf8");
console.log("OK — ahora corre: npm run data:update");
