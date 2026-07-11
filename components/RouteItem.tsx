import { Check } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../theme";

interface RouteItemProps {
  id: string;
  name: string;
  color: string;
  isSelected: boolean;
  onPress: (routeId: string) => void;
}

const RouteItem: React.FC<RouteItemProps> = ({
  id,
  name,
  color,
  isSelected,
  onPress,
}) => {
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.routeItem,
        { borderBottomColor: theme.colors.border },
        isSelected && { backgroundColor: theme.colors.surfaceAlt },
      ]}
      onPress={() => onPress(id)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected }}
    >
      <View style={[styles.colorBox, { backgroundColor: color }]} />
      <Text
        style={[
          styles.routeName,
          theme.typography.body,
          { color: theme.colors.text },
        ]}
      >
        {name}
      </Text>
      {isSelected && (
        <Check size={20} color={theme.colors.success} strokeWidth={3} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  routeItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
  },
  colorBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 12,
  },
  routeName: {
    flex: 1,
  },
});

export default RouteItem;
