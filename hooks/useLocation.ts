import * as Location from "expo-location";
import { useEffect, useState } from "react";

/**
 * Solicita el permiso de ubicación en primer plano.
 * Sin este permiso, `showsUserLocation` del mapa no muestra nada en Android.
 */
const useLocationPermission = () => {
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

  return granted;
};

export default useLocationPermission;
