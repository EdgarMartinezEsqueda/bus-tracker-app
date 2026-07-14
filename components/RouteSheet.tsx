import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Text, View } from "react-native";
import { useTheme } from "../theme";
import { BusStop, Route, RouteGroup } from "../types";
import { StopAlongRoute } from "../utils/geo";
import RouteDetail from "./RouteDetail";
import RouteGroupCard from "./RouteGroupCard";
import ZoneChips from "./ZoneChips";

interface RouteSheetProps {
  groups: RouteGroup[];
  selectedGroup: RouteGroup | null;
  selectedRoute: Route | null;
  stopsAlong: StopAlongRoute<BusStop>[];
  favorites: string[];
  onToggleFavorite: (code: string) => void;
  onSelectGroup: (code: string) => void;
  onSelectVariant: (routeId: string) => void;
  onFocusStop: (stop: BusStop) => void;
}

/**
 * Hoja persistente inferior: lista de rutas agrupadas con filtro por zona;
 * con una ruta seleccionada, detalle con variantes y estadísticas.
 */
const RouteSheet: React.FC<RouteSheetProps> = ({
  groups,
  selectedGroup,
  selectedRoute,
  stopsAlong,
  favorites,
  onToggleFavorite,
  onSelectGroup,
  onSelectVariant,
  onFocusStop,
}) => {
  const theme = useTheme();
  const sheetRef = useRef<BottomSheet>(null);
  const [zone, setZone] = useState<string | null>(null);

  const snapPoints = useMemo(() => [120, "45%", "88%"], []);

  const zones = useMemo(
    () => [...new Set(groups.map((g) => g.zone).filter((z): z is string => !!z))],
    [groups],
  );

  const filteredGroups = useMemo(() => {
    const list = zone ? groups.filter((g) => g.zone === zone) : groups;
    // Favoritas primero (sort estable conserva el orden original entre iguales)
    return [...list].sort(
      (a, b) =>
        Number(favorites.includes(b.code)) -
        Number(favorites.includes(a.code)),
    );
  }, [groups, zone, favorites]);

  useEffect(() => {
    // Detalle y lista abren a media altura: mapa arriba, contenido abajo
    sheetRef.current?.snapToIndex(1);
  }, [selectedGroup?.code]);

  const handleFocusStop = (stop: BusStop) => {
    // Colapsar para que la parada enfocada sea visible en el mapa
    sheetRef.current?.snapToIndex(0);
    onFocusStop(stop);
  };

  const listHeader = (
    <View style={{ paddingBottom: theme.spacing.sm }}>
      <View style={{ paddingHorizontal: theme.spacing.lg }}>
        <Text style={[theme.typography.title, { color: theme.colors.text }]}>
          Rutas disponibles
        </Text>
        <Text
          style={[theme.typography.caption, { color: theme.colors.textMuted }]}
        >
          {groups.length} rutas activas en Tepatitlán
        </Text>
      </View>
      <ZoneChips zones={zones} active={zone} onChange={setZone} />
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
      {selectedGroup && selectedRoute ? (
        <BottomSheetScrollView
          contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
        >
          <RouteDetail
            group={selectedGroup}
            selectedRoute={selectedRoute}
            stopsAlong={stopsAlong}
            isFavorite={favorites.includes(selectedGroup.code)}
            onToggleFavorite={onToggleFavorite}
            onSelectVariant={onSelectVariant}
            onFocusStop={handleFocusStop}
          />
        </BottomSheetScrollView>
      ) : (
        <BottomSheetFlatList
          data={filteredGroups}
          keyExtractor={(group: RouteGroup) => group.code}
          ListHeaderComponent={listHeader}
          renderItem={({ item }: { item: RouteGroup }) => (
            <RouteGroupCard
              group={item}
              isFavorite={favorites.includes(item.code)}
              onPress={onSelectGroup}
            />
          )}
          contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
        />
      )}
    </BottomSheet>
  );
};

export default RouteSheet;
