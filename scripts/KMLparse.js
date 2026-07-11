const fs = require("fs");
const path = require("path");

// Read the original JSON file
const inputFile = path.join(__dirname, "..", "data", "buses.json");
const outputFile = path.join(__dirname, "..", "assets", "busDataProcessed.json");

console.log(`Reading ${inputFile}...`);

let rawData;
try {
  const fileContent = fs.readFileSync(inputFile, "utf8");
  rawData = JSON.parse(fileContent);
} catch (error) {
  console.error("Error reading file:", error.message);
  process.exit(1);
}

console.log("Processing data...");

const processedData = {
  stops: [],
  routes: [],
};

// Process Paradas (Bus Stops)
if (rawData.Paradas && Array.isArray(rawData.Paradas)) {
  rawData.Paradas.forEach((stopGroup) => {
    const groupName = stopGroup.name;

    if (stopGroup.Placemark && Array.isArray(stopGroup.Placemark)) {
      stopGroup.Placemark.forEach((placemark, index) => {
        if (placemark.Point && placemark.Point.coordinates) {
          const coords = placemark.Point.coordinates.trim().split(",");
          const longitude = parseFloat(coords[0]);
          const latitude = parseFloat(coords[1]);

          // Validate coordinates
          if (!isNaN(latitude) && !isNaN(longitude)) {
            processedData.stops.push({
              id: `${groupName}-${index}`,
              name: placemark.name,
              route: groupName,
              latitude: latitude,
              longitude: longitude,
            });
          }
        }
      });
    }
  });
}

// Process Rutas (Routes)
if (rawData.Rutas && Array.isArray(rawData.Rutas)) {
  rawData.Rutas.forEach((route, routeIndex) => {
    if (route.LineString && route.LineString.coordinates) {
      // Parse the coordinate string into an array
      const coordsString = route.LineString.coordinates;
      const coordinates = coordsString
        .trim()
        .split(/\s+/) // Split by whitespace/newlines
        .filter((coord) => coord.length > 0)
        .map((coord) => {
          const [lng, lat] = coord.split(",");
          return {
            latitude: parseFloat(lat),
            longitude: parseFloat(lng),
          };
        })
        .filter((coord) => !isNaN(coord.latitude) && !isNaN(coord.longitude));

      // Extract color from styleUrl if available
      let color = "#FFD600"; // Default color
      if (route.styleUrl) {
        const colorMatch = route.styleUrl.match(/#line-([A-F0-9]{6})/i);
        if (colorMatch) {
          color = `#${colorMatch[1]}`;
        }
      }

      processedData.routes.push({
        id: `route-${routeIndex}`,
        name: route.name,
        description: route.description || "",
        color: color,
        coordinates: coordinates,
      });
    }
  });
}

// Write processed data
console.log("Writing processed data...");

try {
  fs.writeFileSync(outputFile, JSON.stringify(processedData, null, 2), "utf8");

  console.log("Success!");
} catch (error) {
  console.error("Error writing file:", error.message);
  process.exit(1);
}
