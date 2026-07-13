import { LocateFixed } from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../theme";

interface LocateButtonProps {
  onPress: () => void;
}

const LocateButton: React.FC<LocateButtonProps> = ({ onPress }) => {
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Centrar en mi ubicación"
    >
      <LocateFixed size={22} color={theme.colors.primary} strokeWidth={2.5} />
    </TouchableOpacity>
  );
};

const BUTTON_SIZE = 48;

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    right: 16,
    bottom: 132, // por encima del bottom sheet colapsado
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default LocateButton;
