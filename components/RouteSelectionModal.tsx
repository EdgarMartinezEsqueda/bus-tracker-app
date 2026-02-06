import React from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Route } from "../types";
import RouteItem from "./RouteItem";

interface RouteSelectionModalProps {
  visible: boolean;
  routes: Route[];
  selectedRoutes: string[];
  onRouteToggle: (routeId: string) => void;
  onToggleAll: () => void;
  onClose: () => void;
}

const RouteSelectionModal: React.FC<RouteSelectionModalProps> = ({
  visible,
  routes,
  selectedRoutes,
  onRouteToggle,
  onToggleAll,
  onClose,
}) => {
  const allRoutesSelected = selectedRoutes.length === routes.length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar Rutas</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Toggle All Button */}
          <TouchableOpacity
            style={styles.toggleAllButton}
            onPress={onToggleAll}
          >
            <Text style={styles.toggleAllText}>
              {allRoutesSelected ? "Deseleccionar Todas" : "Seleccionar Todas"}
            </Text>
          </TouchableOpacity>

          {/* Routes List */}
          <ScrollView style={styles.routeList}>
            {routes.map((route) => (
              <RouteItem
                key={route.id}
                id={route.id}
                name={route.name}
                color={route.color}
                isSelected={selectedRoutes.includes(route.id)}
                onPress={onRouteToggle}
              />
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    fontSize: 28,
    color: "#999",
  },
  toggleAllButton: {
    margin: 15,
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    alignItems: "center",
  },
  toggleAllText: {
    fontSize: 16,
    fontWeight: "600",
  },
  routeList: {
    paddingHorizontal: 15,
  },
});

export default RouteSelectionModal;
