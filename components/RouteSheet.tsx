import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../theme";
import { Route } from "../types";
import RouteDetail from "./RouteDetail";
import RouteListItem from "./RouteListItem";

interface RouteSheetProps {
  routes: Route[];
  selectedRoute: Route | null;
  stopsCountByCode: Map<string, number>;
  onSelectRoute: (routeId: string) => void;
  onClose: () => void;
}

/**
 * Hoja persistente inferior (patrón Google Maps/Transit): colapsada muestra
 * lo esencial, a media altura la lista de rutas, y arriba la lista completa.
 * Con una ruta seleccionada se colapsa para dejar el mapa como protagonista.
 */
const RouteSheet: React.FC<RouteSheetProps> = ({
  routes,
  selectedRoute,
  stopsCountByCode,
  onSelectRoute,
  onClose,
}) => {
  const theme = useTheme();
  const sheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => [110, "45%", "88%"], []);

  useEffect(() => {
    // Al seleccionar: colapsar para ver el mapa. Al volver: media altura.
    sheetRef.current?.snapToIndex(selectedRoute ? 0 : 1);
  }, [selectedRoute?.id]);

  const listHeader = (
    <View
      style={{
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.sm,
      }}
    >
      <Text style={[theme.typography.title, { color: theme.colors.text }]}>
        Rutas de Tepa
      </Text>
      <Text
        style={[theme.typography.caption, { color: theme.colors.textMuted }]}
      >
        Elige una ruta para ver su recorrido y paradas
      </Text>
    </View>
  );

  return (
    <BottomSheet
      ref={sheetRef}
      index={1}
      snapPoints={snapPoints}
      backgroundStyle={{ backgroundColor: theme.colors.surface }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.border }}
    >
      {selectedRoute ? (
        <BottomSheetView style={styles.content}>
          <RouteDetail
            route={selectedRoute}
            stopsCount={stopsCountByCode.get(selectedRoute.code) ?? 0}
            onClose={onClose}
          />
        </BottomSheetView>
      ) : (
        <BottomSheetFlatList
          data={routes}
          keyExtractor={(route: Route) => route.id}
          ListHeaderComponent={listHeader}
          renderItem={({ item }: { item: Route }) => (
            <RouteListItem route={item} onPress={onSelectRoute} />
          )}
          contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
        />
      )}
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
});

export default RouteSheet;
