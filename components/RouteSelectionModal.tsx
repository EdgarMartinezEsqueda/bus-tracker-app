import { X } from "lucide-react-native";
import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../theme";
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
  const theme = useTheme();
  const allRoutesSelected = selectedRoutes.length === routes.length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View
        style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}
      >
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: theme.radii.lg,
              borderTopRightRadius: theme.radii.lg,
            },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.modalHeader,
              {
                padding: theme.spacing.lg,
                borderBottomColor: theme.colors.border,
              },
            ]}
          >
            <Text style={[theme.typography.title, { color: theme.colors.text }]}>
              Seleccionar Rutas
            </Text>
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={24} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Toggle All Button */}
          <TouchableOpacity
            style={[
              styles.toggleAllButton,
              {
                margin: theme.spacing.md,
                padding: theme.spacing.sm + theme.spacing.xs,
                backgroundColor: theme.colors.surfaceAlt,
                borderRadius: theme.radii.sm,
              },
            ]}
            onPress={onToggleAll}
            accessibilityRole="button"
          >
            <Text
              style={[theme.typography.subtitle, { color: theme.colors.text }]}
            >
              {allRoutesSelected ? "Deseleccionar Todas" : "Seleccionar Todas"}
            </Text>
          </TouchableOpacity>

          {/* Routes List */}
          <ScrollView
            style={{ paddingHorizontal: theme.spacing.md }}
          >
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
    justifyContent: "flex-end",
  },
  modalContent: {
    maxHeight: "90%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  toggleAllButton: {
    alignItems: "center",
  },
});

export default RouteSelectionModal;
