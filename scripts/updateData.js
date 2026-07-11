/**
 * Correr DESPUÉS de editar data/routes.geojson (geojson.io, QGIS, a mano):
 *   npm run data:update
 *
 * 1. Valida el esquema (algunos editores eliminan campos que la app necesita).
 * 2. Actualiza metadata.generatedAt — sin esto los clientes ignoran el cambio.
 * 3. Sincroniza la copia embebida assets/routes.json.
 */
const fs = require("fs");
const path = require("path");

const geojsonFile = path.join(__dirname, "..", "data", "routes.geojson");
const bundledFile = path.join(__dirname, "..", "assets", "routes.json");

const fail = (msg) => {
  console.error(`ERROR: ${msg}`);
  console.error("No se escribió nada. Corrige data/routes.geojson y reintenta.");
  process.exit(1);
};

const collection = JSON.parse(fs.readFileSync(geojsonFile, "utf8"));

// --- Validación ---
if (collection.type !== "FeatureCollection") fail("type debe ser FeatureCollection");
if (!Array.isArray(collection.features) || !collection.features.length)
  fail("features vacío");

const ids = new Set();
let nRoutes = 0;
let nStops = 0;
const routeCodes = new Set();

for (const f of collection.features) {
  const label = f.id || f.properties?.name || "(sin id)";
  if (!f.id) fail(`feature sin id: ${JSON.stringify(f.properties)}`);
  if (ids.has(f.id)) fail(`id duplicado: ${f.id}`);
  ids.add(f.id);
  const p = f.properties || {};

  if (p.type === "route") {
    nRoutes++;
    if (!p.code) fail(`ruta ${label} sin properties.code`);
    if (!p.color) fail(`ruta ${label} sin properties.color`);
    if (f.geometry?.type !== "LineString" || f.geometry.coordinates.length < 2)
      fail(`ruta ${label} sin geometría LineString válida`);
    routeCodes.add(p.code);
  } else if (p.type === "stop") {
    nStops++;
    if (!Array.isArray(p.routeCodes) || !p.routeCodes.length)
      fail(`parada ${label} sin properties.routeCodes`);
    if (f.geometry?.type !== "Point")
      fail(`parada ${label} sin geometría Point`);
  } else {
    fail(`feature ${label} con properties.type desconocido: "${p.type}"`);
  }
}

// Toda parada debe referir a códigos de ruta existentes
for (const f of collection.features) {
  if (f.properties.type !== "stop") continue;
  for (const code of f.properties.routeCodes) {
    if (!routeCodes.has(code))
      fail(`parada ${f.id} refiere a ruta inexistente "${code}"`);
  }
}

// --- Sello de versión (metadata pudo ser eliminada por el editor) ---
collection.metadata = {
  name: "Rutas de transporte público de Tepatitlán de Morelos, Jalisco",
  schemaVersion: 1,
  ...collection.metadata,
  generatedAt: new Date().toISOString(),
};

// --- Escritura + sincronización ---
const json = JSON.stringify(collection, null, 2) + "\n";
fs.writeFileSync(geojsonFile, json, "utf8");
fs.writeFileSync(bundledFile, json, "utf8");

console.log(`OK: ${nRoutes} rutas, ${nStops} paradas, sin errores`);
console.log(`generatedAt → ${collection.metadata.generatedAt}`);
console.log("Ahora haz commit + push para publicar el cambio.");
