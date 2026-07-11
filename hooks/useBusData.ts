import { useEffect, useState } from "react";
import bundledData from "../assets/routes.json";
import {
  fetchRemoteData,
  parseBusData,
  readCachedData,
} from "../services/busData";
import { BusData, RouteCollection } from "../types";

export type BusDataSource = "bundled" | "cache" | "remote";

/**
 * Datos de rutas con tres niveles, del más viejo al más fresco:
 *  1. Copia embebida en la app (assets/routes.json) — disponible al instante.
 *  2. Caché en disco de la última descarga.
 *  3. GeoJSON remoto en GitHub.
 * Siempre gana la copia con `generatedAt` más reciente, así una app recién
 * actualizada no pisa sus datos embebidos con una caché vieja.
 */
const useBusData = () => {
  const [data, setData] = useState<BusData>(() =>
    parseBusData(bundledData as unknown as RouteCollection),
  );
  const [source, setSource] = useState<BusDataSource>("bundled");

  useEffect(() => {
    let active = true;
    let newest = data.generatedAt;

    const applyIfNewer = (candidate: BusData | null, from: BusDataSource) => {
      if (!active || !candidate || candidate.generatedAt <= newest) return;
      newest = candidate.generatedAt;
      setData(candidate);
      setSource(from);
    };

    (async () => {
      applyIfNewer(await readCachedData(), "cache");
      applyIfNewer(await fetchRemoteData(), "remote");
    })();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, source };
};

export default useBusData;
