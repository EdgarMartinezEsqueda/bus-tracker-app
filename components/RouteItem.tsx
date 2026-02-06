import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
  return (
    <TouchableOpacity
      style={[styles.routeItem, isSelected && styles.routeItemSelected]}
      onPress={() => onPress(id)}
    >
      <View style={[styles.colorBox, { backgroundColor: color }]} />
      <Text style={styles.routeName}>{name}</Text>
      <Text style={styles.checkmark}>{isSelected ? "✓" : ""}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  routeItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  routeItemSelected: {
    backgroundColor: "#f0f8ff",
  },
  colorBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 12,
  },
  routeName: {
    flex: 1,
    fontSize: 14,
  },
  checkmark: {
    fontSize: 20,
    color: "#4CAF50",
    fontWeight: "bold",
  },
});

export default RouteItem;
