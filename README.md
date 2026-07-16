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

1. Abrir `data/routes.geojson` en [geojson.io](https://geojson.io) (o QGIS) y editar visualmente. Para nombrar una parada, editar su `properties.name`. **Al agregar una ruta**: darle `id` único (p. ej. `c05-ida`) y sus `properties` (`code`, `direction`, `headsign`, `color`, `zone`).
2. Correr `npm run data:update` — valida el esquema (detecta ids duplicados, propiedades faltantes o si el editor rompió algo), sella `metadata.generatedAt` **(sin este sello los clientes ignoran el cambio)** y sincroniza la copia embebida `assets/routes.json`.
3. Commit + push a `main`. Los usuarios reciben el cambio al reabrir la app.

> Red de seguridad: el workflow [`update-data.yml`](.github/workflows/update-data.yml) corre la validación y el sellado automáticamente en cada push que toque `data/routes.geojson`, por si se edita desde la web de GitHub sin correr el paso 2. Si la validación falla, el Action marca ❌ en GitHub — revisar el log.

> `data/buses.json` y `scripts/buildGeojson.js` son el registro de la migración original (My Maps → KML → GeoJSON) y ya no forman parte del flujo normal.

## Reportes anónimos (Supabase)

La pestaña **Reportar** envía reportes anónimos a una tabla de Supabase vía REST (sin SDK). Configuración única:

1. En el [dashboard de Supabase](https://supabase.com/dashboard), crear un proyecto y abrir **SQL Editor**, pegar y correr:

```sql
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type text not null check (type in (
    'parada_incorrecta','parada_faltante','ruta_modificada',
    'recorrido_incorrecto','comentario'
  )),
  route_code text,
  description text check (char_length(description) <= 1000)
);

alter table public.reports enable row level security;

-- El rol anónimo SOLO puede insertar; nadie puede leer con la anon key
create policy "anon insert reports"
  on public.reports for insert to anon with check (true);
```

2. En **Settings → API**, copiar la *Project URL* y la *anon public key* al `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

3. Reiniciar Metro. Los reportes se leen en el dashboard: **Table Editor → reports**.

> Sin estas variables la app funciona igual; solo el envío de reportes muestra "no disponible".

## Desarrollo

```bash
npm run android        # compila el APK de debug y lo instala en el dispositivo/emulador
npx expo start --dev-client   # solo el servidor Metro (si la app ya está instalada)
```

### Problemas conocidos (Windows)

- **"SocketTimeoutException" / "failed to connect to /10.0.2.2"** al cargar el proyecto: el emulador no alcanza a Metro. Verificar que Metro esté corriendo y crear el túnel: `adb reverse tcp:8081 tcp:8081` (adb vive en `%LOCALAPPDATA%\Android\Sdk\platform-tools`). En el dev launcher, conectarse a `http://localhost:8081`.
- **"Filename longer than 260 characters"** al compilar: límite `MAX_PATH` de Windows en los intermediarios C++. Ya está mitigado en `android/app/build.gradle` con `externalNativeBuild.cmake.buildStagingDirectory "C:/rncxx/tepabuses"`. **Si se corre `expo prebuild --clean`, ese bloque se pierde y hay que reaplicarlo.**
- Tras instalar/quitar dependencias con código nativo, siempre reconstruir el APK (`npm run android`); el Fast Refresh solo cubre JavaScript.
