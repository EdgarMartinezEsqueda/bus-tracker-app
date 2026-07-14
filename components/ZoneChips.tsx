import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../theme";

interface ZoneChipsProps {
  zones: string[];
  active: string | null; // null = "Todas"
  onChange: (zone: string | null) => void;
}

const ZoneChips: React.FC<ZoneChipsProps> = ({ zones, active, onChange }) => {
  const theme = useTheme();

  const chip = (label: string, value: string | null) => {
    const isActive = active === value;
    return (
      <TouchableOpacity
        key={label}
        style={[
          styles.chip,
          {
            backgroundColor: isActive
              ? theme.colors.primary
              : theme.colors.surface,
            borderColor: isActive ? theme.colors.primary : theme.colors.border,
          },
        ]}
        onPress={() => onChange(value)}
        accessibilityRole="button"
        accessibilityState={{ selected: isActive }}
      >
        <Text
          style={[
            styles.chipText,
            {
              color: isActive
                ? theme.colors.textOnPrimary
                : theme.colors.text,
            },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}
    >
      {chip("Todas", null)}
      {zones.map((zone) => chip(zone, zone))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  row: {
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
  },
});

export default ZoneChips;
