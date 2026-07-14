import { ArrowLeft, CheckCircle2 } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  isReportingConfigured,
  REPORT_TYPES,
  ReportType,
  submitReport,
} from "../services/reports";
import { useTheme } from "../theme";
import { RouteGroup } from "../types";

interface ReportScreenProps {
  groups: RouteGroup[];
  onBack: () => void;
}

const MAX_DESCRIPTION = 500;

const ReportScreen: React.FC<ReportScreenProps> = ({ groups, onBack }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [type, setType] = useState<ReportType | null>(null);
  const [routeCode, setRouteCode] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const reset = () => {
    setType(null);
    setRouteCode(null);
    setDescription("");
    setSent(false);
  };

  const handleSubmit = async () => {
    if (!type || sending) return;
    if (!isReportingConfigured()) {
      Alert.alert(
        "Envío no disponible",
        "El buzón de reportes aún no está configurado. Intenta más tarde.",
      );
      return;
    }
    setSending(true);
    const ok = await submitReport({ type, routeCode, description });
    setSending(false);
    if (ok) {
      setSent(true);
    } else {
      Alert.alert(
        "No se pudo enviar",
        "Revisa tu conexión a internet e inténtalo de nuevo.",
      );
    }
  };

  if (sent) {
    return (
      <View
        style={[
          styles.screen,
          styles.successWrap,
          { backgroundColor: theme.colors.background, paddingTop: insets.top },
        ]}
      >
        <CheckCircle2 size={64} color={theme.colors.success} strokeWidth={1.5} />
        <Text style={[theme.typography.title, { color: theme.colors.text }]}>
          ¡Gracias por tu reporte!
        </Text>
        <Text
          style={[
            theme.typography.body,
            { color: theme.colors.textMuted, textAlign: "center" },
          ]}
        >
          Tu comentario anónimo ayuda a mantener las rutas al día para toda la
          ciudad.
        </Text>
        <TouchableOpacity
          style={[styles.submit, { backgroundColor: theme.colors.primary }]}
          onPress={reset}
          accessibilityRole="button"
        >
          <Text
            style={[
              theme.typography.subtitle,
              { color: theme.colors.textOnPrimary },
            ]}
          >
            Enviar otro reporte
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[
        styles.screen,
        { backgroundColor: theme.colors.background, paddingTop: insets.top + 8 },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onBack}
            style={[
              styles.backButton,
              { backgroundColor: theme.colors.surface },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Volver"
          >
            <ArrowLeft size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={[theme.typography.title, { color: theme.colors.text }]}>
              Reportar problema
            </Text>
            <Text
              style={[
                theme.typography.caption,
                { color: theme.colors.textMuted },
              ]}
            >
              Sin registro · Menos de 1 minuto
            </Text>
          </View>
        </View>

        {/* Tipo de reporte */}
        <Text style={[styles.sectionLabel, theme.typography.subtitle, { color: theme.colors.text }]}>
          ¿Qué quieres reportar?
        </Text>
        <View style={{ paddingHorizontal: 16, gap: 8 }}>
          {REPORT_TYPES.map((option) => {
            const isSelected = type === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.option,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: isSelected
                      ? theme.colors.primary
                      : theme.colors.border,
                    borderRadius: theme.radii.md,
                  },
                ]}
                onPress={() => setType(option.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
              >
                <View
                  style={[
                    styles.radio,
                    {
                      borderColor: isSelected
                        ? theme.colors.primary
                        : theme.colors.textMuted,
                    },
                  ]}
                >
                  {isSelected && (
                    <View
                      style={[
                        styles.radioInner,
                        { backgroundColor: theme.colors.primary },
                      ]}
                    />
                  )}
                </View>
                <Text
                  style={[theme.typography.body, { color: theme.colors.text }]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Ruta (opcional) */}
        <Text style={[styles.sectionLabel, theme.typography.subtitle, { color: theme.colors.text }]}>
          Ruta{" "}
          <Text style={{ color: theme.colors.textMuted, fontWeight: "400" }}>
            (opcional)
          </Text>
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.routeChips}
          keyboardShouldPersistTaps="handled"
        >
          {groups.map((group) => {
            const isSelected = routeCode === group.code;
            return (
              <TouchableOpacity
                key={group.code}
                style={[
                  styles.routeChip,
                  {
                    backgroundColor: isSelected
                      ? group.color
                      : `${group.color}22`,
                  },
                ]}
                onPress={() => setRouteCode(isSelected ? null : group.code)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                <Text
                  style={{
                    color: isSelected ? "#FFFFFF" : group.color,
                    fontWeight: "800",
                    fontSize: 13,
                  }}
                >
                  {group.code}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Descripción */}
        <Text style={[styles.sectionLabel, theme.typography.subtitle, { color: theme.colors.text }]}>
          Descripción{" "}
          <Text style={{ color: theme.colors.textMuted, fontWeight: "400" }}>
            (opcional)
          </Text>
        </Text>
        <View style={{ paddingHorizontal: 16 }}>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: theme.radii.md,
                color: theme.colors.text,
              },
            ]}
            placeholder="Describe el problema con más detalle..."
            placeholderTextColor={theme.colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={MAX_DESCRIPTION}
            textAlignVertical="top"
          />
          <Text
            style={[
              theme.typography.caption,
              { color: theme.colors.textMuted, marginTop: 6 },
            ]}
          >
            No incluyas datos personales. Tu comentario es anónimo.
          </Text>
        </View>

        {/* Enviar */}
        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <TouchableOpacity
            style={[
              styles.submit,
              {
                backgroundColor: type
                  ? theme.colors.primary
                  : theme.colors.surfaceAlt,
              },
            ]}
            onPress={handleSubmit}
            disabled={!type || sending}
            accessibilityRole="button"
          >
            {sending ? (
              <ActivityIndicator color={theme.colors.textOnPrimary} />
            ) : (
              <Text
                style={[
                  theme.typography.subtitle,
                  {
                    color: type
                      ? theme.colors.textOnPrimary
                      : theme.colors.textMuted,
                  },
                ]}
              >
                Enviar reporte
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionLabel: {
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 10,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  routeChips: {
    gap: 8,
    paddingHorizontal: 16,
  },
  routeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  textArea: {
    minHeight: 120,
    borderWidth: 1,
    padding: 14,
    fontSize: 15,
  },
  submit: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 999,
  },
  successWrap: {
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 32,
  },
});

export default ReportScreen;
