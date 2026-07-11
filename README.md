# Bus Tracker App - Tepatitlán de Morelos

<div align="center">
  <img src="./assets/logoFlat.png" alt="Logo de la aplicación" width="200" />
</div>

Esta aplicación móvil permite visualizar las rutas de transporte público en **Tepatitlán de Morelos, Jalisco**.

## Sobre los datos

La información de las rutas y paradas se basa en la API pública que utilizó el modelo de ruta empresa **SITRAN** cuando inició operaciones en el año **2017**.

> **Nota importante:** Tenga en cuenta que algunas rutas o paradas pueden haber cambiado desde entonces. La información presentada es con fines históricos y de referencia.

## Tecnologías

Este proyecto está construido con **React Native** y utiliza:

- **react-native-maps** para la visualización del mapa.
- **Expo** para el desarrollo y construcción de la aplicación.

## Datos de rutas

La **fuente de verdad** es [`data/routes.geojson`](./data/routes.geojson): un GeoJSON con las rutas (LineString) y paradas (Point), con la relación explícita ruta↔parada vía `code`/`routeCodes`.

La app lo consume en tres niveles (siempre gana el más reciente según `metadata.generatedAt`):

1. Copia embebida (`assets/routes.json`) — funciona sin internet.
2. Caché local de la última descarga.
3. Descarga desde GitHub raw — **actualizar una ruta = editar el archivo y hacer push**, sin publicar una nueva versión de la app.

### Para modificar una ruta o parada

1. Abrir `data/routes.geojson` en [geojson.io](https://geojson.io) (o QGIS) y editar visualmente. Para nombrar una parada, editar su `properties.name`.
2. Correr `npm run data:update` — valida el esquema (detecta si el editor rompió algo), sella `metadata.generatedAt` y sincroniza la copia embebida `assets/routes.json`.
3. Commit + push a `main`. Los usuarios reciben el cambio al reabrir la app.

> `data/buses.json` y `scripts/buildGeojson.js` son el registro de la migración original (My Maps → KML → GeoJSON) y ya no forman parte del flujo normal.
