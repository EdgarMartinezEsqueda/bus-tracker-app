import * as Location from "expo-location";
import { useEffect, useState } from "react";

const useLocation = () => {
  const [location, setLocation] = useState<Location.LocationObjectCoords>();

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({});
          setLocation(loc.coords);
        }
      } catch (error) {
        console.error("Error getting location:", error);
      }
    })();
  }, []);

  return location;
};

export default useLocation;
