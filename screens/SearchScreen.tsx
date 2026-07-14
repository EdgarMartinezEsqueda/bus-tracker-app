import { ArrowLeft, Search } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RouteGroupCard from "../components/RouteGroupCard";
import ZoneChips from "../components/ZoneChips";
import { useTheme } from "../theme";
import { RouteGroup } from "../types";
import { matchesQuery } from "../utils/routeGroups";

interface SearchScreenProps {
  groups: RouteGroup[];
  onSelectGroup: (code: string) => void;
  onBack: () => void;
}

const SearchScreen: React.FC<SearchScreenProps> = ({
  groups,
  onSelectGroup,
  onBack,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [zone, setZone] = useState<string | null>(null);

  const zones = useMemo(
    () => [...new Set(groups.map((g) => g.zone).filter((z): z is string => !!z))],
    [groups],
  );

  const results = useMemo(
    () =>
      groups
        .filter((g) => (zone ? g.zone === zone : true))
        .filter((g) => matchesQuery(g, query)),
    [groups, query, zone],
  );

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: theme.colors.background, paddingTop: insets.top + 8 },
      ]}
    >
      {/* Header: volver + campo de búsqueda */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={[styles.backButton, { backgroundColor: theme.colors.surface }]}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <ArrowLeft size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <View
          style={[
            styles.inputWrap,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.primary,
            },
          ]}
        >
          <Search size={18} color={theme.colors.textMuted} />
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            placeholder="Nombre de ruta, zona..."
            placeholderTextColor={theme.colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
        </View>
      </View>

      <ZoneChips zones={zones} active={zone} onChange={setZone} />

      <Text
        style={[
          theme.typography.caption,
          {
            color: theme.colors.textMuted,
            paddingHorizontal: theme.spacing.md,
            paddingBottom: theme.spacing.sm,
          },
        ]}
      >
        {results.length}{" "}
        {results.length === 1 ? "ruta disponible" : "rutas disponibles"}
      </Text>

      <FlatList
        style={styles.list}
        data={results}
        keyExtractor={(group) => group.code}
        renderItem={({ item }) => (
          <RouteGroupCard group={item} onPress={onSelectGroup} />
        )}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <Text
            style={[
              theme.typography.body,
              {
                color: theme.colors.textMuted,
                textAlign: "center",
                marginTop: 40,
              },
            ]}
          >
            No se encontraron rutas
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    borderWidth: 1.5,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 9,
    fontSize: 15,
  },
});

export default SearchScreen;
