/**
 * Migración ÚNICA: convierte data/buses.json (KML parseado de My Maps)
 * al formato canónico data/routes.geojson.
 *
 * Después de esta migración, data/routes.geojson ES la fuente de verdad:
 * se edita directamente (geojson.io, QGIS) y NO se regenera con este script,
 * porque se perderían las ediciones manuales (nombres de paradas, etc.).
 *
 * También escribe assets/routes.json (copia embebida en la app como fallback
 * offline). Para re-sincronizar esa copia tras editar el .geojson:
 *   npm run data:sync
 */
const fs = require("fs");
const path = require("path");

const inputFile = path.join(__dirname, "..", "data", "buses.json");
const geojsonFile = path.join(__dirname, "..", "data", "routes.geojson");
const bundledFile = path.join(__dirname, "..", "assets", "routes.json");

const ROUTE_CODE_REGEX = /[CT]\d{2}/g;

const slugify = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // sin acentos
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * Interpreta nombres como:
 *   "Ruta C01 - Ida (Hacienda Popotes)"  → code C01, direction ida, headsign "Hacienda Popotes"
 *   "Ruta T01 (La Villa) - Vuelta"       → code T01, variant "La Villa", direction vuelta
 *   "Ruta C03 - Penal"                   → code C03, headsign "Penal"
 *   "Ruta C02"                           → code C02
 */
const parseRouteName = (name) => {
  const code = (name.match(ROUTE_CODE_REGEX) || [null])[0];
  const variantMatch = name.match(/^Ruta\s+\S+\s*\(([^)]+)\)/);
  const variant = variantMatch ? variantMatch[1].trim() : null;

  let direction = null;
  let headsign = null;
  const afterDash = name.split(" - ")[1];
  if (afterDash) {
    const dirMatch = afterDash.match(/^(Ida|Vuelta)/i);
    if (dirMatch) direction = dirMatch[1].toLowerCase();
    const headsignMatch = afterDash.match(/\(([^)]+)\)/);
    if (headsignMatch) headsign = headsignMatch[1].trim();
    else if (!dirMatch) headsign = afterDash.trim();
  }
  // "Ida" solo al final sin guion: "Ruta T01 (La Villa) - Ida" ya cubierto;
  // por si el nombre termina en Ida/Vuelta sin " - ":
  if (!direction) {
    const tail = name.match(/\b(Ida|Vuelta)\b\s*$/i);
    if (tail) direction = tail[1].toLowerCase();
  }
  return { code, variant, direction, headsign };
};

const raw = JSON.parse(fs.readFileSync(inputFile, "utf8"));
const features = [];

// --- Rutas (LineString) ---
for (const route of raw.Rutas || []) {
  if (!route.LineString?.coordinates) continue;

  const coordinates = route.LineString.coordinates
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((c) => {
      const [lng, lat] = c.split(",").map(parseFloat);
      return [lng, lat];
    })
    .filter(([lng, lat]) => !isNaN(lng) && !isNaN(lat));

  let color = "#FFD600";
  const colorMatch = (route.styleUrl || "").match(/#line-([A-F0-9]{6})/i);
  if (colorMatch) color = `#${colorMatch[1]}`;

  const { code, variant, direction, headsign } = parseRouteName(route.name);
  const idParts = [code, variant, headsign && !direction ? headsign : null, direction]
    .filter(Boolean)
    .map(slugify);

  features.push({
    type: "Feature",
    id: idParts.join("-"),
    properties: {
      type: "route",
      code, // "C01" — vincula la ruta con sus paradas (routeCodes)
      name: route.name,
      variant, // ramal, p. ej. "La Villa"
      direction, // "ida" | "vuelta" | null
      headsign, // destino visible, p. ej. "Hacienda Popotes"
      color,
    },
    geometry: { type: "LineString", coordinates },
  });
}

// --- Paradas (Point) ---
let stopCounter = 0;
for (const group of raw.Paradas || []) {
  const codes = group.name.match(ROUTE_CODE_REGEX) || [];
  for (const placemark of group.Placemark || []) {
    if (!placemark.Point?.coordinates) continue;
    const [lng, lat] = placemark.Point.coordinates
      .trim()
      .split(",")
      .map(parseFloat);
    if (isNaN(lng) || isNaN(lat)) continue;

    stopCounter++;
    features.push({
      type: "Feature",
      id: `s-${String(stopCounter).padStart(3, "0")}`,
      properties: {
        type: "stop",
        // null = parada sin nombre propio todavía; se nombran editando este archivo
        name: /parada de autob/i.test(placemark.name) ? null : placemark.name,
        routeCodes: codes, // rutas que pasan por esta parada
      },
      geometry: { type: "Point", coordinates: [lng, lat] },
    });
  }
}

const collection = {
  type: "FeatureCollection",
  metadata: {
    name: "Rutas de transporte público de Tepatitlán de Morelos, Jalisco",
    generatedAt: new Date().toISOString(),
    schemaVersion: 1,
  },
  features,
};

const json = JSON.stringify(collection, null, 2) + "\n";
fs.writeFileSync(geojsonFile, json, "utf8");
fs.writeFileSync(bundledFile, json, "utf8");

const nRoutes = features.filter((f) => f.properties.type === "route").length;
const nStops = features.filter((f) => f.properties.type === "stop").length;
console.log(`OK: ${nRoutes} rutas y ${nStops} paradas`);
console.log(`  → ${geojsonFile}`);
console.log(`  → ${bundledFile}`);
