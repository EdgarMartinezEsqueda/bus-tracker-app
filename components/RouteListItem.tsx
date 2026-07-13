import { ChevronRight } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../theme";
import { Route } from "../types";
import { routeSubtitle, routeTitle } from "../utils/routeLabel";

interface RouteListItemProps {
  route: Route;
  onPress: (routeId: string) => void;
}

const RouteListItem: React.FC<RouteListItemProps> = ({ route, onPress }) => {
  const theme = useTheme();
  const subtitle = routeSubtitle(route);

  return (
    <TouchableOpacity
      style={[styles.item, { borderBottomColor: theme.colors.border }]}
      onPress={() => onPress(route.id)}
      accessibilityRole="button"
    >
      <View style={[styles.colorDot, { backgroundColor: route.color }]} />
      <View style={styles.texts}>
        <Text style={[theme.typography.subtitle, { color: theme.colors.text }]}>
          {routeTitle(route)}
        </Text>
        {subtitle !== "" && (
          <Text
            style={[theme.typography.caption, { color: theme.colors.textMuted }]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>
      <ChevronRight size={20} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  colorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 14,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
});

export default RouteListItem;
