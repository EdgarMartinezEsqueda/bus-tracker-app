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

## Desarrollo

```bash
npm run android        # compila el APK de debug y lo instala en el dispositivo/emulador
npx expo start --dev-client   # solo el servidor Metro (si la app ya está instalada)
```

### Problemas conocidos (Windows)

- **"SocketTimeoutException" / "failed to connect to /10.0.2.2"** al cargar el proyecto: el emulador no alcanza a Metro. Verificar que Metro esté corriendo y crear el túnel: `adb reverse tcp:8081 tcp:8081` (adb vive en `%LOCALAPPDATA%\Android\Sdk\platform-tools`). En el dev launcher, conectarse a `http://localhost:8081`.
- **"Filename longer than 260 characters"** al compilar: límite `MAX_PATH` de Windows en los intermediarios C++. Ya está mitigado en `android/app/build.gradle` con `externalNativeBuild.cmake.buildStagingDirectory "C:/rncxx/tepabuses"`. **Si se corre `expo prebuild --clean`, ese bloque se pierde y hay que reaplicarlo.**
- Tras instalar/quitar dependencias con código nativo, siempre reconstruir el APK (`npm run android`); el Fast Refresh solo cubre JavaScript.
