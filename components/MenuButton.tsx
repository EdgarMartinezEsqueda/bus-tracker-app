import { Menu } from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../theme";

interface MenuButtonProps {
  onPress: () => void;
}

const MenuButton: React.FC<MenuButtonProps> = ({ onPress }) => {
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={[styles.menuButton, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Seleccionar rutas"
    >
      <Menu size={24} color={theme.colors.text} strokeWidth={2.5} />
    </TouchableOpacity>
  );
};

const MENU_BUTTON_SIZE = 50;

const styles = StyleSheet.create({
  menuButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: MENU_BUTTON_SIZE,
    height: MENU_BUTTON_SIZE,
    borderRadius: MENU_BUTTON_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default MenuButton;
