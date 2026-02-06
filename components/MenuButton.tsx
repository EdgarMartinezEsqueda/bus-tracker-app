import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface MenuButtonProps {
  onPress: () => void;
}

const MenuButton: React.FC<MenuButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.menuButton} onPress={onPress}>
      <Text style={styles.menuIcon}>≡</Text>
    </TouchableOpacity>
  );
};

const MENU_BUTTON_SIZE = 50;
const MENU_BUTTON_BORDER_RADIUS = 25;

const styles = StyleSheet.create({
  menuButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "white",
    width: MENU_BUTTON_SIZE,
    height: MENU_BUTTON_SIZE,
    borderRadius: MENU_BUTTON_BORDER_RADIUS,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuIcon: {
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default MenuButton;
