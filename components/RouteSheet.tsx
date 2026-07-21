import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
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
  /** "sheet": hoja arrastrable sobre el mapa (móvil). "panel": columna fija
   * siempre visible (escritorio/web ancho) — ver App.tsx. Por defecto "sheet". */
  variant?: "sheet" | "panel";
}

/**
 * Lista de rutas agrupadas con filtro por zona; con una ruta seleccionada,
 * detalle con variantes y estadísticas. En "sheet" vive dentro de un
 * @gorhom/bottom-sheet arrastrable; en "panel" es una columna fija sin
 * gestos, por lo que el scroll usa los componentes normales de RN.
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
  variant = "sheet",
}) => {
  const theme = useTheme();
  const sheetRef = useRef<BottomSheet>(null);
  const [zone, setZone] = useState<string | null>(null);
  const isPanel = variant === "panel";

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
    // (el panel de escritorio no tiene snap points, siempre está abierto)
    if (!isPanel) sheetRef.current?.snapToIndex(1);
  }, [selectedGroup?.code, isPanel]);

  const handleFocusStop = (stop: BusStop) => {
    // Colapsar para que la parada enfocada sea visible en el mapa
    if (!isPanel) sheetRef.current?.snapToIndex(0);
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

  // El panel fijo no tiene gestos de arrastre: ScrollView/FlatList normales
  // bastan. Se tipan como `any` porque BottomSheetScrollView/FlatList añaden
  // props propias que no unifican con las de RN al elegir el componente en
  // tiempo de ejecución; ambos pares aceptan las props usadas abajo.
  const ScrollContainer: React.ComponentType<any> = isPanel
    ? ScrollView
    : BottomSheetScrollView;
  const ListContainer: React.ComponentType<any> = isPanel
    ? FlatList
    : BottomSheetFlatList;

  const body =
    selectedGroup && selectedRoute ? (
      <ScrollContainer
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
      </ScrollContainer>
    ) : (
      <ListContainer
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
    );

  if (isPanel) {
    return (
      <View style={[styles.panel, { backgroundColor: theme.colors.surface }]}>
        {body}
      </View>
    );
  }

  return (
    <BottomSheet
      ref={sheetRef}
      index={1}
      snapPoints={snapPoints}
      backgroundStyle={{ backgroundColor: theme.colors.surface }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.border }}
    >
      {body}
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  panel: {
    flex: 1,
  },
});

export default RouteSheet;
