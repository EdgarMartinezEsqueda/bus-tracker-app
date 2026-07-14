import { Home, Info, MessageCircle, Search } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme";

export type TabKey = "inicio" | "buscar" | "reportar" | "acerca";

interface TabBarProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

const TABS: Array<{ key: TabKey; label: string; Icon: typeof Home }> = [
  { key: "inicio", label: "Inicio", Icon: Home },
  { key: "buscar", label: "Buscar", Icon: Search },
  { key: "reportar", label: "Reportar", Icon: MessageCircle },
  { key: "acerca", label: "Acerca de", Icon: Info },
];

const TabBar: React.FC<TabBarProps> = ({ active, onChange }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {TABS.map(({ key, label, Icon }) => {
        const isActive = key === active;
        const color = isActive ? theme.colors.primary : theme.colors.textMuted;
        return (
          <TouchableOpacity
            key={key}
            style={styles.tab}
            onPress={() => onChange(key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <View
              style={[
                styles.indicator,
                isActive && { backgroundColor: theme.colors.primary },
              ]}
            />
            <Icon size={22} color={color} strokeWidth={isActive ? 2.5 : 2} />
            <Text style={[styles.label, { color }]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingTop: 6,
    paddingBottom: 8,
    gap: 3,
  },
  indicator: {
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: "transparent",
    marginBottom: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
  },
});

export default TabBar;
