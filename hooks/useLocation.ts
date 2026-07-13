import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";

/**
 * Permiso de ubicación + posición bajo demanda.
 * Sin el permiso, `showsUserLocation` del mapa no muestra nada en Android.
 */
const useLocation = () => {
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setGranted(status === "granted");
      } catch (error) {
        console.error("Error requesting location permission:", error);
      }
    })();
  }, []);

  /** Posición actual, o null si no hay permiso o falla el GPS. */
  const getPosition =
    useCallback(async (): Promise<Location.LocationObjectCoords | null> => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return null;
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        return location.coords;
      } catch {
        return null;
      }
    }, []);

  return { granted, getPosition };
};

export default useLocation;
