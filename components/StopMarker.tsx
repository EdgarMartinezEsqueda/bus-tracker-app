import React, { memo, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Marker } from "react-native-maps";
import { useTheme } from "../theme";
import { BusStop } from "../types";

interface StopMarkerProps {
  stop: BusStop;
  color: string; // color de la ruta a la que pertenece la parada
}

/**
 * Círculo vectorial (estilo parada de Google Maps): borde del color de la
 * ruta, centro claro. Reemplaza al antiguo JPG cuadrado.
 */
const StopMarker: React.FC<StopMarkerProps> = ({ stop, color }) => {
  const theme = useTheme();

  // En Android, congelar tracksViewChanges desde el inicio rasteriza el
  // marcador antes de que la vista hija exista → marcador invisible.
  // Se rastrea brevemente y después se congela para no re-dibujar al mover.
  const [tracksChanges, setTracksChanges] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setTracksChanges(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Marker
      coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
      title={stop.name ?? "Parada de autobús"}
      description={`Rutas: ${stop.routeCodes.join(", ")}`}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={tracksChanges}
    >
      <View
        style={[
          styles.dot,
          { borderColor: color, backgroundColor: theme.colors.stopFill },
        ]}
      />
    </Marker>
  );
};

const STOP_DOT_SIZE = 14;

const styles = StyleSheet.create({
  dot: {
    width: STOP_DOT_SIZE,
    height: STOP_DOT_SIZE,
    borderRadius: STOP_DOT_SIZE / 2,
    borderWidth: 3,
  },
});

// memo: los marcadores no deben re-renderizarse al mover el mapa
export default memo(StopMarker);
